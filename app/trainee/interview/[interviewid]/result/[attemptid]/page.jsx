"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Loader2, ArrowLeft, BarChart3, Star, ThumbsUp, ThumbsDown, MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from 'recharts';

const scoreColor = (s) =>
  s >= 85 ? 'text-blue-600' : s >= 70 ? 'text-purple-600' : 'text-gray-500';

export default function TraineeInterviewResultPage() {
  const { interviewid, attemptid } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `/api/trainee/interview/${interviewid}/result/${attemptid}`,
          { cache: 'no-store' }
        );
        const json = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(json.error || 'Failed to load');
        setData(json.data);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [interviewid, attemptid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading result…
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h2 className="text-gray-900 font-black text-lg">Couldn&apos;t load result</h2>
          <p className="text-gray-500 text-xs">{error || 'Not found.'}</p>
          <button
            onClick={() => router.push('/trainee?section=sessions')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black"
          >
            Back to my interviews
          </button>
        </div>
      </div>
    );
  }

  const { interview, general, specific, reasons, transcript } = data;
  const radar = specific?.skillRadar || [];
  const perCriterion = specific?.perCriterion || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        <button
          onClick={() => router.push('/trainee?section=sessions')}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-xs font-bold"
        >
          <ArrowLeft size={13} /> Back to my interviews
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-black tracking-tight">{interview.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {interview.department || 'General'} · {interview.experienceLevel || '—'} · {interview.language}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Attempt {attemptid}</p>
          </div>
          <div className="flex items-center gap-3">
            <Score label="Fit Score" value={general?.fitScore ?? 0} />
            <Recommendation value={general?.hiringRecommendation} />
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-2">
          <h3 className="text-sm font-black flex items-center gap-2">
            <MessageSquareText size={15} className="text-purple-500" /> Summary
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            {general?.summary || 'No summary available.'}
          </p>
        </div>

        {/* Strengths / Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ListCard
            icon={ThumbsUp}
            color="text-green-600"
            title="Strengths"
            items={general?.strengths || []}
          />
          <ListCard
            icon={ThumbsDown}
            color="text-red-500"
            title="Weaknesses"
            items={general?.weaknesses || []}
          />
        </div>

        {/* Skill Radar + Per Criterion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black flex items-center gap-2 mb-3">
              <Star size={15} className="text-blue-500" /> Skill Radar
            </h3>
            <div className="h-[280px]">
              {radar.length === 0 ? (
                <Empty text="No skill radar data." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radar}>
                    <PolarGrid stroke="#eee" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#666' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#999' }} />
                    <Radar dataKey="A" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-black flex items-center gap-2 mb-3">
              <BarChart3 size={15} className="text-purple-500" /> Per Criterion
            </h3>
            {perCriterion.length === 0 ? (
              <Empty text="No criterion-level data." />
            ) : (
              <div className="space-y-3">
                {perCriterion.map((c, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-black text-gray-800 truncate pr-2">{c.name}</span>
                      <span className={cn('font-black', scoreColor(c.score))}>{c.score}%</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, c.score))}%` }}
                      />
                    </div>
                    {c.feedback && (
                      <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">{c.feedback}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reasons */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
          <h3 className="text-sm font-black flex items-center gap-2">
            <MessageSquareText size={15} className="text-purple-500" /> Why this score
          </h3>
          {reasons?.overall ? (
            <p className="text-xs text-gray-600 leading-relaxed">{reasons.overall}</p>
          ) : typeof reasons?.reasons === 'string' ? (
            <p className="text-xs text-gray-600 leading-relaxed">{reasons.reasons}</p>
          ) : (
            <p className="text-xs text-gray-400">No reasoning available.</p>
          )}
          {Array.isArray(reasons?.perCriterion) && reasons.perCriterion.length > 0 && (
            <ul className="space-y-1.5 pt-2 border-t border-gray-50">
              {reasons.perCriterion.map((r, i) => (
                <li key={i} className="text-[11px] text-gray-600">
                  <span className="font-black text-gray-800">{r.name}: </span>
                  {r.reason}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transcript */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-black flex items-center gap-2 mb-3">
            <MessageSquareText size={15} className="text-blue-500" /> Transcript
          </h3>
          {!transcript || !Array.isArray(transcript.transcript) || transcript.transcript.length === 0 ? (
            <Empty text="No transcript captured." />
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
              {transcript.transcript.map((m, i) => {
                const isUser = m.role === 'Candidate' || m.role === 'user';
                return (
                  <div key={i} className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed',
                      isUser
                        ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    )}>
                      {m.text}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => router.push(`/trainee/interview/${interviewid}`)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black shadow-md shadow-purple-200"
          >
            Retake interview
          </button>
        </div>
      </div>
    </div>
  );
}

const Score = ({ label, value }) => (
  <div className="text-right">
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{label}</p>
    <p className={cn('text-2xl font-black', scoreColor(value))}>{value}%</p>
  </div>
);

const Recommendation = ({ value }) => {
  const tone = (value || '').toLowerCase();
  const cls =
    tone.includes('strong') ? 'bg-blue-100 text-blue-700'
    : tone.includes('hire')   ? 'bg-purple-100 text-purple-700'
    : tone.includes('reject') ? 'bg-red-100 text-red-700'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={cn('px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider', cls)}>
      {value || 'Review'}
    </span>
  );
};

const ListCard = ({ icon: Icon, color, title, items }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <h3 className="text-sm font-black flex items-center gap-2 mb-3">
      <Icon size={15} className={color} /> {title}
    </h3>
    {items.length === 0 ? (
      <Empty text="None recorded." />
    ) : (
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="text-xs text-gray-600 leading-relaxed">• {it}</li>
        ))}
      </ul>
    )}
  </div>
);

const Empty = ({ text }) => (
  <div className="text-[11px] text-gray-400 py-6 text-center">{text}</div>
);
