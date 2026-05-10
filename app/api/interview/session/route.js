import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq } from 'drizzle-orm';
import { candidateApplications } from '@/lib/db/schemaCharacterAI';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      candidateName, 
      candidateEmail, 
      candidatePhone, 
      experience, 
      country, 
      portfolioUrl, 
      linkedinUrl, 
      resumeUrl,
      linkId,
      positionId,
      agentId 
    } = body;

    console.log('Creating interview session:', { candidateName, candidateEmail, linkId, positionId });

    if (!candidateName || !candidateEmail) {
      return NextResponse.json(
        { error: 'Candidate name and email are required' },
        { status: 400 }
      );
    }

    // Generate a unique session ID
    const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // If we have a candidateId, update their record
    let updatedCandidate = null;
    if (agentId) {
      // For magic link interviews, we might need to find the candidate by email or other means
      // For now, we'll just return the session ID
      console.log('Magic link session created:', sessionId);
    } else if (linkId && positionId) {
      // For position-based interviews, we could update the candidate record
      // For now, we'll just return the session ID
      console.log('Position-based session created:', sessionId);
    }

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      message: 'Interview session created successfully',
      candidateInfo: {
        name: candidateName,
        email: candidateEmail,
        phone: candidatePhone,
        experience: experience,
        country: country,
        portfolioUrl: portfolioUrl,
        linkedinUrl: linkedinUrl,
        resumeUrl: resumeUrl
      }
    });

  } catch (error) {
    console.error('Error creating interview session:', error);
    return NextResponse.json(
      { error: 'Failed to create interview session' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
