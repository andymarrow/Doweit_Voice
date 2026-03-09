"use client";
// app/callagents/[agentid]/integrations/_components/IntegrationsRulesPage.jsx
//
// Top-level client page for per-agent integration rules. Lists existing rules,
// surfaces an "Add destination" entry that opens the rule editor sheet, and
// shows a "not connected yet" empty state with a deep link to the workspace
// Integrations page when the user hasn't connected any provider.

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
    FiPlus,
    FiSlack,
    FiSend,
    FiMail,
    FiExternalLink,
    FiAlertCircle,
} from "react-icons/fi";

import { uiColors, sectionVariants } from "../../../_constants/uiConstants";
import { useCallAgent } from "../../_context/CallAgentContext";

import RuleCard from "./RuleCard";
import RuleEditorSheet from "./RuleEditorSheet";
import CalcomCard from "./CalcomCard";

// Provider catalog used for the empty state + add menu. The colour pair (light/dark)
// matches each brand's accent without overriding the platform's purple/cyan accent.
const PROVIDER_CATALOG = [
    {
        id: "slack",
        name: "Slack",
        Icon: FiSlack,
        description: "Post a Block Kit message to a channel after every call.",
    },
    {
        id: "telegram",
        name: "Telegram",
        Icon: FiSend,
        description: "Send a formatted message to a Telegram chat or group.",
    },
    {
        id: "email",
        name: "Email",
        Icon: FiMail,
        description: "Email a beautifully-formatted summary to one or more recipients.",
    },
];

