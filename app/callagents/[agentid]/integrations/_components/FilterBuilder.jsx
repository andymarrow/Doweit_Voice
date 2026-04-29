"use client";
// app/callagents/[agentid]/integrations/_components/FilterBuilder.jsx
//
// Three modes the dispatcher supports:
//   all_calls    — fire on every call (default)
//   has_actions  — fire only when at least one of the named actions has a value
//   condition    — fire only when a named action equals a specific value
//
// We expose them as a friendly radio + dependent inputs.

import React from "react";
import { uiColors } from "../../../_constants/uiConstants";

function actionNameFromToken(token) {
    const m = /\{\{action\.([\w_]+)\}\}/.exec(token || "");
    return m ? m[1] : null;
}

export default function FilterBuilder({ value, onChange, actionVars }) {
    const mode = value?.mode || "all_calls";
    const actionNames = (actionVars || [])
        .map((v) => ({ name: actionNameFromToken(v.token), label: v.label }))
        .filter((a) => a.name);

    const update = (patch) => onChange({ ...(value || {}), ...patch });

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2">
                <label className={`flex items-start gap-2 text-sm cursor-pointer ${uiColors.textSecondary}`}>
                    <input
                        type="radio"
                        name="filter-mode"
                        checked={mode === "all_calls"}
                        onChange={() => onChange({ mode: "all_calls" })}
                        className="mt-1"
                    />
                    <span>
                        <span className={`block font-medium ${uiColors.textPrimary}`}>
                            Every call
                        </span>
                        Fire after every completed call.
                    </span>
                </label>

                <label className={`flex items-start gap-2 text-sm cursor-pointer ${uiColors.textSecondary}`}>
                    <input
                        type="radio"
                        name="filter-mode"
                        checked={mode === "has_actions"}
                        onChange={() =>
                            update({ mode: "has_actions", requiredActions: value?.requiredActions || [] })
                        }
                        className="mt-1"
                    />
                    <span>
                        <span className={`block font-medium ${uiColors.textPrimary}`}>
                            When specific actions are present
                        </span>
                        Skip calls where none of the chosen actions were extracted.
                    </span>
                </label>

                {mode === "has_actions" && (
                    <div className="ml-6 mt-1 grid grid-cols-2 gap-1.5">
                        {actionNames.length === 0 ? (
                            <p className={`text-xs col-span-2 ${uiColors.textPlaceholder}`}>
                                No extractable actions configured for this agent yet.
                            </p>
                        ) : (
                            actionNames.map((a) => {
                                const checked =
                                    Array.isArray(value?.requiredActions) &&
                                    value.requiredActions.includes(a.name);
                                return (
                                    <label
                                        key={a.name}
                                        className={`flex items-center gap-2 text-xs ${uiColors.textSecondary}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                                const cur = Array.isArray(value?.requiredActions)
                                                    ? value.requiredActions
                                                    : [];
                                                const next = e.target.checked
                                                    ? [...cur, a.name]
                                                    : cur.filter((n) => n !== a.name);
                                                update({ requiredActions: next });
                                            }}
                                        />
                                        {a.label}
                                    </label>
                                );
                            })
                        )}
                    </div>
                )}

                <label className={`flex items-start gap-2 text-sm cursor-pointer ${uiColors.textSecondary}`}>
                    <input
                        type="radio"
                        name="filter-mode"
                        checked={mode === "condition"}
                        onChange={() =>
                            update({ mode: "condition", condition: value?.condition || {} })
                        }
                        className="mt-1"
                    />
                    <span>
                        <span className={`block font-medium ${uiColors.textPrimary}`}>
                            When an action equals a value
                        </span>
                        Fine-grained — useful for routing only certain outcomes.
                    </span>
                </label>

                {mode === "condition" && (
                    <div className="ml-6 mt-1 flex items-center gap-2 flex-wrap">
                        <select
                            value={value?.condition?.actionName || ""}
                            onChange={(e) =>
                                update({
                                    condition: {
                                        ...(value?.condition || {}),
                                        actionName: e.target.value,
                                    },
                                })
                            }
                            className={`rounded-md p-1.5 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                        >
                            <option value="">Pick an action…</option>
                            {actionNames.map((a) => (
                                <option key={a.name} value={a.name}>
                                    {a.label}
                                </option>
                            ))}
                        </select>
                        <span className={`text-sm ${uiColors.textSecondary}`}>equals</span>
                        <input
                            type="text"
                            value={value?.condition?.equals || ""}
                            onChange={(e) =>
                                update({
                                    condition: {
                                        ...(value?.condition || {}),
                                        equals: e.target.value,
                                    },
                                })
                            }
                            placeholder="e.g. Pickup"
                            className={`rounded-md p-1.5 text-sm ring-1 ring-inset min-w-[12rem] ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
