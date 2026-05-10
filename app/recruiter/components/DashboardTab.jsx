"use client";
import React from "react";
import {
  Users,
  Clock,
  Target,
  UserCheck,
  Zap,
  BarChart2,
  HelpCircle,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { calcScore, scoreBg, scoreColor } from "./utils";

export const DashboardTab = ({
  interview,
  candidates,
  activeCandidates,
  rejectedCandidates,
  shortlisted,
  candidateResults,
  criteria,
  questions,
  onTabChange,
}) => {
  const scores = activeCandidates.map((c) => calcScore(c, candidateResults));
  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const criteriaChartData = criteria.map((c) => ({
    name: c.name.split(" ")[0],
    weight: c.weight,
  }));

  const statusData = [
    { name: "Active", value: activeCandidates.length, color: "#6d28d9" },
    { name: "Rejected", value: rejectedCandidates.length, color: "#93c5fd" },
    { name: "Shortlist", value: shortlisted.length, color: "#3b82f6" },
  ];

  const stats = [
    {
      label: "Total Candidates",
      value: candidates.length,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Active",
      value: activeCandidates.length,
      icon: UserCheck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Avg Score",
      value: avgScore || "—",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Duration",
      value: `${interview?.duration || 30}m`,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Questions",
      value: interview?.questionCount || questions.length,
      icon: HelpCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    {
      label: "Status",
      value: interview?.status || "Draft",
      icon: Zap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`rounded-xl border ${s.border} ${s.bg} p-3`}
          >
            <div className="flex items-center justify-between mb-2">
              <s.icon size={14} className={s.color} />
            </div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
              {s.label}
            </p>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Criteria weights */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
              <BarChart2 size={13} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Evaluation Criteria
              </h3>
              <p className="text-[10px] text-gray-400">Weight distribution</p>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={criteriaChartData}
                margin={{ top: 4, right: 8, left: -20, bottom: 4 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                  }}
                />
                <Bar dataKey="weight" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate status pie */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users size={13} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Candidate Status
              </h3>
              <p className="text-[10px] text-gray-400">Pipeline overview</p>
            </div>
          </div>
          <div className="h-48">
            {candidates.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-xs text-gray-400">No candidates yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={4}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                  >
                    {statusData.map((e, i) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-1">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-[10px] font-medium text-gray-600">
                  {s.name} ({s.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent candidates mini-table */}
      {activeCandidates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">
              Recent Candidates
            </h3>
            <button
              onClick={() => onTabChange?.("candidates")}
              className="text-[10px] text-blue-600 hover:underline font-medium"
            >
              View all
            </button>
          </div>
          <table className="w-full">
            <tbody className="divide-y divide-gray-50">
              {activeCandidates.slice(0, 5).map((c) => {
                const score = calcScore(c, candidateResults);
                return (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {(c.candidateName || "C").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {c.candidateName || "Unknown"}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {c.candidateEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full border",
                          scoreBg(score),
                          scoreColor(score),
                        )}
                      >
                        {score || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
