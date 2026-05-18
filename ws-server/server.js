// ws-server/server.js
// Standalone WebSocket proxy: Browser <-> Gemini Live.
//
// Why this exists: Vercel runs serverless functions — no persistent HTTP server,
// so the Next.js Pages-API trick (res.socket.server.wss) doesn't work in
// production. This server runs on Render (persistent Node.js process) and
// handles all WebSocket traffic. The Next.js app on Vercel still handles
// everything else (auth, API routes, UI).

import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import pg from "pg";

const { Pool } = pg;

// ---------------------------------------------------------------------------
//  DB
// ---------------------------------------------------------------------------
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,
});

async function getAppWithAgent(publicKey) {
    const { rows } = await pool.query(
        `SELECT
            sa.id,
            sa.name,
            sa.status,
            sa.mode,
            sa.domain_whitelist,
            sa.custom_prompt,
            sa.custom_voice_id,
            sa.custom_knowledge_base_id,
            ca.name          AS agent_name,
            ca.prompt        AS agent_prompt,
            ca.voice_config  AS agent_voice_config,
            ca.greeting_message AS agent_greeting,
            kb.name          AS custom_kb_name,
            kb.content       AS custom_kb_content
         FROM sdk_apps sa
         LEFT JOIN call_agents ca ON sa.agent_id = ca.id
         LEFT JOIN knowledge_bases kb ON sa.custom_knowledge_base_id = kb.id
         WHERE sa.public_key = $1`,
        [publicKey],
    );
    return rows[0] || null;
}

// Stringify a KB content JSONB array into one text block for the system prompt.
// content rows look like { type: 'text'|'url', value: '...', metadata: {...} }
function knowledgeBaseToText(kbName, content) {
    if (!Array.isArray(content) || content.length === 0) return "";
    const blocks = content
        .map((item, i) => {
            const val = typeof item?.value === "string" ? item.value : "";
            if (!val) return null;
            const label = item.metadata?.filename || item.type || `Item ${i + 1}`;
            return `--- ${label} ---\n${val}`;
        })
        .filter(Boolean)
        .join("\n\n");
    return blocks ? `# Knowledge Base: ${kbName || "Reference"}\n\n${blocks}` : "";
}

async function getLatestManifest(appId) {
    const { rows } = await pool.query(
        `SELECT actions
         FROM sdk_manifests
         WHERE app_id = $1
         ORDER BY version DESC
         LIMIT 1`,
        [appId],
    );
    return rows[0] || null;
}

// ---------------------------------------------------------------------------
//  Gemini helpers (identical to the logic in pages/api/sdk/live.js)
// ---------------------------------------------------------------------------
function buildSystemInstruction({ agentPrompt, agentLanguage, manifestActions }) {
    const basePrompt = agentPrompt || "You are a helpful AI assistant embedded inside a website.";
    const language = agentLanguage || "en";
    const capabilityList = (manifestActions || [])
        .map((a) => `- ${a.name}: ${a.description}`)
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
        `- If you say something like "Sure, taking you there" or "Heading to that page now" or "Opening it for you", you MUST also emit the matching tool call IN THE SAME TURN.`,
        `- This rule applies to EVERY navigation request, including follow-ups after a previous action.`,
        ``,
        `# Available Tools`,
        capabilityList,
    ].join("\n");
}

