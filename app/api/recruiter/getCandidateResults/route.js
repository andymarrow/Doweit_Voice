import { NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { candidateApplications, jobPositions } from '@/lib/db/schemaCharacterAI';
import { eq, and, desc } from 'drizzle-orm';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

// Initialize Google AI
const apiKey = GEMINI_API_KEY;
console.log("GEMINI_API_KEY available:", !!apiKey);
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
}
const ai = new GoogleGenerativeAI(apiKey);

// AI evaluation function for interview transcripts
async function evaluateInterviewTranscripts(interviewCandidates, evaluationCriteria, candidateEvaluation) {
  try {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not available');
    }

    // Prepare candidates data for AI
    const candidatesForAI = interviewCandidates.map(candidate => ({
      id: candidate.publicId,
      evaluationCriteria: evaluationCriteria || [],
      interviewTranscript: candidate.candidateInterview ? JSON.parse(candidate.candidateInterview || '[]') : []
    }));

    // Create evaluation prompt
    const prompt = `
You are an expert recruiter evaluating candidates based on interview transcripts and specific evaluation criteria.

EVALUATION CRITERIA:
${JSON.stringify(evaluationCriteria, null, 2)}

EVALUATION DESCRIPTION:
${candidateEvaluation}

CANDIDATES TO EVALUATE:
${JSON.stringify(candidatesForAI, null, 2)}

Please evaluate each candidate and return a JSON array with the following structure:
[
  {
    "id": "candidate_public_id",
    "result": [
      { "name": "Technical Knowledge", "score": 2 },
      { "name": "Communication Skills", "score": 3 },
      { "name": "Problem Solving", "score": 1 },
      { "name": "Cultural Fit", "score": 5 },
      { "name": "Confidence", "score": 2 }
    ],
    "reasonResult": "Candidate could not answer technical questions and showed low confidence."
  }
]

Guidelines:
- Score each criterion on a scale of 1-5 (1=Poor, 5=Excellent)
- Consider the evaluation description when scoring
- Analyze the entire transcript for evidence
- Provide specific, professional reasoning for the overall assessment
- Be fair and objective in your evaluation
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

    // Parse JSON response
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
        result: result.result ,
        reasonResult: result.reasonResult
      }));
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', generatedText);
      
      // Fallback: return all candidates with default scores
      return interviewCandidates.map(candidate => ({
        id: candidate.publicId,
        result: evaluationCriteria.map(criteria => ({ name: criteria.name, score: 3 })),
        reasonResult: 'AI evaluation failed - manual review required'
      }));
    }

  } catch (error) {
    console.error('Error evaluating interview transcripts:', error);
    
    // Fallback: return all candidates with default scores
    return interviewCandidates.map(candidate => ({
      id: candidate.publicId,
      result: evaluationCriteria.map(criteria => ({ name: criteria.name, score: 3 })),
      reasonResult: 'AI evaluation failed - manual review required'
    }));
  }
}

export async function POST(request) {
  try {
    const { positionId } = await request.json();

    // Validate input
    if (!positionId) {
      return NextResponse.json(
        { error: 'Position ID is required' },
        { status: 400 }
      );
    }

    // Get job position with evaluation criteria
    const [position] = await db.select({
      id: jobPositions.id,
      title: jobPositions.title,
      evaluationCriteria: jobPositions.evaluationCriteria,
      candidateEvaluation: jobPositions.candidateEvaluation
    })
    .from(jobPositions)
    .where(eq(jobPositions.id, positionId))
    .limit(1);

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // Get candidates who have taken interview
    const interviewCandidates = await db.select({
      id: candidateApplications.id,
      candidateId: candidateApplications.candidateId,
      publicId: candidateApplications.publicId,
      positionId: candidateApplications.positionId,
      interviewTaken: candidateApplications.interviewTaken,
      candidateInterview: candidateApplications.candidateInterview,
      result: candidateApplications.result,
      reasonResult: candidateApplications.reasonResult,
      createdAt: candidateApplications.createdAt
    })
    .from(candidateApplications)
    .where(
      and(
        eq(candidateApplications.positionId, positionId),
        eq(candidateApplications.interviewTaken, true)
      )
    )
    .orderBy(desc(candidateApplications.createdAt));

    // Evaluate candidates with AI (only if evaluation criteria exist)
    const aiEvaluationResults = position.evaluationCriteria && position.evaluationCriteria.length > 0 
      ? await evaluateInterviewTranscripts(
          interviewCandidates, 
          position.evaluationCriteria, 
          position.candidateEvaluation
        )
      : []; // Return empty results if no evaluation criteria

    // Update candidates with evaluation results
    for (const evalResult of aiEvaluationResults) {
      await db
        .update(candidateApplications)
        .set({
          result: evalResult.result,
          reasonResult: evalResult.reasonResult,
          updatedAt: new Date(),
        })
        .where(eq(candidateApplications.publicId, evalResult.id));
    }

    return NextResponse.json({
      success: true,
      data: {
        position,
        candidates: interviewCandidates,
        evaluationResults: aiEvaluationResults
      }
    });

    if (!position) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    
  } catch (error) {
    console.error('Get Candidate Results Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
