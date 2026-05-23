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
        return <ConfigurationTab interview={interview} />;
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
      <aside className="w-44 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden sticky top-4">
          {/* Back */}
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-3 text-xs font-bold text-gray-500 hover:text-purple-700 hover:bg-purple-50 transition-colors border-b border-gray-100"
          >
            <ChevronLeft size={14} /> Back
          </button>

          {/* position title */}
          <div className="px-3 py-3 border-b border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Position
            </p>
            <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">
              {interview?.title || "Interview"}
            </p>
            <span
              className={cn(
                "inline-block mt-1.5 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                interview?.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : interview?.status === "closed"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600",
              )}
            >
              {interview?.status || "Draft"}
            </span>
          </div>

          {/* nav items */}
          <nav className="p-2 space-y-0.5">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => onTabChange?.(t.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-bold transition-all",
                  tab === t.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-500 hover:bg-purple-50 hover:text-purple-700",
                )}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </nav>

          {/* mini stats */}
          <div className="px-3 py-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                Candidates
              </span>
              <span className="text-xs font-black text-purple-700">
                {candidates.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-bold text-gray-400 uppercase">
                Active
              </span>
              <span className="text-xs font-black text-blue-700">
                {activeCandidates.length}
              </span>
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
