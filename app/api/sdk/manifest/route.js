export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { db } from "@/lib/database";
import { sdkApps, sdkManifests } from "@/lib/db/schemaCharacterAI";
import { eq, max } from "drizzle-orm";

// The SDK posts here cross-origin from third-party sites. The browser sends a
// preflight OPTIONS first (POST + JSON body), which must be answered with CORS
// headers or the real request is blocked. The publishable key + domainWhitelist
// check below remain the real access controls.
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
};

function withCors(res) {
    for (const [k, v] of Object.entries(CORS_HEADERS)) res.headers.set(k, v);
    return res;
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req) {
    return withCors(await handlePost(req));
}

// POST: The SDK sends its capabilities to this endpoint on initialization
async function handlePost(req) {
    try {
        // 1. Extract the public key from the Authorization header
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer dw_pub_")) {
            return NextResponse.json({ error: "Missing or invalid Publishable Key" }, { status: 401 });
        }
        const publicKey = authHeader.split(" ")[1];

        // 2. Lookup the App in the database
        const app = await db.query.sdkApps.findFirst({
            where: eq(sdkApps.publicKey, publicKey)
        });

        if (!app) {
            return NextResponse.json({ error: "Invalid Publishable Key" }, { status: 401 });
        }

        // 3. Domain Whitelist Verification (CORS/Security check)
        const origin = req.headers.get("origin") || req.headers.get("referer");
        if (origin) {
            try {
                const originUrl = new URL(origin);
                const hostname = originUrl.hostname;
                const isLocalhost = 
                        hostname === "localhost" || 
                        hostname === "127.0.0.1" || 
                        hostname === "::1" || 
                        hostname.startsWith("192.168.");

                // Always allow localhost for local development
                if (!isLocalhost && app.domainWhitelist && app.domainWhitelist.length > 0) {
                    if (!app.domainWhitelist.includes(hostname)) {
                        console.warn(`[SDK Auth] Blocked request from unauthorized domain: ${hostname}`);
                        return NextResponse.json({
                            error: `Domain '${hostname}' is not whitelisted for this App.`
                        }, { status: 403 });
                    }
                }
            } catch (e) {
                console.warn("[SDK Auth] Could not parse origin URL:", origin);
            }
        }

        // 4. Extract Manifest Data from the SDK payload
        const body = await req.json();
        const { actions, stateSchema, environment = "development" } = body;

        if (!actions || !Array.isArray(actions)) {
            return NextResponse.json({ error: "Manifest must contain an 'actions' array." }, { status: 400 });
        }

        // 5. Determine the next Version number
        const result = await db
            .select({ maxVersion: max(sdkManifests.version) })
            .from(sdkManifests)
            .where(eq(sdkManifests.appId, app.id));
        
        const nextVersion = (result[0]?.maxVersion || 0) + 1;

        // 6. Insert the new Manifest version
        const [newManifest] = await db.insert(sdkManifests).values({
            appId: app.id,
            version: nextVersion,
            environment: environment,
            actions: actions,
            stateSchema: stateSchema || {},
            publishedAt: environment === "production" ? new Date() : null, // Auto-publish if env is prod
            createdAt: new Date(),
        }).returning();

        console.log(`[SDK Manifest] Synced v${nextVersion} for App: ${app.name} (${environment})`);

        return NextResponse.json({ 
            success: true, 
            version: newManifest.version,
            message: "Manifest synced successfully"
        }, { status: 200 });

    } catch (error) {
        console.error("[SDK Manifest API] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}