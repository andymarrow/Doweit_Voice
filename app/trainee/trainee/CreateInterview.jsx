"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Upload,
  FileText,
  Sparkles,
  User,
  Link as LinkIcon,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Target,
  Zap,
  HelpCircle,
  Trash2,
  Edit,
  Loader2,
  Copy,
  Database,
  ExternalLink,
  Clock,
  X,
  Plus,
  Volume2,
  Settings,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import VoiceModal from "@/app/characterai/create/_components/VoiceModal";

// ─── steps ──────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Setup", icon: Database },
  { id: 1, label: "Description", icon: FileText },
  { id: 2, label: "AI Prompt", icon: Sparkles },
  { id: 3, label: "Evaluation", icon: Target },
  { id: 4, label: "Agent", icon: Settings },
  { id: 5, label: "Publish", icon: LinkIcon },
];

// ─── criteria pool ───────────────────────────────────────────────────────────

const CRITERIA_POOL = [
  { name: "Technical Knowledge", method: "AI Semantic Analysis" },
  { name: "Communication Skills", method: "Tone & Sentiment" },
  { name: "Problem Solving", method: "Logic Evaluation" },
  { name: "Cultural Fit", method: "Value Alignment" },
  { name: "Confidence", method: "Behavioral Analysis" },
  { name: "Adaptability", method: "Scenario Assessment" },
  { name: "Leadership Potential", method: "Behavioral Analysis" },
  { name: "Creativity", method: "AI Semantic Analysis" },
  { name: "Teamwork", method: "Value Alignment" },
  { name: "Analytical Thinking", method: "Logic Evaluation" },
  { name: "Initiative", method: "Behavioral Analysis" },
  { name: "Domain Expertise", method: "AI Semantic Analysis" },
];

const buildCriteria = (count) => {
  const n = Math.min(count, CRITERIA_POOL.length);
  const base = Math.floor(100 / n);
  const rem = 100 - base * n;
  return CRITERIA_POOL.slice(0, n).map((c, i) => ({
    ...c,
    weight: i === 0 ? base + rem : base,
    range: "0-100",
  }));
};

// ─── helpers ─────────────────────────────────────────────────────────────────

