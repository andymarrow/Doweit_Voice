"use client";
// app/callagents/[agentid]/integrations/_components/TemplateEditor.jsx
//
// Split-pane template editor: textarea on the left, live destination-specific
// preview on the right. A variables tray sits below — clicking a variable
// inserts it at the textarea cursor.

import React, { useMemo, useRef } from "react";
import { uiColors } from "../../../_constants/uiConstants";
import MessagePreview from "./MessagePreview";
import { renderTemplateClient, sampleContext } from "./previewSupport";

export default function TemplateEditor({
    destination,
    body,
    onBodyChange,
    subject,
    variables,
}) {
    const textareaRef = useRef(null);

    const ctx = useMemo(
        () => sampleContext(variables?.actionVars || []),
        [variables],
    );

    const renderedBody = useMemo(
        () => renderTemplateClient(body || "", ctx),
        [body, ctx],
    );
    const renderedSubject = useMemo(
        () => renderTemplateClient(subject || "", ctx),
        [subject, ctx],
    );

    const insertAtCursor = (token) => {
        const ta = textareaRef.current;
        if (!ta) {
            onBodyChange((body || "") + token);
            return;
        }
        const start = ta.selectionStart || 0;
        const end = ta.selectionEnd || 0;
        const next = (body || "").slice(0, start) + token + (body || "").slice(end);
        onBodyChange(next);
        // Restore selection to just after the inserted token next render.
        requestAnimationFrame(() => {
            ta.focus();
            const pos = start + token.length;
            ta.setSelectionRange(pos, pos);
        });
    };

    const allVars = [
        ...(variables?.callVars || []),
        ...(variables?.actionVars || []),
    ];
    const helpers = variables?.blockHelpers || [];

    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor */}
                <div className="flex flex-col">
                    <label
                        className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}
                    >
                        Template body
                    </label>
                    <textarea
                        ref={textareaRef}
                        value={body || ""}
                        onChange={(e) => onBodyChange(e.target.value)}
                        rows={destination === "email" ? 14 : 10}
                        className={`block w-full rounded-md p-3 text-sm font-mono leading-relaxed ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                        placeholder="Type your message and click variables below to insert them."
                    />
                </div>

                {/* Preview */}
                <div className="flex flex-col">
                    <label
                        className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}
                    >
                        Live preview ({destination})
                    </label>
                    <div
                        className={`rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-3 overflow-auto`}
                        style={{ minHeight: 200 }}
                    >
                        <MessagePreview
                            destination={destination}
                            body={renderedBody}
                            subject={renderedSubject}
                            ctx={ctx}
                        />
                    </div>
                </div>
            </div>

            {/* Variable tray */}
            <div className="mt-4">
                <p
                    className={`text-xs uppercase tracking-wider font-semibold mb-2 ${uiColors.textPlaceholder}`}
                >
                    Click to insert
                </p>
                <div className="flex flex-wrap gap-2">
                    {allVars.map((v) => (
                        <button
                            key={v.token}
                            type="button"
                            onClick={() => insertAtCursor(v.token)}
                            title={v.label}
                            className={`text-xs font-mono px-2 py-1 rounded border ${uiColors.borderPrimary} ${uiColors.bgPrimary} ${uiColors.textSecondary} hover:${uiColors.accentPrimary.replace("text-", "border-")}`}
                        >
                            {v.token}
                        </button>
                    ))}
                </div>
                {helpers.length > 0 && (
                    <details className="mt-3">
                        <summary
                            className={`text-xs ${uiColors.textPlaceholder} cursor-pointer select-none`}
                        >
                            Block helpers (conditional + loops)
                        </summary>
                        <ul className={`mt-2 text-xs ${uiColors.textSecondary} space-y-1`}>
                            {helpers.map((h) => (
                                <li key={h.token}>
                                    <code className="font-mono">{h.token}</code> — {h.label}
                                </li>
                            ))}
                        </ul>
                    </details>
                )}
            </div>
        </div>
    );
}
