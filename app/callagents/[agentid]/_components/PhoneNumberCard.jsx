"use client";
// app/callagents/[agentid]/_components/PhoneNumberCard.jsx
//
// Dashboard card showing the phone number assigned to the agent (if any).
// When no number is assigned, shows the warning banner + "Connect a number"
// button that opens a picker. When a number IS assigned, shows the number,
// quick "Call my phone" test, and an Unassign action.

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
    FiAlertTriangle,
    FiPhone,
    FiPhoneCall,
    FiX,
    FiLoader,
    FiExternalLink,
    FiUserX,
} from "react-icons/fi";

import { uiColors, itemVariants } from "../../_constants/uiConstants";

export default function PhoneNumberCard({ agent }) {
    const [assigned, setAssigned] = useState(null);
    const [available, setAvailable] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [pickerOpen, setPickerOpen] = useState(false);
    const [callDialogOpen, setCallDialogOpen] = useState(false);

    const [selectedId, setSelectedId] = useState(null);
    const [busy, setBusy] = useState(false);

    const reload = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/callagents/${agent.publicId}/phone-number`);
            if (!res.ok) throw new Error("Failed to load phone-number info");
            const data = await res.json();
            setAssigned(data.assigned);
            setAvailable(data.available || []);
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [agent.publicId]);

    useEffect(() => {
        reload();
    }, [reload]);

    const handleAssign = async () => {
        if (!selectedId) {
            toast.error("Pick a number first");
            return;
        }
        setBusy(true);
        const id = toast.loading("Wiring up the number…");
        try {
            const res = await fetch(`/api/callagents/${agent.publicId}/phone-number`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumberId: selectedId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed");
            toast.success("Number connected!", { id });
            setPickerOpen(false);
            setSelectedId(null);
            reload();
        } catch (e) {
            toast.error(e.message, { id });
        } finally {
            setBusy(false);
        }
    };

    const handleUnassign = async () => {
        if (!confirm("Disconnect this phone number from the agent?")) return;
        setBusy(true);
        try {
            const res = await fetch(`/api/callagents/${agent.publicId}/phone-number`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error((await res.json()).error || "Failed");
            toast.success("Number unassigned");
            reload();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setBusy(false);
        }
    };

    if (isLoading) return null;

    return (
        <>
            {!assigned ? (
                <motion.div
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 rounded-md border ${uiColors.alertWarningBorder} ${uiColors.alertWarningBg} ${uiColors.alertWarningText}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center flex-1">
                        <FiAlertTriangle className="flex-shrink-0 w-5 h-5 mr-3" />
                        <span className="text-sm">
                            Your agent doesn't have a phone number — it can't receive or place real calls yet.
                        </span>
                    </div>
                    <button
                        onClick={() => setPickerOpen(true)}
                        className={`w-full sm:w-auto px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient}`}
                    >
                        Connect a phone number
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                            className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${uiColors.bgSecondary}`}
                        >
                            <FiPhone className={`w-5 h-5 ${uiColors.textPrimary}`} />
                        </div>
                        <div className="min-w-0">
                            <div
                                className={`font-mono text-sm font-semibold ${uiColors.textPrimary}`}
                            >
                                {assigned.e164}
                            </div>
                            <div className={`text-xs ${uiColors.textSecondary}`}>
                                {assigned.friendlyName || "Connected"} · via{" "}
                                {assigned.provider}
                                {" · "}
                                <Link
                                    href="/callagents/phone-numbers"
                                    className="underline inline-flex items-center gap-1"
                                >
                                    manage
                                    <FiExternalLink className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCallDialogOpen(true)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md text-white ${uiColors.accentPrimaryGradient}`}
                        >
                            <FiPhoneCall className="w-3.5 h-3.5" /> Call my phone
                        </button>
                        <button
                            onClick={handleUnassign}
                            disabled={busy}
                            title="Unassign"
                            className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                        >
                            <FiUserX className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Picker dialog */}
            {pickerOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    onClick={() => setPickerOpen(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className={`relative w-full max-w-md rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary}`}
                    >
                        <header
                            className={`flex items-center justify-between px-5 py-4 border-b ${uiColors.borderPrimary}`}
                        >
                            <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>
                                Pick a number
                            </h3>
                            <button
                                onClick={() => setPickerOpen(false)}
                                className={`p-1.5 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </header>
                        <div className="p-5 space-y-3">
                            {available.length === 0 ? (
                                <div className={`text-sm ${uiColors.textSecondary}`}>
                                    You don't have any unassigned numbers yet. Go to the{" "}
                                    <Link
                                        href="/callagents/phone-numbers"
                                        className={`underline ${uiColors.accentPrimary}`}
                                    >
                                        Phone Numbers page
                                    </Link>{" "}
                                    to import one from Twilio or sync from Vapi.
                                </div>
                            ) : (
                                <ul className={`divide-y ${uiColors.borderPrimary} border ${uiColors.borderPrimary} rounded-lg overflow-hidden max-h-72 overflow-y-auto`}>
                                    {available.map((n) => (
                                        <li key={n.id}>
                                            <label className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="phone-pick"
                                                    checked={selectedId === n.id}
                                                    onChange={() => setSelectedId(n.id)}
                                                    className="mt-1"
                                                />
                                                <div>
                                                    <div className={`font-mono text-sm font-semibold ${uiColors.textPrimary}`}>
                                                        {n.e164}
                                                    </div>
                                                    <div className={`text-xs ${uiColors.textSecondary}`}>
                                                        {n.friendlyName || "—"} · {n.provider}
                                                    </div>
                                                </div>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <footer
                            className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${uiColors.borderPrimary}`}
                        >
                            <button
                                onClick={() => setPickerOpen(false)}
                                className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={busy || !selectedId}
                                className={`px-4 py-2 text-sm rounded-md text-white inline-flex items-center gap-2 ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                            >
                                {busy && <FiLoader className="w-4 h-4 animate-spin" />}
                                Connect
                            </button>
                        </footer>
                    </div>
                </div>
            )}

            {/* Call my phone dialog */}
            {callDialogOpen && (
                <CallMyPhoneDialog
                    agentId={agent.publicId}
                    onClose={() => setCallDialogOpen(false)}
                />
            )}
        </>
    );
}

function CallMyPhoneDialog({ agentId, onClose }) {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("Test caller");
    const [busy, setBusy] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!/^\+[1-9]\d{1,14}$/.test(phone.trim())) {
            toast.error("Use E.164 format, e.g. +15551234567");
            return;
        }
        setBusy(true);
        const id = toast.loading("Placing call…");
        try {
            const res = await fetch(`/api/callagents/${agentId}/call-my-phone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phoneNumber: phone.trim(), userName: name }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Call failed");
            // The route polls Vapi for status — if the call already ended (Twilio
            // trial rejection, etc.) it returns success:false + a human hint
            // instead of pretending the call is on its way.
            if (data.success === false && data.hint) {
                toast.error(data.hint, { id, duration: 8000 });
                return;
            }
            toast.success("Calling — your phone will ring shortly!", { id });
            onClose();
        } catch (err) {
            toast.error(err.message, { id });
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <form
                onSubmit={submit}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-sm rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary}`}
            >
                <header
                    className={`flex items-center justify-between px-5 py-4 border-b ${uiColors.borderPrimary}`}
                >
                    <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>
                        Call my phone
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`p-1.5 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </header>
                <div className="p-5 space-y-3">
                    <p className={`text-sm ${uiColors.textSecondary}`}>
                        We'll place a call from this agent to your phone so you can talk to it.
                    </p>
                    <div>
                        <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                            Your phone number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+15551234567"
                            className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                            Your name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                        />
                    </div>
                </div>
                <footer
                    className={`flex items-center justify-end gap-2 px-5 py-4 border-t ${uiColors.borderPrimary}`}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={busy}
                        className={`px-4 py-2 text-sm rounded-md text-white inline-flex items-center gap-2 ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                    >
                        {busy && <FiLoader className="w-4 h-4 animate-spin" />}
                        Call me
                    </button>
                </footer>
            </form>
        </div>
    );
}
