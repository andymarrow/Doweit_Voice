"use client";
import React, { useEffect, useState } from 'react';
import {
  Zap, Target, TrendingUp, Star, BarChart2,
  Plus, ChevronRight, Award, Clock, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const scoreBand = (s) =>
  s >= 85 ? 'text-blue-600' : s >= 70 ? 'text-purple-600' : 'text-gray-500';

export const TraineeDashboard = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/trainee/dashboard', { cache: 'no-store' });
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading dashboard…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
        Failed to load dashboard: {error}
      </div>
    );
  }

  const totals = data?.totals || { interviews: 0, attempts: 0, avgScore: 0, quizzes: 0, quizAvg: 0 };
  const recent = data?.recent || [];
  const skillData = (data?.skillData || []).map(s => ({ skill: s.subject, score: s.score }));

  // Build a synthetic "score over time" trend from recent attempts.
  const trend = [...recent]
    .reverse()
    .slice(-12)
    .map((r, i) => ({
      label: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: r.score,
      idx: i,
    }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
              <BarChart2 size={17} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Training Dashboard</h2>
              <p className="text-xs text-gray-400">Your personal performance overview</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200 self-start"
        >
          <Plus size={14} /> New Interview
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Interviews', value: totals.interviews, icon: BarChart2, color: 'text-purple-600', bg: 'bg-purple-50', sub: `${totals.attempts} attempts` },
          { label: 'Avg Score', value: `${totals.avgScore}%`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'across attempts' },
          { label: 'Quizzes', value: totals.quizzes, icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50', sub: `${totals.quizAvg}% avg` },
          { label: 'Best Today', value: recent[0] ? `${recent[0].score}%` : '—', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-50', sub: recent[0]?.title?.slice(0, 14) || 'No attempts yet' },
          { label: 'Recent', value: recent.length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50', sub: 'last 8' },
        ].map((s, i) => (
          <div key={i} className="p-3 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('p-2 rounded-xl group-hover:scale-110 transition-transform', s.bg, s.color)}>
                <s.icon size={13} />
              </div>
              <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">{s.sub}</span>
            </div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">{s.label}</p>
            <h3 className="text-base font-black tracking-tight">{s.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Score Trend */}
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black flex items-center gap-2">
              <TrendingUp size={15} className="text-purple-500" />
              Score Trend
            </h3>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Recent attempts</span>
          </div>
          <div className="h-[220px]">
            {trend.length === 0 ? (
              <EmptyChart text="No attempts yet — take an interview to see your trend." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="score" stroke="#7c3aed" strokeWidth={2.5} fill="url(#scoreGrad)" dot={{ r: 3, fill: '#7c3aed', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Skill Breakdown */}
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black flex items-center gap-2">
              <Star size={15} className="text-blue-500" />
              Skill Breakdown
            </h3>
            <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">All attempts</span>
          </div>
          <div className="h-[220px]">
            {skillData.length === 0 ? (
              <EmptyChart text="No skill data yet." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#aaa' }} domain={[0, 100]} />
                  <YAxis type="category" dataKey="skill" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#666' }} width={110} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                  <Bar dataKey="score" fill="#2563eb" radius={[0, 6, 6, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black flex items-center gap-2">
            <Clock size={15} className="text-purple-500" />
            Recent Attempts
          </h3>
          <button
            onClick={() => onNavigate?.('sessions')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            View All <ChevronRight size={12} />
          </button>
        </div>
        <div className="overflow-x-auto">
          {recent.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No attempts yet. Create an interview and take it to see your results here.
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-50">
                  {['Interview', 'Score', 'Date'].map(h => (
                    <th key={h} className="pb-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map(s => (
                  <tr
                    key={s.attemptId}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                    onClick={() => onNavigate?.('sessions', { interviewId: s.interviewId, attemptId: s.attemptId })}
                  >
                    <td className="py-3 text-xs font-bold text-gray-800">{s.title}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-xs font-black', scoreBand(s.score))}>{s.score}%</span>
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${s.score}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-gray-500">
                      {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const EmptyChart = ({ text }) => (
  <div className="h-full flex items-center justify-center text-[11px] text-gray-400">
    {text}
  </div>
);
