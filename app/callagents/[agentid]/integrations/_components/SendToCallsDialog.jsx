"use client";
// app/callagents/[agentid]/integrations/_components/SendToCallsDialog.jsx
//
// Modal that lists past calls with extracted actions and lets the user fire
// the rule for the selected ones. The result is a real Slack/Telegram/Email
// message hitting the destination — perfect for demos ("look, the data from
// my Tuesday lead just landed in #sales").

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
    FiX,
    FiLoader,
    FiPhoneCall,
    FiCheck,
    FiArrowDown,
    FiArrowUp,
} from "react-icons/fi";

import { uiColors } from "../../../_constants/uiConstants";

function formatTime(ts) {
    if (!ts) return "—";
    try {
        return new Date(ts).toLocaleString();
    } catch {
        return String(ts);
    }
}

function formatDuration(s) {
    if (!s || typeof s !== "number") return "—";
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;
}

export default function SendToCallsDialog({
    isOpen,
    onClose,
    agentId,
    ruleId,
    providerLabel,
}) {
    const [calls, setCalls] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const [isSending, setIsSending] = useState(false);
    const [results, setResults] = useState(null);

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/callagents/${agentId}/calls/with-actions`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load calls");
            setCalls(data.calls || []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [agentId]);

    useEffect(() => {
        if (!isOpen) return;
        setSelected(new Set());
        setResults(null);
        reload();
    }, [isOpen, reload]);

    const toggle = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAll = () => {
        if (selected.size === calls.length && calls.length > 0) {
            setSelected(new Set());
        } else {
            setSelected(new Set(calls.map((c) => c.id)));
        }
    };

    const handleSend = async () => {
        if (selected.size === 0) {
            toast.error("Pick at least one call");
            return;
        }
        setIsSending(true);
        const id = toast.loading(`Sending ${selected.size} message(s) to ${providerLabel}…`);
        try {
            const res = await fetch(
                `/api/callagents/${agentId}/integrations/rules/${ruleId}/send-to-calls`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ callIds: Array.from(selected) }),
                },
            );
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Send failed");
            setResults(data);
            const summary = `${data.sent} sent, ${data.failed} failed, ${data.skipped} skipped`;
            if (data.failed > 0) {
                toast.error(summary, { id });
            } else {
                toast.success(summary, { id });
            }
        } catch (e) {
            toast.error(e.message, { id });
        } finally {
            setIsSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary}`}
            >
                {/* Header */}
                <header
                    className={`flex items-center justify-between px-6 py-4 border-b ${uiColors.borderPrimary}`}
                >
                    <div>
                        <h2 className={`text-lg font-bold ${uiColors.textPrimary}`}>
                            Send rule to past calls
                        </h2>
                        <p className={`text-xs mt-1 ${uiColors.textSecondary}`}>
                            Pick one or more past calls. We'll render the rule with that call's
                            real action data and send it to {providerLabel}.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className={`p-6 flex items-center gap-2 text-sm ${uiColors.textSecondary}`}>
                            <FiLoader className="w-4 h-4 animate-spin" /> Loading calls…
                        </div>
                    ) : calls.length === 0 ? (
                        <div className={`p-8 text-center text-sm ${uiColors.textSecondary}`}>
                            <FiPhoneCall className="w-10 h-10 mx-auto mb-3 opacity-40" />
                            No calls with extracted actions yet. After a real call wraps up
                            and gets analyzed, it'll show up here.
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-2 px-2">
                                <button
                                    type="button"
                                    onClick={toggleAll}
                                    className={`text-xs font-medium ${uiColors.accentPrimary} hover:underline`}
                                >
                                    {selected.size === calls.length ? "Clear selection" : "Select all"}
                                </button>
                                <span className={`text-xs ${uiColors.textPlaceholder}`}>
                                    {selected.size} of {calls.length} selected
                                </span>
                            </div>
                            <ul className={`divide-y ${uiColors.borderPrimary} border ${uiColors.borderPrimary} rounded-lg overflow-hidden`}>
                                {calls.map((c) => {
                                    const isSelected = selected.has(c.id);
                                    return (
                                        <li key={c.id}>
                                            <label
                                                className={`flex items-start gap-3 p-3 cursor-pointer ${isSelected ? uiColors.accentSubtleBg : uiColors.hoverBgSubtle}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggle(c.id)}
                                                    className="mt-1"
                                                />
                                                <div className="flex-grow min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className={`font-mono text-sm font-semibold ${uiColors.textPrimary}`}>
                                                            {c.phoneNumber || `Call #${c.id}`}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                                                            {c.direction === "inbound" ? (
                                                                <FiArrowDown className="w-3 h-3" />
                                                            ) : (
                                                                <FiArrowUp className="w-3 h-3" />
                                                            )}
                                                            {c.direction || "—"}
                                                        </span>
                                                        <span className={`text-[10px] uppercase font-semibold ${uiColors.accentBadgeText} ${uiColors.accentBadgeBg} px-1.5 py-0.5 rounded`}>
                                                            {c.actionCount} action{c.actionCount === 1 ? "" : "s"}
                                                        </span>
                                                    </div>
                                                    <div className={`text-xs mt-1 ${uiColors.textSecondary}`}>
                                                        {formatTime(c.startTime)} · {formatDuration(c.duration)}
                                                        {c.summary && (
                                                            <span className="ml-1">
                                                                · <span className={uiColors.textPlaceholder}>{c.summary.slice(0, 80)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}

                    {/* Result summary after a send */}
                    {results && (
                        <div className={`mt-4 rounded-lg border ${uiColors.borderPrimary} p-3 text-sm`}>
                            <div className={`font-semibold ${uiColors.textPrimary}`}>
                                Result: {results.sent} sent, {results.failed} failed, {results.skipped} skipped
                            </div>
                            <ul className="mt-2 space-y-1">
                                {results.results?.slice(0, 12).map((r) => (
                                    <li
                                        key={r.callId}
                                        className={`text-xs flex items-center gap-2 ${
                                            r.status === "success"
                                                ? "text-green-600 dark:text-green-400"
                                                : r.status === "failed"
                                                  ? "text-red-600 dark:text-red-400"
                                                  : uiColors.textPlaceholder
                                        }`}
                                    >
                                        <span className="font-mono">#{r.callId}</span>
                                        <span className="font-semibold uppercase">{r.status}</span>
                                        <span className="font-mono">{r.detail || ""}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer
                    className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${uiColors.borderPrimary}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending || selected.size === 0}
                        className={`px-4 py-2 text-sm rounded-md text-white inline-flex items-center gap-2 ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                    >
                        {isSending ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                        ) : (
                            <FiCheck className="w-4 h-4" />
                        )}
                        Send to {selected.size || 0} call{selected.size === 1 ? "" : "s"}
                    </button>
                </footer>
            </motion.div>
        </div>
    );
}
