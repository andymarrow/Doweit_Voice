"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  Settings,
  BarChart2,
  Target,
  HelpCircle,
  Loader2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

import { DashboardTab } from "../components/DashboardTab";
import { CandidatesTab } from "../components/CandidatesTab";
import { ShortlistTab } from "../components/ShortlistTab";
import { ConfigurationTab } from "../components/ConfigurationTab";
import { EvaluationTab } from "../components/EvaluationTab";
import { QuestionsTab } from "../components/QuestionsTab";
import { CandidateDetailModal } from "../components/CandidateDetailModal";

// InterviewDetail is the in-page router for the recruiter's per-interview
// workspace. The six tabs (dashboard, candidates, shortlist, configuration,
// evaluation, questions) are now their own files in app/recruiter/components/
// — this file owns the data + handler state and dispatches to the right tab
// based on `activeTab`.
export const InterviewDetail = ({
  interviewId,
  onBack,
  activeTab,
  onTabChange,
}) => {
  const [interview, setInterview] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidateResults, setCandidateResults] = useState({});
  const [isGettingResults, setIsGettingResults] = useState(false);
  const [isSendingResults, setIsSendingResults] = useState(false);

  // candidate detail modal
  const [detailCandidate, setDetailCandidate] = useState(null);

  // candidate search
  const [candidateSearch, setCandidateSearch] = useState("");

  // evaluation criteria
  const [criteria, setCriteria] = useState([]);
  const [isSavingCriteria, setIsSavingCriteria] = useState(false);
  const [showAddCriteria, setShowAddCriteria] = useState(false);
  const [editCriteriaIdx, setEditCriteriaIdx] = useState(null);
  const [criteriaName, setCriteriaName] = useState("");
  const [criteriaWeight, setCriteriaWeight] = useState(10);

  // questions
  const [questions, setQuestions] = useState([]);
  const [isSavingQuestions, setIsSavingQuestions] = useState(false);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editQuestionIdx, setEditQuestionIdx] = useState(null);
  const [questionText, setQuestionText] = useState("");

  const tab = activeTab || "dashboard";

  // ── data fetching ──────────────────────────────────────────────────────────

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/recruiter/position-candidates?positionId=${interviewId}`,
        { cache: "no-store" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("position-candidates failed:", res.status, data);
        toast.error(data.error || `Failed to load candidates (${res.status})`);
        return;
      }
      setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
    } catch (err) {
      console.error("fetchCandidates network error:", err);
      toast.error("Network error loading candidates");
    }
  }, [interviewId]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `/api/recruiter/createInterview?positionId=${interviewId}`,
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          console.error("createInterview GET failed:", res.status, data);
          throw new Error(data.error || `Failed to fetch interview (${res.status})`);
        }
        const pos = data.data;
        setInterview(pos);
        // seed criteria from DB
        if (
          Array.isArray(pos?.evaluationCriteria) &&
          pos.evaluationCriteria.length > 0
        ) {
          setCriteria(pos.evaluationCriteria);
        } else {
          setCriteria([
            { name: "Technical Knowledge", weight: 40 },
            { name: "Communication Skills", weight: 20 },
            { name: "Problem Solving", weight: 20 },
            { name: "Cultural Fit", weight: 10 },
            { name: "Confidence", weight: 10 },
          ]);
        }
        // seed questions
        if (Array.isArray(pos?.aiQuestions)) setQuestions(pos.aiQuestions);
        await fetchCandidates();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [interviewId, fetchCandidates]);

  // ── get results ────────────────────────────────────────────────────────────

  const handleGetResults = async () => {
    setIsGettingResults(true);
    try {
      const res = await fetch("/api/recruiter/getCandidateResults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId: interviewId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.data?.evaluationResults) {
          const map = {};
          data.data.evaluationResults.forEach((r) => {
            map[r.id] = {
              result: r.result || [],
              reasonResult: r.reasonResult || "",
              pass: r.pass,
            };
          });
          setCandidateResults(map);
        }
        await fetchCandidates();
        toast.success("Results loaded");
      } else {
        toast.error("Failed to get results");
      }
    } catch {
      toast.error("Error fetching results");
    } finally {
      setIsGettingResults(false);
    }
  };

  // ── send results to candidates via email ──────────────────────────────────

  const handleSendResults = async () => {
    setIsSendingResults(true);
    try {
      const res = await fetch("/api/recruiter/send-result-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId: interviewId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Failed to send results");
        return;
      }
      const sent = data.emailsSent || 0;
      const failed = data.emailsFailed || 0;
      const skipped = data.skipped || 0;
      if (sent > 0) {
        toast.success(
          `Result emails sent to ${sent} candidate${sent !== 1 ? "s" : ""}`,
        );
      }
      if (failed > 0) {
        toast.error(`${failed} email${failed !== 1 ? "s" : ""} failed`);
      }
      if (sent === 0 && failed === 0) {
        toast(
          skipped > 0
            ? `No evaluated candidates yet (run "Get Results" first)`
            : "No eligible candidates",
          { icon: "ℹ️" },
        );
      }
    } catch {
      toast.error("Error sending result emails");
    } finally {
      setIsSendingResults(false);
    }
  };

  // ── save criteria ──────────────────────────────────────────────────────────

  const handleSaveCriteria = async () => {
    setIsSavingCriteria(true);
    try {
      const res = await fetch("/api/recruiter/updateEvaluationCriteria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId: interviewId,
          evaluationCriteria: criteria,
        }),
      });
      if (res.ok) toast.success("Criteria saved");
      else toast.error("Failed to save criteria");
    } catch {
      toast.error("Error saving criteria");
    } finally {
      setIsSavingCriteria(false);
    }
  };

  // ── save questions ─────────────────────────────────────────────────────────

  const handleSaveQuestions = async () => {
    setIsSavingQuestions(true);
    try {
      const res = await fetch("/api/recruiter/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId: interviewId,
          aiQuestions: questions,
        }),
      });
      if (res.ok) toast.success("Questions saved");
      else toast.error("Failed to save questions");
    } catch {
      toast.error("Error saving questions");
    } finally {
      setIsSavingQuestions(false);
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────

  const activeCandidates = candidates.filter((c) => !c.isRejected);
  const rejectedCandidates = candidates.filter((c) => c.isRejected);
  const shortlisted = activeCandidates;
  const weightSum = criteria.reduce((s, c) => s + Number(c.weight || 0), 0);

  // ── loading / error ────────────────────────────────────────────────────────

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        <span className="ml-2 text-sm text-gray-500">Loading interview…</span>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertCircle className="w-8 h-8 text-purple-400" />
        <p className="text-sm text-gray-600">{error}</p>
        <button
          onClick={onBack}
          className="text-xs text-blue-600 hover:underline"
        >
          Go back
        </button>
      </div>
    );

  // ── tabs ───────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "candidates", label: "Candidates", icon: Users },
    { id: "shortlist", label: "Shortlist", icon: UserCheck },
    { id: "configuration", label: "Configuration", icon: Settings },
    { id: "evaluation", label: "Evaluation", icon: Target },
    { id: "questions", label: "Questions", icon: HelpCircle },
  ];

  const renderTab = () => {
    switch (tab) {
      case "candidates":
        return (
          <CandidatesTab
            activeCandidates={activeCandidates}
            candidateResults={candidateResults}
            candidateSearch={candidateSearch}
            setCandidateSearch={setCandidateSearch}
            isGettingResults={isGettingResults}
            handleGetResults={handleGetResults}
            setDetailCandidate={setDetailCandidate}
          />
        );
      case "shortlist":
        return (
          <ShortlistTab
            candidates={candidates}
            candidateResults={candidateResults}
            positionId={interviewId}
            refreshCandidates={fetchCandidates}
          />
        );
      case "configuration":
        return (
          <ConfigurationTab
            interview={interview}
            onSaved={(updated) => setInterview((prev) => ({ ...prev, ...updated }))}
          />
        );
      case "evaluation":
        return (
          <EvaluationTab
            criteria={criteria}
            setCriteria={setCriteria}
            weightSum={weightSum}
            isSavingCriteria={isSavingCriteria}
            handleSaveCriteria={handleSaveCriteria}
            showAddCriteria={showAddCriteria}
            setShowAddCriteria={setShowAddCriteria}
            editCriteriaIdx={editCriteriaIdx}
            setEditCriteriaIdx={setEditCriteriaIdx}
            criteriaName={criteriaName}
            setCriteriaName={setCriteriaName}
            criteriaWeight={criteriaWeight}
            setCriteriaWeight={setCriteriaWeight}
          />
        );
      case "questions":
        return (
          <QuestionsTab
            questions={questions}
            setQuestions={setQuestions}
            isSavingQuestions={isSavingQuestions}
            handleSaveQuestions={handleSaveQuestions}
            showAddQuestion={showAddQuestion}
            setShowAddQuestion={setShowAddQuestion}
            editQuestionIdx={editQuestionIdx}
            setEditQuestionIdx={setEditQuestionIdx}
            questionText={questionText}
            setQuestionText={setQuestionText}
          />
        );
      case "dashboard":
      default:
        return (
          <DashboardTab
            interview={interview}
            candidates={candidates}
            activeCandidates={activeCandidates}
            rejectedCandidates={rejectedCandidates}
            shortlisted={shortlisted}
            candidateResults={candidateResults}
            criteria={criteria}
            questions={questions}
            onTabChange={onTabChange}
          />
        );
    }
  };

  // ── layout ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-4 min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden sticky top-4 shadow-sm">
          {/* Back */}
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 group"
          >
            <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 flex items-center justify-center transition-colors">
              <ChevronLeft size={12} />
            </div>
            Back to Interviews
          </button>

          {/* position title */}
          <div className="relative px-4 py-4 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-br from-purple-50/40 to-blue-50/30 dark:from-purple-900/20 dark:to-blue-900/10">
            {/* avatar + title row */}
            <div className="flex items-start gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-purple-200">
                {(interview?.title || "?").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-purple-400 uppercase tracking-wider mb-0.5">
                  Position
                </p>
                <p className="text-xs font-black text-gray-900 dark:text-white line-clamp-2 leading-tight">
                  {interview?.title || "Interview"}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                interview?.status === "active"
                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                  : interview?.status === "closed"
                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  interview?.status === "active"
                    ? "bg-emerald-500"
                    : interview?.status === "closed"
                      ? "bg-purple-500"
                      : "bg-gray-400",
                )}
              />
              {interview?.status || "Draft"}
            </span>
          </div>

          {/* nav items */}
          <nav className="p-2 space-y-1">
            <p className="px-2 pt-1 pb-1 text-[8px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Workspace
            </p>
            {tabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTabChange?.(t.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all group",
                    active
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-200"
                      : "text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300",
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      active
                        ? "bg-white/20"
                        : "bg-gray-100 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40",
                    )}
                  >
                    <t.icon size={12} />
                  </div>
                  <span className="flex-1 text-left truncate">{t.label}</span>
                  {active && (
                    <span className="w-1 h-1 rounded-full bg-white/80" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* mini stats */}
          <div className="px-3 py-3 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/40 dark:from-purple-900/30 dark:to-purple-900/10 border border-purple-100 dark:border-purple-800 px-2.5 py-2 text-center">
              <p className="text-[8px] font-black text-purple-400 dark:text-purple-300 uppercase tracking-wider">
                Total
              </p>
              <p className="text-sm font-black text-purple-700 dark:text-purple-200 mt-0.5">
                {candidates.length}
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-900/10 border border-blue-100 dark:border-blue-800 px-2.5 py-2 text-center">
              <p className="text-[8px] font-black text-blue-400 dark:text-blue-300 uppercase tracking-wider">
                Active
              </p>
              <p className="text-sm font-black text-blue-700 dark:text-blue-200 mt-0.5">
                {activeCandidates.length}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        {/* Page header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-white">
              {tabs.find((t) => t.id === tab)?.label}
            </h2>
            <p className="text-[10px] text-purple-200 mt-0.5">
              {interview?.title} · {interview?.department || "General"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {tab === "candidates" && (
              <>
                <button
                  onClick={handleGetResults}
                  disabled={isGettingResults}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  {isGettingResults ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <FileText size={11} />
                  )}
                  {isGettingResults ? "Loading…" : "Get Results"}
                </button>
                <button
                  onClick={handleSendResults}
                  disabled={isSendingResults}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-purple-700 text-xs font-bold hover:bg-purple-50 transition-colors disabled:opacity-50"
                >
                  {isSendingResults ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Send size={11} />
                  )}
                  {isSendingResults ? "Sending…" : "Send Results"}
                </button>
              </>
            )}
          </div>
        </div>

        {renderTab()}
      </main>

      {/* Candidate detail modal */}
      <CandidateDetailModal
        candidate={detailCandidate}
        candidateResults={candidateResults}
        onClose={() => setDetailCandidate(null)}
      />
    </div>
  );
};
