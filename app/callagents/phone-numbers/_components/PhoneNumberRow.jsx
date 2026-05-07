"use client";
// app/callagents/phone-numbers/_components/PhoneNumberRow.jsx
//
// One row per number — provider badge, e164, friendly name, capabilities,
// assignment chip, edit/delete actions.

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
    FiPhone,
    FiEdit2,
    FiTrash2,
    FiCheck,
    FiX,
    FiExternalLink,
} from "react-icons/fi";
import { uiColors } from "../../_constants/uiConstants";

function ProviderBadge({ provider }) {
    const map = {
        twilio: { label: "Twilio", color: "bg-red-500" },
        vapi: { label: "Vapi", color: "bg-emerald-500" },
    };
    const info = map[provider] || { label: provider, color: "bg-gray-400" };
    return (
        <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider`}>
            <span className={`w-1.5 h-1.5 rounded-full ${info.color}`} />
            {info.label}
        </span>
    );
}

export default function PhoneNumberRow({ number, onChanged }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(number.friendlyName || "");
    const [busy, setBusy] = useState(false);

    const saveName = async () => {
        setBusy(true);
        try {
            const res = await fetch(`/api/phone-numbers/${number.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ friendlyName: name }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Save failed");
            toast.success("Renamed");
            setEditing(false);
            onChanged?.();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (
            !confirm(
                `Delete ${number.e164}? This unassigns it from any agent and releases Vapi's claim, but does NOT delete it on Twilio.`,
            )
        )
            return;
        setBusy(true);
        try {
            const res = await fetch(`/api/phone-numbers/${number.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error((await res.json()).error || "Delete failed");
            toast.success("Deleted");
            onChanged?.();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <li className="flex items-center gap-4 px-6 py-4">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${uiColors.bgSecondary}`}>
                <FiPhone className={`w-5 h-5 ${uiColors.textPrimary}`} />
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono text-sm font-semibold ${uiColors.textPrimary}`}>
                        {number.e164}
                    </span>
                    <ProviderBadge provider={number.provider} />
                    {number.assignedAgent ? (
                        <Link
                            href={`/callagents/${number.assignedAgent.id}`}
                            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            Assigned to {number.assignedAgent.name}
                            <FiExternalLink className="w-3 h-3" />
                        </Link>
                    ) : (
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                            Unassigned
                        </span>
                    )}
                </div>
                {editing ? (
                    <div className="mt-1 flex items-center gap-2">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Friendly name"
                            className={`text-xs rounded-md p-1.5 ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                        />
                        <button
                            onClick={saveName}
                            disabled={busy}
                            className="p-1 rounded text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                            <FiCheck className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                setEditing(false);
                                setName(number.friendlyName || "");
                            }}
                            className={`p-1 rounded ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <p className={`text-xs mt-1 ${uiColors.textSecondary}`}>
                        {number.friendlyName || (
                            <span className={uiColors.textPlaceholder}>No friendly name</span>
                        )}
                        {Array.isArray(Object.entries(number.capabilities || {})) &&
                            Object.entries(number.capabilities || {})
                                .filter(([, v]) => v)
                                .map(([k]) => k)
                                .slice(0, 4)
                                .join(", ") && (
                                <span className={`ml-2 ${uiColors.textPlaceholder}`}>
                                    ·{" "}
                                    {Object.entries(number.capabilities || {})
                                        .filter(([, v]) => v)
                                        .map(([k]) => k)
                                        .join(" / ")}
                                </span>
                            )}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={() => setEditing((v) => !v)}
                    title="Rename"
                    className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                >
                    <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={remove}
                    disabled={busy}
                    title="Delete"
                    className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 disabled:opacity-50"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </li>
    );
}
