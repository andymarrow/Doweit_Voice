"use client";
// app/_components/SiteAssistant.jsx
//
// Global Doweit Voice site assistant. Mounted once at the root layout, this
// component instantiates a DoweitClient + DoweitWidget configured to:
//
//   - Navigate the app by voice ("take me to phone numbers")
//   - Open a specific user agent ("open my clinic agent")
//   - Create a brand-new call agent ("make a new outbound agent named …")
//   - Edit the current agent's settings while on its detail page
//     ("set the greeting to …", "enable recording", "switch the voice to …")
//
// Behaviour by env:
//   NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY missing → renders nothing (graceful no-op).
//   NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY set     → mounts the chat widget.
//
// The bootstrap endpoint at /api/sdk/site-assistant/bootstrap creates the
// matching SDK app + manifest in the database. See
// .claude/guide/site-assistant.md for the one-time setup.

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";

// The SDK pulls in framer-motion + lucide-react and uses browser-only APIs
// (AudioContext, MediaRecorder), so it MUST be client-side only.
const DoweitWidget = dynamic(
    () => import("@doweit/voice").then((m) => m.DoweitWidget),
    { ssr: false },
);

// Friendly section names → app routes. Kept in sync with
// lib/siteAssistant/manifest.js (server-side).
const SECTION_TO_PATH = {
    home: "/voice-agents-dashboard",
    dashboard: "/voice-agents-dashboard",
    "call agents": "/callagents",
    agents: "/callagents",
    integrations: "/callagents/Integrations",
    "phone numbers": "/callagents/phone-numbers",
    phones: "/callagents/phone-numbers",
    actions: "/callagents/actions",
    "knowledge base": "/callagents/knowledgebase",
    knowledge: "/callagents/knowledgebase",
    workflow: "/callagents/workflow",
    "alan ai": "/test-sdk",
    alan: "/test-sdk",
    "sdk playground": "/callagents/embedded",
    sdk: "/callagents/embedded",
    "character ai": "/characterai",
    character: "/characterai",
    recruitment: "/agents",
    interviews: "/agents",
};

function resolveDestination(input) {
    if (!input || typeof input !== "string") return null;
    const s = input.trim().toLowerCase();
    if (s.startsWith("/")) return s;
    if (SECTION_TO_PATH[s]) return SECTION_TO_PATH[s];
    for (const [key, path] of Object.entries(SECTION_TO_PATH)) {
        if (s.includes(key)) return path;
    }
    return null;
}

// Sub-page suffixes inside a single agent's detail view. Kept in sync with
// AGENT_SECTIONS in lib/siteAssistant/manifest.js.
const AGENT_SECTION_SUFFIX = {
    overview: "",
    configure: "/configure",
    voice: "/configure",
    "call settings": "/configure",
    "call config": "/configure",
    prompt: "/prompt",
    actions: "/actions",
    calls: "/calls",
    "call history": "/calls",
    deployment: "/deployment",
    deploy: "/deployment",
    integrations: "/integrations",
};

function resolveAgentSection(input) {
    if (!input || typeof input !== "string") return null;
    const s = input.trim().toLowerCase();
    if (s in AGENT_SECTION_SUFFIX) return AGENT_SECTION_SUFFIX[s];
    for (const [key, suffix] of Object.entries(AGENT_SECTION_SUFFIX)) {
        if (s.includes(key)) return suffix;
    }
    return null;
}

// Find one of the user's agents by spoken name. Returns the URL-safe id
// (publicId when present) or null.
async function lookupAgentIdByName(agentName) {
    try {
        const res = await fetch("/api/callagents");
        if (!res.ok) return null;
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.agents || [];
        const needle = String(agentName).toLowerCase().trim();
        const match =
            list.find((a) => a?.name && String(a.name).toLowerCase() === needle) ||
            list.find((a) => a?.name && String(a.name).toLowerCase().includes(needle));
        return match ? match.publicId || match.id : null;
    } catch {
        return null;
    }
}

// Pull the agent id out of the current pathname when we're on a
// /callagents/<id>/... page. Used to scope `update_agent`. Matches both the
// new publicId (UUID) format and the legacy integer id form.
function agentIdFromPath(pathname) {
    if (!pathname) return null;
    const m = pathname.match(
        /^\/callagents\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)(?:\/|$)/i,
    );
    return m ? m[1] : null;
}

