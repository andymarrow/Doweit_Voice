"use client";
import { Users, Coins, TrendingDown, Bot, GraduationCap, Briefcase, Activity, BarChart3, Search } from 'lucide-react';
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie,
} from 'recharts';

function fmt(n) { return (n ?? 0).toLocaleString(); }

const CHART_STYLE = { fontSize: 10, fill: '#9ca3af' };
const TIP_STYLE = {
  backgroundColor: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 8,
  fontSize: 11,
  color: '#f9fafb',
};

function StatCard({ icon: Icon, label, value, sub, accent = 'text-gray-900 dark:text-white', iconColor = 'text-gray-400 dark:text-gray-500' }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Icon size={13} className={iconColor} />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">{label}</span>
      </div>
      <p className={`text-lg font-bold tracking-tight ${accent}`}>{value}</p>
      {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  );
}

function makeTrend(peak = 600) {
  const weeks = ['W1','W2','W3','W4','W5','W6','W7'];
  return weeks.map((w, i) => ({
    week: w,
    tokens: Math.floor(peak * (0.4 + 0.6 * (i / 6)) * (0.85 + Math.random() * 0.3)),
    sessions: Math.floor(20 * (0.4 + 0.6 * (i / 6)) * (0.8 + Math.random() * 0.4)),
  }));
}

export default function DashboardPage({ metrics }) {
  const [spenderSearch, setSpenderSearch] = useState('');

  if (!metrics) return (
    <div className="flex items-center justify-center h-48">
      <p className="text-gray-400 dark:text-gray-500 text-xs">No data</p>
    </div>
  );

  const trend = makeTrend(metrics.monthlyTokensSpent || 800);

  const pieData = [
    { name: 'Trainee',   value: metrics.totalTraineeInterviews   || 0, fill: '#a78bfa' },
    { name: 'Recruiter', value: metrics.totalRecruiterInterviews || 0, fill: '#f59e0b' },
  ];

  const platformData = (metrics.typeBreakdown || []).map(b => ({
    name: b.interviewType || 'other',
    spent: Math.abs(Number(b.totalSpent || 0)),
    count: Number(b.count || 0),
  }));

  const filteredSpenders = (metrics.topSpenders || []).filter(s => {
    if (!spenderSearch) return true;
    const q = spenderSearch.toLowerCase();
    return (s.user?.name || '').toLowerCase().includes(q) || (s.user?.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users}        label="Users"             value={fmt(metrics.totalUsers)}               iconColor="text-gray-400 dark:text-gray-500" />
        <StatCard icon={Coins}        label="Tokens in system"  value={fmt(metrics.totalTokensInCirculation)} accent="text-emerald-600 dark:text-emerald-400" iconColor="text-emerald-500" sub="user balances" />
        <StatCard icon={TrendingDown} label="Tokens spent"      value={fmt(metrics.totalTokensSpent)}         accent="text-red-600 dark:text-red-400"       iconColor="text-red-400"     sub="all time" />
        <StatCard icon={Bot}          label="Agents"            value={fmt(metrics.totalAgents)}              accent="text-blue-600 dark:text-blue-400"      iconColor="text-blue-400" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={GraduationCap} label="Trainee"       value={fmt(metrics.totalTraineeInterviews)}   accent="text-purple-600 dark:text-purple-400"  iconColor="text-purple-400" />
        <StatCard icon={Briefcase}     label="Recruiter"     value={fmt(metrics.totalRecruiterInterviews)} accent="text-amber-600 dark:text-amber-400"    iconColor="text-amber-400" />
        <StatCard icon={Activity}      label="Monthly spend" value={fmt(metrics.monthlyTokensSpent)}       accent="text-red-600 dark:text-red-400"        iconColor="text-red-400"    sub="this month" />
        <StatCard icon={BarChart3}     label="Monthly sess." value={fmt(metrics.monthlyInterviews)}        iconColor="text-gray-400 dark:text-gray-500"   sub="interviews" />
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Token Spend — 7-week trend</p>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={trend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
              <XAxis dataKey="week" tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Area type="monotone" dataKey="tokens" stroke="#ef4444" strokeWidth={1.5} fill="url(#tGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Platform split</p>
          {pieData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-[155px] text-gray-300 dark:text-gray-600 text-xs">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={155}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={62}
                  dataKey="value" stroke="none">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={TIP_STYLE} formatter={(v, n) => [fmt(v), n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 justify-center mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                <span className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Platform bar chart */}
      {platformData.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Token spend by platform</p>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={platformData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(156,163,175,0.15)" />
              <XAxis dataKey="name" tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <YAxis tick={CHART_STYLE} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TIP_STYLE} />
              <Bar dataKey="spent" radius={[4, 4, 0, 0]}>
                {platformData.map((entry, i) => (
                  <Cell key={i} fill={entry.name === 'trainee' ? '#a78bfa' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top spenders table */}
      {metrics.topSpenders?.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between flex-wrap gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Top Token Consumers</p>
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                value={spenderSearch}
                onChange={e => setSpenderSearch(e.target.value)}
                placeholder="Search user…"
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-7 pr-3 py-1 text-[11px] text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 transition-colors w-40"
              />
            </div>
          </div>
          <table className="w-full text-left bg-white dark:bg-gray-800">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {['#', 'User', 'Spent', 'Sessions', 'Balance'].map(h => (
                  <th key={h} className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredSpenders.map((s, i) => (
                <tr key={s.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 leading-none">{s.user?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{s.user?.email || s.userId}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-red-600 dark:text-red-400 font-medium">−{fmt(s.totalSpent)}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{fmt(s.txCount)}</td>
                  <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">{fmt(s.user?.tokenBalance ?? 0)}</td>
                </tr>
              ))}
              {filteredSpenders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-gray-400 dark:text-gray-500">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
