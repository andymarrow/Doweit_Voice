export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { eq, and } from "drizzle-orm";
import { jobPositions, candidateApplications } from "@/lib/db/schemaCharacterAI";
import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function POST(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const { positionId } = await request.json();
    if (!positionId) {
      return NextResponse.json(
        { error: "Position ID is required" },
        { status: 400 },
      );
    }

    // Position (also pull passScore from evaluationDescription)
    const [position] = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        evaluationDescription: jobPositions.evaluationDescription,
      })
      .from(jobPositions)
      .where(eq(jobPositions.id, positionId))
      .limit(1);

    if (!position) {
      return NextResponse.json(
        { error: "Position not found" },
        { status: 404 },
      );
    }

    const passScore = Number(position.evaluationDescription) || 50;

    // Only candidates that have been evaluated (have a result) and not rejected
    const candidates = await db
      .select()
      .from(candidateApplications)
      .where(
        and(
          eq(candidateApplications.positionId, positionId),
          eq(candidateApplications.isRejected, false),
        ),
      );

    const eligible = candidates.filter((c) => c.result != null);

    const sentEmails = [];

    for (const candidate of eligible) {
      try {
        const resultArr = Array.isArray(candidate.result)
          ? candidate.result
          : typeof candidate.result === "string"
            ? (() => {
                try {
                  return JSON.parse(candidate.result);
                } catch {
                  return [];
                }
              })()
            : [];

        const totalScore = resultArr.reduce(
          (s, c) => s + (typeof c.score === "number" ? c.score : 0),
          0,
        );

        // Trust DB's `pass` value if present, otherwise compute from passScore
        const passed =
          typeof candidate.pass === "boolean"
            ? candidate.pass
            : totalScore >= passScore;

        const breakdownRows = resultArr
          .map(
            (c) =>
              `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;color:#444;">${c.name || c.criteria || "Criteria"}</td><td style="padding:6px 10px;border-bottom:1px solid #eee;font-size:12px;color:#444;text-align:right;font-weight:600;">${c.score ?? 0}</td></tr>`,
          )
          .join("");

        const html = `
<div style="font-family:Arial;max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#f8f9fa;padding:30px;border-radius:10px;border:1px solid #e9ecef;">
    <h2 style="color:#2c3e50;margin:0 0 12px 0;">Interview Result</h2>
    <p style="font-size:14px;color:#444;">Dear ${candidate.candidateName},</p>
    <p style="font-size:14px;color:#444;">
      Thank you for interviewing for <strong>${position.title}</strong>.
      Here are the results of your evaluation.
    </p>

    <div style="margin:24px 0;padding:16px;border-radius:8px;background:${passed ? "#ecfdf5" : "#fef2f2"};border:1px solid ${passed ? "#a7f3d0" : "#fecaca"};text-align:center;">
      <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${passed ? "#047857" : "#b91c1c"};font-weight:700;">
        ${passed ? "Passed" : "Not Passed"}
      </p>
      <p style="margin:6px 0 0;font-size:24px;font-weight:800;color:${passed ? "#065f46" : "#991b1b"};">
        Score: ${totalScore} / ${passScore}+ to pass
      </p>
    </div>

    ${
      breakdownRows
        ? `<h3 style="font-size:14px;color:#2c3e50;margin:16px 0 8px;">Score Breakdown</h3>
           <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #eee;border-radius:6px;overflow:hidden;">
             ${breakdownRows}
           </table>`
        : ""
    }

    ${
      candidate.reasonResult
        ? `<h3 style="font-size:14px;color:#2c3e50;margin:16px 0 8px;">Feedback</h3>
           <p style="font-size:13px;color:#444;line-height:1.6;white-space:pre-wrap;">${candidate.reasonResult}</p>`
        : ""
    }

    <p style="font-size:12px;color:gray;margin-top:24px;">Automated message</p>
  </div>
</div>
        `;

        const info = await transporter.sendMail({
          from: `"${session.user.name || "Recruiter"}" <${process.env.EMAIL_USER}>`,
          replyTo: session.user.email,
          to: candidate.candidateEmail,
          subject: `Interview Result - ${position.title}`,
          html,
        });

        console.log(
          `Result email -> ${candidate.candidateEmail} (messageId: ${info.messageId})`,
        );

        sentEmails.push({
          candidateName: candidate.candidateName,
          candidateEmail: candidate.candidateEmail,
          status: "sent",
          pass: passed,
          totalScore,
          messageId: info.messageId,
          sentAt: new Date(),
        });
      } catch (error) {
        console.error(error);
        sentEmails.push({
          candidateName: candidate.candidateName,
          candidateEmail: candidate.candidateEmail,
          status: "failed",
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      position,
      passScore,
      emailsSent: sentEmails.filter((x) => x.status === "sent").length,
      emailsFailed: sentEmails.filter((x) => x.status === "failed").length,
      skipped: candidates.length - eligible.length, // not yet evaluated
      emailDetails: sentEmails,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send result emails" },
      { status: 500 },
    );
  }
}
