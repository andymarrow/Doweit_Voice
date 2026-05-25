"use client";
import { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

import AdminLayout   from './_components/AdminLayout';
import DashboardPage from './_components/DashboardPage';
import WalletPage    from './_components/WalletPage';
import RecruiterPage from './_components/RecruiterPage';
import TraineePage   from './_components/TraineePage';

// ─── Admin credentials ────────────────────────────────────────────────────────
const ADMIN_EMAILS = [
  'miheretabsamson90@gmail.com',
  'meriatakalu@gmail.com',
];
const ADMIN_PASSWORD = '1234';

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError]   = useState('');
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
        <div className="flex justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Shield size={20} className="text-white/50" />
          </div>
        </div>
        <h1 className="text-center text-lg font-semibold text-white mb-1">Admin Console</h1>
        <p className="text-center text-[11px] text-white/30 mb-7">Doweit Voice — Internal</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/25 transition-all"
          />
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
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {error && <p className="text-red-400 text-[11px] text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="flex flex-col items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-white/15 border-t-white/60 rounded-full animate-spin" />
        <p className="text-white/25 text-xs">Loading…</p>
      </div>
    </div>
  );
}

// ─── Dashboard shell ──────────────────────────────────────────────────────────
function AdminDashboard({ onLogout }) {
  const [page, setPage] = useState('dashboard');
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Only the overview Dashboard needs the legacy /api/admin/metrics feed.
  // Wallet, Recruiter, and Trainee pages each self-fetch from their own
  // dedicated endpoints (/api/admin/wallet, /api/admin/recruiter,
  // /api/admin/trainee).
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const m = await res.json();
      if (!m.error) setMetrics(m);
    } catch (e) {
      console.error(e);
    }
    setRefreshing(false);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const renderPage = () => {
    if (loading && page === 'dashboard') return <Loader />;
    switch (page) {
      case 'dashboard': return <DashboardPage metrics={metrics} />;
      case 'wallet':    return <WalletPage />;
      case 'recruiter': return <RecruiterPage />;
      case 'trainee':   return <TraineePage />;
      default:          return null;
    }
  };

  return (
    <AdminLayout
      page={page}
      onNav={setPage}
      onLogout={onLogout}
      onRefresh={load}
      refreshing={refreshing}
    >
      {renderPage()}
    </AdminLayout>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem('admin_auth') === '1');
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthed(false);
  };

  if (authed === null) return <div className="min-h-screen bg-[#0a0a0a]" />;

  return authed
    ? <AdminDashboard onLogout={handleLogout} />
    : <LoginPage onLogin={() => setAuthed(true)} />;
}
