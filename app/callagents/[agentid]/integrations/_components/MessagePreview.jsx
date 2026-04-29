"use client";
// app/callagents/[agentid]/integrations/_components/MessagePreview.jsx
//
// Visual preview of how the rendered template will look when sent. We don't
// reproduce the destination's chrome 1:1 — that would be a maintenance burden
// — but we *do* approximate the shape (Slack message bubble, Telegram chat
// bubble, email card) so users get an honest sense of layout.

import React from "react";
import { uiColors } from "../../../_constants/uiConstants";

function ActionsTable({ ctx }) {
    if (!ctx?._actionsList?.length) return null;
    return (
        <table className="w-full mt-3 text-xs">
            <tbody>
                {ctx._actionsList.slice(0, 6).map((a) => (
                    <tr key={a.name} className="border-b border-black/5 dark:border-white/10">
                        <td className="py-1.5 pr-3 text-gray-500 dark:text-gray-400 align-top">
                            {a.displayName}
                        </td>
                        <td className="py-1.5 font-medium">{a.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function SlackPreview({ body, ctx }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-md text-sm text-gray-900 dark:text-gray-100">
            <div className="flex items-start gap-3 p-3">
                <div className="w-9 h-9 rounded bg-gradient-to-br from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-white font-bold">
                    DV
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">Doweit Voice</span>
                        <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            APP
                        </span>
                        <span className="text-xs text-gray-400">just now</span>
                    </div>
                    <div className="mt-1 font-semibold">
                        📞 {ctx?.call?.agentName || "Call Agent"} — call summary
                    </div>
                    <div
                        className="mt-1 whitespace-pre-wrap text-sm"
                        // body is plain text from the renderer; we treat it as text.
                    >
                        {body}
                    </div>
                    <ActionsTable ctx={ctx} />
                    <button
                        type="button"
                        className="mt-3 inline-flex items-center px-3 py-1.5 rounded text-xs font-semibold bg-emerald-500 text-white"
                    >
                        Open call
                    </button>
                </div>
            </div>
        </div>
    );
}

function TelegramPreview({ body, ctx }) {
    return (
        <div className="bg-[#e8f1fb] dark:bg-[#17212b] rounded-md p-3">
            <div className="bg-white dark:bg-[#212e3c] rounded-lg shadow p-3 max-w-md">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                    Doweit Voice Bot
                </div>
                <div className="text-sm text-gray-900 dark:text-gray-100 font-semibold">
                    📞 {ctx?.call?.agentName || "Call Agent"} — call summary
                </div>
                <div className="mt-1 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">
                    {body}
                </div>
                {ctx?._actionsList?.length > 0 && (
                    <ul className="mt-3 text-sm space-y-1 text-gray-700 dark:text-gray-200">
                        {ctx._actionsList.slice(0, 6).map((a) => (
                            <li key={a.name}>
                                • <span className="font-semibold">{a.displayName}</span>:{" "}
                                {a.value}
                            </li>
                        ))}
                    </ul>
                )}
                <a className="mt-3 inline-block text-sm text-blue-600 dark:text-blue-400 underline">
                    Open call
                </a>
            </div>
        </div>
    );
}

function EmailPreview({ body, subject, ctx }) {
    return (
        <div className="rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700 text-sm">
                <div className="text-gray-400 dark:text-gray-500">From: Doweit Voice &lt;agent@…&gt;</div>
                <div className="font-semibold mt-0.5 text-gray-900 dark:text-gray-100">
                    {subject || "Call summary"}
                </div>
            </div>
            <div className="bg-[#f6f7fb] dark:bg-gray-900 p-4">
                <div
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                    style={{ maxWidth: 560, margin: "0 auto" }}
                >
                    <div
                        className="px-4 py-3 text-white font-semibold"
                        style={{ background: "linear-gradient(90deg,#06b6d4,#7c3aed)" }}
                    >
                        📞 {ctx?.call?.agentName || "Call Agent"} — call summary
                    </div>
                    <div className="p-4 text-sm text-gray-900 dark:text-gray-100">
                        <div className="whitespace-pre-wrap">{body}</div>
                        <ActionsTable ctx={ctx} />
                    </div>
                    <div className="px-4 py-2 text-xs bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-gray-500">
                        Sent by Doweit Voice · automated post-call notification
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function MessagePreview({ destination, body, subject, ctx }) {
    if (destination === "slack") return <SlackPreview body={body} ctx={ctx} />;
    if (destination === "telegram") return <TelegramPreview body={body} ctx={ctx} />;
    if (destination === "email") return <EmailPreview body={body} subject={subject} ctx={ctx} />;
    return (
        <div className={`text-sm ${uiColors.textPlaceholder}`}>
            Preview unavailable for this destination.
        </div>
    );
}
