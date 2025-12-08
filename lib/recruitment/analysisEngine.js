// lib/recruitment/analysisEngine.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Analyzes an interview transcript against a specific Job Description and Rubric.
 * @param {string} transcript - The full text conversation.
 * @param {object} recruitmentConfig - The agent's config containing JD and Rubric.
 * @returns {Promise<object>} - Structured analysis data (score, radar data, summary).
 */
export async function analyzeCandidateInterview(transcript, recruitmentConfig) {
    if (!transcript) return { fitScore: 0, summary: "No transcript available." };

    const { jobDescription, systemPrompt } = recruitmentConfig || {};

    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
    });

    // Construct a strict prompt for the AI Analyst
    const prompt = `
    You are an Expert HR Analyst. Evaluate this interview transcript for the role described below.
    
    --- JOB CONTEXT ---
    ${jobDescription ? jobDescription.substring(0, 2000) : "Refer to system prompt requirements."}
    
    --- INTERVIEWER INSTRUCTIONS (RUBRIC) ---
    ${systemPrompt ? systemPrompt.substring(0, 2000) : "Standard professional interview."}

    --- TRANSCRIPT ---
    ${transcript.substring(0, 20000)} 
    ------------------

    TASK:
    Generate a JSON report assessing the candidate. Be critical but fair.

    REQUIRED JSON STRUCTURE:
    {
        "fitScore": (Integer 0-100),
        "summary": (String, 2-3 sentences executive summary),
        "hiringRecommendation": "Strong Hire" | "Hire" | "Review" | "Reject",
        "skillRadar": [
            { "subject": "Technical", "A": (Integer 0-100), "fullMark": 100 },
            { "subject": "Communication", "A": (Integer 0-100), "fullMark": 100 },
            { "subject": "Culture Fit", "A": (Integer 0-100), "fullMark": 100 },
            { "subject": "Problem Solving", "A": (Integer 0-100), "fullMark": 100 },
            { "subject": "Confidence", "A": (Integer 0-100), "fullMark": 100 }
        ],
        "keyInsights": {
            "strengths": ["point 1", "point 2"],
            "weaknesses": ["point 1", "point 2"]
        },
        "timelineSentiment": [
            { "time": "0m", "sentiment": (0-100), "label": "Intro" },
            { "time": "5m", "sentiment": (0-100), "label": "Core" },
            { "time": "End", "sentiment": (0-100), "label": "Closing" }
        ]
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonResponse = JSON.parse(text);
        return jsonResponse;
    } catch (error) {
        console.error("Analysis Engine Error:", error);
        // Return a fallback object so the DB update doesn't crash
        return {
            fitScore: 0,
            summary: "Analysis failed due to AI error.",
            hiringRecommendation: "Review",
            skillRadar: []
        };
    }
}