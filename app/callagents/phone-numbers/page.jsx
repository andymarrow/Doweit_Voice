"use client";
// app/callagents/phone-numbers/page.jsx
//
// Phone Numbers hub. Lists every number the user owns across providers
// (Twilio + Vapi). Lets them import new numbers, rename, unassign from an
// agent, or delete. Connecting Twilio happens on the workspace Integrations
// page; this page is for *managing* the connected numbers.

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
    FiPhone,
    FiPlus,
    FiSearch,
    FiHelpCircle,
    FiExternalLink,
    FiLoader,
} from "react-icons/fi";

import { uiColors, sectionVariants } from "../_constants/uiConstants";
import ImportNumberModal from "./_components/ImportNumberModal";
import PhoneNumberRow from "./_components/PhoneNumberRow";

export default function PhoneNumbersPage() {
    const [numbers, setNumbers] = useState([]);
    const [connections, setConnections] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [importOpen, setImportOpen] = useState(false);

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const [numbersRes, connRes] = await Promise.all([
                fetch("/api/phone-numbers"),
                fetch("/api/integrations/connections"),
            ]);
            if (!numbersRes.ok) throw new Error("Failed to load numbers");
            if (!connRes.ok) throw new Error("Failed to load connections");
            const { numbers: list } = await numbersRes.json();
            const conn = await connRes.json();
            setNumbers(list || []);
            setConnections(new Set(conn || []));
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        reload();
    }, [reload]);

    const filtered = numbers.filter((n) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (
            n.e164?.toLowerCase().includes(q) ||
            n.friendlyName?.toLowerCase().includes(q)
        );
    });

    const hasNoConnections = !connections.has("twilio") && !connections.has("vapi-numbers");

    const noTwilio = !connections.has("twilio");

    return (
        <motion.div
            className="flex flex-col h-full w-full bg-transparent"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <div
                className={`flex-1 flex flex-col rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm overflow-hidden`}
            >
                {/* Header */}
                <div
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b ${uiColors.borderPrimary} gap-4`}
                >
                    <div>
                        <h2 className={`text-xl font-bold flex items-center gap-2 ${uiColors.textPrimary}`}>
                            Phone Numbers
                            <FiHelpCircle
                                className={`w-4 h-4 cursor-pointer ${uiColors.textPlaceholder}`}
                                title="Numbers your agents can call from and receive calls on."
                            />
                        </h2>
                        <p className={`text-sm mt-1 ${uiColors.textSecondary}`}>
                            Numbers imported from Twilio or hosted directly on Vapi. Assign one to an
                            agent from that agent's dashboard.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className={`relative flex items-center border rounded-lg ${uiColors.borderPrimary} ${uiColors.bgSecondary} overflow-hidden`}
                        >
                            <FiSearch className={`absolute left-3 w-4 h-4 ${uiColors.textPlaceholder}`} />
                            <input
                                type="text"
                                placeholder="Search numbers"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-9 pr-4 py-2 text-sm bg-transparent outline-none ${uiColors.textPrimary}`}
                            />
                        </div>
                        <button
                            onClick={() => setImportOpen(true)}
                            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white ${uiColors.accentPrimaryGradient} shadow-md`}
                        >
                            <FiPlus className="mr-1.5 w-4 h-4" /> Add number
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto">
                    {hasNoConnections && !isLoading && numbers.length === 0 && (
                        <div
                            className={`m-6 rounded-lg p-4 flex items-start gap-3 ${uiColors.alertWarningBg} ${uiColors.alertWarningBorder} border`}
                        >
                            <FiHelpCircle
                                className={`w-5 h-5 mt-0.5 flex-shrink-0 ${uiColors.alertWarningText}`}
                            />
                            <div className="text-sm">
                                <p className={`font-semibold ${uiColors.alertWarningText}`}>
                                    Connect Twilio first
                                </p>
                                <p className={`mt-1 ${uiColors.alertWarningText}`}>
                                    To import numbers you've already purchased, connect your Twilio
                                    account on the{" "}
                                    <Link
                                        href="/callagents/Integrations"
                                        className="underline font-semibold"
                                    >
                                        workspace Integrations page
                                    </Link>
                                    . Or buy a number directly on Vapi and click Add → Sync from Vapi.
                                </p>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <div className={`p-8 text-sm flex items-center gap-2 ${uiColors.textSecondary}`}>
                            <FiLoader className="w-4 h-4 animate-spin" /> Loading numbers…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-12">
                            <div className="flex flex-col items-center text-center max-w-sm">
                                <div
                                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}
                                >
                                    <FiPhone className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h3 className={`text-xl font-bold mb-2 ${uiColors.textPrimary}`}>
                                    No phone numbers yet
                                </h3>
                                <p className={`text-sm mb-8 leading-relaxed ${uiColors.textSecondary}`}>
                                    Import a number from your Twilio account or sync from Vapi to let
                                    agents place and receive calls.
                                </p>
                                <button
                                    onClick={() => setImportOpen(true)}
                                    className={`flex items-center px-5 py-2.5 text-sm font-semibold rounded-lg text-white ${uiColors.accentPrimaryGradient} shadow-md`}
                                >
                                    <FiPlus className="mr-1.5 w-4 h-4" /> Add number
                                </button>
                            </div>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {filtered.map((n) => (
                                <PhoneNumberRow
                                    key={n.id}
                                    number={n}
                                    onChanged={reload}
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {importOpen && (
                    <ImportNumberModal
                        isOpen={importOpen}
                        onClose={() => setImportOpen(false)}
                        onImported={reload}
                        twilioConnected={connections.has("twilio")}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
