"use client";
// app/callagents/phone-numbers/_components/ImportNumberModal.jsx
//
// Two-mode modal:
//   1. Twilio — list the user's already-purchased Twilio numbers (fetched live)
//      and let them import any one of them. Importing also registers the
//      number with Vapi so inbound calls can be routed.
//   2. Vapi — single button that syncs all Vapi-hosted numbers (the user
//      bought via vapi.ai) into our local DB.

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
    FiX,
    FiInfo,
    FiLoader,
    FiCheck,
    FiExternalLink,
    FiRefreshCw,
} from "react-icons/fi";

import { uiColors } from "../../_constants/uiConstants";

export default function ImportNumberModal({
    isOpen,
    onClose,
    onImported,
    twilioConnected,
}) {
    const [provider, setProvider] = useState(twilioConnected ? "twilio" : "vapi");
    const [available, setAvailable] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [busyE164, setBusyE164] = useState(null);

    // Fetch the picker list for the current tab.
    const loadList = async (p) => {
        setIsLoading(true);
        try {
            if (p === "twilio") {
                const res = await fetch("/api/phone-numbers/import", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ provider: "twilio" }), // no e164 = list mode
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Failed to list numbers");
                setAvailable(data.available || []);
            } else {
                // Vapi: nothing to *list* — sync is a one-shot button.
                setAvailable([]);
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        loadList(provider);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, provider]);

    const handleImportTwilio = async (e164) => {
        setBusyE164(e164);
        const id = toast.loading(`Importing ${e164}…`);
        try {
            const res = await fetch("/api/phone-numbers/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "twilio", e164 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Import failed");
            toast.success(`Imported ${e164}`, { id });
            onImported?.();
            // Refresh the picker list to flip alreadyImported flag
            loadList("twilio");
        } catch (err) {
            toast.error(err.message, { id });
        } finally {
            setBusyE164(null);
        }
    };

    const handleSyncVapi = async () => {
        const id = toast.loading("Syncing Vapi numbers…");
        setIsLoading(true);
        try {
            const res = await fetch("/api/phone-numbers/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ provider: "vapi" }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Sync failed");
            toast.success(`Synced ${data.numbers?.length || 0} numbers`, { id });
            onImported?.();
            onClose();
        } catch (err) {
            toast.error(err.message, { id });
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`relative w-full max-w-[560px] max-h-[90vh] flex flex-col rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div
                    className={`flex items-center justify-between px-6 py-4 border-b ${uiColors.borderPrimary}`}
                >
                    <h2 className={`text-lg font-bold ${uiColors.textPrimary}`}>
                        Add a phone number
                    </h2>
                    <button
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`px-6 pt-4 border-b ${uiColors.borderPrimary} flex gap-2`}>
                    {[
                        { id: "twilio", label: "Twilio (BYO)" },
                        { id: "vapi", label: "Vapi-hosted" },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setProvider(t.id)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-md
                                ${provider === t.id ? `${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}` : uiColors.textSecondary}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                    {provider === "twilio" && !twilioConnected && (
                        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/50">
                            <FiInfo className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-purple-800 dark:text-purple-300">
                                    Connect Twilio first
                                </p>
                                <p className="text-purple-700 dark:text-purple-300/80 mt-1">
                                    Add your Twilio Account SID + Auth Token on the{" "}
                                    <Link
                                        href="/callagents/Integrations"
                                        className="underline font-semibold"
                                    >
                                        Integrations page
                                    </Link>{" "}
                                    so we can list your numbers.
                                </p>
                            </div>
                        </div>
                    )}

                    {provider === "twilio" && twilioConnected && (
                        <>
                            <p className={`text-sm ${uiColors.textSecondary}`}>
                                Pick a number you've already purchased on Twilio. Importing
                                registers it with Vapi so inbound calls route to your agents.
                            </p>

                            {isLoading ? (
                                <div className={`flex items-center gap-2 text-sm ${uiColors.textSecondary}`}>
                                    <FiLoader className="w-4 h-4 animate-spin" /> Listing your Twilio numbers…
                                </div>
                            ) : available.length === 0 ? (
                                <div className={`text-sm ${uiColors.textPlaceholder} p-4 text-center border-2 border-dashed rounded-lg ${uiColors.borderPrimary}`}>
                                    No numbers found on your Twilio account. Buy one on{" "}
                                    <a
                                        href="https://www.twilio.com/console/phone-numbers/incoming"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline"
                                    >
                                        Twilio's console
                                    </a>{" "}
                                    first.
                                </div>
                            ) : (
                                <ul className={`divide-y ${uiColors.borderPrimary} border ${uiColors.borderPrimary} rounded-lg overflow-hidden`}>
                                    {available.map((n) => (
                                        <li
                                            key={n.twilioSid}
                                            className={`flex items-center justify-between px-4 py-3 ${uiColors.bgPrimary}`}
                                        >
                                            <div className="min-w-0">
                                                <div className={`font-mono text-sm font-semibold ${uiColors.textPrimary}`}>
                                                    {n.e164}
                                                </div>
                                                <div className={`text-xs truncate ${uiColors.textSecondary}`}>
                                                    {n.friendlyName || "—"}
                                                </div>
                                            </div>
                                            {n.alreadyImported ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                                                    <FiCheck className="w-3.5 h-3.5" /> Imported
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleImportTwilio(n.e164)}
                                                    disabled={busyE164 === n.e164}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                                                >
                                                    {busyE164 === n.e164 ? (
                                                        <FiLoader className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        "Import"
                                                    )}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {provider === "vapi" && (
                        <>
                            <p className={`text-sm ${uiColors.textSecondary}`}>
                                Buy a number directly on{" "}
                                <a
                                    href="https://vapi.ai/dashboard/phone-numbers"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline inline-flex items-center gap-1"
                                >
                                    Vapi's dashboard
                                    <FiExternalLink className="w-3 h-3" />
                                </a>
                                , then click the button below to pull it into Doweit Voice.
                            </p>
                            <button
                                onClick={handleSyncVapi}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold rounded-lg text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <FiLoader className="w-4 h-4 animate-spin" />
                                ) : (
                                    <FiRefreshCw className="w-4 h-4" />
                                )}
                                Sync from Vapi
                            </button>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div
                    className={`flex items-center justify-end gap-3 px-6 py-4 border-t ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-900/50 rounded-b-2xl`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg border ${uiColors.borderPrimary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
