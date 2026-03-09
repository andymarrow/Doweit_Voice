"use client";
// app/callagents/[agentid]/integrations/_components/RuleEditorSheet.jsx
//
// Slide-in editor for an integration rule (create or edit). Three sections:
//   1. Destination — provider-specific fields (channel / chat ID / email recipients)
//   2. Message template — TemplateEditor with live preview
//   3. When to fire — filter builder
//
// Saves via POST /api/callagents/<id>/integrations/rules (create)
// or PATCH /api/.../rules/<ruleId> (edit).

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
    FiX,
    FiLoader,
    FiSlack,
    FiSend,
    FiMail,
    FiRefreshCw,
    FiPlay,
} from "react-icons/fi";

import { uiColors } from "../../../_constants/uiConstants";
import TemplateEditor from "./TemplateEditor";
import FilterBuilder from "./FilterBuilder";
import SlackChannelPicker from "./SlackChannelPicker";
import SendToCallsDialog from "./SendToCallsDialog";

const sheetVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

const PROVIDER_META = {
    slack: { name: "Slack", Icon: FiSlack },
    telegram: { name: "Telegram", Icon: FiSend },
    email: { name: "Email", Icon: FiMail },
};

function emptyDestinationConfig(provider) {
    if (provider === "slack") return { channelId: "", channelName: "" };
    if (provider === "telegram") return { chatId: "" };
    if (provider === "email") return { to: "", cc: "", bcc: "" };
    return {};
}

