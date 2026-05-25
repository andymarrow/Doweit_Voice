"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  ExternalLink,
  Briefcase,
  Copy,
  Shield,
  Zap,
  UserCheck,
  Save,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

// Convert a Date-ish value to the "YYYY-MM-DD" format an <input type="date"> expects.
function toDateInput(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

// Build the editable form state from the interview row
function buildForm(interview) {
  return {
    title: interview?.title || "",
    department: interview?.department || "",
    description: interview?.description || "",
    location: interview?.location || "",
    employmentType: interview?.employmentType || "",
    requiredExperience: interview?.requiredExperience || "",
    language: interview?.language || "English",
    duration: interview?.duration ?? 30,
    questionCount: interview?.questionCount ?? 8,
    antiCheatEnabled: interview?.antiCheatEnabled ?? true,
    startDate: toDateInput(interview?.startDate),
    endDate: toDateInput(interview?.endDate),
    registrationStartDate: toDateInput(interview?.registrationStartDate),
    registrationEndDate: toDateInput(interview?.registrationEndDate),
    candidateEvaluation: interview?.candidateEvaluation || "",
  };
}

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"];
const EXPERIENCE_LEVELS = ["junior", "mid", "senior", "expert"];

export const ConfigurationTab = ({ interview, onSaved }) => {
  const [form, setForm] = useState(() => buildForm(interview));
  const [saving, setSaving] = useState(false);

  // Reset form whenever the parent's interview row changes (e.g., after save).
  useEffect(() => {
    setForm(buildForm(interview));
  }, [interview]);

  const dirty = useMemo(() => {
    const base = buildForm(interview);
    return JSON.stringify(base) !== JSON.stringify(form);
  }, [interview, form]);

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  const magicLink =
    interview?.magicLink ||
    (interview?.id ? `${appUrl}/candidate/${interview.id}` : null);

  const copyLink = (link) => {
    if (link) {
      navigator.clipboard.writeText(link);
      toast.success("Copied!");
    }
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!interview?.id || saving) return;
    setSaving(true);
    try {
      const payload = {
        positionId: interview.id,
        title: form.title,
        department: form.department,
        description: form.description,
        location: form.location,
        employmentType: form.employmentType,
        requiredExperience: form.requiredExperience,
        language: form.language,
        duration: Number(form.duration) || 30,
        questionCount: Number(form.questionCount) || 8,
        antiCheatEnabled: !!form.antiCheatEnabled,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
        registrationStartDate: form.registrationStartDate || null,
        registrationEndDate: form.registrationEndDate || null,
        candidateEvaluation: form.candidateEvaluation,
      };

      const res = await fetch("/api/recruiter/createInterview", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Configuration saved");
      onSaved?.(data.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ─── Save bar ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/90 rounded-2xl border border-gray-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Briefcase size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight">Edit Configuration</p>
            <p className={cn(
              "text-[10px] font-medium flex items-center gap-1 mt-0.5",
              dirty ? "text-amber-600" : "text-emerald-600"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                dirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
              )} />
              {dirty ? "Unsaved changes" : "All changes saved"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <button
              onClick={() => setForm(buildForm(interview))}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw size={11} /> Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!dirty || saving}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all",
              dirty && !saving
                ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 shadow-md shadow-purple-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {saving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ─── LEFT COLUMN: Position Details + System Prompt ──────────── */}
        <div className="space-y-4">
          {/* Position Details */}
          <Panel
            icon={Briefcase}
            title="Position Details"
            subtitle="Core job & interview settings"
            accent="purple"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title" full>
                <input
                  value={form.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Department">
                <input
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Location">
                <input
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Employment Type">
                <select
                  value={form.employmentType}
                  onChange={(e) => setField("employmentType", e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select —</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Experience">
                <select
                  value={form.requiredExperience}
                  onChange={(e) => setField("requiredExperience", e.target.value)}
                  className={inputCls}
                >
                  <option value="">— Select —</option>
                  {EXPERIENCE_LEVELS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>

              <Field label="Language">
                <input
                  value={form.language}
                  onChange={(e) => setField("language", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Duration (min)">
                <input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(e) => setField("duration", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Questions">
                <input
                  type="number"
                  min={1}
                  value={form.questionCount}
                  onChange={(e) => setField("questionCount", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Start Date">
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setField("startDate", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="End Date">
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setField("endDate", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Registration Start">
                <input
                  type="date"
                  value={form.registrationStartDate}
                  onChange={(e) => setField("registrationStartDate", e.target.value)}
                  className={inputCls}
                />
              </Field>

              <Field label="Registration End">
                <input
                  type="date"
                  value={form.registrationEndDate}
                  onChange={(e) => setField("registrationEndDate", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </Panel>

          {/* System prompt (read-only) */}
          {interview?.systemPrompt && (
            <Panel
              icon={Zap}
              title="System Prompt"
              subtitle="Generated AI behavior — read only"
              accent="indigo"
            >
              <div className="h-48 overflow-y-auto rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-purple-100 p-3.5">
                <pre className="text-[11px] text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {interview.systemPrompt}
                </pre>
              </div>
            </Panel>
          )}
        </div>

        {/* ─── RIGHT COLUMN ──────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Job description */}
          <Panel
            icon={FileText}
            title="Job Description"
            subtitle="Shown to candidates"
            accent="blue"
          >
            <textarea
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              rows={7}
              className="w-full rounded-xl bg-gradient-to-br from-blue-50/40 to-white border border-blue-100 p-3.5 text-[12px] text-gray-700 leading-relaxed resize-y focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
            />
          </Panel>

          {/* Candidate selection rules */}
          <Panel
            icon={UserCheck}
            title="Candidate Selection Rules"
            subtitle="Automated screening guidelines"
            accent="emerald"
          >
            <textarea
              value={form.candidateEvaluation}
              onChange={(e) => setField("candidateEvaluation", e.target.value)}
              rows={5}
              placeholder="e.g. Auto-reject candidates with fit score below 60. Prioritise candidates with React + TypeScript experience."
              className="w-full rounded-xl bg-gradient-to-br from-emerald-50/40 to-white border border-emerald-100 p-3.5 text-[12px] text-emerald-900 leading-relaxed resize-y focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 placeholder:text-emerald-300/70 transition"
            />
          </Panel>

          {/* Anti-cheat */}
          <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 flex items-center justify-between hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center">
                <Shield size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Anti-Cheat Protection</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Monitors tab switching &amp; focus</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setField("antiCheatEnabled", !form.antiCheatEnabled)}
              className={cn(
                "relative w-11 h-6 rounded-full transition-colors shadow-inner",
                form.antiCheatEnabled
                  ? "bg-gradient-to-r from-purple-500 to-blue-500"
                  : "bg-gray-300"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all",
                  form.antiCheatEnabled ? "right-0.5" : "left-0.5"
                )}
              />
            </button>
          </div>

          {/* Magic link */}
          <Panel
            icon={ExternalLink}
            title="Interview Link"
            subtitle="Share this link with candidates"
            accent="cyan"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 overflow-hidden">
                <p className="text-[11px] font-mono text-blue-800 truncate">
                  {magicLink || "No link available"}
                </p>
              </div>
              <button
                onClick={() => copyLink(magicLink)}
                disabled={!magicLink}
                className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition-all disabled:opacity-40 shadow-sm"
              >
                <Copy size={13} />
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

// Accent palette for the panel headers
const ACCENT = {
  purple:  { bg: "from-purple-500 to-purple-600",  ring: "ring-purple-100/60" },
  blue:    { bg: "from-blue-500 to-blue-600",      ring: "ring-blue-100/60" },
  emerald: { bg: "from-emerald-500 to-emerald-600", ring: "ring-emerald-100/60" },
  indigo:  { bg: "from-indigo-500 to-indigo-600",  ring: "ring-indigo-100/60" },
  cyan:    { bg: "from-cyan-500 to-cyan-600",      ring: "ring-cyan-100/60" },
};

function Panel({ icon: Icon, title, subtitle, accent = "purple", children }) {
  const a = ACCENT[accent] || ACCENT.purple;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2.5">
        <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm", a.bg)}>
          <Icon size={13} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 leading-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 text-xs font-semibold text-gray-800 focus:outline-none focus:border-purple-400 focus:bg-white focus:ring-2 focus:ring-purple-100 transition";

function Field({ label, full, children }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      {children}
    </div>
  );
}
