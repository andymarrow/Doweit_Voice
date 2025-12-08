import React, { useState } from 'react';
import {


  Calendar,
  Filter,
  Zap,
  Target,
  Trophy,
  CheckCircle2,

  ChevronRight,



  History } from
'lucide-react';
import {


  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area } from
'recharts';
import { cn } from '../../lib/utils';

const skillData = [
{ subject: 'Technical', A: 85, fullMark: 100 },
{ subject: 'Communication', A: 70, fullMark: 100 },
{ subject: 'Problem Solving', A: 90, fullMark: 100 },
{ subject: 'Confidence', A: 75, fullMark: 100 },
{ subject: 'Behavioral', A: 80, fullMark: 100 }];


const progressData = [
{ name: 'Mon', score: 65, accuracy: 70 },
{ name: 'Tue', score: 68, accuracy: 72 },
{ name: 'Wed', score: 75, accuracy: 78 },
{ name: 'Thu', score: 72, accuracy: 75 },
{ name: 'Fri', score: 82, accuracy: 85 },
{ name: 'Sat', score: 85, accuracy: 88 },
{ name: 'Sun', score: 88, accuracy: 92 }];


const sessionHistory = [
{ id: 'S1', date: '2024-03-14', agent: 'Alex', mode: 'Mock Interview', score: 88, xp: 250, duration: '24m' },
{ id: 'S2', date: '2024-03-13', agent: 'Sarah', mode: 'Quiz', score: 95, xp: 150, duration: '12m' },
{ id: 'S3', date: '2024-03-12', agent: 'Viktor', mode: 'Mock Interview', score: 72, xp: 180, duration: '45m' },
{ id: 'S4', date: '2024-03-10', agent: 'Alex', mode: 'Quiz', score: 82, xp: 100, duration: '15m' }];


export const TraineeAnalysis = () => {
  const [dateRange, setDateRange] = useState('Last 7 Days');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Training Analysis</h2>
          <p className="text-xs text-muted-foreground">Deep dive into your learning performance and progress.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-black/5 text-xs font-bold focus:ring-emerald-500/10">
              
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <button className="p-2 rounded-xl bg-white border border-black/5 hover:bg-gray-50 transition-colors">
            <Calendar size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
        { label: 'Total Sessions', value: '48', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Avg. Score', value: '82%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'XP Earned', value: '12,450', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Mastery Level', value: 'Advanced', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Accuracy Rate', value: '94%', icon: CheckCircle2, color: 'text-pink-600', bg: 'bg-pink-50' }].
        map((stat, i) =>
        <div key={i} className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg", stat.bg, stat.color)}>
                <stat.icon size={14} />
              </div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-lg font-black tracking-tight">{stat.value}</h3>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Radar Chart */}
        <div className="lg:col-span-1 p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
          <h3 className="text-sm font-bold">Skill Development</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Skills"
                  dataKey="A"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.5} />
                
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Top Strengths</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold">Problem Solving</span>
              <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-bold">Technical Knowledge</span>
            </div>
          </div>
        </div>

        {/* Progress Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold">Performance Trends</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Mock Score</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Quiz Accuracy</span>
                </div>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
                  <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="p-6 rounded-3xl bg-gray-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap size={16} />
                <h3 className="text-sm font-bold uppercase tracking-widest">AI Learning Recommendations</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                { title: 'Practice Behavioral', desc: 'Your communication score is 15% lower than your technical score.', action: 'Try Sarah Coach' },
                { title: 'Improve Pacing', desc: 'You tend to speak 20% faster when answering complex questions.', action: 'View Analysis' }].
                map((rec, i) =>
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <p className="text-xs font-bold">{rec.title}</p>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{rec.desc}</p>
                    <button className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                      {rec.action}
                      <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Session History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <History size={18} className="text-gray-400" />
            Recent Training Sessions
          </h3>
          <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">View Full History</button>
        </div>
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-black/5">
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Session Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Agent</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mode</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">XP</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {sessionHistory.map((session) =>
                <tr key={session.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-xs font-medium text-gray-500">{session.date}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gray-100 overflow-hidden">
                          <img src={`https://picsum.photos/seed/${session.agent}/100/100`} alt="" />
                        </div>
                        <span className="text-xs font-bold">{session.agent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                      "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                      session.mode === 'Mock Interview' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                        {session.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-gray-900">{session.score}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-emerald-600">+{session.xp}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-gray-900">
                        <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>);

};