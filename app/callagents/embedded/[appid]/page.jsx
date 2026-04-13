"use client";
// app/callagents/embedded/[appid]/page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiArrowLeft,
    FiCode,
    FiPlay,
    FiSettings,
    FiActivity,
    FiCopy,
    FiCheck,
    FiLoader,
    FiZap,
    FiCalendar,
} from "react-icons/fi";
import { uiColors, sectionVariants } from "@/app/callagents/_constants/uiConstants";
import { toast } from "react-hot-toast";
import IntegrationTab from "./_components/IntegrationTab";
import ManifestTab from "./_components/ManifestTab";
import PlaygroundTab from "./_components/PlaygroundTab";
import SettingsTab from "./_components/SettingsTab";

const TABS = [
    { id: "integration", label: "Integration", icon: FiCode, hint: "Install & embed" },
    { id: "manifest", label: "Capabilities", icon: FiActivity, hint: "Synced from your code" },
    { id: "playground", label: "Playground", icon: FiPlay, hint: "Live debug" },
    { id: "settings", label: "Settings", icon: FiSettings, hint: "Agent, security, danger zone" },
];

function timeAgo(date) {
    if (!date) return "Never";
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "just now";
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}

export default function EmbeddedAppDetail() {
    const params = useParams();
    const router = useRouter();
    const appId = params.appid;

    const [appData, setAppData] = useState(null);
    const [manifest, setManifest] = useState(null);
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("integration");
    const [copiedKey, setCopiedKey] = useState(false);

    const fetchAppDetails = useCallback(async () => {
        try {
            const res = await fetch(`/api/sdk/apps/${appId}`);
            if (res.ok) {
                const data = await res.json();
                setAppData(data.app);
                setManifest(data.latestManifest);
                setHistory(data.history || []);
            } else {
                toast.error("Failed to load project.");
                router.push("/callagents/embedded");
            }
        } catch (e) {
            console.error(e);
            toast.error("Network error.");
        } finally {
            setIsLoading(false);
        }
    }, [appId, router]);

    useEffect(() => { fetchAppDetails(); }, [fetchAppDetails]);

    const handleCopyKey = () => {
        if (!appData) return;
        navigator.clipboard.writeText(appData.publicKey);
        setCopiedKey(true);
        toast.success("Publishable key copied");
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleAppUpdate = (updates) => {
        setAppData(prev => ({ ...prev, ...updates }));
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <FiLoader className="w-8 h-8 animate-spin text-cyan-500" />
                <p className={`text-sm ${uiColors.textSecondary}`}>Loading project…</p>
            </div>
        );
    }

    if (!appData) return null;

    const isPaused = appData.status !== "active";
    const actionsCount = manifest?.actions?.length || 0;
    const lastSync = manifest?.createdAt;

    return (
        <motion.div
            className="flex flex-col w-full max-w-7xl mx-auto pb-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Back link */}
            <button
                onClick={() => router.push("/callagents/embedded")}
                className={`self-start flex items-center gap-2 mb-6 text-sm ${uiColors.textSecondary} hover:${uiColors.textPrimary} transition-colors`}
            >
                <FiArrowLeft className="w-4 h-4" />
                <span>All projects</span>
            </button>

            {/* HERO HEADER */}
            <div className={`relative overflow-hidden rounded-3xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-6 md:p-8 mb-6`}>
                {/* Gradient backdrop */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/10 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-400/10 blur-3xl pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-cyan-500/20 shrink-0">
                            {appData.name?.substring(0, 2).toUpperCase() || "DW"}
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className={`text-2xl md:text-3xl font-extrabold truncate ${uiColors.textPrimary}`}>
                                    {appData.name}
                                </h1>
                                <span className={`shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                                    isPaused
                                        ? "bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300"
                                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-gray-400" : "bg-emerald-500 animate-pulse"}`}/>
                                    {isPaused ? "Paused" : "Live"}
                                </span>
                            </div>
                            <div className={`text-sm font-mono ${uiColors.textPlaceholder} truncate`}>
                                …{appData.publicKey?.slice(-16)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCopyKey}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} ${uiColors.textPrimary} text-sm font-semibold transition-all`}
                        >
                            {copiedKey ? <FiCheck className="text-emerald-500"/> : <FiCopy />}
                            {copiedKey ? "Copied" : "Copy key"}
                        </button>
                        <button
                            onClick={() => setActiveTab("playground")}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white ${uiColors.accentPrimaryGradient} shadow-lg`}
                        >
                            <FiPlay className="w-4 h-4" />
                            Test live
                        </button>
                    </div>
                </div>

                {/* Stat strip */}
                <div className={`relative grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t ${uiColors.borderPrimary}`}>
                    <Stat
                        icon={FiZap}
                        iconColor="text-cyan-500"
                        label="Capabilities"
                        value={actionsCount}
                        sub={actionsCount === 0 ? "None synced yet" : `${actionsCount} action${actionsCount === 1 ? "" : "s"} active`}
                    />
                    <Stat
                        icon={FiActivity}
                        iconColor="text-purple-500"
                        label="Manifest"
                        value={manifest ? `v${manifest.version}` : "—"}
                        sub={manifest?.environment || "no version yet"}
                    />
                    <Stat
                        icon={FiCalendar}
                        iconColor="text-emerald-500"
                        label="Last sync"
                        value={timeAgo(lastSync)}
                        sub={lastSync ? new Date(lastSync).toLocaleDateString() : "Run your app to sync"}
                    />
                    <Stat
                        icon={FiSettings}
                        iconColor="text-orange-500"
                        label="Domains"
                        value={appData.domainWhitelist?.length || "Any"}
                        sub={appData.domainWhitelist?.length ? "whitelisted" : "Allow all (dev mode)"}
                    />
                </div>
            </div>

            {/* TABS */}
            <div className={`flex flex-wrap gap-2 mb-6 p-1.5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                isActive
                                    ? `${uiColors.bgSecondary} ${uiColors.textPrimary} shadow-sm`
                                    : `${uiColors.textSecondary} hover:${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-cyan-500" : ""}`} />
                            <span>{tab.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-tab-underline"
                                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* TAB CONTENT */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "integration" && <IntegrationTab appData={appData} manifest={manifest} />}
                    {activeTab === "manifest" && <ManifestTab manifest={manifest} history={history} appData={appData} />}
                    {activeTab === "playground" && <PlaygroundTab appData={appData} manifest={manifest} />}
                    {activeTab === "settings" && (
                        <SettingsTab
                            appData={appData}
                            onUpdate={handleAppUpdate}
                            onDeleted={() => router.push("/callagents/embedded")}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}

function Stat({ icon: Icon, iconColor, label, value, sub }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-white dark:bg-gray-900 border ${uiColors.borderPrimary} flex items-center justify-center ${iconColor} shrink-0`}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
                <div className={`text-xs font-bold uppercase tracking-widest ${uiColors.textPlaceholder}`}>{label}</div>
                <div className={`text-lg font-extrabold ${uiColors.textPrimary} leading-tight`}>{value}</div>
                <div className={`text-[11px] truncate ${uiColors.textSecondary}`}>{sub}</div>
            </div>
        </div>
    );
}
