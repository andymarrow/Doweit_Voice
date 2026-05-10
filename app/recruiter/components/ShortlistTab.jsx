"use client";
import React from "react";
import { UserCheck, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { calcScore, getReason, scoreBg, scoreColor } from "./utils";

export const ShortlistTab = ({
  activeCandidates,
  candidateResults,
  selected,
  setSelected,
}) => {
  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Header checkbox: select-all when nothing/some selected, deselect-all when
  // every active candidate is already in the set.
  const allSelected =
    activeCandidates.length > 0 &&
    activeCandidates.every((c) => selected.has(c.id));
  const someSelected =
    !allSelected && activeCandidates.some((c) => selected.has(c.id));
  const toggleSelectAll = () => {
    setSelected(() => {
      if (allSelected) return new Set();
      return new Set(activeCandidates.map((c) => c.id));
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900">
            Candidate Shortlist
          </h3>
          <p className="text-[10px] text-gray-400">
            {selected.size} selected · {activeCandidates.length} total active
          </p>
        </div>
        {selected.size > 0 && (
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
            <UserCheck size={12} /> Confirm Shortlist ({selected.size})
          </button>
        )}
      </div>

      {activeCandidates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <UserCheck size={24} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 font-semibold">
            No candidates to shortlist
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 w-10">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      title={allSelected ? "Deselect all" : "Select all"}
                      className={cn(
                        "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                        allSelected
                          ? "bg-blue-600 border-blue-600"
                          : someSelected
                            ? "bg-blue-200 border-blue-400"
                            : "border-gray-300 hover:border-blue-400",
                      )}
                    >
                      {allSelected && (
                        <CheckCircle2 size={10} className="text-white" />
                      )}
                      {someSelected && !allSelected && (
                        <span className="block w-2 h-0.5 bg-blue-700 rounded" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Evaluation
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeCandidates
                  .slice()
                  .sort(
                    (a, b) =>
                      calcScore(b, candidateResults) -
                      calcScore(a, candidateResults),
                  )
                  .map((c) => {
                    const score = calcScore(c, candidateResults);
                    const isShortlisted = selected.has(c.id);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        className={cn(
                          "cursor-pointer transition-colors",
                          isShortlisted
                            ? "bg-blue-50 hover:bg-blue-100/60"
                            : "hover:bg-purple-50/30",
                        )}
                      >
                        <td className="px-4 py-3">
                          <div
                            className={cn(
                              "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                              isShortlisted
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-300",
                            )}
                          >
                            {isShortlisted && (
                              <CheckCircle2
                                size={10}
                                className="text-white"
                              />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                              {(c.candidateName || "C")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-900">
                                {c.candidateName || "Unknown"}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {c.candidateEmail}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "text-xs font-bold px-2 py-1 rounded-full border",
                              scoreBg(score),
                              scoreColor(score),
                            )}
                          >
                            {score || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {getReason(c, candidateResults)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          {isShortlisted ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                              Shortlisted
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wider">
                              Pending
                            </span>
                          )}
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
