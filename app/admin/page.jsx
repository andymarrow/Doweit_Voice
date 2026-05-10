"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Coins, TrendingDown, Activity, LogOut, Eye, EyeOff,
  ArrowUpRight, RefreshCw, Shield, BarChart3, Clock, Zap,
  GraduationCap, Briefcase, Bot, ChevronLeft, ChevronRight,
} from 'lucide-react';

// ─── Hardcoded admin credentials ───────────────────────────────────────────
const ADMIN_EMAILS = [
  'miheretabsamson90@gmail.com',
  'meriatakalu@gmail.com',
];
const ADMIN_PASSWORD = '1234';
// Add more emails above when needed.

// ─── Helpers ────────────────────────────────────────────────────────────────
function fmt(n) { return (n ?? 0).toLocaleString(); }
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
function fmtDateShort(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Login Page ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (ADMIN_EMAILS.includes(email.trim().toLowerCase()) && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_auth', '1');
        onLogin();
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield size={22} className="text-white/60" />
          </div>
        </div>

        <h1 className="text-center text-xl font-semibold text-white mb-1">Admin Console</h1>
        <p className="text-center text-xs text-white/30 mb-8">Doweit Voice — Internal</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 focus:bg-white/8 transition-all"
            />
          </div>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Metric Card ─────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, color = 'white' }) {
  const colors = {
    white:  'text-white bg-white/5 border-white/8',
    green:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/15',
    red:    'text-red-400 bg-red-500/10 border-red-500/15',
    blue:   'text-blue-400 bg-blue-500/10 border-blue-500/15',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/15',
    amber:  'text-amber-400 bg-amber-500/10 border-amber-500/15',
  };
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <Icon size={15} className="opacity-70" />
        <span className="text-[10px] font-semibold uppercase tracking-widest opacity-50">{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      {sub && <p className="text-[10px] opacity-40 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ onLogout }) {
  const [metrics, setMetrics] = useState(null);
  const [txData, setTxData] = useState({ transactions: [], userBalances: [] });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('transactions');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (p = 1) => {
    setRefreshing(true);
    try {
      const [mRes, tRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch(`/api/admin/transactions?page=${p}`),
      ]);
      const [m, t] = await Promise.all([mRes.json(), tRes.json()]);
      if (!m.error) setMetrics(m);
      if (!t.error) setTxData(t);
    } catch (e) {
      console.error(e);
    }
    setRefreshing(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
          <p className="text-white/30 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'transactions', label: 'Token Transactions' },
    { id: 'users',        label: 'User Balances' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top bar */}
      <div className="border-b border-white/8 px-6 py-4 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield size={14} className="text-white/50" />
          </div>
          <div>
            <h1 className="text-sm font-semibold">Admin Console</h1>
            <p className="text-[10px] text-white/30">Doweit Voice — System Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(page)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/8 border border-white/8 text-xs text-white/50 hover:text-white/80 transition-all"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/10 border border-white/8 hover:border-red-500/20 text-xs text-white/50 hover:text-red-400 transition-all"
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Metrics Grid ── */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">System Overview</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard icon={Users}        label="Total Users"       value={fmt(metrics?.totalUsers)}               color="white" />
            <MetricCard icon={Coins}        label="Tokens in System"  value={fmt(metrics?.totalTokensInCirculation)} color="green" sub="combined user balances" />
            <MetricCard icon={TrendingDown} label="Tokens Spent"      value={fmt(metrics?.totalTokensSpent)}         color="red"   sub="all time usage" />
            <MetricCard icon={Bot}          label="Agents Created"    value={fmt(metrics?.totalAgents)}              color="blue"  />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <MetricCard icon={GraduationCap} label="Trainee Sessions"     value={fmt(metrics?.totalTraineeInterviews)}   color="purple" />
            <MetricCard icon={Briefcase}     label="Recruiter Interviews"  value={fmt(metrics?.totalRecruiterInterviews)} color="amber"  />
            <MetricCard icon={Activity}      label="Monthly Spent"         value={fmt(metrics?.monthlyTokensSpent)}       color="red"    sub="this calendar month" />
            <MetricCard icon={BarChart3}     label="Monthly Sessions"      value={fmt(metrics?.monthlyInterviews)}        color="white"  sub="interviews run" />
          </div>
        </div>

        {/* ── Breakdown Cards ── */}
        {metrics?.typeBreakdown?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">Usage by Platform</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {metrics.typeBreakdown.map(b => (
                <div key={b.interviewType} className="rounded-2xl border border-white/8 bg-white/3 p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {b.interviewType === 'trainee'
                      ? <GraduationCap size={18} className="text-purple-400" />
                      : <Briefcase size={18} className="text-amber-400" />}
                    <div>
                      <p className="text-sm font-semibold capitalize">{b.interviewType ?? 'other'}</p>
                      <p className="text-[10px] text-white/30">{fmt(b.count)} sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-400">−{fmt(Math.abs(Number(b.totalSpent || 0)))}</p>
                    <p className="text-[10px] text-white/30">tokens spent</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Top Spenders ── */}
        {metrics?.topSpenders?.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-4">Top Token Consumers</p>
            <div className="rounded-2xl border border-white/8 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/8 bg-white/3">
                    {['User', 'Tokens Spent', 'Sessions', 'Current Balance'].map(h => (
                      <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics.topSpenders.map((s, i) => (
                    <tr key={s.userId} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-[9px] font-bold text-white/40">{i + 1}</span>
                          <div>
                            <p className="text-xs font-medium">{s.user?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-white/30">{s.user?.email || s.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-red-400 font-bold">−{fmt(s.totalSpent)}</td>
                      <td className="px-5 py-3 text-xs text-white/60">{fmt(s.txCount)}</td>
                      <td className="px-5 py-3 text-xs text-emerald-400 font-medium">{fmt(s.user?.tokenBalance ?? 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div>
          <div className="flex items-center gap-1 mb-5 border-b border-white/8">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 -mb-px ${
                  activeTab === t.id
                    ? 'border-white text-white'
                    : 'border-transparent text-white/35 hover:text-white/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Transactions tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/8 overflow-hidden">
                {txData.transactions.length === 0 ? (
                  <div className="py-12 text-center text-white/25 text-sm">No transactions recorded yet.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/8 bg-white/3">
                          {['User', 'Type', 'Amount', 'Description', 'Duration', 'Platform', 'Date'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {txData.transactions.map(tx => (
                          <tr key={tx.id} className="hover:bg-white/3 transition-colors">
                            <td className="px-4 py-3">
                              <p className="text-xs font-medium text-white/90 truncate max-w-[150px]">{tx.userEmail || tx.userId}</p>
                              {tx.userName && <p className="text-[9px] text-white/30">{tx.userName}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                tx.type === 'purchase' ? 'bg-emerald-500/15 text-emerald-400' :
                                tx.type === 'bonus'    ? 'bg-blue-500/15 text-blue-400' :
                                'bg-red-500/15 text-red-400'
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-white/50 max-w-[180px] truncate">{tx.description || '—'}</td>
                            <td className="px-4 py-3 text-xs text-white/40">
                              {tx.durationMinutes ? `${tx.durationMinutes} min` : '—'}
                            </td>
                            <td className="px-4 py-3">
                              {tx.interviewType ? (
                                <span className={`flex items-center gap-1 text-[10px] font-medium capitalize ${
                                  tx.interviewType === 'trainee' ? 'text-purple-400' : 'text-amber-400'
                                }`}>
                                  {tx.interviewType === 'trainee'
                                    ? <GraduationCap size={11} />
                                    : <Briefcase size={11} />}
                                  {tx.interviewType}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="px-4 py-3 text-[10px] text-white/35 whitespace-nowrap">{fmtDate(tx.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {txData.transactions.length === 50 || page > 1 ? (
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-white/25">Page {page} · 50 per page</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={txData.transactions.length < 50}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/70 disabled:opacity-30 transition-all"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* User Balances tab */}
          {activeTab === 'users' && (
            <div className="rounded-2xl border border-white/8 overflow-hidden">
              {txData.userBalances.length === 0 ? (
                <div className="py-12 text-center text-white/25 text-sm">No users found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/8 bg-white/3">
                        {['User', 'Email', 'Token Balance', 'Joined'].map(h => (
                          <th key={h} className="px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {txData.userBalances.map(u => (
                        <tr key={u.id} className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3 text-xs font-medium">{u.name || '—'}</td>
                          <td className="px-5 py-3 text-xs text-white/50">{u.email}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <Zap size={11} className="text-purple-400" />
                              <span className={`text-xs font-bold ${
                                u.tokenBalance < 100 ? 'text-red-400' :
                                u.tokenBalance < 300 ? 'text-amber-400' :
                                'text-emerald-400'
                              }`}>
                                {fmt(u.tokenBalance)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[10px] text-white/30">{fmtDateShort(u.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(null); // null = checking

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_auth') === '1');
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  // While checking sessionStorage
  if (authed === null) {
    return <div className="min-h-screen bg-[#0a0a0a]" />;
  }

  return authed
    ? <Dashboard onLogout={handleLogout} />
    : <LoginPage onLogin={() => setAuthed(true)} />;
}
