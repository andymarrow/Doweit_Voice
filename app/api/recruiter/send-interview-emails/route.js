export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq, and } from 'drizzle-orm';
import { jobPositions, candidateApplications, interviewLinks } from '@/lib/db/schemaCharacterAI';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();
    const { positionId } = body;

    console.log('Send interview emails API called with:', { positionId });

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Get position details
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
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Get interview link for this position
    const interviewLink = await db
      .select({
        linkId: interviewLinks.linkId,
      })
      .from(interviewLinks)
      .where(eq(interviewLinks.positionId, positionId))
      .limit(1);

    if (interviewLink.length === 0) {
      return NextResponse.json(
        { error: 'Interview link not found for this position' },
        { status: 404 }
      );
    }

    // Get non-rejected candidates for this position
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
          eq(candidateApplications.isRejected, false)
        )
      );

    console.log(`Found ${candidates.length} non-rejected candidates for position ${positionId}`);

    // Generate interview links and prepare email data
    const emailData = candidates.map(candidate => ({
      candidateName: candidate.candidateName,
      candidateEmail: candidate.candidateEmail,
      interviewLink: `http://localhost:3000/interview/${interviewLink[0].linkId}/${candidate.publicId}`,
      positionTitle: position[0].title,
      positionDescription: position[0].description,
    }));

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Send emails to candidates
    const sentEmails = [];
    for (const email of emailData) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email.candidateEmail,
          subject: `Interview Invitation - ${email.positionTitle}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border: 1px solid #e9ecef;">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Interview Invitation</h2>
                
                <p style="color: #495057; font-size: 16px; line-height: 1.6;">
                  Dear ${email.candidateName},
                </p>
                
                <p style="color: #495057; font-size: 16px; line-height: 1.6;">
                  We are pleased to invite you for an interview for the position of <strong>${email.positionTitle}</strong>.
                </p>
                
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #007bff;">
                  <h3 style="color: #2c3e50; margin-top: 0;">Position Details:</h3>
                  <p style="color: #495057; margin-bottom: 10px;"><strong>Title:</strong> ${email.positionTitle}</p>
                  ${email.positionDescription ? `<p style="color: #495057; margin-bottom: 10px;"><strong>Description:</strong> ${email.positionDescription}</p>` : ''}
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${email.interviewLink}" 
                     style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Start Interview
                  </a>
                </div>
                
                <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
                  Click the button above or use this link: <a href="${email.interviewLink}" style="color: #007bff;">${email.interviewLink}</a>
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
                  <p style="color: #6c757d; font-size: 12px; margin: 0;">
                    This is an automated message. Please do not reply to this email.
                  </p>
                </div>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email.candidateEmail}`);
        
        sentEmails.push({
          candidateEmail: email.candidateEmail,
          candidateName: email.candidateName,
          interviewLink: email.interviewLink,
          status: 'sent',
          sentAt: new Date(),
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${email.candidateEmail}:`, emailError);
        sentEmails.push({
          candidateEmail: email.candidateEmail,
          candidateName: email.candidateName,
          status: 'failed',
          error: emailError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Interview emails processed for ${sentEmails.length} candidates`,
      position: position[0],
      emailsSent: sentEmails.filter(e => e.status === 'sent').length,
      emailsFailed: sentEmails.filter(e => e.status === 'failed').length,
      emailDetails: sentEmails,
    });

  } catch (error) {
    console.error('Error sending interview emails:', error);
    return NextResponse.json(
      { error: 'Failed to send interview emails' },
      { status: 500 }
    );
  }
}