function toolsForGemini(actions) {
    if (!actions || actions.length === 0) return undefined;
    const functionDeclarations = actions.map((action) => {
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

// ---------------------------------------------------------------------------
//  WebSocket connection handler (same logic as live.js wss.on("connection"))
// ---------------------------------------------------------------------------
async function handleWsConnection(ws, req) {
    let geminiSession = null;
    let messageQueue = [];

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
            geminiSession.sendRealtimeInput({ text: `${stateBlock}${msg.text}` });
        }
    };

    let audioFrameCount = 0;
    ws.on("message", (raw) => {
        let msg;
        try { msg = JSON.parse(raw); } catch { return; }
        if (msg.type === "audio_input") {
            audioFrameCount++;
            if (audioFrameCount === 1 || audioFrameCount % 100 === 0) {
                console.log("[WS] audio_input frames received:", audioFrameCount);
            }
        } else {
            console.log("[WS] Client message:", msg.type, msg.name || msg.text?.slice(0, 40) || "");
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
        const app = await getAppWithAgent(publicKey);
        if (!app || app.status !== "active") {
            throw new Error("Invalid or inactive App Key");
        }
        // WebSockets bypass CORS, so enforce the per-app domain whitelist here too.
        if (!originAllowed(req.headers.origin, app.domain_whitelist)) {
            throw new Error("Domain not authorized for this app");
        }

        const manifest = await getLatestManifest(app.id);
        const actions = manifest?.actions || [];
        const tools = actions.length > 0 ? toolsForGemini(actions) : undefined;

        // Resolve prompt + voice based on the app's mode.
        // mode === 'custom' → use sdk_apps.custom_* fields (+ optional KB injection)
        // mode === 'agent' (default) → use the linked call_agents row
        let promptForGemini;
        let voiceName;
        if (app.mode === "custom") {
            const kbBlock = knowledgeBaseToText(app.custom_kb_name, app.custom_kb_content);
            promptForGemini = [app.custom_prompt || "", kbBlock].filter(Boolean).join("\n\n");
            voiceName = app.custom_voice_id || "Aoede";
            console.log("[WS] Using CUSTOM mode. Voice:", voiceName, "KB attached:", !!kbBlock);
        } else {
            promptForGemini = app.agent_prompt;
            voiceName = app.agent_voice_config?.voiceId || "Aoede";
            console.log("[WS] Using AGENT mode. Voice:", voiceName);
        }
        const systemInstruction = buildSystemInstruction({
            agentPrompt: promptForGemini,
            manifestActions: actions,
        });

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Gemini API key missing on server.");

        const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });

        const geminiConfig = {
            responseModalities: [Modality.AUDIO],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName } },
            },
            outputAudioTranscription: {},
            inputAudioTranscription: {},
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
                onopen: () => console.log("[WS] Gemini Live connected"),
                onmessage: (message) => {
                    const keys = Object.keys(message).filter(k => message[k] != null);
                    console.log("[WS] Gemini msg keys:", keys.join(", "));

                    const serverContent = message.serverContent;
                    if (serverContent) {
                        const scKeys = Object.keys(serverContent).filter(k => serverContent[k] != null);
                        console.log("[WS] serverContent keys:", scKeys.join(", "));
                    }

                    if (serverContent?.interrupted) safeSend({ type: "interrupted" });

                    if (serverContent?.outputTranscription?.text) {
                        console.log("[WS] AI transcript:", serverContent.outputTranscription.text.slice(0, 80));
                        safeSend({ type: "text", text: serverContent.outputTranscription.text });
                    }
                    if (serverContent?.inputTranscription?.text) {
                        console.log("[WS] User transcript:", serverContent.inputTranscription.text.slice(0, 80));
                        safeSend({
                            type: "text_user",
                            text: serverContent.inputTranscription.text,
                            turnComplete: !!serverContent.turnComplete,
                        });
                    }
                    const modelTurn = serverContent?.modelTurn;
                    if (modelTurn?.parts) {
                        console.log("[WS] modelTurn parts:", modelTurn.parts.length, "types:", modelTurn.parts.map(p => p.inlineData ? "audio" : p.text ? "text" : "other").join(","));
                        for (const part of modelTurn.parts) {
                            if (part.inlineData?.data) {
                                safeSend({ type: "audio", data: part.inlineData.data });
                            }
                        }
                    }
                    if (message.toolCall?.functionCalls) {
                        for (const fc of message.toolCall.functionCalls) {
                            console.log("[WS] Tool call:", fc.name, fc.args);
                            safeSend({ type: "tool_call", id: fc.id, name: fc.name, args: fc.args || {} });
                            try {
                                geminiSession.sendToolResponse({
                                    functionResponses: [{
                                        id: fc.id,
                                        name: fc.name,
                                        response: { status: "success" },
                                    }],
                                });
                            } catch (err) {
                                console.error("[WS] sendToolResponse error:", err.message);
                            }
                        }
                    }
                    if (message.setupComplete) {
                        console.log("[WS] Gemini setup complete");
                    }
                },
                onerror: (err) => {
                    console.error("[WS] Gemini error:", err);
                    safeSend({ type: "error", message: "Gemini stream error." });
                },
                onclose: (e) => {
                    console.log("[WS] Gemini session closed", e?.code, e?.reason);
                    if (ws.readyState === ws.OPEN) ws.close();
                },
            },
        });

        for (const msg of messageQueue) dispatchToGemini(msg);
        messageQueue = [];

        safeSend({ type: "ready", agent: { name: app.agent_name || app.name } });

    } catch (error) {
        console.error("[WS] Setup error:", error);
        safeSend({ type: "error", message: error.message });
        ws.close();
    }
}

// ---------------------------------------------------------------------------
//  Express + HTTP server
// ---------------------------------------------------------------------------
const app = express();

// CORS is intentionally permissive: a browser CORS *preflight* carries no
// Authorization header, so the server can't know which app (and which domain
// whitelist) the request belongs to until the real request arrives. So we let
// the browser through at the CORS layer and enforce the per-app domain
// whitelist INSIDE each handler (originAllowed below) — returning 403 for a
// domain the developer hasn't authorised in their dashboard.
app.use(cors({
    origin: true, // reflect any origin
    methods: ["GET", "POST", "OPTIONS"],
}));

// Normalize a whitelist entry (stored as full URL OR bare hostname) to hostname.
// Handles entries like "https://foo.com/", "foo.com", "http://localhost:5173/".
function normalizeToHostname(entry) {
    const s = (entry || "").trim();
    if (s.includes("://")) {
        try { return new URL(s).hostname; } catch { /* fall through */ }
    }
    return s.replace(/\/+$/, "");
}

