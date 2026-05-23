export const dynamic = 'force-dynamic';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";
import { db } from "@/lib/database";
import { jobPositions } from "@/lib/db/schemaCharacterAI";
import { eq } from "drizzle-orm";

// Initialize Google AI
const apiKey = GEMINI_API_KEY;
console.log("API Key available:", !!apiKey);
console.log("API Key length:", apiKey?.length || 0);
if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set.");
  throw new Error("GEMINI_API_KEY environment variable not set.");
}
const ai = new GoogleGenerativeAI(apiKey);
console.log("Google AI initialized successfully");

// Fallback function to generate questions if AI fails
function generateFallbackQuestions(title, experienceLevel, count) {
  const baseQuestions = {
    junior: [
      "Tell me about a project you're proud of and what you learned from it.",
      "How do you approach learning a new technology or skill?",
      "Describe a time you had to work with a difficult team member.",
      "What do you consider your biggest technical achievement so far?",
      "How do you ensure the quality of your work?",
      "Tell me about a time you made a mistake and how you fixed it.",
      "What motivates you to do your best work?",
      "How do you handle tight deadlines?"
    ],
    mid: [
      "Describe a complex technical challenge you've solved recently.",
      "How do you balance technical debt with new feature development?",
      "Tell me about a time you had to mentor a junior developer.",
      "How do you approach system design and architecture decisions?",
      "Describe a situation where you had to influence stakeholders.",
      "How do you stay current with technology trends?",
      "Tell me about a time you had to refactor a legacy system.",
      "How do you approach performance optimization?"
    ],
    senior: [
      "Describe your approach to leading a technical team.",
      "How do you make decisions about technology stack and architecture?",
      "Tell me about a time you had to handle a production crisis.",
      "How do you balance business requirements with technical constraints?",
      "Describe your experience with cross-functional collaboration.",
      "How do you approach hiring and building teams?",
      "Tell me about a time you had to pivot a technical strategy.",
      "How do you ensure long-term maintainability of systems?"
    ]
  };

  const questions = baseQuestions[experienceLevel] || baseQuestions.mid;
  
  // Customize questions based on job title
  const customizedQuestions = questions.map(q => {
    if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('react')) {
      return q.replace(/technical/g, 'frontend').replace(/system/g, 'application');
    } else if (title.toLowerCase().includes('backend') || title.toLowerCase().includes('api')) {
      return q.replace(/technical/g, 'backend').replace(/application/g, 'system');
    }
    return q;
  });

  return customizedQuestions.slice(0, count);
}

export async function POST(request) {
  const body = await request.json();
  try {
    // Save mode: when called with { positionId, aiQuestions }, update the
    // stored questions on the position. This is what the InterviewDetail
    // Questions tab uses for its "Save Questions" button.
    if (body.positionId && Array.isArray(body.aiQuestions)) {
      const updated = await db
        .update(jobPositions)
        .set({
          aiQuestions: body.aiQuestions,
          updatedAt: new Date(),
        })
        .where(eq(jobPositions.id, body.positionId))
        .returning();
      if (updated.length === 0) {
        return Response.json({ error: "Position not found" }, { status: 404 });
      }
      return Response.json({
        success: true,
        questions: body.aiQuestions,
        count: body.aiQuestions.length,
      });
    }

    const {
      title,
      department,
      description,
      requirements,
      experienceLevel,
      questionCount ,
      duration,
      evaluationCriteria,
      systemPrompt,
      location,
      employmentType,
      language
    } = body;

    // Validate required fields
    if (!title || !description) {
      return Response.json(
        { error: "Job title and description are required" },
        { status: 400 }
      );
    }

    // Construct the evaluation criteria string
    const criteriaString = evaluationCriteria
      ? evaluationCriteria.map(criteria => 
          `- ${criteria.name} (${criteria.weight}%): ${criteria.method}`
        ).join('\n')
      : '';

    // Calculate time per question
    const timePerQuestion = Math.floor(duration / questionCount);

    // Create the prompt for generating interview questions
    const questionGenerationPrompt = `
You are an expert technical interviewer and hiring manager. Generate ${questionCount} professional interview questions for the following position:

Job Details:
- Title: ${title}
- Department: ${department || 'Not specified'}
- Experience Level: ${experienceLevel || 'Not specified'}
- Location: ${location || 'Not specified'}
- Employment Type: ${employmentType || 'Not specified'}
- Interview Duration: ${duration} minutes (${timePerQuestion} minutes per question)
- Description: ${description}
- Requirements: ${requirements || 'Not specified'}

Evaluation Criteria:
${criteriaString}

System Prompt Context:
${systemPrompt || 'No system prompt provided'}

Instructions:
1. Generate exactly ${questionCount} interview questions by this language ${language}
2. Mix of question types:
   - Technical questions (40%)
   - Behavioral questions (30%)
   - Situational/problem-solving questions (20%)
   - Experience/background questions (10%)
3. Each question should:
   - Be clear and concise
   - Be appropriate for the ${experienceLevel} level
   - Be answerable within ${timePerQuestion} minutes
   - Align with the evaluation criteria
   - Be specific to the job requirements
4. Avoid generic questions that could apply to any job
5. Make questions thought-provoking but not overly complex
6. Ensure questions will help evaluate the specified criteria

Format your response as a JSON array of question strings only, like this:
["Question 1?", "Question 2?", "Question 3?", ...]
Do not include any additional text, explanations, or formatting - only the JSON array.`;

    // Use Gemini to generate the questions with retry logic
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    let result, response, generatedText;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(questionGenerationPrompt);
        response = await result.response;
        generatedText = response.text();
        break; // Success, exit retry loop
      } catch (fetchError) {
        retryCount++;
        console.error(`Attempt ${retryCount} failed:`, fetchError.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to generate questions after ${maxRetries} attempts. Last error: ${fetchError.message}`);
        }
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
      }
    }

    // Parse the JSON response
    let questions = [];
    try {
      // Strip markdown wrapper if present
      let cleanedText = generatedText;
      if (generatedText.includes('```json')) {
        cleanedText = generatedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (generatedText.includes('```')) {
        cleanedText = generatedText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to parse as JSON array
      questions = JSON.parse(cleanedText);
      
      // Ensure it's an array
      if (!Array.isArray(questions)) {
        throw new Error('Response is not an array');
      }
      
      // Clean up questions and ensure we have the right number
      questions = questions
        .filter(q => typeof q === 'string' && q.trim().length > 0)
        .map(q => q.trim())
        .slice(0, questionCount);
      
      // If we don't have enough questions, add fallback questions
      if (questions.length < questionCount) {
        const fallbackQuestions = generateFallbackQuestions(title, experienceLevel, questionCount - questions.length);
        questions = [...questions, ...fallbackQuestions];
      }
      
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('Raw AI response:', generatedText);
      
      // Fallback to manually generated questions if parsing fails
      questions = generateFallbackQuestions(title, experienceLevel, questionCount);
    }

    return Response.json({
      success: true,
      questions: questions,
      count: questions.length
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    return Response.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}
