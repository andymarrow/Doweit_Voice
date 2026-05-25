"use client";
import { useState, useEffect, useCallback } from 'react';
import { Briefcase, CheckCircle, Users, TrendingUp, Search, Loader2, FileText } from 'lucide-react';

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

function statusBadge(status) {
  const map = {
    active:    'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    draft:     'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    closed:    'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    rejected:  'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    hired:     'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    applied:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    interviewing: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  };
  return map[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
}

const TAB_KEYS = ['positions', 'applications', 'recruiters'];

export default function RecruiterPage() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [tab, setTab]       = useState('positions');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/recruiter', { cache: 'no-store' });
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
        <Loader2 size={16} className="animate-spin mr-2" /> Loading recruiter metrics…
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
  const positions = data?.recentPositions || [];
  const applications = data?.recentApplications || [];
  const recruiters = data?.topRecruiters || [];

  // Apply search to whichever tab is active
  const q = search.trim().toLowerCase();
  const matchesQ = (...vals) => vals.some(v => (v || '').toString().toLowerCase().includes(q));
  const filteredPositions    = q ? positions.filter(p => matchesQ(p.title, p.department, p.sellerName)) : positions;
  const filteredApplications = q ? applications.filter(a => matchesQ(a.candidateName, a.candidateEmail, a.jobTitle)) : applications;
  const filteredRecruiters   = q ? recruiters.filter(r => matchesQ(r.name, r.email)) : recruiters;

  return (
    <div className="space-y-4">
      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card icon={Briefcase}   label="Total Positions"  value={fmt(totals.positions)}       accent="text-amber-600 dark:text-amber-400"   iconColor="text-amber-400"  sub={`${fmt(totals.activePositions)} active`} />
        <Card icon={Users}       label="Recruiters"       value={fmt(totals.recruiters)}      accent="text-blue-600 dark:text-blue-400"     iconColor="text-blue-400"   sub="unique users" />
        <Card icon={CheckCircle} label="Interviews Taken" value={fmt(totals.interviewsTaken)} accent="text-emerald-600 dark:text-emerald-400" iconColor="text-emerald-500" sub={`of ${fmt(totals.applications)} applications`} />
        <Card icon={TrendingUp}  label="Avg Fit Score"    value={`${fmt(totals.avgFitScore)}%`} accent="text-purple-600 dark:text-purple-400" iconColor="text-purple-400" sub="across scored interviews" />
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

        {/* Tab tables */}
        {tab === 'positions' && (
          <Table headers={['Title', 'Department', 'Recruiter', 'Status', 'Applicants', 'Created']}>
            {filteredPositions.length === 0 ? (
              <EmptyRow span={6} text="No positions found." />
            ) : (
              filteredPositions.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[180px]">{p.title}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">{p.department || '—'}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">{p.sellerName}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${statusBadge(p.status)}`}>{p.status || 'draft'}</span>
                  </td>
                  <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400 font-medium">{fmt(p.applicationCount)}</td>
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDate(p.createdAt)}</td>
                </tr>
              ))
            )}
          </Table>
        )}

        {tab === 'applications' && (
          <Table headers={['Candidate', 'Position', 'Status', 'Fit Score', 'Interview', 'Date']}>
            {filteredApplications.length === 0 ? (
              <EmptyRow span={6} text="No applications found." />
            ) : (
              filteredApplications.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{a.candidateName}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{a.candidateEmail}</p>
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{a.jobTitle}</td>
                  <td className="px-4 py-2">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${statusBadge(a.status)}`}>{a.status || 'applied'}</span>
                  </td>
                  <td className="px-4 py-2">
                    {a.fitScore != null ? (
                      <span className={`text-xs font-medium ${a.fitScore >= 75 ? 'text-emerald-600 dark:text-emerald-400' : a.fitScore >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}`}>
                        {a.fitScore}
                      </span>
                    ) : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2">
                    {a.interviewTaken ? (
                      <CheckCircle size={11} className="text-emerald-500" />
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600 text-[10px]">pending</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">{fmtDate(a.createdAt)}</td>
                </tr>
              ))
            )}
          </Table>
        )}

        {tab === 'recruiters' && (
          <Table headers={['#', 'Recruiter', 'Email', 'Positions', 'Applications', 'Interviews']}>
            {filteredRecruiters.length === 0 ? (
              <EmptyRow span={6} text="No recruiters found." />
            ) : (
              filteredRecruiters.map((r, i) => (
                <tr key={r.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 text-[10px] text-gray-400 dark:text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2 text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[140px]">{r.name}</td>
                  <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{r.email}</td>
                  <td className="px-4 py-2 text-xs text-amber-600 dark:text-amber-400 font-medium">{fmt(r.positionCount)}</td>
                  <td className="px-4 py-2 text-xs text-blue-600 dark:text-blue-400">{fmt(r.applicationCount)}</td>
                  <td className="px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">{fmt(r.interviewCount)}</td>
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
