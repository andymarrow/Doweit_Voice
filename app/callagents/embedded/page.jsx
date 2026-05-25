"use client";
// app/callagents/embedded/page.jsx

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    FiPlus,
    FiCode,
    FiSearch,
    FiArrowRight,
    FiZap,
    FiGlobe,
    FiCalendar,
    FiInbox,
    FiLoader,
} from "react-icons/fi";
import { uiColors, sectionVariants, itemVariants } from "@/app/callagents/_constants/uiConstants";
import CreateProjectModal from "./_components/CreateProjectModal";
import { useRouter } from "next/navigation";

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

export default function EmbeddedAgentsDashboard() {
    const [apps, setApps] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const router = useRouter();

    const fetchApps = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/sdk/apps");
            if (res.ok) setApps(await res.json());
        } catch (e) {
            console.error("Failed to fetch SDK apps:", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchApps(); }, []);

    const handleAppCreated = (newApp) => {
        setIsCreateModalOpen(false);
        setApps(prev => [newApp, ...prev]);
        router.push(`/callagents/embedded/${newApp.publicId || newApp.id}`);
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return apps;
        const s = search.toLowerCase();
        return apps.filter(
            a => a.name?.toLowerCase().includes(s) || a.publicKey?.toLowerCase().includes(s)
        );
    }, [apps, search]);

    return (
        <motion.div
            className="flex flex-col w-full max-w-7xl mx-auto space-y-6 pb-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            {/* HERO */}
            <div className={`relative overflow-hidden rounded-3xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-6 md:p-8`}>
                <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
                                SDK · Beta
                            </span>
                        </div>
                        <h1 className={`text-3xl md:text-4xl font-extrabold ${uiColors.textPrimary} mb-2`}>
                            Web AI Assistants
                        </h1>
                        <p className={`text-sm md:text-base ${uiColors.textSecondary} max-w-xl`}>
                            Embed a capability-aware voice agent in any website. Register your JS functions, the AI calls them when the user asks.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className={`group flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white ${uiColors.accentPrimaryGradient} transition-all`}
                    >
                        <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform"/>
                        New project
                    </button>
                </div>
            </div>

            {/* Search */}
            {apps.length > 0 && (
                <div className="relative max-w-md">
                    <FiSearch className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${uiColors.textPlaceholder}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search projects…"
                        className={`w-full pl-11 pr-4 py-3 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} ${uiColors.textPrimary} text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all`}
                    />
                </div>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`h-56 rounded-2xl ${uiColors.bgSecondary} animate-pulse border ${uiColors.borderPrimary}`} />
                    ))}
                </div>
            ) : apps.length === 0 ? (
                <EmptyState onCreate={() => setIsCreateModalOpen(true)} />
            ) : filtered.length === 0 ? (
                <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                    <FiSearch className={`w-8 h-8 mx-auto mb-3 ${uiColors.textPlaceholder}`} />
                    <p className={`font-semibold ${uiColors.textPrimary}`}>No projects match "{search}"</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(app => <ProjectCard key={app.id} app={app} onOpen={() => router.push(`/callagents/embedded/${app.publicId || app.id}`)}/>)}
                </div>
            )}

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleAppCreated}
            />
        </motion.div>
    );
}

function ProjectCard({ app, onOpen }) {
    const isPaused = app.status !== "active";
    const domainCount = app.domainWhitelist?.length || 0;

    return (
        <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={onOpen}
            className={`group relative cursor-pointer flex flex-col p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-cyan-500/40 transition-all overflow-hidden`}
        >
            <div className="relative flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shrink-0">
                            {app.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h3 className={`font-bold text-base leading-tight truncate ${uiColors.textPrimary}`}>
                                {app.name}
                            </h3>
                            <p className={`text-[11px] font-mono ${uiColors.textPlaceholder} truncate`}>
                                …{app.publicKey.slice(-12)}
                            </p>
                        </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                        isPaused
                            ? "bg-gray-200/60 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-gray-400" : "bg-emerald-500 animate-pulse"}`}/>
                        {isPaused ? "Paused" : "Live"}
                    </span>
                </div>

                {/* Stats */}
                <div className={`flex-1 grid grid-cols-2 gap-2 py-3 border-y ${uiColors.borderPrimary} my-1`}>
                    <CardStat icon={FiGlobe} label="Domains" value={domainCount === 0 ? "Any" : domainCount} />
                    <CardStat icon={FiCalendar} label="Created" value={timeAgo(app.createdAt)} />
                </div>

                {/* CTA */}
                <div className={`pt-4 flex items-center justify-between text-sm font-semibold ${uiColors.textSecondary} group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors`}>
                    <span>Open project</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </motion.div>
    );
}

function CardStat({ icon: Icon, label, value }) {
    return (
        <div className="flex items-center gap-2">
            <Icon className={`w-3.5 h-3.5 ${uiColors.textPlaceholder} shrink-0`} />
            <div className="min-w-0">
                <div className={`text-[10px] uppercase font-bold tracking-widest ${uiColors.textPlaceholder} leading-none`}>{label}</div>
                <div className={`text-sm font-bold ${uiColors.textPrimary} truncate leading-tight mt-0.5`}>{value}</div>
            </div>
        </div>
    );
}

function EmptyState({ onCreate }) {
    return (
        <motion.div
            variants={itemVariants}
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-10 md:p-14 text-center flex flex-col items-center`}
        >
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white mb-5">
                <FiCode className="w-10 h-10" />
            </div>

            <h3 className={`relative text-2xl md:text-3xl font-extrabold ${uiColors.textPrimary} mb-2`}>
                Build your first AI assistant
            </h3>
            <p className={`relative max-w-md mb-8 ${uiColors.textSecondary}`}>
                Create a project, grab the publishable key, and drop the widget into any React, Next.js, or HTML site.
            </p>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full mb-8">
                {[
                    { icon: FiZap, title: "Capability-first", body: "Expose JS functions, AI calls them." },
                    { icon: FiGlobe, title: "Any framework", body: "React, Next.js, Vue, plain HTML." },
                    { icon: FiInbox, title: "Auto-synced", body: "Manifest updates with each deploy." },
                ].map(f => (
                    <div key={f.title} className={`p-4 rounded-xl border ${uiColors.borderPrimary} bg-white dark:bg-gray-900 text-left`}>
                        <f.icon className="w-5 h-5 text-cyan-500 mb-2" />
                        <p className={`text-sm font-bold ${uiColors.textPrimary}`}>{f.title}</p>
                        <p className={`text-xs ${uiColors.textSecondary} mt-0.5`}>{f.body}</p>
                    </div>
                ))}
            </div>

            <button
                onClick={onCreate}
                className={`relative flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white ${uiColors.accentPrimaryGradient}`}
            >
                <FiPlus className="w-5 h-5" />
                Create your first project
            </button>
        </motion.div>
    );
}