// Is `origin` permitted for an app with this `domainWhitelist`?
// localhost is always allowed (local dev). An empty/missing whitelist is
// treated as "allow all" so a developer isn't locked out before configuring.
function originAllowed(origin, domainWhitelist) {
    if (!origin) return true; // non-browser caller (curl, health check)
    let hostname;
    try {
        hostname = new URL(origin).hostname;
    } catch {
        return false;
    }
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
        return true;
    }
    if (!Array.isArray(domainWhitelist) || domainWhitelist.length === 0) {
        return true;
    }
    return domainWhitelist.some(entry => normalizeToHostname(entry) === hostname);
}

app.use(express.json({ limit: "1mb" }));

// ---------------------------------------------------------------------------
//  SDK HTTP API
//  This standalone server is the COMPLETE SDK backend: init + manifest (HTTP)
//  AND live (WebSocket). Keeping all three on one origin means the SDK only
//  ever talks to one host — and that host is a persistent server that can hold
//  WebSockets (unlike Vercel's serverless functions).
// ---------------------------------------------------------------------------

function getPublicKey(req) {
    const auth = req.headers.authorization || "";
    return auth.startsWith("Bearer dw_pub_") ? auth.slice(7).trim() : null;
}

// GET /api/sdk/init — the SDK calls this on load to fetch the agent config.
app.get("/api/sdk/init", async (req, res) => {
    const publicKey = getPublicKey(req);
    if (!publicKey) {
        return res.status(401).json({ error: "Missing or invalid Publishable Key" });
    }
    try {
        const appRow = await getAppWithAgent(publicKey);
        if (!appRow) {
            return res.status(404).json({ error: "App not found or invalid key" });
        }
        if (!originAllowed(req.headers.origin, appRow.domain_whitelist)) {
            return res.status(403).json({
                error: `Domain '${req.headers.origin || "unknown"}' is not authorized for this app. Add it to the domain whitelist in your Doweit dashboard.`,
            });
        }
        if (appRow.status !== "active") {
            return res.status(403).json({ error: "This app is currently paused." });
        }
        const manifest = await getLatestManifest(appRow.id);
        const isCustom = appRow.mode === "custom";
        res.json({
            success: true,
            config: {
                appName: appRow.name,
                agent: {
                    name: appRow.agent_name || appRow.name || "Assistant",
                    voiceId: isCustom
                        ? appRow.custom_voice_id || "Aoede"
                        : appRow.agent_voice_config?.voiceId || "Aoede",
                    language: "en",
                    greeting: appRow.agent_greeting || "Hello! How can I help you today?",
                },
                tools: manifest?.actions || [],
            },
        });
    } catch (e) {
        console.error("[SDK init]", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/sdk/manifest — the SDK uploads its registered actions on init.
app.post("/api/sdk/manifest", async (req, res) => {
    const publicKey = getPublicKey(req);
    if (!publicKey) {
        return res.status(401).json({ error: "Missing or invalid Publishable Key" });
    }
    try {
        const appRow = await getAppWithAgent(publicKey);
        if (!appRow) {
            return res.status(401).json({ error: "Invalid Publishable Key" });
        }
        if (!originAllowed(req.headers.origin, appRow.domain_whitelist)) {
            return res.status(403).json({
                error: `Domain '${req.headers.origin || "unknown"}' is not authorized for this app.`,
            });
        }
        const { actions, stateSchema, environment } = req.body || {};
        if (!Array.isArray(actions)) {
            return res.status(400).json({ error: "Manifest must contain an 'actions' array." });
        }
        const { rows } = await pool.query(
            `SELECT COALESCE(MAX(version), 0) AS max FROM sdk_manifests WHERE app_id = $1`,
            [appRow.id],
        );
        const nextVersion = Number(rows[0]?.max || 0) + 1;
        await pool.query(
            `INSERT INTO sdk_manifests
                (app_id, version, environment, actions, state_schema, published_at, created_at)
             VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, NOW(), NOW())`,
            [
                appRow.id,
                nextVersion,
                environment || "production",
                JSON.stringify(actions),
                JSON.stringify(stateSchema || {}),
            ],
        );
        res.json({ success: true, version: nextVersion });
    } catch (e) {
        console.error("[SDK manifest]", e);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Warm-up endpoint — the SDK fetches this before opening the WebSocket so
// the server is definitely awake and the upgrade listener is attached.
app.get("/api/sdk/live", (_req, res) => {
    res.status(200).send("Doweit WS proxy is running.");
});

// Health check for Render.
app.get("/health", (_req, res) => res.status(200).send("ok"));

const server = http.createServer(app);

// ---------------------------------------------------------------------------
//  WebSocket upgrade
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
    if (!request.url.startsWith("/api/sdk/live")) {
        socket.destroy();
        return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

wss.on("connection", handleWsConnection);

// ---------------------------------------------------------------------------
//  Start
// ---------------------------------------------------------------------------
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`[Doweit WS Server] Listening on port ${PORT}`);
});
