// pages/api/sdk/live.js
// Gemini Live <-> Browser WebSocket proxy.
// Why this lives in pages/: App Router API routes don't expose the underlying
// HTTP server, which we need to attach a WebSocketServer to.

import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import { db } from "@/lib/database";
import { sdkApps, sdkManifests } from "@/lib/db/schemaCharacterAI";
import { eq, desc } from "drizzle-orm";

export const config = { 
    api: { 
        bodyParser: false,
        externalResolver: true 
    } 
};

function buildSystemInstruction({ agent, manifestActions, fallbackMessage }) {
    const basePrompt = agent?.prompt || "You are a helpful AI assistant embedded inside a website.";
    const language = agent?.language || "en";

    const capabilityList = (manifestActions || [])
        .map(a => `- ${a.name}: ${a.description}`)
        .join("\n") || "(none)";

    return [
        basePrompt,
        ``,
        `# Operating Rules`,
        `- You are bounded to this app. You may chat warmly and naturally, but you MUST NOT invent or attempt actions that are not in your tool list.`,
        `- Always respond in ${language} unless the user explicitly switches.`,
        `- The conversation NEVER ends after one action. After a tool finishes, stay attentive for the user's next request — treat each new message as a fresh turn.`,
        `- Sound like a friendly teammate, not a system. One short, warm sentence is plenty ("Sure, opening that now…", "Done — recording is on."). Never read JSON, status codes, paths, or tool names back to the user.`,
        `- Before calling a tool that needs info you don't have, ask ONE focused question. Don't list options unless asked.`,
        `- When a tool returns "clarification_needed", ask the user for the listed fields and DO NOT call the tool again until they're provided.`,
        `- After a tool returns success, briefly confirm in plain language and then wait for what's next.`,
        ``,
        `# CRITICAL: SAYING vs DOING`,
        `- Speaking a confirmation does NOTHING by itself. Only emitting the actual function call performs the action.`,
        `- If you say something like "Sure, taking you there" or "Heading to that page now" or "Opening it for you", you MUST also emit the matching tool call (navigate / open_agent / create_agent / update_agent / go_back) IN THE SAME TURN. Saying it without calling it = you did not do it = the user is stranded.`,
        `- This rule applies to EVERY navigation request, including follow-ups after a previous action. Don't assume the model already moved — emit the tool call again.`,
        ``,
        `# Available Tools`,
        capabilityList,
        ``,
        fallbackMessage
            ? `# Fallback\nIf the user asks for something outside your tools, reply with: "${fallbackMessage}"`
            : "",
    ].filter(Boolean).join("\n");
}

function toolsForGemini(actions) {
    if (!actions || actions.length === 0) return undefined;

    const functionDeclarations = actions.map(action => {
        const properties = {};
        const required = [];
        for (const [key, rules] of Object.entries(action.params || {})) {
            properties[key] = {
                type: (rules.type || "string").toUpperCase(),
                description: rules.description || `Parameter ${key} for ${action.name}.`,
            };
            if (rules.required) required.push(key);
        }
        return {
            name: action.name,
            description: action.description,
            parameters: Object.keys(properties).length
                ? { type: "OBJECT", properties, required }
                : undefined,
        };
    });

    return [{ functionDeclarations }];
}

let wss = null;

