"use client";
// app/callagents/[agentid]/integrations/_components/RuleCard.jsx
//
// Compact list card for one integration rule. Shows destination summary + a
// health chip from the most recent dispatch attempt + quick actions.

import React from "react";
import {
    FiSlack,
    FiSend,
    FiMail,
    FiEdit2,
    FiTrash2,
    FiPlay,
    FiCheck,
    FiAlertTriangle,
} from "react-icons/fi";
import { uiColors } from "../../../_constants/uiConstants";

const ICON_BY_PROVIDER = {
    slack: FiSlack,
    telegram: FiSend,
    email: FiMail,
};

function describeDestination(rule) {
    const cfg = rule.destinationConfig || {};
    if (rule.provider === "slack") return cfg.channelName || cfg.channelId || "—";
    if (rule.provider === "telegram") return `chat ${cfg.chatId || "—"}`;
    if (rule.provider === "email") return cfg.to || "—";
    return "—";
}

function describeFilter(rule) {
    const f = rule.filter || {};
    if (f.mode === "all_calls" || !f.mode) return "All calls";
    if (f.mode === "has_actions") {
        const list = (f.requiredActions || []).join(", ");
        return list ? `When ${list} present` : "When any action present";
    }
    if (f.mode === "condition") {
        const c = f.condition || {};
        return `When ${c.actionName || "?"} = "${c.equals || ""}"`;
    }
    return "All calls";
}

function HealthChip({ lastDispatch }) {
    if (!lastDispatch) {
        return (
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                Not yet fired
            </span>
        );
    }
    if (lastDispatch.status === "success") {
        return (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-400">
                <FiCheck className="w-3 h-3" /> Last sent OK
            </span>
        );
    }
    if (lastDispatch.status === "failed") {
        return (
            <span
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-red-600 dark:text-red-400"
                title={lastDispatch.detail || ""}
            >
                <FiAlertTriangle className="w-3 h-3" /> Last failed
            </span>
        );
    }
    return (
        <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
            Last skipped
        </span>
    );
}

export default function RuleCard({ rule, onEdit, onDelete, onToggle, onTest }) {
    const Icon = ICON_BY_PROVIDER[rule.provider] || FiMail;

    return (
        <div
            className={`rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-4 flex items-start gap-4`}
        >
            <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 ${uiColors.bgSecondary}`}>
                <Icon className={`w-5 h-5 ${uiColors.textPrimary}`} />
            </div>

            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`font-semibold truncate ${uiColors.textPrimary}`}>{rule.name}</h4>
                    <HealthChip lastDispatch={rule.lastDispatch} />
                    {!rule.enabled && (
                        <span className={`text-[10px] uppercase tracking-wider font-semibold ${uiColors.textPlaceholder}`}>
                            Disabled
                        </span>
                    )}
                </div>
                <p className={`text-xs mt-1 ${uiColors.textSecondary}`}>
                    Sends to <span className="font-medium">{describeDestination(rule)}</span> · {describeFilter(rule)}
                </p>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
                {/* Toggle */}
                <button
                    onClick={() => onToggle(!rule.enabled)}
                    title={rule.enabled ? "Disable" : "Enable"}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                                ${rule.enabled ? "bg-cyan-500 dark:bg-purple-500" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                    ${rule.enabled ? "translate-x-4" : "translate-x-0.5"}`}
                    />
                </button>
                <button
                    onClick={onTest}
                    title="Send a test message"
                    className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                >
                    <FiPlay className="w-4 h-4" />
                </button>
                <button
                    onClick={onEdit}
                    title="Edit"
                    className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                >
                    <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                    onClick={onDelete}
                    title="Delete"
                    className="p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                >
                    <FiTrash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
