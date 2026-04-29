"use client";
// app/callagents/[agentid]/integrations/_components/SlackChannelPicker.jsx
//
// Lightweight searchable dropdown over the connected workspace's channels.
// Only channels the bot is a member of can receive messages — we surface that
// state so users get immediate feedback if they need to /invite @doweit.

import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiSearch, FiLock, FiHash, FiLoader } from "react-icons/fi";
import { uiColors } from "../../../_constants/uiConstants";

export default function SlackChannelPicker({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [channels, setChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/integrations/slack/channels");
                const data = await res.json();
                if (cancelled) return;
                if (!res.ok) throw new Error(data.error || "Failed to load channels");
                setChannels(data.channels || []);
                setError(null);
            } catch (e) {
                if (!cancelled) setError(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const selected = useMemo(
        () => channels.find((c) => c.id === value),
        [channels, value],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return channels;
        return channels.filter((c) => c.name.toLowerCase().includes(q));
    }, [channels, search]);

    return (
        <div>
            <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                Slack channel
            </label>
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className={`flex w-full items-center justify-between rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
            >
                <span className="flex items-center gap-2">
                    {selected ? (
                        <>
                            {selected.isPrivate ? (
                                <FiLock className="w-3.5 h-3.5" />
                            ) : (
                                <FiHash className="w-3.5 h-3.5" />
                            )}
                            {selected.name}
                        </>
                    ) : (
                        <span className={uiColors.textPlaceholder}>Pick a channel…</span>
                    )}
                </span>
                <FiChevronDown className={`w-4 h-4 ${uiColors.textSecondary}`} />
            </button>

            {isOpen && (
                <div
                    className={`mt-1 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-lg max-h-72 overflow-hidden flex flex-col`}
                >
                    <div className={`p-2 border-b ${uiColors.borderPrimary} flex items-center gap-2`}>
                        <FiSearch className={`w-4 h-4 ${uiColors.textPlaceholder}`} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search channels…"
                            className={`flex-grow text-sm bg-transparent focus:outline-none ${uiColors.textPrimary}`}
                        />
                    </div>
                    <div className="overflow-y-auto">
                        {loading && (
                            <div className={`p-3 text-sm flex items-center gap-2 ${uiColors.textSecondary}`}>
                                <FiLoader className="w-4 h-4 animate-spin" />
                                Loading channels…
                            </div>
                        )}
                        {error && (
                            <div className="p-3 text-sm text-red-600 dark:text-red-400">
                                {error}
                            </div>
                        )}
                        {!loading && !error && filtered.length === 0 && (
                            <div className={`p-3 text-sm ${uiColors.textPlaceholder}`}>
                                No channels match.
                            </div>
                        )}
                        {!loading && !error &&
                            filtered.map((c) => {
                                const inviteWarning = !c.isMember;
                                return (
                                    <button
                                        type="button"
                                        key={c.id}
                                        onClick={() => {
                                            onChange(c);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-2 flex items-center justify-between gap-2 text-sm ${uiColors.hoverBgSubtle} ${uiColors.textPrimary}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {c.isPrivate ? (
                                                <FiLock className="w-3.5 h-3.5" />
                                            ) : (
                                                <FiHash className="w-3.5 h-3.5" />
                                            )}
                                            {c.name}
                                        </span>
                                        {inviteWarning && (
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.alertWarningText}`}>
                                                Invite bot
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                    </div>
                </div>
            )}
            <p className={`text-xs mt-1 ${uiColors.textPlaceholder}`}>
                Only channels the Doweit bot has been invited to can receive messages.
                Type <code className="font-mono">/invite @doweit</code> in your channel if needed.
            </p>
        </div>
    );
}