export default function RuleEditorSheet({
    isOpen,
    onClose,
    onSaved,
    provider,
    rule,
    agentId,
}) {
    const isEdit = !!rule;
    const effectiveProvider = isEdit ? rule.provider : provider;
    const meta = PROVIDER_META[effectiveProvider];

    const [name, setName] = useState("");
    const [destinationConfig, setDestinationConfig] = useState({});
    const [templateBody, setTemplateBody] = useState("");
    const [emailSubject, setEmailSubject] = useState("");
    const [filter, setFilter] = useState({ mode: "all_calls" });
    const [enabled, setEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [agentVariables, setAgentVariables] = useState({
        callVars: [],
        actionVars: [],
        blockHelpers: [],
    });

    // Whether the AI-generated template is in flight; flips the refresh icon
    // to a spinner and disables the rest of the form briefly.
    const [isGenerating, setIsGenerating] = useState(false);
    const [sendDialogOpen, setSendDialogOpen] = useState(false);

    // Reset state on open / provider change.
    useEffect(() => {
        if (!isOpen) return;
        if (isEdit) {
            setName(rule.name || "");
            setDestinationConfig(rule.destinationConfig || emptyDestinationConfig(rule.provider));
            setFilter(rule.filter || { mode: "all_calls" });
            setEnabled(rule.enabled !== false);
            setTemplateBody(rule.template?.body || "");
            setEmailSubject(rule.template?.subject || "");
        } else {
            setName(`Send to ${meta?.name || "destination"}`);
            setDestinationConfig(emptyDestinationConfig(effectiveProvider));
            setFilter({ mode: "all_calls" });
            setEnabled(true);
            setTemplateBody("");
            setEmailSubject("");
        }
    }, [isOpen, isEdit, rule, effectiveProvider, meta]);

    // Load agent-specific variable list for the editor autocomplete.
    useEffect(() => {
        if (!isOpen || !agentId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/callagents/${agentId}/integrations/variables`);
                if (!res.ok) return;
                const data = await res.json();
                if (!cancelled) setAgentVariables(data);
            } catch {
                /* non-fatal */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isOpen, agentId]);

    // Generate (or regenerate) a template using the agent's prompt + actions
    // + knowledge base. Server falls back to a static template if Gemini is
    // unavailable, so this always returns *something* usable.
    const generateTemplate = useCallback(async () => {
        if (!agentId || !effectiveProvider) return;
        setIsGenerating(true);
        try {
            const res = await fetch(
                `/api/callagents/${agentId}/integrations/generate-template`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ destination: effectiveProvider }),
                },
            );
            if (!res.ok) throw new Error("Failed to generate template");
            const data = await res.json();
            if (data?.body) setTemplateBody(data.body);
            if (effectiveProvider === "email") {
                setEmailSubject(data?.subject || "Call summary — {{call.agentName}}");
            }
            if (data?.generatedBy === "gemini") {
                toast.success("Generated from agent context");
            } else {
                toast("Used a fallback template — Gemini unavailable.", {
                    icon: "ℹ️",
                });
            }
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsGenerating(false);
        }
    }, [agentId, effectiveProvider]);

    // Auto-generate the *first* time a brand-new rule editor is opened with
    // an empty body — the user gets a context-aware template instead of a
    // generic placeholder. We track which (provider, agentId) we already
    // auto-generated for so re-opens don't burn extra Gemini calls.
    const [autoGenerated, setAutoGenerated] = useState({ key: null });
    useEffect(() => {
        if (!isOpen || isEdit) return;
        if (templateBody) return; // user already typed something
        const key = `${agentId}:${effectiveProvider}`;
        if (autoGenerated.key === key) return;
        setAutoGenerated({ key });
        generateTemplate();
    }, [isOpen, isEdit, agentId, effectiveProvider, templateBody, autoGenerated.key, generateTemplate]);

    const validate = useCallback(() => {
        if (!name.trim()) return "Name is required";
        if (effectiveProvider === "slack" && !destinationConfig.channelId) {
            return "Pick a Slack channel";
        }
        if (effectiveProvider === "telegram" && !destinationConfig.chatId) {
            return "Telegram chat ID is required";
        }
        if (effectiveProvider === "email" && !destinationConfig.to) {
            return "Add at least one email recipient";
        }
        if (!templateBody.trim()) return "Template body is required";
        return null;
    }, [name, effectiveProvider, destinationConfig, templateBody]);

    const handleSave = async () => {
        const err = validate();
        if (err) {
            toast.error(err);
            return;
        }
        setIsSaving(true);
        try {
            // For now, store the template inline by creating/updating a one-off
            // template alongside the rule. Simpler than wiring a separate library
            // selector for v1. The Templates API still exists for power users.
            const tplResp = await fetch(`/api/integrations/templates`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: `${name.trim()} (inline)`,
                    destination: effectiveProvider,
                    subject: effectiveProvider === "email" ? emailSubject : null,
                    body: templateBody,
                }),
            });
            if (!tplResp.ok) {
                const data = await tplResp.json();
                throw new Error(data.error || "Failed to save template");
            }
            const { template } = await tplResp.json();

            const rulePayload = {
                provider: effectiveProvider,
                name: name.trim(),
                destinationConfig,
                templateId: template.id,
                filter,
                enabled,
            };

            const resp = isEdit
                ? await fetch(
                      `/api/callagents/${agentId}/integrations/rules/${rule.id}`,
                      {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(rulePayload),
                      },
                  )
                : await fetch(`/api/callagents/${agentId}/integrations/rules`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(rulePayload),
                  });

            if (!resp.ok) {
                const data = await resp.json();
                throw new Error(data.error || "Failed to save rule");
            }

            toast.success(isEdit ? "Rule updated" : "Rule created");
            onSaved();
        } catch (e) {
            toast.error(e.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen || !meta) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/50"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`fixed top-0 right-0 h-full w-full max-w-3xl z-50 flex flex-col border-l ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}
                    >
                        {/* Header */}
                        <header
                            className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-md flex items-center justify-center ${uiColors.bgSecondary}`}>
                                    <meta.Icon className={`w-5 h-5 ${uiColors.textPrimary}`} />
                                </div>
                                <div>
                                    <h2 className={`text-lg font-semibold ${uiColors.textPrimary}`}>
                                        {isEdit ? "Edit rule" : `New ${meta.name} rule`}
                                    </h2>
                                    <p className={`text-xs ${uiColors.textSecondary}`}>
                                        Fires automatically once a call ends and actions are extracted.
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}
                            >
                                <FiX className={`w-5 h-5 ${uiColors.textSecondary}`} />
                            </button>
                        </header>

                        {/* Body */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-8">
                            {/* Step 1 — name + destination */}
                            <section>
                                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${uiColors.textPlaceholder}`}>
                                    Step 1 — Destination
                                </h3>
                                <label
                                    className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}
                                >
                                    Rule name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. New leads to #sales"
                                    className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                />

                                <div className="mt-4">
                                    {effectiveProvider === "slack" && (
                                        <SlackChannelPicker
                                            value={destinationConfig.channelId}
                                            onChange={(channel) =>
                                                setDestinationConfig({
                                                    channelId: channel?.id || "",
                                                    channelName: channel?.name ? `#${channel.name}` : "",
                                                })
                                            }
                                        />
                                    )}
                                    {effectiveProvider === "telegram" && (
                                        <div>
                                            <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                                Telegram chat ID
                                            </label>
                                            <input
                                                type="text"
                                                value={destinationConfig.chatId || ""}
                                                onChange={(e) =>
                                                    setDestinationConfig({ chatId: e.target.value })
                                                }
                                                placeholder="-1001234567890 or 123456789"
                                                className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                            />
                                            <p className={`text-xs mt-1 ${uiColors.textPlaceholder}`}>
                                                Find this by adding{" "}
                                                <code className="font-mono">@RawDataBot</code> to your group, or
                                                DM your bot and call <code className="font-mono">getUpdates</code>.
                                                See the Telegram setup guide for the full walkthrough.
                                            </p>
                                        </div>
                                    )}
                                    {effectiveProvider === "email" && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                                    To
                                                </label>
                                                <input
                                                    type="text"
                                                    value={destinationConfig.to || ""}
                                                    onChange={(e) =>
                                                        setDestinationConfig({ ...destinationConfig, to: e.target.value })
                                                    }
                                                    placeholder="alice@example.com, bob@example.com"
                                                    className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                                        Cc (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={destinationConfig.cc || ""}
                                                        onChange={(e) =>
                                                            setDestinationConfig({ ...destinationConfig, cc: e.target.value })
                                                        }
                                                        className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                                        Bcc (optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={destinationConfig.bcc || ""}
                                                        onChange={(e) =>
                                                            setDestinationConfig({ ...destinationConfig, bcc: e.target.value })
                                                        }
                                                        className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Step 2 — message */}
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className={`text-sm font-semibold uppercase tracking-wide ${uiColors.textPlaceholder}`}>
                                        Step 2 — Message
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={generateTemplate}
                                        disabled={isGenerating}
                                        title="Regenerate based on this agent's prompt + actions + knowledge base"
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50`}
                                    >
                                        {isGenerating ? (
                                            <FiLoader className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <FiRefreshCw className="w-3.5 h-3.5" />
                                        )}
                                        Generate from agent context
                                    </button>
                                </div>
                                <p className={`text-xs mb-3 -mt-1 ${uiColors.textPlaceholder}`}>
                                    Regenerate uses Gemini + this agent's prompt, knowledge base,
                                    and configured actions to write a context-aware template.
                                    Edit it freely afterward.
                                </p>

                                {effectiveProvider === "email" && (
                                    <div className="mb-3">
                                        <label className={`block text-sm font-medium ${uiColors.textSecondary} mb-1`}>
                                            Email subject
                                        </label>
                                        <input
                                            type="text"
                                            value={emailSubject}
                                            onChange={(e) => setEmailSubject(e.target.value)}
                                            placeholder="Call summary — {{call.agentName}}"
                                            className={`block w-full rounded-md p-2 text-sm ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset`}
                                        />
                                    </div>
                                )}

                                <TemplateEditor
                                    destination={effectiveProvider}
                                    body={templateBody}
                                    onBodyChange={setTemplateBody}
                                    subject={emailSubject}
                                    variables={agentVariables}
                                />
                            </section>

                            {/* Step 3 — filter */}
                            <section>
                                <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${uiColors.textPlaceholder}`}>
                                    Step 3 — When to fire
                                </h3>
                                <FilterBuilder
                                    value={filter}
                                    onChange={setFilter}
                                    actionVars={agentVariables.actionVars}
                                />
                            </section>
                        </div>

                        {/* Footer */}
                        <footer
                            className={`p-4 border-t ${uiColors.borderPrimary} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                        >
                            <div className="flex items-center gap-4 flex-wrap">
                                <label className={`flex items-center gap-2 text-sm ${uiColors.textSecondary}`}>
                                    <input
                                        type="checkbox"
                                        checked={enabled}
                                        onChange={(e) => setEnabled(e.target.checked)}
                                    />
                                    Enable this rule
                                </label>
                                {/* Only meaningful for already-saved rules — for new rules we
                                    don't have a ruleId to dispatch with yet. */}
                                {isEdit && (
                                    <button
                                        type="button"
                                        onClick={() => setSendDialogOpen(true)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border ${uiColors.borderPrimary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                                        title="Send this rule's message for one or more past calls — great for demos."
                                    >
                                        <FiPlay className="w-3.5 h-3.5" />
                                        Send to past calls…
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className={`px-4 py-2 text-sm rounded-md text-white inline-flex items-center gap-2 ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                                >
                                    {isSaving && <FiLoader className="w-4 h-4 animate-spin" />}
                                    {isEdit ? "Save changes" : "Create rule"}
                                </button>
                            </div>
                        </footer>
                    </motion.div>

                    {/* Send-to-past-calls picker — only relevant in edit mode */}
                    {isEdit && rule && (
                        <SendToCallsDialog
                            isOpen={sendDialogOpen}
                            onClose={() => setSendDialogOpen(false)}
                            agentId={agentId}
                            ruleId={rule.id}
                            providerLabel={meta?.name || "destination"}
                        />
                    )}
                </>
            )}
        </AnimatePresence>
    );
}
