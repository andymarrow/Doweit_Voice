"use client";
import { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Users, Zap, TrendingUp, Search, Loader2, BookOpen } from 'lucide-react';

function fmt(n) { return (n ?? 0).toLocaleString(); }
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Card({ icon: Icon, label, value, accent = 'text-gray-900 dark:text-white', iconColor = 'text-gray-400 dark:text-gray-500', sub }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={12} className={iconColor} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
      </div>
      <p className={`text-lg font-bold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

const TAB_KEYS = ['interviews', 'quizzes', 'trainees'];

export default function TraineePage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [tab, setTab]       = useState('interviews');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/trainee', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500 text-xs">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading trainee metrics…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-4 text-xs text-red-700 dark:text-red-300">
        Failed to load: {error}
      </div>
    );
  }

  const totals = data?.totals || {};
  const recentInterviews = data?.recentInterviews || [];
  const recentQuizzes = data?.recentQuizzes || [];
  const topTrainees = data?.topTrainees || [];

  const q = search.trim().toLowerCase();
  const matchesQ = (...vals) => vals.some(v => (v || '').toString().toLowerCase().includes(q));
  const filteredInterviews = q ? recentInterviews.filter(i => matchesQ(i.title, i.department, i.userName, i.userEmail)) : recentInterviews;
  const filteredQuizzes    = q ? recentQuizzes.filter(q2 => matchesQ(q2.title, q2.userName)) : recentQuizzes;
  const filteredTrainees   = q ? topTrainees.filter(t => matchesQ(t.name, t.email)) : topTrainees;

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card icon={GraduationCap} label="Total Interviews" value={fmt(totals.interviews)}  accent="text-purple-600 dark:text-purple-400" iconColor="text-purple-400" sub={`${fmt(totals.attempts)} attempts`} />
        <Card icon={Users}         label="Active Trainees"  value={fmt(totals.trainees)}    accent="text-blue-600 dark:text-blue-400"     iconColor="text-blue-400"   sub="distinct users" />
        <Card icon={BookOpen}      label="Quiz Attempts"    value={fmt(totals.quizzes)}     accent="text-amber-600 dark:text-amber-400"   iconColor="text-amber-400"  sub={`${fmt(totals.quizAvg)}% avg score`} />
        <Card icon={TrendingUp}    label="Avg Fit Score"    value={`${fmt(totals.avgFitScore)}%`} accent="text-emerald-600 dark:text-emerald-400" iconColor="text-emerald-500" sub="voice interviews" />
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {TAB_KEYS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  tab === t
                    ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-7 pr-3 py-1 text-[11px] text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors w-44"
            />
          </div>
        </div>

        {tab === 'interviews' && (
          <Table headers={['Title', 'Trainee', 'Department', 'Attempts', 'Best Score', 'Created']}>
            {filteredInterviews.length === 0 ? (
              <EmptyRow span={6} text="No trainee interviews found." />
            ) : (
              filteredInterviews.map(iv => (
                <tr key={iv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{iv.title}</td>
                  <td className="px-4 py-2">
                    <p className="text-xs text-gray-700 dark:text-gray-300 truncate max-w-[140px]">{iv.userName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{iv.userEmail}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{iv.department || '—'}</td>
                  <td className="px-4 py-2 text-xs text-purple-600 dark:text-purple-400 font-medium">{fmt(iv.attempts)}</td>
                  <td className="px-4 py-2">
                    {iv.bestScore != null ? (
                      <span className={`text-xs font-medium ${iv.bestScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : iv.bestScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {iv.bestScore}
                      </span>
                    ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDate(iv.createdAt)}</td>
                </tr>
              ))
            )}
          </Table>
        )}

        {tab === 'quizzes' && (
          <Table headers={['Title', 'Trainee', 'Score', 'Total', '%', 'Date']}>
            {filteredQuizzes.length === 0 ? (
              <EmptyRow span={6} text="No quiz attempts found." />
            ) : (
              filteredQuizzes.map(q2 => {
                const pct = q2.total ? Math.round((q2.score / q2.total) * 100) : 0;
                return (
                  <tr key={q2.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{q2.title || '—'}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{q2.userName}</td>
                    <td className="px-4 py-2 text-xs text-purple-600 dark:text-purple-400 font-medium">{q2.score}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{q2.total}</td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDate(q2.createdAt)}</td>
                  </tr>
                );
              })
            )}
          </Table>
        )}

        {tab === 'trainees' && (
          <Table headers={['#', 'Trainee', 'Email', 'Interviews', 'Attempts', 'Best Score']}>
            {filteredTrainees.length === 0 ? (
              <EmptyRow span={6} text="No trainees found." />
            ) : (
              filteredTrainees.map((t, i) => (
                <tr key={t.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{t.name}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{t.email}</td>
                  <td className="px-4 py-2 text-xs text-purple-600 dark:text-purple-400 font-medium">{fmt(t.interviewCount)}</td>
                  <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400">{fmt(t.attemptCount)}</td>
                  <td className="px-4 py-2">
                    {t.bestScore != null ? (
                      <span className={`text-xs font-medium ${t.bestScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : t.bestScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.bestScore}
                      </span>
                    ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                  </td>
                </tr>
              ))
            )}
          </Table>
        )}
      </div>
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left bg-white dark:bg-gray-800">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {headers.map(h => (
              <th key={h} className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({ span, text }) {
  return (
    <tr>
      <td colSpan={span} className="px-4 py-10 text-center text-xs text-gray-400 dark:text-gray-500">{text}</td>
    </tr>
  );
}