export default function SiteAssistant() {
    const router = useRouter();
    const pathname = usePathname();
    const [client, setClient] = useState(null);

    // Refs so the SDK handlers always read the latest values without
    // depending on stale closures. Critical: the SDK is built once and
    // never re-registers handlers, so direct closures over `pathname`
    // would freeze on whatever path was set when the widget mounted.
    const pathnameRef = useRef(pathname);
    const routerRef = useRef(router);
    useEffect(() => { pathnameRef.current = pathname; }, [pathname]);
    useEffect(() => { routerRef.current = router; }, [router]);

    const publicKey = process.env.NEXT_PUBLIC_DOWEIT_SITE_PUBLIC_KEY;

    useEffect(() => {
        if (!publicKey) return;
        let cancelled = false;

        (async () => {
            const { DoweitClient } = await import("@doweit/voice");
            if (cancelled) return;

            const c = new DoweitClient({
                publicKey,
                language: "en",
                // On localhost NEXT_PUBLIC_WS_SERVER_URL is unset → baseUrl is ""
                // → SDK falls back to window.location.host → local Next.js handles WS.
                // On Vercel set NEXT_PUBLIC_WS_SERVER_URL=https://<your-render-app>.onrender.com
                // → SDK connects to the standalone Render server instead.
                baseUrl: process.env.NEXT_PUBLIC_WS_SERVER_URL || "",
            });

            // Live UI state pushed to Gemini before each turn. Including
            // currentAgentId here is what lets the model decide whether
            // `update_agent` is a valid choice.
            c.bindState(() => {
                const path = pathnameRef.current || "/";
                return {
                    currentPath: path,
                    currentAgentId: agentIdFromPath(path),
                };
            });

            c.register({
                navigate: {
                    description: "Navigate to a section of the Doweit Voice app.",
                    params: { destination: { type: "string", required: true } },
                    handler: async ({ destination }) => {
                        const path = resolveDestination(destination);
                        if (!path) {
                            return {
                                status: "unknown_destination",
                                input: destination,
                                hint: "Try one of: home, call agents, integrations, phone numbers, actions, knowledge base, workflow, alan ai, sdk playground, character ai, recruitment.",
                            };
                        }
                        routerRef.current.push(path);
                        return { status: "navigated", to: path };
                    },
                },

                open_agent: {
                    description: "Open the detail page for one of the user's call agents.",
                    params: {
                        agentId: { type: "string", required: false },
                        agentName: { type: "string", required: false },
                    },
                    handler: async ({ agentId, agentName }) => {
                        // Always resolve through the agents API so we navigate
                        // straight to the publicId URL. (A bare integer id like
                        // /callagents/27 is not a valid route — it must be the
                        // UUID publicId.)
                        if (agentName) {
                            const id = await lookupAgentIdByName(agentName);
                            if (id) {
                                routerRef.current.push(`/callagents/${id}`);
                                return { status: "navigated", agentId: id };
                            }
                        }
                        // The model passed an id with no name — only trust it if
                        // it already looks like a UUID publicId.
                        if (agentId && /^[0-9a-f-]{36}$/i.test(String(agentId))) {
                            routerRef.current.push(`/callagents/${agentId}`);
                            return { status: "navigated", agentId };
                        }
                        routerRef.current.push("/callagents");
                        return {
                            status: "ambiguous",
                            hint: "Showed the agents list — ask the user which agent by name.",
                        };
                    },
                },

                open_agent_section: {
                    description: "Open a section/tab of a call agent's detail page.",
                    params: {
                        section: { type: "string", required: true },
                        agentName: { type: "string", required: false },
                    },
                    handler: async ({ section, agentName }) => {
                        const suffix = resolveAgentSection(section);
                        if (suffix === null) {
                            return {
                                status: "unknown_section",
                                hint: "Valid sections: overview, configure, voice, call settings, prompt, actions, calls, deployment, integrations.",
                            };
                        }
                        let id = agentName
                            ? await lookupAgentIdByName(agentName)
                            : agentIdFromPath(pathnameRef.current);
                        if (!id) id = agentIdFromPath(pathnameRef.current);
                        if (!id) {
                            return {
                                status: "no_agent_in_view",
                                hint: "Ask the user which agent — none is currently open.",
                            };
                        }
                        routerRef.current.push(`/callagents/${id}${suffix}`);
                        return { status: "navigated", to: `${section}`, agentId: id };
                    },
                },

                get_agent_info: {
                    description: "Report the current agent's settings.",
                    params: {},
                    handler: async () => {
                        const id = agentIdFromPath(pathnameRef.current);
                        if (!id) {
                            return {
                                status: "no_agent_in_view",
                                hint: "Ask the user to open an agent first.",
                            };
                        }
                        try {
                            const res = await fetch(`/api/callagents/${id}/config`);
                            if (!res.ok) throw new Error(`Failed (${res.status})`);
                            const a = await res.json();
                            return {
                                status: "ok",
                                info: {
                                    name: a?.name ?? null,
                                    status: a?.status ?? null,
                                    type: a?.type ?? null,
                                    aiModel: a?.aiModel ?? null,
                                    voice: a?.voiceConfig?.voiceId ?? null,
                                    recordingEnabled: !!a?.callConfig?.recordingEnabled,
                                    useFillerWords: !!a?.useFillerWords,
                                    greeting: a?.greetingMessage ?? null,
                                    timezone: a?.timezone ?? null,
                                },
                            };
                        } catch (e) {
                            return { status: "error", message: e.message };
                        }
                    },
                },

                list_integrations: {
                    description: "Report which integrations the user has connected.",
                    params: {},
                    handler: async () => {
                        try {
                            const res = await fetch("/api/integrations/connections");
                            if (!res.ok) throw new Error(`Failed (${res.status})`);
                            const providers = await res.json();
                            const connected = Array.isArray(providers) ? providers : [];
                            return {
                                status: "ok",
                                count: connected.length,
                                connected,
                            };
                        } catch (e) {
                            return { status: "error", message: e.message };
                        }
                    },
                },

                add_action: {
                    description: "Attach a reusable action to the current agent.",
                    params: {
                        actionName: { type: "string", required: true },
                        timing: { type: "string", required: false },
                    },
                    handler: async ({ actionName, timing }) => {
                        const id = agentIdFromPath(pathnameRef.current);
                        if (!id) {
                            return {
                                status: "no_agent_in_view",
                                hint: "Ask the user to open an agent first.",
                            };
                        }
                        const when = ["before", "during", "after"].includes(
                            String(timing || "").trim().toLowerCase(),
                        )
                            ? String(timing).trim().toLowerCase()
                            : "during";
                        try {
                            const listRes = await fetch("/api/actions");
                            if (!listRes.ok) throw new Error(`Failed to load actions (${listRes.status})`);
                            const library = await listRes.json();
                            const actionList = Array.isArray(library) ? library : [];
                            const needle = String(actionName).toLowerCase().trim();
                            const match =
                                actionList.find((a) => a?.name && String(a.name).toLowerCase() === needle) ||
                                actionList.find((a) => a?.name && String(a.name).toLowerCase().includes(needle));
                            if (!match) {
                                return {
                                    status: "not_found",
                                    available: actionList.map((a) => a?.name).filter(Boolean),
                                    hint: "Action name didn't match — read the available names and ask which one.",
                                };
                            }
                            const res = await fetch(`/api/callagents/${id}/actions`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ timing: when, actionIds: [match.id] }),
                            });
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                throw new Error(err?.error || `Failed (${res.status})`);
                            }
                            const added = await res.json();
                            const alreadyThere = Array.isArray(added) && added.length === 0;
                            toast.success(
                                alreadyThere
                                    ? `"${match.name}" is already on this agent`
                                    : `Added "${match.name}" (${when})`,
                            );
                            try { routerRef.current.refresh(); } catch { /* noop */ }
                            return {
                                status: alreadyThere ? "already_added" : "added",
                                action: match.name,
                                timing: when,
                            };
                        } catch (e) {
                            toast.error(e.message || "Could not add action");
                            return { status: "error", message: e.message };
                        }
                    },
                },

                open_call: {
                    description: "Open the detail modal for one of the current agent's calls.",
                    params: {
                        which: { type: "string", required: false },
                    },
                    handler: async ({ which }) => {
                        const id = agentIdFromPath(pathnameRef.current);
                        if (!id) {
                            return {
                                status: "no_agent_in_view",
                                hint: "Ask the user to open an agent first.",
                            };
                        }
                        try {
                            const res = await fetch(`/api/callagents/${id}/calls`);
                            if (!res.ok) throw new Error(`Failed to load calls (${res.status})`);
                            const calls = await res.json();
                            const list = Array.isArray(calls) ? calls : [];
                            if (list.length === 0) {
                                return { status: "no_calls", message: "This agent has no calls yet." };
                            }
                            // Calls come back newest-first. `which` is either
                            // "latest"/blank or an ordinal (1 = most recent).
                            let idx = 0;
                            const n = parseInt(String(which || "").replace(/[^0-9]/g, ""), 10);
                            if (Number.isFinite(n) && n >= 1) idx = Math.min(n - 1, list.length - 1);
                            const call = list[idx];
                            // The calls page reads ?call=<id> on load and opens the modal.
                            routerRef.current.push(`/callagents/${id}/calls?call=${call.id}`);
                            return {
                                status: "opened",
                                call: {
                                    id: call.id,
                                    caller: call.customerName || call.phoneNumber || "Unknown caller",
                                    when: call.startTime || null,
                                },
                            };
                        } catch (e) {
                            return { status: "error", message: e.message };
                        }
                    },
                },

                go_back: {
                    description: "Go back to the previous page.",
                    params: {},
                    handler: async () => {
                        routerRef.current.back();
                        return { status: "went_back" };
                    },
                },

                create_agent: {
                    description: "Create a brand-new call agent for this user.",
                    params: {
                        name: { type: "string", required: true },
                        type: { type: "string", required: true },
                    },
                    handler: async ({ name, type }) => {
                        const cleanName = String(name || "").trim();
                        const cleanType = String(type || "").trim().toLowerCase();
                        if (!cleanName) return { status: "error", message: "name is required" };
                        if (!["inbound", "outbound"].includes(cleanType)) {
                            return { status: "error", message: "type must be 'inbound' or 'outbound'" };
                        }

                        try {
                            const fd = new FormData();
                            fd.append("name", cleanName);
                            fd.append("type", cleanType);
                            const res = await fetch("/api/callagents/create", {
                                method: "POST",
                                body: fd,
                            });
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                throw new Error(err?.error || `Failed (${res.status})`);
                            }
                            const created = await res.json();
                            const newId = created.publicId || created.id;
                            toast.success(`Created agent "${cleanName}"`);
                            routerRef.current.push(`/callagents/${newId}`);
                            return {
                                status: "created",
                                agentId: newId,
                                name: cleanName,
                                type: cleanType,
                            };
                        } catch (e) {
                            toast.error(e.message || "Could not create agent");
                            return { status: "error", message: e.message };
                        }
                    },
                },

                update_agent: {
                    description: "Update one setting on the agent currently being viewed.",
                    params: {
                        field: { type: "string", required: true },
                        value: { type: "string", required: true },
                    },
                    handler: async ({ field, value }) => {
                        const id = agentIdFromPath(pathnameRef.current);
                        if (!id) {
                            return {
                                status: "no_agent_in_view",
                                hint: "Open an agent first (the path must be /callagents/<id>/...).",
                            };
                        }
                        try {
                            const res = await fetch(
                                `/api/callagents/${id}/quick-update`,
                                {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ field, value }),
                                },
                            );
                            if (!res.ok) {
                                const err = await res.json().catch(() => ({}));
                                throw new Error(err?.error || `Failed (${res.status})`);
                            }
                            const data = await res.json();
                            toast.success(`Updated ${data.label}`);
                            // Refresh server-rendered parts of the page; client
                            // contexts that fetched once will need a reload to
                            // pick the new value up — see doweit:agent-updated
                            // event below for an opt-in subscriber path.
                            try { routerRef.current.refresh(); } catch { /* noop */ }
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new CustomEvent("doweit:agent-updated", {
                                    detail: { agentId: id, field, value: data.value },
                                }));
                            }
                            return {
                                status: "updated",
                                field: data.field,
                                label: data.label,
                                value: data.value,
                            };
                        } catch (e) {
                            toast.error(e.message || "Could not update agent");
                            return { status: "error", message: e.message };
                        }
                    },
                },
            });

            c.isInitialized = true;
            setClient(c);
        })();

        return () => {
            cancelled = true;
        };
    }, [publicKey]);

    if (!publicKey || !client) return null;
    return <DoweitWidget client={client} />;
}
