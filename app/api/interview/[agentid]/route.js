import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq, and } from 'drizzle-orm';
import { interviewLinks, jobPositions, interviews, candidateApplications } from '@/lib/db/schemaCharacterAI';

export async function GET(request, { params }) {
  try {
    const { agentid } = params;
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    
    // Find the interview link by linkId (magic link)
    const interviewLink = await db
      .select({
        link: interviewLinks,
        position: jobPositions,
      })
      .from(interviewLinks)
      .leftJoin(jobPositions, eq(interviewLinks.positionId, jobPositions.id))
      .where(eq(interviewLinks.linkId, agentid))
      .limit(1);

    if (!interviewLink.length) {
      return NextResponse.json(
        { error: 'Interview link not found' },
        { status: 404 }
      );
    }

    const { link, position } = interviewLink[0];

    // Check if link is active and not expired
    if (link.status !== 'active') {
      return NextResponse.json(
        { error: 'Interview link is not active' },
        { status: 400 }
      );
    }

    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Interview link has expired' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (link.maxUses && link.currentUses >= link.maxUses) {
      return NextResponse.json(
        { error: 'Interview link has reached maximum uses' },
        { status: 400 }
      );
    }

    // Validate candidate if candidateId is provided
    let candidateInfo = null;
    if (candidateId) {
      const candidate = await db
        .select()
        .from(candidateApplications)
        .where(
          and(
            eq(candidateApplications.positionId, position.id),
            eq(candidateApplications.publicId, candidateId),
            eq(candidateApplications.isRejected, false),
            eq(candidateApplications.interviewTaken, false) // Check if interview hasn't been taken
          )
        )
        .limit(1);

      if (!candidate.length) {
        return NextResponse.json(
          { error: 'Candidate not found, not authorized, or interview already completed' },
          { status: 404 }
        );
      }

      candidateInfo = candidate[0];
    }

    // Return interview data
    const interviewData = {
      id: link.id,
      linkId: link.linkId,
      type: 'magic_link',
      position: {
        id: position.id,
        title: position.title,
        department: position.department,
        description: position.description,
        requirements: position.requirements,
        experienceLevel: position.experienceLevel,
        location: position.location,
        salary: position.salary,
        employmentType: position.employmentType,
        startDate: position.startDate,
        endDate: position.endDate,
        voiceProvider: position.voiceProvider,
        voiceId: position.voiceId,
        systemPrompt: position.systemPrompt,
        duration: position.duration,
        antiCheatEnabled: position.antiCheatEnabled,
        aiQuestions: position.aiQuestions,
        language: position.language,
        agentName: position.agentName,
        tone: position.tone,
      },
      linkSettings: {
        maxUses: link.maxUses,
        currentUses: link.currentUses,
        expiresAt: link.expiresAt,
        requirePassword: link.requirePassword,
      },
      candidate: candidateInfo ? {
        id: candidateInfo.id,
        publicId: candidateInfo.publicId,
        candidateName: candidateInfo.candidateName,
        candidateEmail: candidateInfo.candidateEmail,
        candidatePhone: candidateInfo.candidatePhone,
        country: candidateInfo.country,
      } : null
    };

    return NextResponse.json(interviewData);

  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { agentid } = params;
    const body = await request.json();
    
    // Find the interview link
    const interviewLink = await db
      .select()
      .from(interviewLinks)
      .where(eq(interviewLinks.linkId, agentid))
      .limit(1);

    if (!interviewLink.length) {
      return NextResponse.json(
        { error: 'Interview link not found' },
        { status: 404 }
      );
    }

    const link = interviewLink[0];

    // Increment usage count when candidate starts interview
    if (body.action === 'start_interview') {
      await db
        .update(interviewLinks)
        .set({ 
          currentUses: link.currentUses + 1,
          updatedAt: new Date()
        })
        .where(eq(interviewLinks.id, link.id));
    }

    // Create interview record when candidate submits application
    if (body.action === 'submit_application') {
      const { candidate } = body;
      
      const newInterview = await db
        .insert(interviews)
        .values({
          linkId: agentid,
          positionId: link.positionId,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          candidatePhone: candidate.phone,
          portfolioUrl: candidate.portfolioUrl,
          linkedinUrl: candidate.linkedinUrl,
          experience: candidate.experience,
          country: candidate.country,
          type: 'real_application',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return NextResponse.json({ 
        success: true, 
        interviewId: newInterview[0].id 
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
