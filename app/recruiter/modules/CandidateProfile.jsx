"use client";
import React from 'react';
import {
  ArrowLeft, Mail, Phone, Calendar, Shield, CheckCircle2, XCircle,
  Zap, FileText, MessageSquare, AlertCircle, MapPin, Briefcase,
  Globe, Linkedin, Link as LinkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Convert the stored transcript string ("Role: text\n\nRole: text…") into
// an array of { role, text } so the right-rail bubbles can render it.
// candidate_applications.candidateInterview is the field the magic-link
// `/api/interview/save-transcript` route writes into.
function parseTranscript(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .split(/\n{2,}/)
    .map((block) => {
      const m = block.match(/^([^:\n]+):\s*([\s\S]*)$/);
      if (!m) return null;
      return { role: m[1].trim(), text: m[2].trim() };
    })
    .filter(Boolean);
}

// Sum every criterion's score from candidate_applications.result.
function calcFitScore(result) {
  if (!Array.isArray(result)) return null;
  const total = result.reduce((s, c) => s + (Number(c?.score) || 0), 0);
  return total > 0 ? Math.min(100, total) : null;
}

const SCORE_TIER = (n) => {
  if (n == null) return { color: 'text-gray-400', bg: 'bg-gray-50 border-gray-200' };
  if (n >= 75)   return { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
  if (n >= 50)   return { color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' };
  return                  { color: 'text-red-700',     bg: 'bg-red-50 border-red-200' };
};

export const CandidateProfile = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const c = candidate;
  // The API returns the schema column names verbatim. Older versions of this
  // component were calling c.name / c.email / c.fitScore (which don't exist
  // on a candidate_applications row), producing the "empty data" bug.
  const name        = c.candidateName || 'Unknown';
  const email       = c.candidateEmail || '—';
  const phone       = c.candidatePhone || '—';
  const country     = c.country || '';
  const address     = c.address || '';
  const cv          = c.cv || '';
  const portfolio   = c.portfolioUrl || '';
  const linkedin    = c.linkedinUrl || '';
  const experience  = c.experience || '';

  const resultArr   = Array.isArray(c.result) ? c.result : [];
  const fitScore    = calcFitScore(resultArr);
  const reasonText  = c.reasonResult || '';
  const pass        = c.pass;
  const isRejected  = !!c.isRejected;
  const rejectReason = c.rejectReason || '';

  const snapshots   = Array.isArray(c.snapshotUrls) ? c.snapshotUrls : [];
  const transcript  = parseTranscript(c.candidateInterview || '');

  const tier = SCORE_TIER(fitScore);
  const jobTitle = c.jobTitle || 'Position';
  const jobDept  = c.jobDepartment || '';

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-3xl h-full max-h-[90vh] bg-white shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-base">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight">{name}</h3>
              <p className="text-[10px] text-white/70 mt-0.5">
                {jobTitle}{jobDept ? ` · ${jobDept}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isRejected ? (
              <span className="px-2.5 py-1 rounded-lg bg-red-500/30 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <XCircle size={11} /> Rejected
              </span>
            ) : pass === true ? (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/30 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={11} /> Passed
              </span>
            ) : pass === false ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/30 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle size={11} /> Failed
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white text-[10px] font-bold uppercase tracking-wider">
                {c.status || 'applied'}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className={cn("p-3 rounded-2xl border text-center", tier.bg)}>
              <p className={cn("text-[9px] font-bold uppercase tracking-widest", tier.color)}>Fit Score</p>
              <h4 className={cn("text-2xl font-black mt-1", tier.color)}>
                {fitScore != null ? `${fitScore}%` : '—'}
              </h4>
              <p className="text-[9px] text-gray-500 mt-0.5">
                {fitScore != null ? 'AI evaluated' : 'Not scored yet'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Interview</p>
              <h4 className="text-sm font-black text-purple-900 mt-1.5">
                {c.interviewTaken ? 'Completed' : 'Pending'}
              </h4>
              <p className="text-[9px] text-purple-500 mt-0.5">
                {transcript.length > 0 ? `${transcript.length} turns recorded` : 'No transcript yet'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Applied</p>
              <h4 className="text-sm font-black text-blue-900 mt-1.5">
                {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </h4>
              <p className="text-[9px] text-blue-500 mt-0.5 capitalize">{c.status || 'applied'}</p>
            </div>
          </div>

          {/* Rejection reason */}
          {isRejected && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle size={13} className="text-red-600" />
                <p className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Rejection Reason</p>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                {rejectReason || 'No reason provided.'}
              </p>
            </div>
          )}

          {/* Contact + links grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <FileText size={12} className="text-emerald-600" />
                Contact Information
              </h4>
              <ContactRow icon={Mail}        value={email} />
              <ContactRow icon={Phone}       value={phone} />
              <ContactRow icon={MapPin}      value={address || country || '—'} />
              <ContactRow icon={Briefcase}   value={experience ? `${experience} experience` : '—'} />
            </div>
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <LinkIcon size={12} className="text-blue-600" />
                Links
              </h4>
              {portfolio ? (
                <LinkRow icon={Globe}    label="Portfolio" url={portfolio} />
              ) : <EmptyRow label="No portfolio" />}
              {linkedin ? (
                <LinkRow icon={Linkedin} label="LinkedIn"  url={linkedin} />
              ) : <EmptyRow label="No LinkedIn" />}
            </div>
          </div>

          {/* AI Evaluation */}
          {(reasonText || resultArr.length > 0) && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Zap size={12} className="text-purple-600" />
                AI Evaluation Summary
              </h4>
              {reasonText && (
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reasonText}
                  </p>
                </div>
              )}
              {resultArr.length > 0 && (
                <div className="space-y-1.5">
                  {resultArr.map((r, i) => {
                    const s = Number(r?.score) || 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <p className="text-[11px] font-medium text-gray-700 w-40 truncate flex-shrink-0">
                          {r.criteria || r.name || `Criterion ${i + 1}`}
                        </p>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              s >= 75 ? "bg-emerald-500" : s >= 50 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(100, s)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 w-9 text-right">
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* CV / Resume */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-2">
              <FileText size={12} className="text-purple-600" />
              CV / Resume
            </h4>
            {cv ? (
              <div className="max-h-56 overflow-y-auto rounded-xl bg-gray-50 border border-gray-100 p-3">
                <pre className="text-[11px] text-gray-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {cv}
                </pre>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 italic">No CV submitted</p>
              </div>
            )}
          </div>

          {/* Transcript */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2 mb-2">
              <MessageSquare size={12} className="text-blue-600" />
              Interview Transcript
              {transcript.length > 0 && (
                <span className="text-[9px] font-medium text-gray-400 normal-case">
                  ({transcript.length} turns)
                </span>
              )}
            </h4>
            {transcript.length > 0 ? (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {transcript.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-2xl text-[11px] leading-relaxed",
                      msg.role.toLowerCase().includes('ai') || msg.role.toLowerCase().includes('interview')
                        ? "bg-white border border-gray-100"
                        : "bg-purple-50 border border-purple-100 ml-6"
                    )}
                  >
                    <p className="font-black mb-1 text-[9px] uppercase tracking-widest text-gray-400">
                      {msg.role}
                    </p>
                    <p className="font-medium text-gray-700">{msg.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                <p className="text-[11px] text-gray-400 italic">
                  {c.interviewTaken
                    ? 'Interview was taken but transcript is not available.'
                    : 'Candidate has not taken the interview yet.'}
                </p>
              </div>
            )}
          </div>

          {/* Anti-cheat snapshots */}
          {snapshots.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                  <Shield size={12} className="text-emerald-600" />
                  Anti-Cheat Snapshots
                </h4>
                <span className="text-[10px] text-gray-400">{snapshots.length} captured</span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {snapshots.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50 hover:ring-2 hover:ring-purple-400 transition-all"
                    title={s.capturedAt ? new Date(s.capturedAt).toLocaleString() : ''}
                  >
                    <img
                      src={s.url}
                      alt={`Snapshot ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {s.capturedAt
                        ? new Date(s.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

function ContactRow({ icon: Icon, value }) {
  return (
    <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="p-1.5 rounded-lg bg-white">
        <Icon size={13} className="text-gray-400" />
      </div>
      <span className="font-semibold text-gray-700 truncate">{value}</span>
    </div>
  );
}

function LinkRow({ icon: Icon, label, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 text-xs p-3 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
    >
      <div className="p-1.5 rounded-lg bg-white">
        <Icon size={13} className="text-blue-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">{label}</p>
        <p className="text-[11px] text-blue-700 truncate">{url}</p>
      </div>
    </a>
  );
}

function EmptyRow({ label }) {
  return (
    <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="p-1.5 rounded-lg bg-white">
        <LinkIcon size={13} className="text-gray-300" />
      </div>
      <span className="text-gray-400 italic text-[11px]">{label}</span>
    </div>
  );
}
