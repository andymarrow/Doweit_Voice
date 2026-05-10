import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import {
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  AlertCircle,
  Briefcase,
  ShoppingBag,
  Plus,
  Target,
  Coins,
  Zap,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Mic,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// Demo data for analysis section
const radarData = [
  { subject: "Technical", A: 120, fullMark: 150 },
  { subject: "Communication", A: 98, fullMark: 150 },
  { subject: "Problem Solving", A: 86, fullMark: 150 },
  { subject: "Culture Fit", A: 99, fullMark: 150 },
  { subject: "Confidence", A: 85, fullMark: 150 },
];

const questionPerformanceData = [
  {
    q: "Explain REST vs GraphQL",
    type: "Technical",
    score: "72%",
    diff: "Medium",
    fail: "12%",
  },
  {
    q: "Conflict resolution story",
    type: "Behavioral",
    score: "85%",
    diff: "Medium",
    fail: "5%",
  },
  {
    q: "System design for notifications",
    type: "Scenario",
    score: "58%",
    diff: "Hard",
    fail: "24%",
  },
  {
    q: "Why do you want to join us?",
    type: "Culture",
    score: "92%",
    diff: "Low",
    fail: "2%",
  },
];

const progressData = [
  { name: "W1", score: 65 },
  { name: "W2", score: 72 },
  { name: "W3", score: 68 },
  { name: "W4", score: 85 },
  { name: "W5", score: 78 },
  { name: "W6", score: 82 },
];

// Demo candidate data
const candidateData = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    position: "Frontend Developer",
    score: 85,
    status: "Interviewing",
    applied: "2024-01-15",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.c@email.com",
    position: "Backend Engineer",
    score: 78,
    status: "Screening",
    applied: "2024-01-14",
  },
  {
    id: 3,
    name: "Emily Davis",
    email: "emily.d@email.com",
    position: "Full Stack Developer",
    score: 92,
    status: "Shortlisted",
    applied: "2024-01-13",
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.w@email.com",
    position: "DevOps Engineer",
    score: 71,
    status: "Rejected",
    applied: "2024-01-12",
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    position: "UI/UX Designer",
    score: 88,
    status: "Interviewing",
    applied: "2024-01-11",
  },
  {
    id: 6,
    name: "Robert Taylor",
    email: "robert.t@email.com",
    position: "Product Manager",
    score: 76,
    status: "Screening",
    applied: "2024-01-10",
  },
];

export const RecruiterDashboard = ({ onNavigate }) => {
  const { data: session, isPending: sessionLoading } = useSession();
  const [analytics, setAnalytics] = useState(null);
  const [candidateData, setCandidateData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (sessionLoading) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const userId = session?.user?.id;
        if (!userId) {
          setError("Not authenticated");
          return;
        }

        const dashboardResponse = await fetch(
          `/api/recruiter/dashboard?userId=${userId}`,
        );
        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardData = await dashboardResponse.json();
        setAnalytics(dashboardData);

        const candidatesResponse = await fetch(`/api/recruiter/applications`);
        if (candidatesResponse.ok) {
          const candidatesData = await candidatesResponse.json();
          const transformedCandidates = (Array.isArray(candidatesData) ? candidatesData : [])
            .slice(0, 6)
            .map((candidate) => {
              const resultArr = Array.isArray(candidate.result) ? candidate.result : [];
              const totalScore = resultArr.reduce((sum, c) => sum + (c.score || 0), 0);
              return {
                id: candidate.id,
                name: candidate.candidateName || "Unknown",
                email: candidate.candidateEmail || "unknown@email.com",
                position: candidate.jobTitle || "Unknown Position",
                score: totalScore || 0,
                status: candidate.isRejected ? "Rejected" : (candidate.status || "applied"),
                applied: candidate.createdAt
                  ? new Date(candidate.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : "N/A",
              };
            });
          setCandidateData(transformedCandidates);
        }

        const activitiesResponse = await fetch(`/api/recruiter/activities?limit=15`);
        if (activitiesResponse.ok) {
          const activitiesJson = await activitiesResponse.json();
          setActivities(Array.isArray(activitiesJson?.data) ? activitiesJson.data : []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, sessionLoading]);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Recruiter Dashboard
          </h2>
          <p className="text-xs text-muted-foreground">
            Welcome back! Here's what's happening with your interviews.
          </p>
        </div>
        <button
          onClick={() => onNavigate?.("create")}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          Create New Interview
        </button>
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
        {/* Charts Section */}
        <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              Interview Volume
            </h3>
            <select className="text-[10px] font-bold bg-gray-50 border-none rounded-lg px-2 py-1 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "10px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
          <h3 className="text-sm font-bold mb-6">Candidate Quality Trend</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={qualityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#999" }}
                />
                <Tooltip
                  cursor={{ fill: "#f9fafb" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    fontSize: "10px",
                  }}
                />

                <Bar
                  dataKey="score"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
        <h3 className="text-sm font-bold mb-4">Progress</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progressData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#999" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#999" }}
              />
              <Tooltip
                contentStyle={{ fontSize: "10px", borderRadius: "8px" }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: "#10b981" }}
              />
            </LineChart>
          </ResponsiveContainer>
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
      </div>
    </div>
  );
};
