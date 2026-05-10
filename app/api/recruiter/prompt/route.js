import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY } from "@/configs/constants";

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

export async function POST(request) {
  const body = await request.json();
  try {
    const { jobTitle, department, description, experienceLevel, evaluationCriteria, location, employmentType, language } = body;

    // Validate required fields
    if (!jobTitle || !description) {
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

    // Create the prompt for generating system prompt
    const systemPromptGeneration = `
You are an expert AI interview system designer. Generate a comprehensive system prompt for an AI interviewer based on the following job information:

Job Details:
- Title: ${jobTitle}
- Department: ${department || 'Not specified'}
- Experience Level: ${experienceLevel || 'Not specified'}
- Location: ${location || 'Not specified'}
- Employment Type: ${employmentType || 'Not specified'}
- Language: ${language}
- Description: ${description}

Evaluation Criteria:
${criteriaString}

Instructions:
1. Create a professional, detailed system prompt that will guide an AI interviewer by this language: ${language}
2. The prompt should include:
   - Interviewer persona and tone
   - Guidelines for conducting the interview
   - How to evaluate candidates based on the specified criteria
   - Question types to ask (behavioral, technical, situational)
   - Time management guidelines
   - Professional communication standards
3. Make it specific to the job role and requirements
4. Include clear evaluation instructions for each criterion
5. Ensure the prompt is comprehensive yet actionable
6. Format it as a clear, structured prompt that can be directly used

Generate only the system prompt without any additional explanations or formatting markers.`;

    // Use Gemini to generate the system prompt with retry logic
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    let result, response, generatedPrompt;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        result = await model.generateContent(systemPromptGeneration);
        response = await result.response;
        generatedPrompt = response.text();
        break; // Success, exit retry loop
      } catch (fetchError) {
        retryCount++;
        console.error(`Prompt generation attempt ${retryCount} failed:`, fetchError.message);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to generate system prompt after ${maxRetries} attempts. Last error: ${fetchError.message}`);
        }
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount - 1) * 1000));
      }
    }

    return Response.json({
      success: true,
      prompt: generatedPrompt.trim()
    });

  } catch (error) {
    console.error("Error generating system prompt:", error);
    return Response.json(
      { error: "Failed to generate system prompt", details: error.message },
      { status: 500 }
    );
  }
}