const Field = ({ label, children, className }) => (
  <div className={cn("space-y-1", className)}>
    <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all";

// ─── component ───────────────────────────────────────────────────────────────

export const CreateInterview = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdPosition, setCreatedPosition] = useState(null);
  const [storageError, setStorageError] = useState(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [criteriaReady, setCriteriaReady] = useState(false);

  // AI generation states
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  // Evaluation criteria
  const [criteria, setCriteria] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState(10);
  const [editMethod, setEditMethod] = useState("");
  const [showAddRow, setShowAddRow] = useState(false);

  // Form
  const [form, setForm] = useState({
    // step 0
    registrationStartDate: "",
    registrationEndDate: "",
    jobPosition: "",
    requiredExperience: "mid",
    language: "English",
    title: "",
    department: "Engineering",
    location: "Remote",
    employmentType: "full-time",
    startDate: "",
    endDate: "",
    duration: 30,
    questionCount: 8,
    // step 1
    description: "",
    // step 2 (AI)
    systemPrompt: "",
    aiQuestions: [],
    // step 4
    agentName: "Viktor",
    voiceProvider: "vapi",
    voiceId: "monitor",
    voiceName: "",
    tone: "Friendly",
    antiCheatEnabled: true,
    price: 50,
    accessType: "Public (Anyone)",
    status: "draft",
  });

  const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  const searchParams = useSearchParams();

  // ── when entering step 3, auto-generate criteria ────────────────────────
  useEffect(() => {
    if (step === 3 && !criteriaReady) {
      const count = (Number(form.questionCount) || 8) + 2;
      setCriteria(buildCriteria(count));
      setCriteriaReady(true);
    }
  }, [step, criteriaReady, form.questionCount]);

  // ── voice modal ─────────────────────────────────────────────────────────
  const handleVoiceSelected = (voice) => {
    const platform = (voice.platform || voice.provider || "vapi").toLowerCase();
    setForm((p) => ({
      ...p,
      voiceProvider: platform,
      voiceId: voice.voiceId,
      voiceName: voice.name,
    }));
    setIsVoiceModalOpen(false);
  };

  // ── AI prompt ────────────────────────────────────────────────────────────
  const generatePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const res = await fetch("/api/recruiter/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: form.title,
          department: form.department,
          description: form.description,
          experienceLevel: form.requiredExperience,
          evaluationCriteria: criteria,
          location: form.location,
          employmentType: form.employmentType,
          language: form.language,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set("systemPrompt", data.prompt);
      toast.success("Prompt generated");
    } catch {
      toast.error("Failed to generate prompt");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  // ── AI questions ─────────────────────────────────────────────────────────
  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const res = await fetch("/api/recruiter/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          department: form.department,
          description: form.description,
          language: form.language,
          experienceLevel: form.requiredExperience,
          questionCount: form.questionCount,
          duration: form.duration,
          evaluationCriteria: criteria,
          systemPrompt: form.systemPrompt,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      set("aiQuestions", data.questions || []);
      toast.success(`${data.questions?.length || 0} questions generated`);
    } catch {
      toast.error("Failed to generate questions");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // ── submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStorageError(null);
    try {
      const res = await fetch("/api/recruiter/createInterview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          aiQuestions: form.aiQuestions || [],
          systemPrompt: form.systemPrompt || "",
          evaluationCriteria: criteria,
          recruiterId: "default-recruiter",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setCreatedPosition(data.data);
        toast.success("Interview created!");
        setTimeout(() => setStep(5), 800);
      }
    } catch (err) {
      setStorageError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── criteria helpers ─────────────────────────────────────────────────────
  const weightSum = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);
  const weightsValid = weightSum === 100;

  const openEdit = (i) => {
    setEditIdx(i);
    setEditName(criteria[i].name);
    setEditWeight(criteria[i].weight);
    setEditMethod(criteria[i].method || "");
  };

  const saveEdit = () => {
    const updated = [...criteria];
    if (editIdx === "new") {
      updated.push({
        name: editName,
        weight: Number(editWeight),
        range: "0-100",
        method: editMethod,
      });
    } else {
      updated[editIdx] = {
        ...updated[editIdx],
        name: editName,
        weight: Number(editWeight),
        method: editMethod,
      };
    }
    setCriteria(updated);
    setEditIdx(null);
    setShowAddRow(false);
    setEditName("");
    setEditWeight(10);
    setEditMethod("");
  };

  const deleteCriteria = (i) => {
    if (criteria.length <= 1) return;
    setCriteria(criteria.filter((_, idx) => idx !== i));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STEP RENDERS
  // ─────────────────────────────────────────────────────────────────────────

  const renderStep0 = () => (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-black text-gray-900">
          Registration & Job Setup
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Configure dates, position details and interview parameters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Job Title *">
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Senior Frontend Engineer"
          />
        </Field>
        <Field label="Job Position *">
          <input
            className={inputCls}
            value={form.jobPosition}
            onChange={(e) => set("jobPosition", e.target.value)}
            placeholder="e.g. Software Engineer"
          />
        </Field>
        <Field label="Department *">
          <input
            className={inputCls}
            value={form.department}
            onChange={(e) => set("department", e.target.value)}
            placeholder="e.g. Engineering"
          />
        </Field>
        <Field label="Language *">
          <select
            className={inputCls}
            value={form.language}
            onChange={(e) => set("language", e.target.value)}
          >
            <option value="English">English</option>
            <option value="Amharic">Amharic</option>
            <option value="Oromo">Oromo</option>
            <option value="Tigrinya">Tigrinya</option>
          </select>
        </Field>
        <Field label="Required Experience *">
          <select
            className={inputCls}
            value={form.requiredExperience}
            onChange={(e) => set("requiredExperience", e.target.value)}
          >
            <option value="0-1">0–1 Years (Entry)</option>
            <option value="1-3">1–3 Years (Junior)</option>
            <option value="3-5">3–5 Years (Mid)</option>
            <option value="5-10">5–10 Years (Senior)</option>
            <option value="10+">10+ Years (Expert)</option>
          </select>
        </Field>
        <Field label="Location *">
          <select
            className={inputCls}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </Field>
        <Field label="Employment Type *">
          <select
            className={inputCls}
            value={form.employmentType}
            onChange={(e) => set("employmentType", e.target.value)}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </Field>
        <Field label="Number of Questions *">
          <div className="relative">
            <input
              className={inputCls}
              type="number"
              min={3}
              max={20}
              value={form.questionCount}
              onChange={(e) => {
                set("questionCount", parseInt(e.target.value));
                setCriteriaReady(false);
              }}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
              Q
            </span>
          </div>
        </Field>
        <Field label="Interview Duration *">
          <div className="relative">
            <input
              className={inputCls}
              type="number"
              min={15}
              max={120}
              value={form.duration}
              onChange={(e) => set("duration", parseInt(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-400 pointer-events-none">
              MIN
            </span>
          </div>
        </Field>
        <Field label="Registration Start *">
          <input
            className={inputCls}
            type="datetime-local"
            value={form.registrationStartDate}
            onChange={(e) => set("registrationStartDate", e.target.value)}
          />
        </Field>
        <Field label="Registration End *">
          <input
            className={inputCls}
            type="datetime-local"
            value={form.registrationEndDate}
            onChange={(e) => set("registrationEndDate", e.target.value)}
          />
        </Field>
        <Field label="Interview Start Date">
          <input
            className={inputCls}
            type="date"
            value={form.startDate}
            onChange={(e) => set("startDate", e.target.value)}
          />
        </Field>
        <Field label="Interview End Date">
          <input
            className={inputCls}
            type="date"
            value={form.endDate}
            onChange={(e) => set("endDate", e.target.value)}
          />
        </Field>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-black text-gray-900">Job Description</h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Describe the role, responsibilities and requirements
        </p>
      </div>
      <textarea
        value={form.description}
        onChange={(e) => set("description", e.target.value)}
        placeholder="Paste or type the full job description here…&#10;&#10;Include:&#10;• Role responsibilities&#10;• Required skills and experience&#10;• Nice-to-have qualifications&#10;• About the company"
        className="w-full h-72 px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
        required
      />
      <p className="text-[10px] text-gray-400">
        {form.description.length} characters · Recommended: 300+ characters for
        best AI results
      </p>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">AI System Prompt</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Generate an AI interviewer prompt then create questions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generatePrompt}
            disabled={isGeneratingPrompt || !form.title || !form.description}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {isGeneratingPrompt ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {isGeneratingPrompt ? "Generating…" : "Generate Prompt"}
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={form.systemPrompt}
          onChange={(e) => set("systemPrompt", e.target.value)}
          placeholder="Click 'Generate Prompt' to create an AI-powered system prompt…"
          className="w-full h-52 px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
        />
        {form.systemPrompt && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(form.systemPrompt);
              toast.success("Copied");
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500"
          >
            <Copy size={12} />
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-xs font-bold text-gray-900">
              Generate Interview Questions
            </h4>
            <p className="text-[10px] text-gray-400">
              AI will create {form.questionCount} questions based on the prompt
            </p>
          </div>
          <button
            onClick={generateQuestions}
            disabled={isGeneratingQuestions || !form.systemPrompt}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isGeneratingQuestions ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <HelpCircle size={12} />
            )}
            {isGeneratingQuestions ? "Generating…" : "Generate Questions"}
          </button>
        </div>

        {form.aiQuestions?.length > 0 && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 space-y-2 max-h-48 overflow-y-auto">
            {form.aiQuestions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-[11px] text-gray-700 leading-relaxed">{q}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-900">
            Evaluation Criteria
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Auto-generated {criteria.length} criteria ({form.questionCount}{" "}
            questions + 2) · sent as JSON to AI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-1 rounded-full",
              weightsValid
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700",
            )}
          >
            {weightSum}% / 100%
          </span>
          <button
            onClick={() => {
              setShowAddRow(true);
              setEditIdx("new");
              setEditName("");
              setEditWeight(10);
              setEditMethod("AI Semantic Analysis");
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-600 text-white text-[10px] font-bold hover:bg-purple-700 transition-colors"
          >
            <Plus size={11} /> Add
          </button>
        </div>
      </div>

      {!weightsValid && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 border border-purple-200">
          <HelpCircle size={12} className="text-purple-500 flex-shrink-0" />
          <p className="text-[10px] text-purple-700">
            Weights must total 100%. Current: <strong>{weightSum}%</strong>
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Criteria
              </th>
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-4 py-2.5 text-left text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Bar
              </th>
              <th className="px-4 py-2.5 text-right text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {criteria.map((c, i) => (
              <tr key={i} className="hover:bg-purple-50/20 transition-colors">
                <td className="px-4 py-2.5 text-[10px] font-bold text-gray-400">
                  {i + 1}
                </td>
                <td className="px-4 py-2.5">
                  {editIdx === i ? (
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-medium text-gray-800">
                      {c.name}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {editIdx === i ? (
                    <select
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                    >
                      <option>AI Semantic Analysis</option>
                      <option>Tone &amp; Sentiment</option>
                      <option>Logic Evaluation</option>
                      <option>Value Alignment</option>
                      <option>Behavioral Analysis</option>
                      <option>Scenario Assessment</option>
                    </select>
                  ) : (
                    <span className="text-[10px] text-gray-500">
                      {c.method}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {editIdx === i ? (
                    <input
                      type="number"
                      value={editWeight}
                      min={1}
                      max={100}
                      onChange={(e) => setEditWeight(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                    />
                  ) : (
                    <span className="text-xs font-bold text-purple-700">
                      {c.weight}%
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 w-28">
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: `${Math.min(100, c.weight)}%` }}
                    />
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {editIdx === i ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <CheckCircle2 size={11} />
                        </button>
                        <button
                          onClick={() => setEditIdx(null)}
                          className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                        >
                          <X size={11} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => openEdit(i)}
                          className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600"
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          onClick={() => deleteCriteria(i)}
                          className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {/* inline add row */}
            {showAddRow && editIdx === "new" && (
              <tr className="bg-purple-50/40">
                <td className="px-4 py-2.5 text-[10px] text-gray-400">
                  {criteria.length + 1}
                </td>
                <td className="px-4 py-2.5">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Criteria name…"
                    autoFocus
                    className="w-full px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                  />
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value)}
                    className="w-full px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                  >
                    <option>AI Semantic Analysis</option>
                    <option>Tone &amp; Sentiment</option>
                    <option>Logic Evaluation</option>
                    <option>Value Alignment</option>
                    <option>Behavioral Analysis</option>
                    <option>Scenario Assessment</option>
                  </select>
                </td>
                <td className="px-4 py-2.5">
                  <input
                    type="number"
                    value={editWeight}
                    min={1}
                    max={100}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded border border-purple-300 text-xs focus:outline-none"
                  />
                </td>
                <td />
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={saveEdit}
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <CheckCircle2 size={11} />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddRow(false);
                        setEditIdx(null);
                      }}
                      className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* JSON preview */}
      <details className="group">
        <summary className="text-[10px] font-bold text-gray-400 cursor-pointer hover:text-purple-600 transition-colors">
          Preview JSON sent to AI ▸
        </summary>
        <pre className="mt-2 p-3 rounded-lg bg-gray-50 border border-gray-100 text-[10px] text-gray-700 overflow-x-auto">
          {JSON.stringify(criteria, null, 2)}
        </pre>
      </details>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div>
        <h3 className="text-sm font-black text-gray-900">
          Agent &amp; Access Settings
        </h3>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Configure voice, tone, and marketplace settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-900">Agent Voice</h4>
          <Field label="Agent Name">
            <input
              className={inputCls}
              value={form.agentName}
              onChange={(e) => set("agentName", e.target.value)}
            />
          </Field>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Volume2 size={16} />
            </div>
            <div className="flex-1 min-w-0">
              {form.voiceId ? (
                <>
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {form.voiceName || form.voiceId}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {form.voiceProvider === "google" ||
                    form.voiceProvider === "gemini"
                      ? "Gemini Live"
                      : form.voiceProvider === "11labs" ||
                          form.voiceProvider === "elevenlabs"
                        ? "ElevenLabs"
                        : "Vapi"}{" "}
                    · {form.voiceId}
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-400">No voice selected</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
          >
            {form.voiceId ? "Change Voice" : "Choose a Voice"}
          </button>

          <Field label="Personality Tone">
            <div className="grid grid-cols-3 gap-2">
              {["Formal", "Friendly", "Strict"].map((tone) => (
                <button
                  key={tone}
                  onClick={() => set("tone", tone)}
                  className={cn(
                    "py-2 rounded-lg border text-[10px] font-bold transition-all",
                    form.tone === tone
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
                  )}
                >
                  {tone}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-900">Anti-Cheat</p>
              <p className="text-[9px] text-gray-400">
                Monitors focus &amp; tab switching
              </p>
            </div>
            <button
              onClick={() => set("antiCheatEnabled", !form.antiCheatEnabled)}
              className={cn(
                "relative w-10 h-5 rounded-full transition-colors",
                form.antiCheatEnabled ? "bg-purple-600" : "bg-gray-300",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  form.antiCheatEnabled ? "right-0.5" : "left-0.5",
                )}
              />
            </button>
          </div>
        </div>

        {/* Marketplace */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <h4 className="text-xs font-bold text-gray-900">
            Marketplace &amp; Access
          </h4>

          <Field label="Token Price per Interview">
            <div className="relative">
              <input
                type="number"
                value={form.price}
                onChange={(e) => set("price", parseInt(e.target.value))}
                className={inputCls}
              />
              <Zap
                size={12}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500"
              />
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              Recommended: 30–70 tokens
            </p>
          </Field>

          <Field label="Access Type">
            <select
              className={inputCls}
              value={form.accessType}
              onChange={(e) => set("accessType", e.target.value)}
            >
              <option>Public (Anyone)</option>
              <option>Invite Only</option>
              <option>Paid License</option>
            </select>
          </Field>

          <Field label="Status">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </Field>

          <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-[10px] text-blue-700 font-medium">
              Publishing as <strong>{form.accessType}</strong> · {form.price}{" "}
              tokens per interview
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => {
    if (isSubmitting)
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping" />
            <div className="relative w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center">
              <Database size={28} className="animate-pulse" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">
              Creating Interview…
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Saving to database and generating magic links
            </p>
          </div>
          <Loader2 className="animate-spin text-purple-500" size={20} />
        </div>
      );

    if (storageError)
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
            <X size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900">
              Creation Failed
            </h3>
            <p className="text-xs text-gray-500 mt-1">{storageError}</p>
          </div>
          <button
            onClick={() => {
              setStorageError(null);
            }}
            className="px-5 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      );

    if (createdPosition)
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
              <div className="relative w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={28} className="text-white" />
              </div>
            </div>
            <h3 className="text-lg font-black text-gray-900">
              Interview Created!
            </h3>
            <p className="text-xs text-gray-400 max-w-xs">
              Your AI interview has been set up. Share the links below with
              candidates.
            </p>
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            {/* Interview Link */}
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider mb-2">
                Interview Link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-white border border-purple-200 font-mono text-[10px] text-gray-800 truncate">
                  {createdPosition.interviewLink ||
                    `${typeof window !== "undefined" ? window.location.origin : ""}/interview/${createdPosition.linkId}`}
                </div>
                <button
                  onClick={() => {
                    const link =
                      createdPosition.interviewLink ||
                      `${window.location.origin}/interview/${createdPosition.linkId}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Copied!");
                  }}
                  className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex-shrink-0"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Registration Link */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-wider mb-2">
                Candidate Registration Link
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-lg bg-white border border-blue-200 font-mono text-[10px] text-gray-800 truncate">
                  {createdPosition.registrationLink ||
                    `${typeof window !== "undefined" ? window.location.origin : ""}/candidate/${createdPosition.positionId}`}
                </div>
                <button
                  onClick={() => {
                    const link =
                      createdPosition.registrationLink ||
                      `${window.location.origin}/candidate/${createdPosition.positionId}`;
                    navigator.clipboard.writeText(link);
                    toast.success("Copied!");
                  }}
                  className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex-shrink-0"
                >
                  <Copy size={13} />
                </button>
              </div>
            </div>

            {/* Confirmation checklist */}
            <div className="bg-white border border-gray-100 rounded-xl p-4">
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                What was created
              </p>
              <div className="space-y-1.5">
                {[
                  "Job position saved to database",
                  `${form.aiQuestions?.length || 0} AI questions generated`,
                  `${criteria.length} evaluation criteria saved`,
                  "Magic links generated and active",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2
                      size={12}
                      className="text-blue-500 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  createdPosition &&
                  window.open(
                    createdPosition.interviewLink ||
                      `/interview/${createdPosition.linkId}`,
                    "_blank",
                  )
                }
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <ExternalLink size={12} /> Preview Interview
              </button>
              <button
                onClick={() =>
                  createdPosition &&
                  window.open(
                    createdPosition.registrationLink ||
                      `/candidate/${createdPosition.positionId}`,
                    "_blank",
                  )
                }
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <User size={12} /> Preview Registration
              </button>
            </div>
          </div>
        </div>
      );

    // Review state (before submit)
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div>
          <h3 className="text-sm font-black text-gray-900">
            Review &amp; Publish
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Review your interview setup before creating it
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Position
            </p>
            {[
              ["Title", form.title || "—"],
              ["Department", form.department || "—"],
              ["Location", form.location || "—"],
              ["Type", form.employmentType || "—"],
              ["Experience", form.requiredExperience || "—"],
              ["Language", form.language || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400">{k}</span>
                <span className="text-[10px] font-semibold text-gray-800">
                  {v}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-2">
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              Interview
            </p>
            {[
              ["Questions", form.questionCount || 0],
              ["Duration", `${form.duration} min`],
              ["Criteria", criteria.length],
              ["Voice", form.voiceName || form.voiceId || "—"],
              ["Tone", form.tone || "—"],
              ["Access", form.accessType || "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400">{k}</span>
                <span className="text-[10px] font-semibold text-gray-800">
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
          <CheckCircle2 size={13} className="text-blue-500 flex-shrink-0" />
          <p className="text-[10px] text-blue-700">
            {form.aiQuestions?.length > 0
              ? `${form.aiQuestions.length} AI questions ready`
              : "No questions generated yet — you can generate them in the AI Prompt step or skip"}
          </p>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.title || !form.description}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-black hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-purple-600/20"
          >
            <Database size={16} /> Create Interview
          </button>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────────────────

  const renderContent = () => {
    switch (step) {
      case 0:
        return renderStep0();
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      case 5:
        return renderStep5();
      default:
        return renderStep0();
    }
  };

  const canProceed = () => {
    if (step === 0)
      return !!(
        form.title &&
        form.jobPosition &&
        form.registrationStartDate &&
        form.registrationEndDate
      );
    if (step === 1) return !!form.description;
    return true;
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-xl font-black tracking-tight text-gray-900">
          Create AI Interview
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Configure your autonomous recruiting agent in {STEPS.length} steps
        </p>
      </div>

      {/* Step indicator */}
      <div className="relative flex justify-between items-center px-4">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100 -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-purple-500 -z-10 transition-all duration-500"
          style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all duration-300",
                step === s.id
                  ? "bg-purple-600 border-purple-600 text-white scale-110"
                  : step > s.id
                    ? "bg-blue-50 border-blue-500 text-blue-500"
                    : "bg-white border-gray-200 text-gray-400",
              )}
            >
              {step > s.id ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
            </div>
            <span
              className={cn(
                "text-[8px] font-bold uppercase tracking-widest hidden md:block",
                step === s.id ? "text-purple-600" : "text-gray-400",
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[420px]">
        {renderContent()}
      </div>

      {/* Navigation */}
      {!(step === 5 && (createdPosition || isSubmitting)) && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-0 transition-all"
          >
            <ChevronLeft size={15} /> Previous
          </button>

          {step < 5 ? (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-40 transition-all shadow-sm"
            >
              Continue <ChevronRight size={15} />
            </button>
          ) : (
            !createdPosition &&
            !storageError && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !form.title || !form.description}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-sm"
              >
                <Database size={14} /> Create Interview
              </button>
            )
          )}
        </div>
      )}

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceSelect={handleVoiceSelected}
      />
    </div>
  );
};
