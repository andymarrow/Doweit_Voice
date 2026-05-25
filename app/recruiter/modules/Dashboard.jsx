import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  TrendingUp,
  AlertCircle,
  Briefcase,
  Plus,
  Target,
  Zap,
  Loader2,
  UserPlus,
  Mic,
  Activity,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export const RecruiterDashboard = ({ onNavigate }) => {
  const { data: session, isPending: sessionLoading } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [candidateData, setCandidateData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const userId = session?.user?.id;
      if (!userId) {
        setError("Not authenticated");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Each fetch is independent — one failure doesn't kill the rest.
      // cache: 'no-store' is critical: without it, the browser was serving
      // a stale "Total Positions: 2" response from HTTP cache even after
      // the recruiter deleted all their positions.
      const ts = Date.now(); // cache-bust query param as a belt-and-braces guard
      const [dashboardRes, candidatesRes, activitiesRes] =
        await Promise.allSettled([
          fetch(`/api/recruiter/dashboard?userId=${encodeURIComponent(userId)}&_=${ts}`, { cache: 'no-store' }),
          fetch(`/api/recruiter/applications?_=${ts}`, { cache: 'no-store' }),
          fetch(`/api/recruiter/activities?limit=15&_=${ts}`, { cache: 'no-store' }),
        ]);

      if (dashboardRes.status === "fulfilled" && dashboardRes.value.ok) {
        try {
          setAnalytics(await dashboardRes.value.json());
        } catch (e) {
          console.error("dashboard json parse failed:", e);
        }
      } else {
        console.error("dashboard fetch failed", dashboardRes);
      }

      if (candidatesRes.status === "fulfilled" && candidatesRes.value.ok) {
        try {
          const candidatesJson = await candidatesRes.value.json();
          const transformed = (
            Array.isArray(candidatesJson) ? candidatesJson : []
          )
            .slice(0, 6)
            .map((candidate) => {
              const resultArr = Array.isArray(candidate.result)
                ? candidate.result
                : [];
              const totalScore = resultArr.reduce(
                (sum, c) => sum + (c.score || 0),
                0,
              );
              return {
                id: candidate.id,
                name: candidate.candidateName || "Unknown",
                email: candidate.candidateEmail || "unknown@email.com",
                position: candidate.jobTitle || "Unknown Position",
                score: totalScore || 0,
                status: candidate.isRejected
                  ? "Rejected"
                  : candidate.status || "applied",
                applied: candidate.createdAt
                  ? new Date(candidate.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "N/A",
              };
            });
          setCandidateData(transformed);
        } catch (e) {
          console.error("candidates json parse failed:", e);
        }
      } else {
        console.error("candidates fetch failed", candidatesRes);
      }

      if (activitiesRes.status === "fulfilled" && activitiesRes.value.ok) {
        try {
          const activitiesJson = await activitiesRes.value.json();
          setActivities(
            Array.isArray(activitiesJson?.data) ? activitiesJson.data : [],
          );
        } catch (e) {
          console.error("activities json parse failed:", e);
        }
      } else {
        console.error("activities fetch failed", activitiesRes);
      }

      setIsLoading(false);
      setIsRefreshing(false);
    },
    [session],
  );

  useEffect(() => {
    if (sessionLoading) return;
    fetchDashboardData();
  }, [sessionLoading, fetchDashboardData]);

  // Generate chart data from real analytics
  const volumeData = analytics?.recentActivity?.reduce((acc, activity) => {
    const day = new Date(activity.createdAt).toLocaleDateString("en", {
      weekday: "short",
    });
    const existing = acc.find((item) => item.name === day);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: day, count: 1 });
    }
    return acc;
  }, []) || [
    { name: "Mon", count: 0 },
    { name: "Tue", count: 0 },
    { name: "Wed", count: 0 },
    { name: "Thu", count: 0 },
    { name: "Fri", count: 0 },
    { name: "Sat", count: 0 },
    { name: "Sun", count: 0 },
  ];

  const qualityData =
    analytics?.topPositions?.map((pos) => ({
      name: pos.title.split(" ")[0] || "Unknown",
      score: Math.round(pos.averageScore || 0),
    })) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <span className="ml-2 text-sm text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">
          Failed to load analytics
        </p>
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Recruiter Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            Welcome back! Here's what's happening with your interviews.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboardData({ silent: true })}
            disabled={isRefreshing}
            title="Refresh data"
            className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-50 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={() => onNavigate?.("create")}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            Create New Interview
          </button>
        </div>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Positions",
            value: analytics?.overview?.totalPositions?.toString() || "0",
            icon: Briefcase,
            color: "text-blue-600",
            bg: "bg-blue-50",
            trend:
              (analytics?.positions?.active?.toString() || "0") + " active",
          },
          {
            label: "Total Applications",
            value: analytics?.overview?.totalApplications?.toString() || "0",
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            trend:
              (analytics?.applications?.interviewing?.toString() || "0") +
              " interviewing",
          },
          {
            label: "Avg. Fit Score",
            value:
              (analytics?.overview?.averageFitScore?.toString() || "0") + "%",
            icon: Target,
            color: "text-orange-600",
            bg: "bg-orange-50",
            trend:
              (analytics?.interviews?.completed?.toString() || "0") +
              " completed",
          },
          {
            label: "Total Interviews",
            value: analytics?.overview?.totalInterviews?.toString() || "0",
            icon: Zap,
            color: "text-purple-600",
            bg: "bg-purple-50",
            trend:
              (analytics?.interviews?.ongoing?.toString() || "0") + " ongoing",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-3 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={cn(
                  "p-2 rounded-xl group-hover:scale-110 transition-transform",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon size={14} />
              </div>
              <span
                className={cn(
                  "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
                  "bg-gray-50 text-gray-500",
                )}
              >
                {stat.trend}
              </span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">
              {stat.label}
            </p>
            <h3 className="text-base font-black tracking-tight">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interview Volume */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-600 flex items-center justify-center">
                  <TrendingUp size={13} className="text-white" />
                </div>
                Interview Volume
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 ml-8">
                Interviews conducted per day
              </p>
            </div>
            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Last 7 Days
            </span>
          </div>
          <div className="h-[220px]">
            {volumeData.every((d) => d.count === 0) ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp size={20} className="text-purple-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium">No interview data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f0ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a78bfa" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#a78bfa" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 20px -3px rgb(124 58 237 / 0.15)", fontSize: "11px", background: "#fff" }}
                    labelStyle={{ color: "#7c3aed", fontWeight: "700" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} fillOpacity={1} fill="url(#volumeGrad)"
                    dot={{ r: 4, fill: "#7c3aed", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 6, fill: "#7c3aed", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Candidate Quality Trend */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Target size={13} className="text-white" />
                </div>
                Candidate Quality Trend
              </h3>
              <p className="text-[10px] text-gray-400 mt-0.5 ml-8">
                Avg. fit score per position
              </p>
            </div>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Top 5
            </span>
          </div>
          <div className="h-[220px]">
            {qualityData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Target size={20} className="text-blue-400" />
                </div>
                <p className="text-xs text-gray-400 font-medium">No scored interviews yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="qualityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eff6ff" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#93c5fd" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#93c5fd" }} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 8px 20px -3px rgb(37 99 235 / 0.15)", fontSize: "11px", background: "#fff" }}
                    labelStyle={{ color: "#2563eb", fontWeight: "700" }}
                    formatter={(v) => [`${v}%`, "Avg Score"]}
                  />
                  <Area type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#qualityGrad)"
                    dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                    activeDot={{ r: 7, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Activity size={16} className="text-purple-600" />
            Recent Activity
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Registrations & interviews
          </span>
        </div>
        {activities.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No registrations or interviews yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {activities.map((a) => {
              const isRegister = a.type === "registered";
              const Icon = isRegister ? UserPlus : Mic;
              const accent = isRegister
                ? "bg-emerald-50 text-emerald-600"
                : "bg-blue-50 text-blue-600";
              const verb = isRegister ? "registered for" : "took the interview for";
              return (
                <li
                  key={a.id}
                  className="py-3 flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                      accent,
                    )}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-800">
                      <span className="font-bold">
                        {a.candidateName || "Unknown candidate"}
                      </span>{" "}
                      <span className="text-gray-500">{verb}</span>{" "}
                      <span className="font-bold">
                        {a.positionTitle || "a position"}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 truncate">
                      {a.candidateEmail || ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Candidate List Table at Bottom */}
      <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Users size={16} className="text-blue-600" />
            Recent Candidates
          </h3>
          <button
            onClick={() => onNavigate?.("candidates")}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View All
          </button>
        </div>
        {candidateData.length === 0 ? (
          <div className="text-center py-10">
            <Users size={28} className="mx-auto text-gray-200 mb-2" />
            <p className="text-xs font-semibold text-gray-500">
              No candidates yet
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Candidates will appear here after they register for one of your
              interviews
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-50">
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Position
                </th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="pb-3 font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
                  Applied
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidateData.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3">
                    <div>
                      <p className="text-xs font-medium text-gray-900">
                        {candidate.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {candidate.email}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 text-xs text-gray-600">
                    {candidate.position}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="text-xs font-bold text-emerald-600">
                        {candidate.score}%
                      </div>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${candidate.score}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                        candidate.status === "Shortlisted"
                          ? "bg-emerald-50 text-emerald-600"
                          : candidate.status === "Interviewing"
                            ? "bg-blue-50 text-blue-600"
                            : candidate.status === "Screening"
                              ? "bg-yellow-50 text-yellow-600"
                              : candidate.status === "Rejected"
                                ? "bg-red-50 text-red-600"
                                : "bg-gray-100 text-gray-600",
                      )}
                    >
                      {candidate.status}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    {candidate.applied}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};
