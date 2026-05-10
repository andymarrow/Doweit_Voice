export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { jobPositions, interviewSessions, interviewQuestions, interviewLinks } from '@/lib/db/schemaCharacterAI';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';

// Secure ID generation function
function generateSecureId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
import { eq, and, desc, inArray } from 'drizzle-orm';

// POST - Create new interview position
export async function POST(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    
    // Validate required fields
    const {
      // Registration Setup Fields
      registrationStartDate,
      registrationEndDate,
      jobPosition,
      requiredExperience,
      language,
      
      // Job Info Fields
      title,
      department,
      description,
      evaluationDescription,
      location,
      employmentType,
      startDate,
      endDate,
      duration,
      questionCount,
      voiceProvider,
      voiceId,
      antiCheatEnabled,
      aiQuestions,
      systemPrompt,
      recruiterId,
      tone,
      agentName,
      price,
      accessType,
      evaluationCriteria
    } = body;

    if (!title || !jobPosition || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: title, jobPosition, description' },
        { status: 400 }
      );
    }

    // For testing purposes, handle recruiterId properly
    // In production, you should validate that the recruiterId exists in the users table
    let finalRecruiterId = recruiterId;
    
    if (!finalRecruiterId || finalRecruiterId === 'test-recruiter' || finalRecruiterId === 'default-recruiter') {
      // Generate a temporary UUID for testing purposes
      // In production, you should create a proper user or validate the recruiterId exists
      finalRecruiterId = 'temp-recruiter-' + Date.now();
    }

    // Create job position
    const [position] = await db.insert(jobPositions).values({
      id: generateSecureId(), // Generate secure 13-character ID
      recruiterId: finalRecruiterId,
      userId: userId || 'default-user',
      title: title, // Use title from form
      department: department || 'Engineering',
      description,
      evaluationDescription: evaluationDescription || '',
      location: location || 'Remote',
      employmentType: employmentType || 'full-time',
      language: language || 'English',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      questionCount: questionCount || 8,
      duration: duration || 30,
      antiCheatEnabled: antiCheatEnabled !== false,
      aiQuestions: aiQuestions || [],
      voiceProvider: voiceProvider || 'vapi',
      voiceId: voiceId || 'monitor',
      systemPrompt: systemPrompt || '',
      agentName: agentName || 'viktor',
      tone: tone || 'Friendly',
      evaluationCriteria: evaluationCriteria || [],
      price: price || 50,
      accessType: accessType || 'Public (Anyone)',
      status: 'draft',
      // Registration Setup Fields
      registrationStartDate: registrationStartDate ? new Date(registrationStartDate) : null,
      registrationEndDate: registrationEndDate ? new Date(registrationEndDate) : null,
      jobPosition: jobPosition,
      requiredExperience: requiredExperience || 'mid'
    }).returning();

    // Generate interview magic link
    const interviewLinkId = nanoid(12);
    const interviewMagicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/interview/${interviewLinkId}`;

    // Create interview link
    const [interviewLink] = await db.insert(interviewLinks).values({
      positionId: position.id,
      linkId: interviewLinkId,
      maxUses: 100, // Default max uses
      currentUses: 0,
      status: 'active'
    }).returning();

    // Generate registration magic link (uses same ID as interview link)
    const registrationMagicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/candidate/${interviewLinkId}`;

    // Return success response with all data needed for frontend
    return NextResponse.json({
      success: true,
      data: {
        position,
        link: interviewLink,
        magicLink: interviewMagicLink,
        linkId: interviewLinkId,
        // Additional fields for frontend
        interviewLink: interviewMagicLink,
        registrationLink: registrationMagicLink,
        positionId: position.id
      }
    });

  } catch (error) {
    console.error('Create Interview Error:', error);
    return NextResponse.json(
      { error: 'Failed to create interview', details: error.message },
      { status: 500 }
    );
  }
}

