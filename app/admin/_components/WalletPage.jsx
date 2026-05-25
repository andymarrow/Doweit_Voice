"use client";
// Unified admin "Wallet" surface — merges the old Token, Balances, and
// Transaction tabs into one pro-level token-operations view. Every token
// movement (purchase top-up, marketplace buy, platform bonus, usage
// deduction, marketplace sale credit) flows through token_transactions, and
// this page surfaces all of them with per-user drill-down.
import { useState, useEffect, useCallback } from 'react';
import {
  Wallet, Users, TrendingDown, TrendingUp, ShoppingCart, Gift, Zap,
  Search, ChevronLeft, ChevronRight, Loader2, X, ArrowLeftRight,
  Clock, Mail,
} from 'lucide-react';

function fmt(n) { return (n ?? 0).toLocaleString(); }
function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

function typeBadge(type) {
  if (type === 'purchase') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300';
  if (type === 'bonus')    return 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
  if (type === 'usage')    return 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
  return 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
}

function balanceTier(bal) {
  if (bal === 0)  return { label: 'Empty',    color: 'text-gray-400 dark:text-gray-500',   dot: 'bg-gray-300 dark:bg-gray-600',   badge: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400' };
  if (bal < 100)  return { label: 'Critical', color: 'text-red-600 dark:text-red-400',     dot: 'bg-red-400',                     badge: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' };
  if (bal < 300)  return { label: 'Low',      color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400',                   badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' };
  if (bal < 1000) return { label: 'Normal',   color: 'text-gray-700 dark:text-gray-300',   dot: 'bg-gray-400',                    badge: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
  return                 { label: 'Rich',     color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400',             badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' };
}

const TABS = [
  { id: 'transactions', label: 'Transactions' },
  { id: 'users',        label: 'Users' },
  { id: 'spenders',     label: 'Top Spenders' },
  { id: 'earners',      label: 'Top Earners' },
];

const TYPE_FILTERS = ['all', 'purchase', 'usage', 'bonus'];

export default function WalletPage() {
  const [data, setData]   = useState(null);
  const [page, setPage]   = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab]               = useState('transactions');
  const [search, setSearch]         = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null); // userId → opens modal

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/wallet?page=${p}&limit=50`, { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page); }, [load, page]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 dark:text-gray-500 text-xs">
        <Loader2 size={16} className="animate-spin mr-2" /> Loading wallet data…
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

  const summary = data?.summary || {};
  const transactions = data?.transactions || [];
  const users = data?.users || [];
  const spenders = data?.topSpenders || [];
  const earners = data?.topEarners || [];

  const q = search.trim().toLowerCase();
  const matchesQ = (...vals) => vals.some(v => (v || '').toString().toLowerCase().includes(q));

  const filteredTransactions = transactions.filter((tx) => {
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    if (!matchType) return false;
    if (!q) return true;
    return matchesQ(tx.userName, tx.userEmail, tx.description, tx.userId);
  });

  const filteredUsers    = q ? users.filter((u) => matchesQ(u.name, u.email)) : users;
  const filteredSpenders = q ? spenders.filter((u) => matchesQ(u.name, u.email)) : spenders;
  const filteredEarners  = q ? earners.filter((u) => matchesQ(u.name, u.email)) : earners;

  return (
    <div className="space-y-4">
      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card icon={Users}         label="Total Users"   value={fmt(summary.totalUsers)}        sub={`${fmt(summary.activeWallets)} active`} />
        <Card icon={Wallet}        label="In Circulation" value={fmt(summary.tokensInSystem)} accent="text-emerald-600 dark:text-emerald-400" iconColor="text-emerald-500" sub="user balances" />
        <Card icon={TrendingDown}  label="Total Spent"   value={fmt(summary.totalSpent)}        accent="text-red-600 dark:text-red-400"    iconColor="text-red-400"     sub="all-time outflow" />
        <Card icon={ShoppingCart}  label="Purchased"     value={fmt(summary.totalPurchased)}    accent="text-blue-600 dark:text-blue-400"  iconColor="text-blue-400"   sub="top-ups + sales" />
        <Card icon={Gift}          label="Bonuses"       value={fmt(summary.totalBonus)}        accent="text-purple-600 dark:text-purple-400" iconColor="text-purple-400" sub="platform credits" />
        <Card icon={ArrowLeftRight} label="Avg Balance"  value={fmt(summary.avgBalance)}        accent="text-amber-600 dark:text-amber-400" iconColor="text-amber-400" sub={`${fmt(summary.totalTransactions)} txns total`} />
      </div>

      {/* ── Tabs + toolbar ────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                  tab === t.id
                    ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-white'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {tab === 'transactions' && (
            <div className="flex items-center gap-1">
              {TYPE_FILTERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    typeFilter === t
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white'
                      : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
          <div className="relative ml-auto">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'transactions' ? 'Search user or description…' : 'Search by name or email…'}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-7 pr-3 py-1 text-[11px] text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors w-52"
            />
          </div>
          <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
            {tab === 'transactions' ? `${filteredTransactions.length} records` :
             tab === 'users'        ? `${filteredUsers.length} users` :
             tab === 'spenders'     ? `${filteredSpenders.length} spenders` :
                                      `${filteredEarners.length} earners`}
          </span>
        </div>

        {/* ── Transactions tab ────────────────────────────────────────── */}
        {tab === 'transactions' && (
          <>
            <Table headers={['User', 'Type', 'Amount', 'Platform', 'Duration', 'Description', 'Date']}>
              {filteredTransactions.length === 0 ? (
                <EmptyRow span={7} text="No transactions found." />
              ) : (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedUser(tx.userId)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">
                        {tx.userEmail || tx.userId}
                      </p>
                      {tx.userName && <p className="text-[10px] text-gray-400 dark:text-gray-500">{tx.userName}</p>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${typeBadge(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {tx.interviewType ? (
                        <span className={`text-[10px] font-medium capitalize ${tx.interviewType === 'trainee' ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {tx.interviewType}
                        </span>
                      ) : <span className="text-gray-300 dark:text-gray-600 text-[10px]">—</span>}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {tx.durationMinutes ? `${tx.durationMinutes}m` : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                      {tx.description || '—'}
                    </td>
                    <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {fmtDate(tx.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </Table>

            {/* Pagination */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 dark:text-gray-500">Page {data?.page || 1} · {data?.limit || 50} per page</p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={13} />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!data?.hasMore}
                  className="p-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── Users tab ───────────────────────────────────────────────── */}
        {tab === 'users' && (
          <Table headers={['#', 'User', 'Balance', 'Tier', 'Purchased', 'Spent', 'Bonus', 'Txns', 'Last Activity']}>
            {filteredUsers.length === 0 ? (
              <EmptyRow span={9} text="No users found." />
            ) : (
              filteredUsers.map((u, i) => {
                const tier = balanceTier(u.balance);
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUser(u.id)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                    <td className="px-4 py-2">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{u.name || '—'}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[160px]">{u.email}</p>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={10} className={tier.color} />
                        <span className={`text-xs font-medium ${tier.color}`}>{fmt(u.balance)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tier.badge}`}>{tier.label}</span>
                    </td>
                    <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">+{fmt(u.totalPurchased)}</td>
                    <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400">−{fmt(u.totalSpent)}</td>
                    <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400">+{fmt(u.totalBonus)}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{fmt(u.txCount)}</td>
                    <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDate(u.lastActivityAt)}</td>
                  </tr>
                );
              })
            )}
          </Table>
        )}

        {/* ── Spenders tab ────────────────────────────────────────────── */}
        {tab === 'spenders' && (
          <Table headers={['#', 'User', 'Spent', 'Balance', 'Txns']}>
            {filteredSpenders.length === 0 ? (
              <EmptyRow span={5} text="No spenders yet." />
            ) : (
              filteredSpenders.map((u, i) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{u.name || u.email}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{u.email}</p>
                  </td>
                  <td className="px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400">−{fmt(u.totalSpent)}</td>
                  <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">{fmt(u.balance)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{fmt(u.txCount)}</td>
                </tr>
              ))
            )}
          </Table>
        )}

        {/* ── Earners tab ─────────────────────────────────────────────── */}
        {tab === 'earners' && (
          <Table headers={['#', 'User', 'Purchased', 'Bonuses', 'Balance']}>
            {filteredEarners.length === 0 ? (
              <EmptyRow span={5} text="No earners yet." />
            ) : (
              filteredEarners.map((u, i) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[160px]">{u.name || u.email}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{u.email}</p>
                  </td>
                  <td className="px-4 py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">+{fmt(u.totalPurchased)}</td>
                  <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400">+{fmt(u.totalBonus)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{fmt(u.balance)}</td>
                </tr>
              ))
            )}
          </Table>
        )}
      </div>

      {selectedUser && (
        <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

// ── User drill-down modal ─────────────────────────────────────────────────
function UserDetailModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/admin/wallet/${userId}`)
      .then((r) => r.json())
      .then((json) => {
        if (!alive) return;
        if (json?.error) setError(json.error);
        else setData(json);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-base shrink-0">
              {(data?.user?.name || data?.user?.email || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold truncate">{data?.user?.name || 'Loading…'}</h2>
              <p className="text-[11px] text-white/70 truncate">{data?.user?.email || userId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-10 text-gray-400 dark:text-gray-500 text-xs">
              <Loader2 size={14} className="animate-spin mr-2" /> Loading…
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 p-3 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {data && (
            <>
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <StatTile label="Balance"    value={fmt(data.user.balance)}        color="emerald" />
                <StatTile label="Purchased"  value={`+${fmt(data.stats.totalPurchased)}`} color="blue" />
                <StatTile label="Spent"      value={`−${fmt(data.stats.totalSpent)}`}     color="red" />
                <StatTile label="Bonuses"    value={`+${fmt(data.stats.totalBonus)}`}     color="purple" />
              </div>

              {/* Platform split */}
              <div className="grid grid-cols-2 gap-2">
                <PlatformTile label="Trainee Spent"   value={fmt(data.stats.spentTrainee)}   color="text-purple-600 dark:text-purple-400" />
                <PlatformTile label="Recruiter Spent" value={fmt(data.stats.spentRecruiter)} color="text-amber-600 dark:text-amber-400" />
              </div>

              {/* Account meta */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 space-y-1.5">
                <MetaRow icon={Mail}    label="Email"    value={data.user.email} />
                <MetaRow icon={Clock}   label="Joined"   value={fmtDate(data.user.joinedAt)} />
                <MetaRow icon={ArrowLeftRight} label="Transactions" value={`${fmt(data.stats.txCount)} total`} />
                <MetaRow icon={TrendingUp} label="Last activity" value={fmtDateTime(data.stats.lastActivityAt)} />
              </div>

              {/* Type breakdown */}
              {data.typeBreakdown?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">By Type</p>
                  <div className="grid grid-cols-3 gap-2">
                    {data.typeBreakdown.map((t) => (
                      <div key={t.type} className={`rounded-lg border p-2.5 ${typeBadge(t.type).replace('text-', 'border-').replace('-300', '-200').replace('-700', '-200')}`}>
                        <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">{t.type}</p>
                        <p className="text-sm font-bold mt-0.5">{fmt(t.count)}</p>
                        <p className="text-[10px] opacity-70">{t.amount > 0 ? '+' : ''}{fmt(t.amount)} tokens</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full transaction history */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                  Transaction History ({data.transactions.length})
                </p>
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left bg-white dark:bg-gray-800">
                      <thead className="sticky top-0">
                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          {['Type', 'Amount', 'Platform', 'Description', 'Date'].map((h) => (
                            <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.transactions.length === 0 ? (
                          <tr><td colSpan={5} className="px-3 py-8 text-center text-xs text-gray-400 dark:text-gray-500">No transactions for this user yet.</td></tr>
                        ) : (
                          data.transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="px-3 py-2">
                                <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${typeBadge(tx.type)}`}>{tx.type}</span>
                              </td>
                              <td className="px-3 py-2">
                                <span className={`text-xs font-medium ${tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {tx.amount > 0 ? '+' : ''}{fmt(tx.amount)}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {tx.interviewType ? (
                                  <span className={`text-[10px] font-medium capitalize ${tx.interviewType === 'trainee' ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                    {tx.interviewType}
                                  </span>
                                ) : <span className="text-gray-300 dark:text-gray-600 text-[10px]">—</span>}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{tx.description || '—'}</td>
                              <td className="px-3 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDateTime(tx.createdAt)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────
function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left bg-white dark:bg-gray-800">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            {headers.map((h) => (
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

function StatTile({ label, value, color = 'emerald' }) {
  const palette = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
    red:     'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-300',
    blue:    'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    purple:  'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-300',
  };
  return (
    <div className={`rounded-xl border p-3 ${palette[color]}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-base font-bold mt-1">{value}</p>
    </div>
  );
}

function PlatformTile({ label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3">
      <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</p>
      <p className={`text-base font-bold mt-1 ${color}`}>−{value}</p>
    </div>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px]">
      <Icon size={11} className="text-gray-400 dark:text-gray-500 shrink-0" />
      <span className="text-gray-400 dark:text-gray-500 w-24 shrink-0">{label}</span>
      <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{value}</span>
    </div>
  );
}
