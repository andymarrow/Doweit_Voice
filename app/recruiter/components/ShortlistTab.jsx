"use client";
import React, { useState } from "react";
import {
  UserCheck,
  Loader2,
  Send,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { CandidateDetailModal } from "./CandidateDetailModal";

export const ShortlistTab = ({
  candidates,
  candidateResults,
  positionId,
  refreshCandidates,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [detailCandidate, setDetailCandidate] = useState(null);

  const list = Array.isArray(candidates) ? candidates : [];
  const rejectedCount = list.filter((c) => c.isRejected).length;
  const activeCount = list.length - rejectedCount;

  const handleSelectCandidate = async () => {
    if (!positionId) {
      toast.error("Position ID missing");
      return;
    }
    setIsSelecting(true);
    try {
      const res = await fetch("/api/recruiter/selectCandidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      const data = await res.json();
      if (res.ok) {
        const count = data.candidatesEvaluated?.length || 0;
        toast.success(
          `${count} candidate${count !== 1 ? "s" : ""} evaluated by AI`,
        );
        if (typeof refreshCandidates === "function") {
          await refreshCandidates();
        }
      } else {
        toast.error(data.error || "Failed to evaluate candidates");
      }
    } catch {
      toast.error("Error selecting candidates");
    } finally {
      setIsSelecting(false);
    }
  };

  const handleSendLink = async () => {
    if (!positionId) {
      toast.error("Position ID missing");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/recruiter/send-interview-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionId }),
      });
      const data = await res.json();
      if (res.ok) {
        const sent = data.emailsSent || 0;
        const failed = data.emailsFailed || 0;
        if (sent > 0) {
          toast.success(
            `Interview links sent to ${sent} candidate${sent !== 1 ? "s" : ""}`,
          );
        }
        if (failed > 0) {
          toast.error(
            `${failed} email${failed !== 1 ? "s" : ""} failed to send`,
          );
        }
        if (sent === 0 && failed === 0) {
          toast("No eligible candidates found", { icon: "ℹ️" });
        }
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch {
      toast.error("Error sending emails");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (candidate) => {
    if (!candidate?.id) return;
    const ok = window.confirm(
      `Delete ${candidate.candidateName || "this candidate"}? This cannot be undone.`,
    );
    if (!ok) return;
    setDeletingId(candidate.id);
    try {
      const res = await fetch(
        `/api/recruiter/applications?id=${candidate.id}`,
        { method: "DELETE" },
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success("Candidate deleted");
        if (typeof refreshCandidates === "function") {
          await refreshCandidates();
        }
      } else {
        toast.error(data.error || "Failed to delete candidate");
      }
    } catch {
      toast.error("Error deleting candidate");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Candidate Shortlist
          </h3>
          <p className="text-[10px] text-gray-400">
            {activeCount} active · {rejectedCount} rejected · {list.length}{" "}
            total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectCandidate}
            disabled={isSelecting || list.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSelecting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <UserCheck size={12} />
            )}
            {isSelecting ? "Selecting…" : "Select Candidate"}
          </button>
          <button
            onClick={handleSendLink}
            disabled={isSending || activeCount === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            {isSending ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Send size={12} />
            )}
            {isSending ? "Sending…" : "Send Link"}
          </button>
        </div>
      </div>

      {/* info banner */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50 border border-purple-100">
        <UserCheck size={14} className="text-purple-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-purple-800">
            How shortlisting works
          </p>
          <p className="text-[10px] text-purple-600 leading-relaxed">
            <span className="font-semibold">Select Candidate</span> — AI
            evaluates all applicants against your candidate selection rules and
            marks rejections. &nbsp;
            <span className="font-semibold">Send Link</span> — Sends interview
            invitation emails to all non-rejected candidates.
          </p>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Users size={28} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-semibold text-gray-500">
            No candidates yet
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Candidates will appear here after registration
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Rejection
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {list.map((c) => {
                  const isRejected = !!c.isRejected;
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "transition-colors",
                        isRejected
                          ? "bg-red-50/40 hover:bg-red-50/60"
                          : "hover:bg-purple-50/30",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                            {(c.candidateName || "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <p className="text-xs font-semibold text-gray-900">
                            {c.candidateName || "Unknown"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] text-gray-700">
                          {c.candidateEmail || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {isRejected ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 uppercase tracking-wider">
                              <XCircle size={10} /> Rejected
                            </span>
                            {c.rejectReason && (
                              <p
                                className="text-[10px] text-red-600/80 line-clamp-2 max-w-xs"
                                title={c.rejectReason}
                              >
                                {c.rejectReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 uppercase tracking-wider">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailCandidate(c)}
                            className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                            title="View details"
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(c)}
                            disabled={deletingId === c.id}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 transition-colors disabled:opacity-40"
                            title="Delete candidate"
                          >
                            {deletingId === c.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* detail popup */}
      <CandidateDetailModal
        candidate={detailCandidate}
        candidateResults={candidateResults}
        onClose={() => setDetailCandidate(null)}
      />
    </div>
  );
};
