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

            const c = new DoweitClient({ publicKey, language: "en" });

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
                        // If the user said something that already looks like an id,
                        // pass it through — the page-level layout will redirect
                        // numeric ids to the publicId variant.
                        if (agentId) {
                            routerRef.current.push(`/callagents/${agentId}`);
                            return { status: "navigated", agentId };
                        }
                        if (agentName) {
                            try {
                                const res = await fetch("/api/callagents");
                                if (res.ok) {
                                    const data = await res.json();
                                    const list = Array.isArray(data) ? data : data?.agents || [];
                                    const needle = String(agentName).toLowerCase().trim();
                                    const match = list.find(
                                        (a) => a?.name && String(a.name).toLowerCase().includes(needle),
                                    );
                                    if (match) {
                                        const id = match.publicId || match.id;
                                        routerRef.current.push(`/callagents/${id}`);
                                        return { status: "navigated", agentId: id };
                                    }
                                }
                            } catch { /* fall through */ }
                        }
                        routerRef.current.push("/callagents");
                        return {
                            status: "ambiguous",
                            hint: "Showed the agents list — please tell me which one.",
                        };
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