export default async function handler(req, res) {
    // 1. Initialize the WebSocket Server if it doesn't exist yet
    if (!res.socket.server.wss) {
        wss = new WebSocketServer({ noServer: true });
        res.socket.server.wss = wss;

        const server = res.socket.server;

        // Capture every upgrade listener Next.js already registered (HMR etc.),
        // strip them off, then install ONE interceptor. For our URL we handle
        // exclusively — Next.js never sees the socket. For all other URLs we
        // re-invoke the original listeners so HMR keeps working.
        const nextUpgradeListeners = server.listeners("upgrade").slice();
        server.removeAllListeners("upgrade");

        server.on("upgrade", (request, socket, head) => {
            if (!request.url.startsWith("/api/sdk/live")) {
                nextUpgradeListeners.forEach(fn => fn.call(server, request, socket, head));
                return;
            }
            wss.handleUpgrade(request, socket, head, (ws) => {
                wss.emit("connection", ws, request);
            });
        });

        wss.on("connection", async (ws, req) => {
            let geminiSession = null;
            let messageQueue = [];   // holds msgs that arrive before Gemini is ready

            const url = new URL(req.url, `http://${req.headers.host}`);
            const publicKey = url.searchParams.get("key");

            const safeSend = (msg) => {
                if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
            };

            const dispatchToGemini = (msg) => {
                if (!geminiSession) return;
                if (msg.type === "audio_input" && msg.data) {
                    geminiSession.sendRealtimeInput({
                        audio: { mimeType: "audio/pcm;rate=16000", data: msg.data },
                    });
                } else if (msg.type === "text_input") {
                    const stateBlock = msg.state ? `[UI STATE]: ${JSON.stringify(msg.state)}\n` : "";
                    const fullText = `${stateBlock}${msg.text}`;
                    console.log("[WS Proxy] Sending text to Gemini:", fullText);
                    geminiSession.sendRealtimeInput({ text: fullText });
                } else if (msg.type === "tool_result") {
                    // Client sent a result — log it but Gemini was already answered.
                    console.log("[WS Proxy] Client tool_result (already handled):", msg.name, JSON.stringify(msg.result));
                }
            };

            // Register handlers IMMEDIATELY — before the async Gemini setup.
            // Messages that arrive early are queued and flushed once Gemini is ready.
            ws.on("message", (raw) => {
                let msg;
                try { msg = JSON.parse(raw); } catch { return; }
                if (msg.type !== "audio_input") {
                    console.log("[WS Proxy] Client message:", msg.type, msg.name || msg.text?.slice(0, 40) || "");
                }
                if (!geminiSession) {
                    if (msg.type !== "interrupt") messageQueue.push(msg);
                    return;
                }
                dispatchToGemini(msg);
            });

            ws.on("close", () => {
                if (geminiSession?.close) geminiSession.close();
            });

            if (!publicKey) {
                safeSend({ type: "error", message: "Missing Publishable Key" });
                return ws.close();
            }

            try {
                const app = await db.query.sdkApps.findFirst({
                    where: eq(sdkApps.publicKey, publicKey),
                    with: { agent: true },
                });

                if (!app || app.status !== "active") {
                    throw new Error("Invalid or inactive App Key");
                }

                const latestManifest = await db.query.sdkManifests.findFirst({
                    where: eq(sdkManifests.appId, app.id),
                    orderBy: [desc(sdkManifests.version)],
                });

                const actions = latestManifest?.actions || [];
                const tools = actions.length > 0 ? toolsForGemini(actions) : undefined;

                const voiceName = app.agent?.voiceConfig?.voiceId || "Aoede";
                const systemInstruction = buildSystemInstruction({
                    agent: app.agent,
                    manifestActions: actions,
                });

                const apiKey = process.env.GEMINI_API_KEY || process.env.GEMNI_API_KEY;
                if (!apiKey) throw new Error("Gemini API key missing on server.");

                const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

                const geminiConfig = {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
                    },
                    // Both directions get transcribed:
                    //   outputAudioTranscription → AI's spoken reply as text (chat bubble)
                    //   inputAudioTranscription  → what the USER said as text. Without this,
                    //                              voice input never produces a user bubble in
                    //                              the widget — that was Alan AI's "no user
                    //                              chat bubble" bug.
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                    // Explicit VAD tuning. Defaults bias toward LONG silence detection (~600ms),
                    // which made Gemini treat 5 separate user questions as one continuous turn
                    // until the user paused completely. Tightening end-of-speech sensitivity +
                    // shortening the required silence makes turns snappier.
                    realtimeInputConfig: {
                        automaticActivityDetection: {
                            disabled: false,
                            startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
                            endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
                            prefixPaddingMs: 20,
                            silenceDurationMs: 200,
                        },
                    },
                };
                if (tools) geminiConfig.tools = tools;

                geminiSession = await ai.live.connect({
                    model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                    config: geminiConfig,
                    callbacks: {
                        onopen: () => console.log("[WS Proxy] Gemini Live connected"),
                        onmessage: (message) => {
                            console.log("[WS Proxy] Gemini raw message keys:", Object.keys(message).filter(k => message[k] != null));
                            const serverContent = message.serverContent;
                            if (serverContent?.interrupted) {
                                safeSend({ type: "interrupted" });
                            }
                            if (serverContent?.turnComplete) {
                                console.log("[WS Proxy] Gemini turn complete");
                            }
                            if (serverContent?.outputTranscription?.text) {
                                console.log("[WS Proxy] Gemini transcript:", serverContent.outputTranscription.text);
                                safeSend({ type: "text", text: serverContent.outputTranscription.text });
                            }
                            // The user's own speech — sent as `text_user` so the widget
                            // can display a chat bubble for what the caller said.
                            if (serverContent?.inputTranscription?.text) {
                                console.log("[WS Proxy] User transcript:", serverContent.inputTranscription.text);
                                safeSend({
                                    type: "text_user",
                                    text: serverContent.inputTranscription.text,
                                    // Gemini sends partial transcripts that grow over the turn;
                                    // turnComplete signals the SDK to "commit" the bubble.
                                    turnComplete: !!serverContent.turnComplete,
                                });
                            }
                            const modelTurn = serverContent?.modelTurn;
                            if (modelTurn?.parts) {
                                console.log("[WS Proxy] Gemini modelTurn parts count:", modelTurn.parts.length);
                                for (const part of modelTurn.parts) {
                                    if (part.inlineData?.data) {
                                        console.log("[WS Proxy] Sending audio chunk, mimeType:", part.inlineData.mimeType);
                                        safeSend({ type: "audio", data: part.inlineData.data });
                                    }
                                    // Intentionally do NOT forward part.text. With the
                                    // gemini-2.5-flash-native-audio-preview model, modelTurn.parts.text
                                    // contains the model's internal reasoning ("**Initiating Navigation
                                    // Task** I've determined I need to ..."), which leaks into the chat
                                    // as a system-y bubble. The user-facing reply is already streamed
                                    // through outputTranscription.text above.
                                    if (part.text) {
                                        console.log("[WS Proxy] Suppressed reasoning text:", part.text.slice(0, 80));
                                    }
                                }
                            }
                            if (message.toolCall?.functionCalls) {
                                for (const fc of message.toolCall.functionCalls) {
                                    console.log("[WS Proxy] Tool call:", fc.name, fc.args);
                                    // Notify the client so it can execute the action (fire-and-forget).
                                    safeSend({ type: "tool_call", id: fc.id, name: fc.name, args: fc.args || {} });
                                    // Respond to Gemini immediately — the client's tool_result
                                    // round-trip is unreliable (async onmessage swallows errors).
                                    try {
                                        geminiSession.sendToolResponse({
                                            functionResponses: [{
                                                id: fc.id,
                                                name: fc.name,
                                                response: { status: "success" },
                                            }],
                                        });
                                        console.log("[WS Proxy] Auto tool response sent for:", fc.name);
                                    } catch (err) {
                                        console.error("[WS Proxy] sendToolResponse error:", err.message);
                                    }
                                }
                            }
                            if (message.setupComplete) {
                                console.log("[WS Proxy] Gemini setup complete");
                            }
                        },
                        onerror: (err) => {
                            console.error("[WS Proxy] Gemini error:", err);
                            safeSend({ type: "error", message: "Gemini stream error." });
                        },
                        onclose: (e) => {
                            console.log("[WS Proxy] Gemini session closed", e?.code, e?.reason);
                            if (ws.readyState === ws.OPEN) ws.close();
                        },
                    },
                });

                // Gemini is ready — flush any messages that arrived during setup
                for (const msg of messageQueue) dispatchToGemini(msg);
                messageQueue = [];

                safeSend({ type: "ready", agent: { name: app.agent?.name || app.name } });

            } catch (error) {
                console.error("[WS Proxy] Setup error:", error);
                safeSend({ type: "error", message: error.message });
                ws.close();
            }
        });
    }

    // 2. Tell Next.js that the HTTP request was handled successfully
    // This stops the 'bind' crash.
    // res.status(200).send("Doweit WS proxy is running.");

    if (!req.headers.upgrade) {
        res.status(200).send("Doweit WS proxy is running.");
        return;
    }
}
