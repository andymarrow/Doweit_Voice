// app/api/callagents/ingest/route.js
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSession } from '@/lib/auth';
import { headers } from 'next/headers';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const runtime = "nodejs"; // Required for file processing

export async function POST(req) {
    // 1. Authenticate User
    const { user } = await getSession(await headers());
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const contentType = req.headers.get("content-type") || "";
        let jobContextParts = []; // Array to hold text or file parts for Gemini
        let jobTitle = "";

        // --- SCENARIO A: File Upload (PDF) ---
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file");
            jobTitle = formData.get("jobTitle") || "Candidate";

            if (!file) {
                return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
            }

            // Convert File to Base64 for Gemini
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const base64Data = buffer.toString("base64");

            jobContextParts.push({
                inlineData: {
                    data: base64Data,
                    mimeType: file.type, // e.g., "application/pdf"
                },
            });
        } 
        
        // --- SCENARIO B: Raw Text Paste ---
        else if (contentType.includes("application/json")) {
            const body = await req.json();
            jobTitle = body.jobTitle;
            const textDescription = body.textDescription;

            if (!textDescription) {
                return NextResponse.json({ error: "No text description provided" }, { status: 400 });
            }

            jobContextParts.push({
                text: textDescription
            });
        } else {
            return NextResponse.json({ error: "Unsupported content type" }, { status: 400 });
        }

        // 2. Prepare the AI Prompt
        const systemInstruction = `
        You are an expert HR Interview Architect. Your task is to analyze the provided Job Description (JD) and generate a configuration for an AI Voice Interviewer.

        ROLE: ${jobTitle}

        You must output a strictly valid JSON object. Do not include markdown formatting like \`\`\`json.

        The JSON must follow this structure:
        {
            "systemPrompt": "A detailed system prompt (approx 150-200 words) instructing the AI how to behave. It should: 1. Adopt a professional yet welcoming persona. 2. Verify the candidate's name. 3. Ask probing questions based on the specific skills in the JD. 4. Dig deeper if answers are vague.",
            "rubric": [
                {
                    "name": "Short skill name (e.g., 'React Proficiency')",
                    "description": "What specifically the AI should listen for.",
                    "type": "Score 1-10", 
                    "weight": "High"
                },
                {
                    "name": "Communication",
                    "description": "Clarity, pacing, and structure of answers.",
                    "type": "Score 1-10", 
                    "weight": "Medium"
                }
                // Generate 3-5 total criteria based on the JD
            ]
        }
        `;

        // 3. Call Gemini 1.5 Flash
        // Flash is chosen for speed and long-context window (perfect for PDFs)
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent([
            systemInstruction,
            ...jobContextParts
        ]);

        const responseText = result.response.text();
        
        // 4. Parse and Return
        try {
            const structuredData = JSON.parse(responseText);
            return NextResponse.json(structuredData, { status: 200 });
        } catch (parseError) {
            console.error("Gemini JSON Parse Error:", parseError);
            console.log("Raw Text:", responseText);
            return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
        }

    } catch (error) {
        console.error("Ingestion API Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}