export default function IntegrationsRulesPage() {
    const agent = useCallAgent();

    const [rules, setRules] = useState([]);
    const [connectedProviders, setConnectedProviders] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);

    const [editorState, setEditorState] = useState({
        open: false,
        rule: null,
        provider: null,
    });

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rulesRes, connRes] = await Promise.all([
                fetch(`/api/callagents/${agent.publicId}/integrations/rules`),
                fetch(`/api/integrations/connections`),
            ]);
            if (!rulesRes.ok) throw new Error("Failed to load rules");
            if (!connRes.ok) throw new Error("Failed to load connections");
            const rulesJson = await rulesRes.json();
            const connJson = await connRes.json();
            setRules(rulesJson.rules || []);
            setConnectedProviders(new Set(connJson || []));
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [agent.publicId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const handleAdd = (provider) => {
        if (!connectedProviders.has(provider)) {
            toast.error(
                `Connect ${provider[0].toUpperCase() + provider.slice(1)} on the workspace Integrations page first.`,
            );
            return;
        }
        setEditorState({ open: true, rule: null, provider });
    };

    const handleEdit = (rule) => {
        setEditorState({ open: true, rule, provider: rule.provider });
    };

    const handleDelete = async (rule) => {
        if (!confirm(`Delete "${rule.name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(
                `/api/callagents/${agent.publicId}/integrations/rules/${rule.id}`,
                { method: "DELETE" },
            );
            if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
            toast.success("Rule deleted");
            setRules((prev) => prev.filter((r) => r.id !== rule.id));
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleToggle = async (rule, enabled) => {
        try {
            const res = await fetch(
                `/api/callagents/${agent.publicId}/integrations/rules/${rule.id}`,
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ enabled }),
                },
            );
            if (!res.ok) throw new Error("Update failed");
            const { rule: updated } = await res.json();
            setRules((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleTest = async (rule) => {
        const id = toast.loading("Sending test message…");
        try {
            const res = await fetch(
                `/api/callagents/${agent.publicId}/integrations/rules/${rule.id}/test`,
                { method: "POST" },
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Test failed");
            toast.success("Test sent — check the destination", { id });
            // Refresh so the lastDispatch chip updates.
            reload();
        } catch (e) {
            toast.error(`Test failed: ${e.message}`, { id });
        }
    };

    const handleEditorSaved = () => {
        setEditorState({ open: false, rule: null, provider: null });
        reload();
    };

    const noConnections = connectedProviders.size === 0;

    return (
        <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-6 w-full"
        >
            <header className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>
                        Integrations
                    </h2>
                    <p className={`${uiColors.textSecondary} mt-1 text-sm max-w-2xl`}>
                        Send extracted action data and call summaries to Slack, Telegram, or
                        Email after every call. Rules below run automatically once the call
                        ends — customise the message format, pick a destination, and test
                        before going live.
                    </p>
                </div>
                <Link
                    href="/callagents/Integrations"
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${uiColors.accentPrimary} hover:underline`}
                >
                    Manage connected accounts <FiExternalLink className="w-3.5 h-3.5" />
                </Link>
            </header>

            {noConnections && !isLoading && (
                <div
                    className={`rounded-lg p-4 flex items-start gap-3 ${uiColors.alertWarningBg} ${uiColors.alertWarningBorder} border`}
                >
                    <FiAlertCircle
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${uiColors.alertWarningText}`}
                    />
                    <div className="text-sm">
                        <p className={`font-semibold ${uiColors.alertWarningText}`}>
                            No accounts connected yet
                        </p>
                        <p className={`mt-1 ${uiColors.alertWarningText}`}>
                            Before defining a rule for this agent, connect at least one of
                            Slack, Telegram, or Email on the{" "}
                            <Link
                                href="/callagents/Integrations"
                                className="underline font-semibold"
                            >
                                workspace Integrations page
                            </Link>
                            . You only need to do this once per workspace.
                        </p>
                    </div>
                </div>
            )}

            {/* Mid-call capabilities (Cal.com) — fundamentally different from
                destination rules below. Lives above the messaging rules so the
                "calendar" feature gets prominence. */}
            <section>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${uiColors.textPlaceholder}`}>
                    Mid-call capabilities
                </h3>
                <CalcomCard
                    agentId={agent.publicId}
                    isConnected={connectedProviders.has("calcom")}
                    onChange={reload}
                />
            </section>

            {/* Add destination cards */}
            <section>
                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${uiColors.textPlaceholder}`}>
                    Add a destination
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PROVIDER_CATALOG.map((p) => {
                        const connected = connectedProviders.has(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => handleAdd(p.id)}
                                className={`text-left rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary}
                                            p-4 transition-all
                                            ${connected ? "hover:shadow-md hover:-translate-y-0.5" : "opacity-60 cursor-not-allowed"}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${uiColors.bgSecondary}`}>
                                        <p.Icon className={`w-4 h-4 ${uiColors.textPrimary}`} />
                                    </div>
                                    {connected ? (
                                        <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                                            Connected
                                        </span>
                                    ) : (
                                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                                            Not connected
                                        </span>
                                    )}
                                </div>
                                <h4 className={`mt-3 font-semibold ${uiColors.textPrimary}`}>
                                    Send to {p.name}
                                </h4>
                                <p className={`mt-1 text-xs ${uiColors.textSecondary} leading-relaxed`}>
                                    {p.description}
                                </p>
                                <span
                                    className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${connected ? uiColors.accentPrimary : uiColors.textPlaceholder}`}
                                >
                                    <FiPlus className="w-3.5 h-3.5" /> Add rule
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Existing rules — calcom is rendered separately as CalcomCard. */}
            <section>
                {(() => {
                    const messagingRules = rules.filter((r) => r.provider !== "calcom");
                    return (
                        <>
                            <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${uiColors.textPlaceholder}`}>
                                {messagingRules.length === 0
                                    ? "No rules yet"
                                    : `${messagingRules.length} rule${messagingRules.length === 1 ? "" : "s"}`}
                            </h3>
                            {isLoading ? (
                                <div className={`text-sm ${uiColors.textSecondary}`}>Loading…</div>
                            ) : messagingRules.length === 0 ? (
                                <div className={`rounded-lg border-dashed border-2 ${uiColors.borderPrimary} p-8 text-center`}>
                                    <p className={`text-sm ${uiColors.textSecondary}`}>
                                        Add your first rule above to start sending call data automatically.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {messagingRules.map((rule) => (
                                        <RuleCard
                                            key={rule.id}
                                            rule={rule}
                                            onEdit={() => handleEdit(rule)}
                                            onDelete={() => handleDelete(rule)}
                                            onToggle={(enabled) => handleToggle(rule, enabled)}
                                            onTest={() => handleTest(rule)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    );
                })()}
            </section>

            <RuleEditorSheet
                isOpen={editorState.open}
                onClose={() => setEditorState({ open: false, rule: null, provider: null })}
                onSaved={handleEditorSaved}
                provider={editorState.provider}
                rule={editorState.rule}
                agentId={agent.publicId}
            />
        </motion.div>
    );
}
