"use client";
// app/callagents/embedded/[appid]/_components/PlaygroundTab.jsx

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiMic,
    FiMicOff,
    FiSend,
    FiTerminal,
    FiCpu,
    FiTrash2,
    FiZap,
    FiActivity,
    FiAlertCircle,
    FiCornerDownRight,
} from "react-icons/fi";
import { DoweitClient } from "@/lib/doweit-sdk/DoweitClient";
import { useDoweitVoice } from "@/lib/doweit-sdk/useDoweitVoice";
import { uiColors } from "@/app/callagents/_constants/uiConstants";

const STATUS_LABEL = {
    idle: "Idle",
    connecting: "Connecting",
    listening: "Listening",
    thinking: "Thinking",
    speaking: "Speaking",
    executing: "Running action",
    error: "Error",
};

const STATUS_COLOR = {
    idle: "bg-gray-400",
    connecting: "bg-yellow-500",
    listening: "bg-emerald-500",
    thinking: "bg-blue-500",
    speaking: "bg-purple-500",
    executing: "bg-orange-500",
    error: "bg-red-500",
};

export default function PlaygroundTab({ appData, manifest }) {
    const [logs, setLogs] = useState([]);
    const [inputText, setInputText] = useState("");
    const chatEndRef = useRef(null);
    const logsEndRef = useRef(null);

    const addLog = (type, message, data = null) => {
        setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type, message, data }]);
    };

    // Build a mock client that mimics the developer's app — all handlers just log.
    const mockClient = useMemo(() => {
        if (!appData?.publicKey) return null;
        const client = new DoweitClient({
            publicKey: appData.publicKey,
            // Same env-var routing as SiteAssistant: unset on localhost (uses local Next.js WS),
            // set to the Render server URL on Vercel.
            baseUrl: process.env.NEXT_PUBLIC_WS_SERVER_URL || "",
        });

        if (manifest?.actions?.length) {
            const mockActions = {};
            for (const action of manifest.actions) {
                mockActions[action.name] = {
                    description: action.description,
                    params: action.params,
                    scope: action.scope,
                    dangerous: action.dangerous,
                    handler: async (args) => {
                        addLog("ACTION", `Executing ${action.name}`, args);
                        await new Promise(r => setTimeout(r, 600));
                        addLog("RESULT", `Completed ${action.name}`, { simulated: true });
                        return { status: "success", simulated_in_playground: true };
                    },
                };
            }
            client.register(mockActions);
        }

        // Bypass real init — playground doesn't need to round-trip the manifest API
        client.isInitialized = true;
        client.agentConfig = { agent: { name: "Playground simulator" } };
        return client;
    }, [appData, manifest]);

    const { status, messages, currentAction, connect, disconnect, sendText } = useDoweitVoice(mockClient);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

    useEffect(() => {
        if (status !== "idle") addLog("STATUS", `Status → ${STATUS_LABEL[status] || status}`);
    }, [status]);

    const handleSend = (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;
        addLog("INPUT", "User typed", { text: inputText });
        sendText(inputText);
        setInputText("");
    };

    const toggleVoice = () => {
        if (status === "idle" || status === "error") {
            addLog("SYS", "Connecting to Gemini Live…");
            connect();
        } else {
            addLog("SYS", "Disconnecting…");
            disconnect();
        }
    };

    const isLive = status !== "idle" && status !== "error";

    if (!mockClient) {
        return (
            <div className="p-10 text-center text-gray-500">Loading simulator…</div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Status bar */}
            <div className={`flex items-center justify-between flex-wrap gap-3 p-4 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                <div className="flex items-center gap-3">
                    <div className="relative w-3 h-3">
                        <span className={`absolute inset-0 rounded-full ${STATUS_COLOR[status]} ${isLive ? "animate-ping" : ""}`} />
                        <span className={`relative w-3 h-3 rounded-full block ${STATUS_COLOR[status]}`} />
                    </div>
                    <span className={`text-sm font-bold uppercase tracking-widest ${uiColors.textPrimary}`}>
                        {STATUS_LABEL[status] || status}
                    </span>
                    {currentAction && (
                        <span className="ml-2 px-2 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 text-xs font-mono">
                            {currentAction}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <span className={`${uiColors.textSecondary}`}>
                        {manifest?.actions?.length || 0} mocked action{(manifest?.actions?.length || 0) === 1 ? "" : "s"}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">·</span>
                    <span className={`${uiColors.textPlaceholder}`}>
                        manifest v{manifest?.version || "—"}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Chat */}
                <div className={`lg:col-span-3 flex flex-col rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} overflow-hidden`} style={{ height: 600 }}>
                    <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-950/30`}>
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white">
                                <FiCpu className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className={`font-bold ${uiColors.textPrimary} leading-tight`}>Live conversation</h4>
                                <p className={`text-[11px] ${uiColors.textPlaceholder}`}>
                                    Mock simulator · actions don't hit your real backend
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action banner */}
                    <AnimatePresence>
                        {status === "executing" && currentAction && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-orange-500/10 border-b border-orange-500/30 px-4 py-2.5 flex items-center gap-2"
                            >
                                <FiZap className="w-4 h-4 text-orange-500 animate-pulse" />
                                <span className="text-xs font-bold uppercase tracking-widest text-orange-700 dark:text-orange-300">
                                    Tool call
                                </span>
                                <span className={`text-sm font-mono ${uiColors.textPrimary}`}>{currentAction}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-gray-50/50 dark:bg-gray-950/20">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-600 space-y-2">
                                <FiActivity className="w-10 h-10 opacity-60" />
                                <p className={`text-sm ${uiColors.textSecondary}`}>
                                    Click the mic or type to start.
                                </p>
                                <p className="text-xs max-w-xs">
                                    Try: "What can you do?" or "Run {manifest?.actions?.[0]?.name || 'an action'}"
                                </p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                        m.role === "user"
                                            ? "bg-cyan-600 text-white rounded-tr-sm"
                                            : `${uiColors.bgPrimary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} rounded-tl-sm`
                                    }`}>
                                        {m.text}
                                    </div>
                                </motion.div>
                            ))
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className={`p-3 border-t ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleVoice}
                                className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                    isLive
                                        ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30"
                                        : "bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/25"
                                }`}
                                title={isLive ? "Stop voice session" : "Start voice session"}
                            >
                                {isLive ? <FiMicOff /> : <FiMic />}
                            </button>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type to test capabilities…"
                                className={`flex-1 rounded-xl px-4 py-3 text-sm bg-gray-100 dark:bg-gray-900 border-transparent focus:bg-white dark:focus:bg-gray-950 focus:ring-2 focus:ring-cyan-500 outline-none transition-all ${uiColors.textPrimary}`}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className={`p-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors`}
                            >
                                <FiSend />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Developer console */}
                <div className="lg:col-span-2 flex flex-col rounded-2xl border border-gray-800 bg-[#0D1117] overflow-hidden font-mono shadow-xl" style={{ height: 600 }}>
                    <div className="px-4 py-3 border-b border-gray-800 bg-[#161B22] flex items-center justify-between text-gray-400 text-xs">
                        <div className="flex items-center gap-2">
                            <FiTerminal />
                            <span className="font-bold tracking-wider uppercase">Developer console</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500">{logs.length} events</span>
                            <button
                                onClick={() => setLogs([])}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Clear"
                            >
                                <FiTrash2 className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 text-xs space-y-2">
                        {logs.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-600 italic text-center px-6">
                                Events from the AI ↔ SDK round-trip will stream here.
                            </div>
                        ) : (
                            logs.map((log, i) => <LogLine key={i} log={log} />)
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            </div>

            {/* Helpful hint */}
            {(!manifest || (manifest.actions || []).length === 0) && (
                <div className={`flex items-start gap-3 p-4 rounded-xl border border-orange-500/30 bg-orange-500/5`}>
                    <FiAlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-orange-700 dark:text-orange-300">No capabilities yet</p>
                        <p className="text-sm text-orange-700/80 dark:text-orange-300/80 mt-0.5">
                            The playground works best after your app has called <code className="font-mono">client.init()</code> at least once. Try the Integration tab to set it up.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function LogLine({ log }) {
    const map = {
        STATUS: "text-purple-400",
        ACTION: "text-orange-400",
        RESULT: "text-emerald-400",
        INPUT: "text-cyan-400",
        SYS: "text-blue-400",
    };
    const color = map[log.type] || "text-gray-400";
    return (
        <div>
            <div className="flex items-start gap-2">
                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                <span className={`font-bold shrink-0 ${color}`}>{log.type}</span>
                <span className="text-gray-300">{log.message}</span>
            </div>
            {log.data && (
                <pre className="ml-8 mt-1 p-2 bg-black/50 rounded border border-gray-800 text-gray-400 overflow-x-auto text-[11px] flex items-start gap-1">
                    <FiCornerDownRight className="w-3 h-3 mt-0.5 shrink-0" />
                    <code>{JSON.stringify(log.data, null, 2)}</code>
                </pre>
            )}
        </div>
    );
}
