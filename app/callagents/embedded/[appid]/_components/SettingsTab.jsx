"use client";
// app/callagents/embedded/[appid]/_components/SettingsTab.jsx

import React, { useState, useEffect } from "react";
import {
    FiSave,
    FiLoader,
    FiGlobe,
    FiLink,
    FiRefreshCw,
    FiPower,
    FiTrash2,
    FiAlertTriangle,
    FiCheck,
    FiUser,
    FiEdit3,
} from "react-icons/fi";
import { uiColors } from "@/app/callagents/_constants/uiConstants";
import { toast } from "react-hot-toast";

export default function SettingsTab({ appData, onUpdate, onDeleted }) {
    // ---- Project name ----
    const [name, setName] = useState(appData.name || "");
    const [savingName, setSavingName] = useState(false);

    // ---- Domains ----
    const [domains, setDomains] = useState((appData.domainWhitelist || []).join(", "));
    const [savingDomains, setSavingDomains] = useState(false);

    // ---- Agent link ----
    const [agents, setAgents] = useState([]);
    const [agentsLoading, setAgentsLoading] = useState(true);
    const [linkedAgentId, setLinkedAgentId] = useState(appData.agentId ?? "");
    const [savingAgent, setSavingAgent] = useState(false);

    // ---- Status ----
    const [status, setStatus] = useState(appData.status || "active");
    const [togglingStatus, setTogglingStatus] = useState(false);

    // ---- Key regen ----
    const [regenerating, setRegenerating] = useState(false);
    const [confirmRegen, setConfirmRegen] = useState(false);

    // ---- Danger zone ----
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteText, setDeleteText] = useState("");
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("/api/callagents");
                if (res.ok) {
                    const data = await res.json();
                    setAgents(Array.isArray(data) ? data : []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setAgentsLoading(false);
            }
        })();
    }, []);

    const patchApp = async (body) => {
        const res = await fetch(`/api/sdk/apps/${appData.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Update failed");
        }
        return res.json();
    };

    const saveName = async () => {
        if (!name.trim() || name === appData.name) return;
        setSavingName(true);
        try {
            const updated = await patchApp({ name: name.trim() });
            onUpdate({ name: updated.name });
            toast.success("Project renamed");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSavingName(false);
        }
    };

    const saveDomains = async () => {
        const arr = domains.split(",").map(d => d.trim()).filter(Boolean);
        setSavingDomains(true);
        try {
            const updated = await patchApp({ domainWhitelist: arr });
            onUpdate({ domainWhitelist: updated.domainWhitelist });
            toast.success("Domains updated");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSavingDomains(false);
        }
    };

    const saveAgent = async () => {
        setSavingAgent(true);
        try {
            const updated = await patchApp({ agentId: linkedAgentId === "" ? null : Number(linkedAgentId) });
            onUpdate({ agentId: updated.agentId });
            toast.success(linkedAgentId ? "Agent linked" : "Agent unlinked");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setSavingAgent(false);
        }
    };

    const toggleStatus = async () => {
        const next = status === "active" ? "paused" : "active";
        setTogglingStatus(true);
        try {
            const updated = await patchApp({ status: next });
            setStatus(updated.status);
            onUpdate({ status: updated.status });
            toast.success(next === "active" ? "Project resumed" : "Project paused");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setTogglingStatus(false);
        }
    };

    const regenerateKey = async () => {
        setRegenerating(true);
        try {
            const updated = await patchApp({ regenerateKey: true });
            onUpdate({ publicKey: updated.publicKey });
            setConfirmRegen(false);
            toast.success("New publishable key issued. Update your apps.");
        } catch (e) {
            toast.error(e.message);
        } finally {
            setRegenerating(false);
        }
    };

    const deleteApp = async () => {
        if (deleteText !== appData.name) {
            toast.error("Type the project name exactly to confirm.");
            return;
        }
        setDeleting(true);
        try {
            const res = await fetch(`/api/sdk/apps/${appData.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            toast.success("Project deleted");
            onDeleted();
        } catch (e) {
            toast.error(e.message);
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Project info */}
            <Card icon={FiEdit3} iconColor="from-cyan-500 to-blue-600" title="Project info" desc="Update how this project is identified across the dashboard.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <Label>Project name</Label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={inputClass}
                            placeholder="My website assistant"
                        />
                    </div>
                    <button
                        onClick={saveName}
                        disabled={savingName || !name.trim() || name === appData.name}
                        className={primaryBtn}
                    >
                        {savingName ? <FiLoader className="animate-spin"/> : <FiSave />}
                        Save
                    </button>
                </div>
            </Card>

            {/* Linked agent */}
            <Card icon={FiUser} iconColor="from-purple-500 to-pink-500" title="Linked call agent" desc="The agent provides voice, language and the base prompt. Without one, the assistant uses Doweit defaults.">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <Label>Agent</Label>
                        <select
                            value={linkedAgentId ?? ""}
                            onChange={e => setLinkedAgentId(e.target.value)}
                            disabled={agentsLoading}
                            className={inputClass}
                        >
                            <option value="">— None (use defaults) —</option>
                            {agents.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.name} · {a.type}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={saveAgent}
                        disabled={savingAgent || (linkedAgentId ?? "") === (appData.agentId ?? "")}
                        className={primaryBtn}
                    >
                        {savingAgent ? <FiLoader className="animate-spin"/> : <FiLink />}
                        Link
                    </button>
                </div>
                {agents.length === 0 && !agentsLoading && (
                    <p className={`mt-3 text-sm ${uiColors.textSecondary}`}>
                        You haven't created any call agents yet.{" "}
                        <a href="/callagents" className="text-cyan-600 dark:text-cyan-400 underline">Create one →</a>
                    </p>
                )}
            </Card>

            {/* Domain whitelist */}
            <Card icon={FiGlobe} iconColor="from-cyan-500 to-emerald-500" title="Domain whitelist (CORS)" desc="Hosts allowed to use this publishable key. Comma-separated. Leave empty to allow all (development mode).">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <Label>Allowed hostnames</Label>
                        <input
                            value={domains}
                            onChange={e => setDomains(e.target.value)}
                            className={inputClass}
                            placeholder="localhost, mywebsite.com, app.mywebsite.com"
                        />
                    </div>
                    <button
                        onClick={saveDomains}
                        disabled={savingDomains}
                        className={primaryBtn}
                    >
                        {savingDomains ? <FiLoader className="animate-spin"/> : <FiCheck />}
                        Update
                    </button>
                </div>
            </Card>

            {/* Status toggle */}
            <Card icon={FiPower} iconColor="from-emerald-500 to-cyan-500" title="Project status" desc="Pausing immediately blocks all new SDK sessions for this key.">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className={`relative w-3 h-3 rounded-full ${
                            status === "active" ? "bg-emerald-500" : "bg-gray-400"
                        }`}>
                            {status === "active" && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"/>}
                        </span>
                        <span className={`font-bold ${uiColors.textPrimary} capitalize`}>{status}</span>
                    </div>
                    <button
                        onClick={toggleStatus}
                        disabled={togglingStatus}
                        className={status === "active" ? secondaryBtn : primaryBtn}
                    >
                        {togglingStatus ? <FiLoader className="animate-spin"/> : <FiPower />}
                        {status === "active" ? "Pause project" : "Resume project"}
                    </button>
                </div>
            </Card>

            {/* Key regeneration */}
            <Card icon={FiRefreshCw} iconColor="from-orange-500 to-amber-500" title="Rotate publishable key" desc="If you suspect your key was leaked, generate a fresh one. The old key stops working immediately.">
                {!confirmRegen ? (
                    <button
                        onClick={() => setConfirmRegen(true)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold border ${uiColors.borderPrimary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Generate new key
                    </button>
                ) : (
                    <div className="rounded-xl bg-orange-500/10 border border-orange-500/30 p-4 space-y-3">
                        <div className="flex items-start gap-2">
                            <FiAlertTriangle className="text-orange-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                                After rotating, every site using the old key will fail to load until you redeploy with the new one.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={regenerateKey}
                                disabled={regenerating}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50`}
                            >
                                {regenerating ? <FiLoader className="animate-spin"/> : <FiRefreshCw />}
                                Yes, rotate now
                            </button>
                            <button
                                onClick={() => setConfirmRegen(false)}
                                className={`px-4 py-2 rounded-lg font-semibold ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Danger zone */}
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white shrink-0">
                        <FiAlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-red-700 dark:text-red-300">Danger zone</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80">
                            Deleting this project removes its publishable key and the entire manifest history. This cannot be undone.
                        </p>
                    </div>
                </div>

                {!confirmDelete ? (
                    <button
                        onClick={() => setConfirmDelete(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-600 dark:text-red-400 transition-colors"
                    >
                        <FiTrash2 className="w-4 h-4" />
                        Delete project
                    </button>
                ) : (
                    <div className="space-y-3">
                        <Label>
                            Type <code className="font-mono px-1.5 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-300">{appData.name}</code> to confirm
                        </Label>
                        <input
                            value={deleteText}
                            onChange={e => setDeleteText(e.target.value)}
                            className={inputClass}
                            placeholder={appData.name}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={deleteApp}
                                disabled={deleting || deleteText !== appData.name}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white disabled:bg-red-500/30 disabled:text-red-200/50"
                            >
                                {deleting ? <FiLoader className="animate-spin"/> : <FiTrash2 />}
                                Permanently delete
                            </button>
                            <button
                                onClick={() => { setConfirmDelete(false); setDeleteText(""); }}
                                disabled={deleting}
                                className={`px-4 py-2 rounded-lg font-semibold ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Card({ icon: Icon, iconColor, title, desc, children }) {
    return (
        <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
            <div className="flex items-start gap-4 mb-5">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${iconColor} flex items-center justify-center text-white shrink-0`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>{title}</h3>
                    <p className={`text-sm ${uiColors.textSecondary}`}>{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function Label({ children }) {
    return <label className={`block text-xs uppercase font-bold tracking-widest mb-1.5 ${uiColors.textPlaceholder}`}>{children}</label>;
}

const inputClass = `w-full px-4 py-2.5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.textPrimary} text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all`;

const primaryBtn = `flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white ${uiColors.accentPrimaryGradient} shadow-md disabled:opacity-50 transition-all`;

const secondaryBtn = `flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 transition-colors`;
