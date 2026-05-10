export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { eq, and } from 'drizzle-orm';
import { jobPositions, candidateApplications } from '@/lib/db/schemaCharacterAI';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

// Initialize Google AI
const apiKey = GEMINI_API_KEY;
console.log("GEMINI_API_KEY available:", !!apiKey);
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
}
const ai = new GoogleGenerativeAI(apiKey);

// Gemini AI evaluation function
async function evaluateCandidatesWithGemini(candidates, evaluationRules) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not available');
    }

    // Create evaluation prompt
    const prompt = `
You are an expert recruiter evaluating candidates based on specific criteria. 

EVALUATION RULES:
${evaluationRules}

CANDIDATES TO EVALUATE:
${JSON.stringify(candidates, null, 2)}

Please evaluate each candidate and return a JSON array with the following structure:
[
  {
    "id": "candidate_id",
    "isReject": true/false,
    "rejectReason": "Detailed reason for rejection (if rejected)"
  }
]

Guidelines:
- Set isReject: true if candidate doesn't meet the evaluation rules
- Provide specific, professional rejection reasons
- Be fair and objective in your evaluation
- Consider skills, experience, and qualifications mentioned in CV
- Return only valid JSON format
`;

    // Use Gemini to evaluate candidates with retry logic
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let result, response, generatedText;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(prompt);
        response = await result.response;
        generatedText = response.text();
        break; // Success, exit retry loop
      } catch (fetchError) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, fetchError.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to evaluate candidates after ${maxRetries} attempts. Last error: ${fetchError.message}`);
        }
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
      }
    }

    // Parse the JSON response
    let evaluationResults = [];
    try {
      // Strip markdown wrapper if present
      let cleanedText = generatedText;
      if (generatedText.includes('```json')) {
        cleanedText = generatedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (generatedText.includes('```')) {
        cleanedText = generatedText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Extract JSON from AI response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      evaluationResults = JSON.parse(jsonMatch[0]);
      
      // Validate results format
      if (!Array.isArray(evaluationResults)) {
        throw new Error('AI response is not an array');
      }
      
      return evaluationResults.map(result => ({
        id: result.id,
        isReject: Boolean(result.isReject),
        rejectReason: result.rejectReason || ''
      }));
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', generatedText);
      
      // Fallback: return all candidates as not rejected
      return candidates.map(candidate => ({
        id: candidate.id,
        isReject: false,
        rejectReason: 'AI evaluation failed - manual review required'
      }));
    }

  } catch (error) {
    console.error('Error evaluating candidates with Gemini:', error);
    
    // Fallback: return all candidates as not rejected
    return candidates.map(candidate => ({
      id: candidate.id,
      isReject: false,
      rejectReason: 'AI evaluation failed - manual review required'
    }));
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { positionId } = body;

    console.log('SelectCandidate API called with:', { positionId });

    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Get position details including evaluation rules
    const position = await db
      .select({
        id: jobPositions.id,
        title: jobPositions.title,
        candidateEvaluation: jobPositions.candidateEvaluation,
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

    // Get candidates for this specific interview (not all candidates)
    const candidates = await db
      .select({
        id: candidateApplications.id,
        candidateName: candidateApplications.candidateName,
        candidateEmail: candidateApplications.candidateEmail,
        cv: candidateApplications.cv,
        isRejected: candidateApplications.isRejected,
        rejectReason: candidateApplications.rejectReason,
        address: candidateApplications.address,
        experience: candidateApplications.experience,
        country: candidateApplications.country,
      })
      .from(candidateApplications)
      .where(eq(candidateApplications.positionId, positionId))
      .limit(50); // Limit to reasonable number

    console.log(`Found ${candidates.length} candidates for position ${positionId}`);

    // Prepare candidates data for AI evaluation
    const candidatesForAI = candidates.map(candidate => ({
      id: candidate.id.toString(),
      cv: candidate.cv || '',
      isReject: candidate.isRejected || false,
      rejectReason: candidate.rejectReason || ''
    }));

    // Get evaluation rules from candidateEvaluation field
    const evaluationRules = position[0].candidateEvaluation || '';

    // Send candidates to Gemini AI for evaluation
    const aiResults = await evaluateCandidatesWithGemini(candidatesForAI, evaluationRules);

    // Update candidates with AI results
    for (const result of aiResults) {
      await db
        .update(candidateApplications)
        .set({
          isRejected: result.isReject,
          rejectReason: result.rejectReason,
          updatedAt: new Date(),
        })
        .where(eq(candidateApplications.id, parseInt(result.id)));
    }

    return NextResponse.json({
      success: true,
      message: 'Candidates evaluated successfully with Gemini AI',
      evaluationRules,
      candidatesEvaluated: aiResults,
      totalCandidates: candidates.length,
    });

  } catch (error) {
    console.error('Error in SelectCandidate API:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate candidates' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const positionId = searchParams.get('positionId');

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
        candidateEvaluation: jobPositions.candidateEvaluation,
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

    // Get candidates for this position
    const candidates = await db
      .select({
        id: candidateApplications.id,
        candidateName: candidateApplications.candidateName,
        candidateEmail: candidateApplications.candidateEmail,
        cv: candidateApplications.cv,
        isRejected: candidateApplications.isRejected,
        rejectReason: candidateApplications.rejectReason,
        address: candidateApplications.address,
        experience: candidateApplications.experience,
        country: candidateApplications.country,
      })
      .from(candidateApplications)
      .where(eq(candidateApplications.positionId, positionId));

    return NextResponse.json({
      success: true,
      position: position[0],
      candidates,
    });

  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
