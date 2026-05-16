export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { sdkApps, sdkManifests, callAgents } from "@/lib/db/schemaCharacterAI";
import { eq, and, desc } from "drizzle-orm";

// The SDK runs in third-party browsers, so this endpoint is hit cross-origin.
// Without these headers the browser blocks the response before our handler's
// domain-whitelist check ever runs. ACAO:* is safe here — the publishable key
// plus the domainWhitelist check below are the actual access controls.
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
};

function withCors(res) {
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
    return res;
}

// Preflight: browsers send OPTIONS before a cross-origin GET with an Authorization header.
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req) {
    return withCors(await handleGet(req));
}

// GET: The SDK calls this on page load to securely fetch configuration
async function handleGet(req) {
    try {
        // 1. Extract and validate the Public Key
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer dw_pub_")) {
            return NextResponse.json({ error: "Missing or invalid Publishable Key" }, { status: 401 });
        }
        const publicKey = authHeader.split(" ")[1];

        // 2. Fetch the App and its linked Agent configuration
        const app = await db.query.sdkApps.findFirst({
            where: eq(sdkApps.publicKey, publicKey),
            with: {
                // We join the callAgents table to get the Voice, Prompt, and Language settings
                // configured by the developer in the Doweit Dashboard
                agent: true 
            }
        });

        if (!app) {
            return NextResponse.json({ error: "App not found or Invalid Key" }, { status: 404 });
        }

        if (app.status !== "active") {
            return NextResponse.json({ error: "This App is currently paused." }, { status: 403 });
        }

        // 3. Domain Whitelist Verification (Crucial for Public Keys)
        const origin = req.headers.get("origin") || req.headers.get("referer");
        if (origin) {
            try {
                const originUrl = new URL(origin);
                const hostname = originUrl.hostname;
                const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";

                // Always allow localhost for local development
                if (!isLocalhost && app.domainWhitelist && app.domainWhitelist.length > 0) {
                    if (!app.domainWhitelist.includes(hostname)) {
                        console.warn(`[SDK Init] Blocked unauthorized domain: ${hostname}`);
                        return NextResponse.json({ error: "Domain not authorized" }, { status: 403 });
                    }
                }
            } catch (e) {
                // Ignore parsing errors for non-standard origins
            }
        }

        // 4. Fetch the Latest Active Manifest (The Code Capabilities)
        const latestManifest = await db.query.sdkManifests.findFirst({
            where: eq(sdkManifests.appId, app.id),
            orderBy: [desc(sdkManifests.version)], // Get the newest one
        });

        // 5. Construct the final Payload for the SDK
        // We combine the Agent settings (from dashboard) + Manifest (from code)
        const sdkConfig = {
            appName: app.name,
            agent: {
                name: app.agent?.name || "Assistant",
                voiceProvider: app.agent?.voiceConfig?.voiceProvider || "google",
                voiceId: app.agent?.voiceConfig?.voiceId || "Aoede",
                language: app.agent?.language || "en",
                basePrompt: app.agent?.prompt || "You are a helpful AI assistant embedded in a website.",
                greeting: app.agent?.greetingMessage || "Hello! How can I help you today?"
            },
            tools: latestManifest?.actions || [],
            stateSchema: latestManifest?.stateSchema || {}
        };

        console.log(`[SDK Init] Successfully initialized SDK for App: ${app.name}`);

        return NextResponse.json({ success: true, config: sdkConfig }, { status: 200 });

    } catch (error) {
        console.error("[SDK Init API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}