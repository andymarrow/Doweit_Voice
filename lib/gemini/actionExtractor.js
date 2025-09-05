import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/configs/db";
import { callActionValues } from "@/lib/db/schemaCharacterAI";

// ... (formatTranscriptForPrompt and buildActionExtractionPrompt functions remain the same) ...
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function formatTranscriptForPrompt(transcript) {
    if (!Array.isArray(transcript)) return "";
    return transcript
        .map(entry => `${entry.role}: ${entry.message}`)
        .join('\n');
}

function buildActionExtractionPrompt(actions, formattedTranscript) {
    const actionInstructions = actions.map(agentAction => {
        const action = agentAction.action;
        let instruction = `- **${action.name}**: ${action.description || `Extract the ${action.displayName}`}.`;
        if (action.config?.type === 'Boolean') {
            instruction += ` Respond with "${action.config.trueLabel}" or "${action.config.falseLabel}".`;
        }
        if (action.config?.type === 'Choice') {
            const choices = action.config.options.map(o => `"${o.label}"`).join(', ');
            instruction += ` Choose one of the following options: ${choices}.`;
        }
        return instruction;
    }).join('\n');

    return `
You are an expert data extraction AI. Your task is to analyze a call transcript and extract specific pieces of information.
Read the entire transcript carefully.

**TRANSCRIPT:**
---
${formattedTranscript}
---

**INSTRUCTIONS:**
Based on the transcript, extract the following information. Respond ONLY with a valid JSON object. The keys of the object must be the action names provided below.
If you cannot find the information for a specific action or it was not discussed, the value for that key MUST be null. Do not make up information.

**ACTIONS TO EXTRACT:**
${actionInstructions}

**JSON RESPONSE FORMAT:**
{
  "action_name_1": "extracted value",
  "action_name_2": null,
  "action_name_3": "another extracted value"
}
`;
}


export async function extractActionValuesFromTranscript(callId, agentActions, transcript) {
    console.log(`[ANALYSIS] Starting extraction for callId: ${callId}`);
    
    const formattedTranscript = formatTranscriptForPrompt(transcript);
    const prompt = buildActionExtractionPrompt(agentActions, formattedTranscript);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    console.log(`[ANALYSIS] Gemini Raw Response for callId ${callId}:`, responseText);
    
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    let extractedData;
    try {
        extractedData = JSON.parse(jsonString);
    } catch (error) {
        console.error(`[ANALYSIS] Failed to parse JSON from Gemini for callId ${callId}. Response: ${jsonString}`);
        throw new Error("Invalid JSON response from AI.");
    }
    
    console.log(`[ANALYSIS] Parsed extracted data for callId ${callId}:`, extractedData);

    const valuesToInsert = [];
    for (const agentAction of agentActions) {
        const actionName = agentAction.action.name;
        if (Object.prototype.hasOwnProperty.call(extractedData, actionName)) {
            const extractedValue = extractedData[actionName];
            
            // *** FIX: REMOVE THE NULL CHECK ***
            // We now want to insert every action, including those with null values.
            valuesToInsert.push({
                callId: callId,
                agentActionId: agentAction.id,
                value: extractedValue, // This can now be null
                extractedAt: new Date(),
            });
        }
    }

    if (valuesToInsert.length > 0) {
        console.log(`[ANALYSIS] Inserting ${valuesToInsert.length} action values (including nulls) into DB for callId ${callId}.`);
        await db.insert(callActionValues).values(valuesToInsert);
        console.log(`[ANALYSIS] Successfully saved extracted values for callId ${callId}.`);
    } else {
        console.log(`[ANALYSIS] No actions were found in the Gemini response for callId ${callId}. Nothing to save.`);
    }
}