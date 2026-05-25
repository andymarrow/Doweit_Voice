export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { eq, and } from "drizzle-orm";
import {
  jobPositions,
  candidateApplications,
  interviewLinks,
} from "@/lib/db/schemaCharacterAI";
import { auth } from "@/lib/auth";

import nodemailer from "nodemailer";

// Gmail SMTP — free, works on localhost, no domain verification needed.
// Set EMAIL_USER (your gmail) and EMAIL_APP_PASSWORD (Gmail App Password,
// 16-char code from https://myaccount.google.com/apppasswords) in .env.local.
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
    const body = await request.json();
    const { positionId } = body;

    console.log("Send interview emails API called:", { positionId });

    if (!positionId) {
      return NextResponse.json(
        {
          error: "Position ID is required",
        },
        {
          status: 400,
        },
      );
    }

    // Position

    const position = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        description: jobPositions.description,
      })
      .from(jobPositions)
      .where(eq(jobPositions.id, positionId))
      .limit(1);

    if (position.length === 0) {
      return NextResponse.json(
        {
          error: "Position not found",
        },
        {
          status: 404,
        },
      );
    }

    // Interview Link

    const interviewLink = await db
      .select({
        linkId: interviewLinks.linkId,
        positionId: interviewLinks.positionId,
      })
      .from(interviewLinks)
      .where(eq(interviewLinks.positionId, positionId))
      .limit(1);

    if (interviewLink.length === 0) {
      return NextResponse.json(
        {
          error: "Interview link not found",
        },
        {
          status: 404,
        },
      );
    }

    // Candidates

    const candidates = await db
      .select({
        id: candidateApplications.id,

        candidateName: candidateApplications.candidateName,

        candidateEmail: candidateApplications.candidateEmail,

        publicId: candidateApplications.publicId,

        isRejected: candidateApplications.isRejected,
      })
      .from(candidateApplications)
      .where(
        and(
          eq(candidateApplications.positionId, positionId),

          eq(candidateApplications.isRejected, false),
        ),
      );

    console.log(`Found ${candidates.length} candidates`);

    const sentEmails = [];

    for (const candidate of candidates) {
      try {
        // Get user session first
        const session = await auth.api.getSession({
          headers: request.headers,
        });

        const EMAIL_FROM = session?.user?.email;

        if (!EMAIL_FROM) {
          return NextResponse.json(
            { error: "User not authenticated" },
            { status: 401 },
          );
        }
        const generatedLink = `${process.env.NEXT_PUBLIC_APP_URL}interview/${interviewLink[0].linkId}/${candidate.publicId}`;

        const html = `

<div style="
font-family:Arial;
max-width:600px;
margin:0 auto;
padding:20px;
">

<div style="
background:#f8f9fa;
padding:30px;
border-radius:10px;
border:1px solid #e9ecef;
">

<h2
style="
color:#2c3e50;
"
>
Interview Invitation
</h2>

<p>
Dear
${candidate.candidateName},
</p>

<p>

We are pleased
to invite you
for an interview
for

<strong>
${position[0].title}
</strong>

</p>

${
  position[0].description
    ? `
<div>

<h3>
Position Details
</h3>

<p>

${position[0].description}

</p>

</div>
`
    : ""
}

<div
style="
text-align:center;
margin:30px 0;
"
>

<a
href="${generatedLink}"

style="
background:#007bff;
color:white;
padding:12px 30px;
text-decoration:none;
border-radius:6px;
display:inline-block;
"
>

Start Interview

</a>

</div>

<p>

Or use:

<a href="${generatedLink}">

${generatedLink}

</a>

</p>

<p
style="
font-size:12px;
color:gray;
"
>

Automated message

</p>

</div>

</div>

        `;

        const info = await transporter.sendMail({
          from: `"${session.user.name || "Recruiter"}" <${process.env.EMAIL_USER}>`,
          replyTo: EMAIL_FROM,
          to: candidate.candidateEmail,
          subject: `Interview Invitation - ${position[0].title}`,
          html,
        });

        console.log(
          `Sent -> ${candidate.candidateEmail} (messageId: ${info.messageId})`,
        );

        sentEmails.push({
          candidateName: candidate.candidateName,
          candidateEmail: candidate.candidateEmail,
          status: "sent",
          interviewLink: generatedLink,
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

      position: position[0],

      emailsSent: sentEmails.filter((x) => x.status === "sent").length,

      emailsFailed: sentEmails.filter((x) => x.status === "failed").length,

      emailDetails: sentEmails,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to send emails",
      },

      {
        status: 500,
      },
    );
  }
}
