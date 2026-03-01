"use client";
// app/callagents/[agentid]/integrations/_components/CalcomCard.jsx
//
// Cal.com section of the per-agent Integrations page. Cal.com is a
// "capability" rather than a destination — once enabled the agent gets
// scheduling superpowers during the call (check availability, create
// bookings) via Vapi function tools.
//
// Storage: reuses `agent_integrations` with provider='calcom'. The
// destinationConfig JSONB holds:
//   { eventTypeId, scope, timeZone, autoConfirm }

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import {
    FiCalendar,
    FiCheckCircle,
    FiCircle,
    FiExternalLink,
    FiLoader,
    FiSettings,
} from "react-icons/fi";
import Link from "next/link";

import { uiColors } from "../../../_constants/uiConstants";

const SCOPES = [
    { id: "off", label: "Disabled", description: "Agent has no calendar access on calls." },
    {
        id: "read_only",
        label: "Read-only",
        description: "Agent can answer 'when am I free?' but won't book anything.",
    },
    {
        id: "read_book",
        label: "Read + Book",
        description: "Agent can check availability and lock in new bookings.",
    },
    {
        id: "read_book_reschedule",
        label: "Full access",
        description: "Read, book, and reschedule existing bookings.",
    },
];

export default function CalcomCard({ agentId, isConnected, onChange }) {
    const [rule, setRule] = useState(null);
    const [eventTypes, setEventTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Local form state mirrors rule.destinationConfig for editing.
    const [eventTypeId, setEventTypeId] = useState("");
    const [scope, setScope] = useState("read_only");
    const [timeZone, setTimeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    );
    const [autoConfirm, setAutoConfirm] = useState(true);

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rulesRes, etRes] = await Promise.all([
                fetch(`/api/callagents/${agentId}/integrations/rules`),
                isConnected
                    ? fetch(`/api/integrations/calcom/event-types`)
                    : Promise.resolve(null),
            ]);
            if (rulesRes.ok) {
                const { rules } = await rulesRes.json();
                const calcomRule = rules.find((r) => r.provider === "calcom") || null;
                setRule(calcomRule);
                if (calcomRule) {
                    const cfg = calcomRule.destinationConfig || {};
                    setEventTypeId(cfg.eventTypeId || "");
                    setScope(cfg.scope || "read_only");
                    setTimeZone(cfg.timeZone || timeZone);
                    setAutoConfirm(cfg.autoConfirm !== false);
                }
            }
            if (etRes && etRes.ok) {
                const { eventTypes: list } = await etRes.json();
                setEventTypes(list || []);
            } else if (etRes && !etRes.ok) {
                setEventTypes([]);
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [agentId, isConnected, timeZone]);

    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agentId, isConnected]);

    const save = async () => {
        if (!isConnected) {
            toast.error("Connect Cal.com on the workspace Integrations page first.");
            return;
        }
        if (!eventTypeId) {
            toast.error("Pick an event type before saving.");
            return;
        }
        setIsSaving(true);
        try {
            const payload = {
                provider: "calcom",
                name: "Cal.com calendar tools",
                destinationConfig: {
                    eventTypeId: Number(eventTypeId),
                    scope,
                    timeZone,
                    autoConfirm,
                },
                filter: { mode: "all_calls" },
                enabled: scope !== "off",
            };

            let res;
            if (rule) {
                res = await fetch(
                    `/api/callagents/${agentId}/integrations/rules/${rule.id}`,
                    {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(payload),
                    },
                );
            } else {
                res = await fetch(`/api/callagents/${agentId}/integrations/rules`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
            }
            if (!res.ok) throw new Error((await res.json()).error || "Save failed");
            toast.success("Cal.com configuration saved.");
            await reload();
            onChange?.();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    const isEnabled = !!rule && rule.enabled && scope !== "off";

    return (
        <div
            className={`rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-4`}
        >
            <header className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${uiColors.bgSecondary}`}>
                    <FiCalendar className={`w-5 h-5 ${uiColors.textPrimary}`} />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`font-semibold ${uiColors.textPrimary}`}>
                            Cal.com — calendar tools
                        </h4>
                        {isEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-400">
                                <FiCheckCircle className="w-3 h-3" /> Active mid-call
                            </span>
                        ) : (
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                                <FiCircle className="w-3 h-3" /> Inactive
                            </span>
                        )}
                    </div>
                    <p className={`text-xs mt-1 ${uiColors.textSecondary}`}>
                        Lets the agent check the calendar and create bookings during a live
                        call. The caller can ask "when are you free Tuesday?" or "book me at
                        2 PM" and the agent answers using your Cal.com data in real time.
                    </p>
                    {!isConnected && (
                        <Link
                            href="/callagents/Integrations"
                            className={`inline-flex items-center gap-1 mt-2 text-xs font-medium ${uiColors.accentPrimary} hover:underline`}
                        >
                            Connect Cal.com on the workspace page first
                            <FiExternalLink className="w-3 h-3" />
                        </Link>
                    )}
                </div>
            </header>

            {isConnected && (
                <div className={`mt-4 pt-4 border-t ${uiColors.borderPrimary} space-y-4`}>
                    {isLoading ? (
                        <div className={`text-sm ${uiColors.textSecondary} flex items-center gap-2`}>
                            <FiLoader className="w-4 h-4 animate-spin" /> Loading…
                        </div>
                    ) : (
                        <>
                            {/* Event type picker */}
                            <div>
                                <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                    Event type
                                </label>
                                {eventTypes.length === 0 ? (
                                    <p className={`text-xs ${uiColors.textPlaceholder}`}>
                                        No event types found on your Cal.com account. Create
                                        one in Cal.com first (e.g. "30-min consultation").
                                    </p>
                                ) : (
                                    <select
                                        value={eventTypeId}
                                        onChange={(e) => setEventTypeId(e.target.value)}
                                        className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                                    >
                                        <option value="">Pick an event type…</option>
                                        {eventTypes.map((e) => (
                                            <option key={e.id} value={e.id}>
                                                {e.title} ({e.length} min)
                                            </option>
                                        ))}
                                    </select>
                                )}
                                <p className={`text-xs mt-1 ${uiColors.textPlaceholder}`}>
                                    The agent will use this event type's length and metadata
                                    when checking slots and booking. Manage event types on{" "}
                                    <a
                                        href="https://cal.com/event-types"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        cal.com/event-types
                                    </a>
                                    .
                                </p>
                            </div>

                            {/* Scope */}
                            <div>
                                <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-2`}>
                                    What can this agent do?
                                </label>
                                <div className="space-y-2">
                                    {SCOPES.map((s) => (
                                        <label
                                            key={s.id}
                                            className={`flex items-start gap-2 text-sm cursor-pointer ${uiColors.textSecondary}`}
                                        >
                                            <input
                                                type="radio"
                                                name="calcom-scope"
                                                value={s.id}
                                                checked={scope === s.id}
                                                onChange={() => setScope(s.id)}
                                                className="mt-1"
                                            />
                                            <span>
                                                <span className={`block font-medium ${uiColors.textPrimary}`}>
                                                    {s.label}
                                                </span>
                                                {s.description}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Time zone + auto confirm */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                        Default time zone
                                    </label>
                                    <input
                                        type="text"
                                        value={timeZone}
                                        onChange={(e) => setTimeZone(e.target.value)}
                                        placeholder="America/New_York"
                                        className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                                    />
                                    <p className={`text-xs mt-1 ${uiColors.textPlaceholder}`}>
                                        Used when the caller doesn't specify one.
                                    </p>
                                </div>
                                <label className={`flex items-start gap-2 text-sm cursor-pointer ${uiColors.textSecondary} pt-7`}>
                                    <input
                                        type="checkbox"
                                        checked={autoConfirm}
                                        onChange={(e) => setAutoConfirm(e.target.checked)}
                                    />
                                    <span>
                                        <span className={`block font-medium ${uiColors.textPrimary}`}>
                                            Auto-confirm bookings
                                        </span>
                                        Off = bookings created as tentative; you confirm in Cal.com.
                                    </span>
                                </label>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                                <span className={`text-xs ${uiColors.textPlaceholder} flex items-center gap-1`}>
                                    <FiSettings className="w-3.5 h-3.5" />
                                    Tools injected into the agent: <code className="font-mono">check_availability</code>
                                    , <code className="font-mono">list_upcoming_bookings</code>
                                    {(scope === "read_book" || scope === "read_book_reschedule") && (
                                        <>, <code className="font-mono">create_booking</code></>
                                    )}
                                </span>
                                <button
                                    onClick={save}
                                    disabled={isSaving}
                                    className={`px-3 py-1.5 text-sm rounded-md text-white inline-flex items-center gap-2 ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                                >
                                    {isSaving && <FiLoader className="w-4 h-4 animate-spin" />}
                                    Save Cal.com settings
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