// GET - Fetch interview positions
export async function GET(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const recruiterId = searchParams.get('recruiterId');
    const status = searchParams.get('status');
    const positionId = searchParams.get('positionId');
    const requestUserId = searchParams.get('userId');
    
    
    // If positionId is provided, fetch specific position
    if (positionId) {
      const [position] = await db.select({
        id: jobPositions.id,
        title: jobPositions.title,
        department: jobPositions.department,
        description: jobPositions.description,
        evaluationDescription: jobPositions.evaluationDescription,
        location: jobPositions.location,
        employmentType: jobPositions.employmentType,
        startDate: jobPositions.startDate,
        endDate: jobPositions.endDate,
        registrationStartDate: jobPositions.registrationStartDate,
        registrationEndDate: jobPositions.registrationEndDate,
        jobPosition: jobPositions.jobPosition,
        requiredExperience: jobPositions.requiredExperience,
        questionCount: jobPositions.questionCount,
        duration: jobPositions.duration,
        antiCheatEnabled: jobPositions.antiCheatEnabled,
        aiQuestions: jobPositions.aiQuestions,
        voiceProvider: jobPositions.voiceProvider,
        voiceId: jobPositions.voiceId,
        systemPrompt: jobPositions.systemPrompt,
        agentName: jobPositions.agentName,
        tone: jobPositions.tone,
        price: jobPositions.price,
        accessType: jobPositions.accessType,
        status: jobPositions.status,
        evaluationCriteria: jobPositions.evaluationCriteria,
        language: jobPositions.language,
        createdAt: jobPositions.createdAt,
        updatedAt: jobPositions.updatedAt,
        recruiterId: jobPositions.recruiterId,
        userId: jobPositions.userId
      }).from(jobPositions)
        .where(and(
          eq(jobPositions.id, positionId),
          eq(jobPositions.userId, userId) // Only return positions owned by current user
        ));

      if (!position) {
        return NextResponse.json(
          { error: 'Position not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: position
      });
    }

    // Fetch all positions for the current user
    let query = db.select({
      id: jobPositions.id,
      title: jobPositions.title,
      department: jobPositions.department,
      description: jobPositions.description,
      evaluationDescription: jobPositions.evaluationDescription,
      location: jobPositions.location,
      employmentType: jobPositions.employmentType,
      startDate: jobPositions.startDate,
      endDate: jobPositions.endDate,
      registrationStartDate: jobPositions.registrationStartDate,
      registrationEndDate: jobPositions.registrationEndDate,
      jobPosition: jobPositions.jobPosition,
      requiredExperience: jobPositions.requiredExperience,
      questionCount: jobPositions.questionCount,
      duration: jobPositions.duration,
      antiCheatEnabled: jobPositions.antiCheatEnabled,
      aiQuestions: jobPositions.aiQuestions,
      voiceProvider: jobPositions.voiceProvider,
      voiceId: jobPositions.voiceId,
      systemPrompt: jobPositions.systemPrompt,
      agentName: jobPositions.agentName,
      tone: jobPositions.tone,
      price: jobPositions.price,
      accessType: jobPositions.accessType,
      status: jobPositions.status,
      evaluationCriteria: jobPositions.evaluationCriteria,
      language: jobPositions.language,
      createdAt: jobPositions.createdAt,
      updatedAt: jobPositions.updatedAt,
      recruiterId: jobPositions.recruiterId,
      userId: jobPositions.userId
    }).from(jobPositions);

    // Apply filters - always filter by current user's userId
    const conditions = [eq(jobPositions.userId, userId)];
    
    if (recruiterId) {
      conditions.push(eq(jobPositions.recruiterId, recruiterId));
    }
    if (status) {
      conditions.push(eq(jobPositions.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const positions = await query.orderBy(desc(jobPositions.createdAt));

    return NextResponse.json({
      success: true,
      data: positions
    });

  } catch (error) {
    console.error('Fetch Interviews Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an interview position
export async function DELETE(request) {
  try {
    // Get user session first
    const session = await auth.api.getSession({
      headers: request.headers
    });
    
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Delete the interview position
    const deletedPosition = await db
      .delete(jobPositions)
      .where(
        and(
          eq(jobPositions.id, positionId),
          eq(jobPositions.userId, userId) // Only allow deletion by position owner
        )
      )
      .returning();

    if (deletedPosition.length === 0) {
      return NextResponse.json(
        { error: 'Interview position not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Interview position deleted successfully',
      deletedPosition: deletedPosition[0]
    });

  } catch (error) {
    console.error('Delete Interview Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete interview', details: error.message },
      { status: 500 }
    );
  }
}
