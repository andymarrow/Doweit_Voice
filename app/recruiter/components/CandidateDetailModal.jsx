"use client";
import React from "react";
import { X, XCircle, CheckCircle2, FileText, Mail, Phone, MapPin } from "lucide-react";
import { calcScore, getReason } from "./utils";

export const CandidateDetailModal = ({ candidate, candidateResults, onClose }) => {
  if (!candidate) return null;
  const c = candidate;
  const score = calcScore(c, candidateResults);
  const reason = getReason(c, candidateResults);
  const rawResult = candidateResults[c?.publicId]?.result ?? c?.result;
  const resultArr = rawResult
    ? typeof rawResult === "string"
      ? (() => {
          try {
            return JSON.parse(rawResult);
          } catch {
            return [];
          }
        })()
      : rawResult
    : [];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center font-black text-sm">
              {(c.candidateName || "C").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {c.candidateName || "Unknown"}
              </h3>
              <p className="text-[10px] text-purple-200">
                {c.candidateEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-white/30"
          >
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Rejection banner — shown prominently when candidate is rejected */}
          {c.isRejected ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <XCircle size={14} className="text-red-600" />
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                  Rejected
                </p>
              </div>
              {c.rejectReason ? (
                <p className="text-[11px] text-red-800 leading-relaxed whitespace-pre-wrap">
                  {c.rejectReason}
                </p>
              ) : (
                <p className="text-[11px] text-red-600/80 italic">
                  No reason provided.
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Active candidate
              </p>
            </div>
          )}

          {/* score */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200">
            <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-lg">
              {score || "—"}
            </div>
            <div>
              <p className="text-[9px] font-bold text-purple-600 uppercase tracking-wider">
                Total Score
              </p>
              <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                {reason}
              </p>
            </div>
          </div>

          {/* contact info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <Mail size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14 flex-shrink-0">
                Email
              </p>
              <p className="text-xs font-semibold text-gray-800 truncate">
                {c.candidateEmail || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <Phone size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14 flex-shrink-0">
                Phone
              </p>
              <p className="text-xs font-semibold text-gray-800 truncate">
                {c.candidatePhone || "—"}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <MapPin size={12} className="text-gray-400 flex-shrink-0" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-14 flex-shrink-0">
                Address
              </p>
              <p className="text-xs font-semibold text-gray-800 truncate">
                {c.address || c.country || "—"}
              </p>
            </div>
          </div>

          {/* CV content */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={12} className="text-gray-500" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                CV / Resume
              </p>
            </div>
            {c.cv ? (
              <div className="max-h-48 overflow-y-auto rounded-lg bg-gray-50 border border-gray-100 p-3">
                <pre className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {c.cv}
                </pre>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 italic">
                  No CV submitted
                </p>
              </div>
            )}
          </div>

          {/* criteria breakdown */}
          {Array.isArray(resultArr) && resultArr.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                Score Breakdown
              </p>
              <div className="space-y-2">
                {resultArr.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <p className="text-xs text-gray-700 w-32 truncate flex-shrink-0">
                      {r.criteria || r.name || `Criteria ${i + 1}`}
                    </p>
                    <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all"
                        style={{ width: `${Math.min(100, r.score || 0)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 w-8 text-right">
                      {r.score || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* anti-cheat snapshots — captured during the interview and
              uploaded to UploadThing. Click to open full size in a new tab. */}
          {Array.isArray(c.snapshotUrls) && c.snapshotUrls.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Interview Snapshots
                </p>
                <span className="text-[9px] font-bold text-gray-400">
                  {c.snapshotUrls.length} captured
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {c.snapshotUrls.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50 hover:ring-2 hover:ring-purple-400"
                    title={
                      s.capturedAt
                        ? new Date(s.capturedAt).toLocaleString()
                        : ""
                    }
                  >
                    <img
                      src={s.url}
                      alt={`Snapshot ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.capturedAt
                        ? new Date(s.capturedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : `#${i + 1}`}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
