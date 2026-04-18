"use client";
// app/callagents/embedded/[appid]/_components/ManifestTab.jsx

import React, { useMemo, useState } from "react";
import {
    FiZap,
    FiAlertTriangle,
    FiGlobe,
    FiTarget,
    FiClock,
    FiSearch,
    FiActivity,
    FiCode,
    FiInbox,
} from "react-icons/fi";
import { uiColors } from "@/app/callagents/_constants/uiConstants";

export default function ManifestTab({ manifest, history, appData }) {
    const [search, setSearch] = useState("");

    const actions = manifest?.actions || [];

    const filtered = useMemo(() => {
        if (!search.trim()) return actions;
        const s = search.toLowerCase();
        return actions.filter(
            a =>
                a.name?.toLowerCase().includes(s) ||
                a.description?.toLowerCase().includes(s)
        );
    }, [actions, search]);

    if (!manifest) {
        return <EmptyState appData={appData} />;
    }

    return (
        <div className="space-y-6">
            {/* Header card */}
            <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                        <FiActivity className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>
                            Capabilities discovered in code
                        </h3>
                        <p className={`text-sm ${uiColors.textSecondary}`}>
                            Manifest <span className="font-bold text-cyan-600 dark:text-cyan-400">v{manifest.version}</span>
                            {" · "}
                            <span className="capitalize">{manifest.environment}</span>
                            {" · "}
                            Synced {new Date(manifest.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="relative w-full md:w-72">
                    <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${uiColors.textPlaceholder}`} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search capabilities…"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.textPrimary} text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all`}
                    />
                </div>
            </div>

            {actions.length === 0 ? (
                <EmptyActionsBlock />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filtered.map((action, idx) => (
                        <ActionCard key={`${action.name}-${idx}`} action={action} />
                    ))}
                    {filtered.length === 0 && (
                        <div className={`col-span-full p-8 text-center rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.textSecondary}`}>
                            No capabilities match "{search}".
                        </div>
                    )}
                </div>
            )}

            {/* Version history */}
            {history && history.length > 1 && (
                <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <FiClock className="w-4 h-4" />
                        </div>
                        <div>
                            <h4 className={`font-bold ${uiColors.textPrimary}`}>Version history</h4>
                            <p className={`text-xs ${uiColors.textSecondary}`}>Most recent manifest snapshots</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {history.slice(0, 6).map(v => (
                            <div
                                key={v.id}
                                className={`flex items-center justify-between p-3 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300">
                                        v{v.version}
                                    </span>
                                    <span className={`text-xs uppercase font-bold tracking-wider ${
                                        v.environment === "production"
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : v.environment === "staging"
                                                ? "text-orange-600 dark:text-orange-400"
                                                : "text-gray-500"
                                    }`}>
                                        {v.environment}
                                    </span>
                                    <span className={`text-sm ${uiColors.textSecondary}`}>
                                        {(v.actions || []).length} action{(v.actions || []).length === 1 ? "" : "s"}
                                    </span>
                                </div>
                                <span className={`text-xs ${uiColors.textPlaceholder}`}>
                                    {new Date(v.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionCard({ action }) {
    const params = action.params || {};
    const paramEntries = Object.entries(params);
    const requiredCount = paramEntries.filter(([, r]) => r?.required).length;

    return (
        <div className={`group relative p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:shadow-lg hover:border-cyan-500/40 transition-all`}>
            {/* Gradient on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/5 group-hover:to-purple-500/5 transition-all pointer-events-none" />

            <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <FiZap className="w-4 h-4 text-cyan-500 shrink-0" />
                        <h4 className={`font-mono font-bold text-cyan-600 dark:text-cyan-400 truncate`}>
                            {action.name}
                        </h4>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {action.dangerous && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-600 dark:text-red-400">
                                <FiAlertTriangle className="w-3 h-3" /> Dangerous
                            </span>
                        )}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            action.scope === "global"
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                : "bg-orange-500/15 text-orange-600 dark:text-orange-400"
                        }`}>
                            {action.scope === "global" ? <FiGlobe className="w-3 h-3"/> : <FiTarget className="w-3 h-3"/>}
                            {action.scope}
                        </span>
                    </div>
                </div>

                <p className={`text-sm ${uiColors.textSecondary} mb-4 leading-relaxed`}>
                    {action.description}
                </p>

                {paramEntries.length > 0 ? (
                    <div className={`rounded-xl border ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-950/50 overflow-hidden`}>
                        <div className={`px-3 py-1.5 border-b ${uiColors.borderPrimary} text-[11px] uppercase font-bold tracking-wider ${uiColors.textPlaceholder} flex items-center justify-between`}>
                            <span>Parameters</span>
                            <span>{requiredCount} required</span>
                        </div>
                        <div className="p-3 space-y-1.5">
                            {paramEntries.map(([key, rules]) => {
                                const rulesObj = typeof rules === "object" && rules !== null ? rules : {};
                                return (
                                    <div key={key} className="flex items-center gap-2 text-xs font-mono">
                                        <span className="text-purple-600 dark:text-purple-400 font-bold">{key}</span>
                                        <span className="text-gray-400">:</span>
                                        <span className={uiColors.textSecondary}>{rulesObj.type || "any"}</span>
                                        {rulesObj.required && (
                                            <span className="ml-auto px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase">
                                                required
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className={`text-xs ${uiColors.textPlaceholder} italic`}>No parameters</div>
                )}
            </div>
        </div>
    );
}

function EmptyState({ appData }) {
    return (
        <div
            className={`p-12 rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex flex-col items-center text-center`}
        >
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 mb-5">
                <FiInbox className="w-10 h-10" />
            </div>
            <h3 className={`text-2xl font-extrabold mb-2 ${uiColors.textPrimary}`}>No manifest synced yet</h3>
            <p className={`max-w-md mb-6 ${uiColors.textSecondary}`}>
                Your capabilities will appear here automatically the first time your app calls{" "}
                <code className="font-mono text-cyan-600 dark:text-cyan-400">client.init()</code>.
            </p>

            <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-800">
                <div className="bg-gray-900 px-4 py-2 text-gray-300 font-mono text-xs flex items-center gap-2">
                    <FiCode /> example
                </div>
                <pre className="bg-gray-950 px-5 py-4 text-blue-300 font-mono text-xs text-left overflow-x-auto">
{`const client = new DoweitClient({
  publicKey: "${appData?.publicKey?.slice(0, 16) || "dw_pub_..."}…"
});

client.register({
  addToCart: {
    description: "Add an item to the cart",
    params: { itemId: { required: true } },
    handler: async ({ itemId }) => addItem(itemId)
  }
});

await client.init();   // ← syncs the manifest`}
                </pre>
            </div>
        </div>
    );
}

function EmptyActionsBlock() {
    return (
        <div className={`p-10 text-center rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
            <FiInbox className="w-8 h-8 mx-auto mb-3 text-gray-400" />
            <p className={`font-semibold ${uiColors.textPrimary}`}>This manifest version has no actions</p>
            <p className={`text-sm ${uiColors.textSecondary} mt-1`}>
                Call <code className="font-mono text-cyan-600 dark:text-cyan-400">client.register(...)</code> before <code className="font-mono">client.init()</code>.
            </p>
        </div>
    );
}
