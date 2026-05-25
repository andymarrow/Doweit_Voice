"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, RefreshCw, LayoutGrid, List, Clock, ChevronRight,
  Loader2, Trash2, PlayCircle, BarChart3, Plus, BookOpen, History, X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const AVATAR_COLORS = [
  'from-purple-500 to-purple-700',
  'from-teal-400 to-teal-600',
  'from-pink-500 to-pink-700',
  'from-blue-500 to-blue-700',
  'from-orange-400 to-orange-600',
  'from-violet-500 to-violet-700',
  'from-cyan-500 to-cyan-700',
];
const agentColor = (s = '') => AVATAR_COLORS[(s.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (s = '') => s.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—');

const scoreBg = (s) =>
  s == null ? 'bg-gray-100 text-gray-400'
    : s >= 85 ? 'bg-blue-100 text-blue-700'
    : s >= 70 ? 'bg-purple-100 text-purple-700'
    : 'bg-gray-100 text-gray-500';

export const MySessions = ({ onNavigate }) => {
  const router = useRouter();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  // History modal state — lets the trainee re-open any past interview attempt
  // OR any past quiz attempt, not just the most recent one.
  const [historyFor, setHistoryFor] = useState(null); // session row
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/trainee/sessions', { cache: 'no-store' });
        const json = await res.json();
        if (!active) return;
        if (!res.ok) throw new Error(json.error || 'Failed');
        setList(json.data || []);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (s) =>
        (s.title || '').toLowerCase().includes(q) ||
        (s.department || '').toLowerCase().includes(q)
    );
  }, [list, search]);

  const onStart = (id) => router.push(`/trainee/interview/${id}`);
  const onQuiz = (id) => router.push(`/trainee/interview/${id}/quiz`);
  const onResults = (s) => {
    if (!s.lastAttemptId) {
      toast.error('No attempts yet — take the interview first.');
      return;
    }
    router.push(`/trainee/interview/${s.id}/result/${s.lastAttemptId}`);
  };
  // Open the history modal: shows all past interview attempts AND fetches
  // every saved quiz attempt for this interview so the trainee can review
  // any of them.
  const onHistory = async (s) => {
    setHistoryFor(s);
    setQuizAttempts([]);
    setQuizLoading(true);
    try {
      const res = await fetch(
        `/api/trainee/quiz?interviewId=${encodeURIComponent(s.id)}`,
        { cache: 'no-store' }
      );
      const json = await res.json();
      if (res.ok) setQuizAttempts(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      // Non-fatal — modal still shows interview attempts.
      console.error('quiz attempts fetch:', e);
    } finally {
      setQuizLoading(false);
    }
  };
  const closeHistory = () => {
    setHistoryFor(null);
    setQuizAttempts([]);
  };
  const openInterviewAttempt = (attemptId) => {
    if (!historyFor) return;
    router.push(`/trainee/interview/${historyFor.id}/result/${attemptId}`);
  };
  const openQuizAttempt = (attemptId) => {
    if (!historyFor) return;
    router.push(`/trainee/interview/${historyFor.id}/quiz/result/${attemptId}`);
  };
  const onDelete = async (id) => {
    if (!confirm('Delete this interview and all its attempts?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/trainee/interview/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      });
      // Read the body so we can surface the real reason on failure — the
      // old handler always toasted "Deleted" even when the API returned
      // 404/500, which is exactly how the row stayed in the DB while
      // looking deleted on the front-end.
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Delete failed (${res.status})`);
      toast.success(`Deleted (${data.deletedId || id})`);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black tracking-tight">My Interviews</h2>
          <p className="text-xs text-gray-400">All your trainee interviews and attempts.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-0.5">
            <button
              onClick={() => setView('grid')}
              className={cn('p-1.5 rounded-lg', view === 'grid' ? 'bg-purple-100 text-purple-700' : 'text-gray-400')}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('p-1.5 rounded-lg', view === 'list' ? 'bg-purple-100 text-purple-700' : 'text-gray-400')}
            >
              <List size={13} />
            </button>
          </div>
          <button
            onClick={() => onNavigate?.('create')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black shadow-md shadow-purple-200 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus size={13} /> New
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or department…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
        />
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2" /> Loading…
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>
      ) : filtered.length === 0 ? (
        <EmptyState onCreate={() => onNavigate?.('create')} />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Card
              key={s.id}
              s={s}
              onStart={() => onStart(s.id)}
              onQuiz={() => onQuiz(s.id)}
              onResults={() => onResults(s)}
              onHistory={() => onHistory(s)}
              onDelete={() => onDelete(s.id)}
              deleting={deletingId === s.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Department</div>
            <div className="col-span-1">Attempts</div>
            <div className="col-span-2">Best</div>
            <div className="col-span-2">Updated</div>
            <div className="col-span-1" />
          </div>
          <div className="divide-y divide-gray-50">
            {filtered.map((s) => (
              <Row
                key={s.id}
                s={s}
                onStart={() => onStart(s.id)}
                onQuiz={() => onQuiz(s.id)}
                onResults={() => onResults(s)}
                onHistory={() => onHistory(s)}
                onDelete={() => onDelete(s.id)}
                deleting={deletingId === s.id}
              />
            ))}
          </div>
        </div>
      )}

      {historyFor && (
        <HistoryModal
          session={historyFor}
          quizAttempts={quizAttempts}
          quizLoading={quizLoading}
          onClose={closeHistory}
          onOpenInterview={openInterviewAttempt}
          onOpenQuiz={openQuizAttempt}
        />
      )}
    </div>
  );
};

const HistoryModal = ({
  session,
  quizAttempts,
  quizLoading,
  onClose,
  onOpenInterview,
  onOpenQuiz,
}) => {
  const interviewAttempts = Array.isArray(session.attemptList)
    ? [...session.attemptList].reverse()
    : [];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-gray-100 shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900">Past attempts</h3>
            <p className="text-[11px] text-gray-400 truncate">{session.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-700"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          <Section title="Interview attempts" emptyHint="No interview attempts yet.">
            {interviewAttempts.length === 0 ? null : (
              <ul className="divide-y divide-gray-50">
                {interviewAttempts.map((a) => (
                  <li
                    key={a.attemptId}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/60 cursor-pointer"
                    onClick={() => onOpenInterview(a.attemptId)}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-black text-gray-800 truncate">
                        Attempt {a.attemptId}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {a.takenAt
                          ? new Date(a.takenAt).toLocaleString()
                          : 'Date unknown'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-700">
                        {a.fitScore != null ? `${a.fitScore}%` : '—'}
                      </span>
                      <ChevronRight size={12} className="text-gray-300" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Quiz attempts" emptyHint="No quiz attempts yet.">
            {quizLoading ? (
              <div className="px-5 py-6 text-center text-gray-400 text-xs flex items-center justify-center">
                <Loader2 size={14} className="animate-spin mr-2" /> Loading…
              </div>
            ) : quizAttempts.length === 0 ? null : (
              <ul className="divide-y divide-gray-50">
                {quizAttempts.map((q) => {
                  const pct = q.total
                    ? Math.round(((q.score || 0) / q.total) * 100)
                    : 0;
                  return (
                    <li
                      key={q.id}
                      className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => onOpenQuiz(q.id)}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-800 truncate">
                          {q.title || 'Quiz'}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {q.createdAt
                            ? new Date(q.createdAt).toLocaleString()
                            : 'Date unknown'}{' '}
                          · {q.score ?? 0}/{q.total ?? 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-purple-700">
                          {pct}%
                        </span>
                        <ChevronRight size={12} className="text-gray-300" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, emptyHint, children }) => (
  <div>
    <div className="px-5 py-2 bg-gray-50/60 text-[10px] font-black text-gray-500 uppercase tracking-wider">
      {title}
    </div>
    {children || (
      <p className="px-5 py-4 text-[11px] text-gray-400">{emptyHint}</p>
    )}
  </div>
);

const Card = ({ s, onStart, onQuiz, onResults, onHistory, onDelete, deleting }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
    <div className="p-5 flex-1">
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-base flex-shrink-0',
          agentColor(s.title)
        )}>
          {initials(s.title)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-sm text-gray-900 truncate">{s.title}</h3>
          <p className="text-[11px] text-gray-400 truncate">{s.department || '—'}</p>
        </div>
        <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg flex-shrink-0', scoreBg(s.bestScore))}>
          {s.bestScore != null ? `${s.bestScore}%` : '—'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <Mini label="Attempts" value={s.attempts} />
        <Mini label="Duration" value={`${s.duration}m`} />
        <Mini label="Q's" value={s.questionCount} />
      </div>
      <p className="mt-3 text-[10px] text-gray-400 flex items-center gap-1">
        <Clock size={10} /> {fmtDate(s.updatedAt)}
      </p>
    </div>
    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-2">
      <button
        onClick={onStart}
        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-black hover:from-purple-700 hover:to-blue-700"
      >
        <PlayCircle size={12} /> Interview
      </button>
      <button
        onClick={onQuiz}
        className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 text-[11px] font-black hover:bg-purple-50"
      >
        <BookOpen size={12} /> Quiz
      </button>
      <button
        onClick={onResults}
        disabled={!s.lastAttemptId}
        title="Latest result"
        className={cn(
          'flex items-center justify-center px-2 py-1.5 rounded-lg text-[11px] font-black',
          s.lastAttemptId ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
        )}
      >
        <BarChart3 size={12} />
      </button>
      <button
        onClick={onHistory}
        title="Past attempts"
        className="flex items-center justify-center px-2 py-1.5 rounded-lg text-[11px] font-black bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <History size={12} />
      </button>
      <button
        onClick={onDelete}
        disabled={deleting}
        title="Delete"
        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500"
      >
        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </button>
    </div>
  </div>
);

const Row = ({ s, onStart, onQuiz, onResults, onHistory, onDelete, deleting }) => (
  <div className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50/50 transition-colors">
    <div className="col-span-4 min-w-0">
      <p className="text-xs font-black text-gray-800 truncate">{s.title}</p>
      <p className="text-[10px] text-gray-400 truncate">{s.duration}m · {s.questionCount} q · {s.experienceLevel || '—'}</p>
    </div>
    <div className="col-span-2 text-xs text-gray-500 truncate">{s.department || '—'}</div>
    <div className="col-span-1 text-xs text-gray-700 font-bold">{s.attempts}</div>
    <div className="col-span-1">
      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', scoreBg(s.bestScore))}>
        {s.bestScore != null ? `${s.bestScore}%` : '—'}
      </span>
    </div>
    <div className="col-span-2 text-[11px] text-gray-500">{fmtDate(s.updatedAt)}</div>
    <div className="col-span-2 flex items-center justify-end gap-1">
      <button onClick={onStart} title="Interview" className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <PlayCircle size={12} />
      </button>
      <button onClick={onQuiz} title="Quiz" className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50">
        <BookOpen size={12} />
      </button>
      <button
        onClick={onResults}
        disabled={!s.lastAttemptId}
        title="Latest result"
        className={cn('p-1.5 rounded-lg', s.lastAttemptId ? 'bg-white border border-gray-200 text-gray-600' : 'bg-gray-100 text-gray-300 cursor-not-allowed')}
      >
        <BarChart3 size={12} />
      </button>
      <button
        onClick={onHistory}
        title="Past attempts"
        className="p-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50"
      >
        <History size={12} />
      </button>
      <button
        onClick={onDelete}
        disabled={deleting}
        title="Delete"
        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:bg-red-50 hover:text-red-500"
      >
        {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      </button>
    </div>
  </div>
);

const Mini = ({ label, value }) => (
  <div className="rounded-lg bg-gray-50 py-1.5">
    <p className="text-sm font-black text-gray-800">{value}</p>
    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 mx-auto flex items-center justify-center text-purple-600">
      <PlayCircle size={20} />
    </div>
    <h3 className="text-sm font-black text-gray-800 mt-3">No interviews yet</h3>
    <p className="text-xs text-gray-400 mt-1">Create your first practice interview to get started.</p>
    <button
      onClick={onCreate}
      className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black shadow-md shadow-purple-200 hover:from-purple-700 hover:to-blue-700"
    >
      Create interview
    </button>
  </div>
);
