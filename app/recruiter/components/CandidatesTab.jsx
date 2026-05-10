"use client";
import React from "react";
import {
  Users,
  Search,
  FileText,
  Eye,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { calcScore, getReason, scoreBg, scoreColor } from "./utils";

export const CandidatesTab = ({
  activeCandidates,
  candidateResults,
  candidateSearch,
  setCandidateSearch,
  isGettingResults,
  handleGetResults,
  setDetailCandidate,
}) => {
  const filtered = activeCandidates.filter(
    (c) =>
      !candidateSearch ||
      c.candidateName
        ?.toLowerCase()
        .includes(candidateSearch.toLowerCase()) ||
      c.candidateEmail?.toLowerCase().includes(candidateSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={13}
          />
          <input
            value={candidateSearch}
            onChange={(e) => setCandidateSearch(e.target.value)}
            placeholder="Search candidates…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>
        <button
          onClick={handleGetResults}
          disabled={isGettingResults}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGettingResults ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <FileText size={12} />
          )}
          {isGettingResults ? "Loading…" : "Get Results"}
        </button>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-purple-400" />
          </div>
          <p className="text-sm font-semibold text-gray-500">
            No candidates yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Share the interview link to receive applications
          </p>
        </div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((c) => {
                  const score = calcScore(c, candidateResults);
                  const reason = getReason(c, candidateResults);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-purple-50/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {(c.candidateName || "C").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-900">
                              {c.candidateName || "Unknown"}
                            </p>
                            <p className="text-[10px] text-gray-400">
                              {c.address || c.country || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-700">
                          {c.candidateEmail}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {c.candidatePhone || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "text-xs font-bold px-2.5 py-1 rounded-full border",
                            scoreBg(score),
                            scoreColor(score),
                          )}
                        >
                          {score || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                        <p className="text-[11px] text-gray-500 line-clamp-2">
                          {reason}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setDetailCandidate(c)}
                          className="p-1.5 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                          title="View details"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
