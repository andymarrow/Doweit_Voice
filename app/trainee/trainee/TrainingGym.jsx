import React, { useState } from 'react';
import {

  Trophy,
  Zap,
  Target,
  Star,

  ChevronRight,
  Play,
  HelpCircle,

  History,
  Search,
  ArrowUpRight,
  TrendingUp,
  Award,
  BookOpen,

  MessageSquare,
  Filter,
  Activity,
  BarChart3,
  PieChart,
  Calendar,
  Clock } from
'lucide-react';
import { cn } from '@/lib/utils';
import { demoTrainingAgents, demoQuestions } from './demoData';

// Import chart components
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

import { AgentDetail } from './AgentDetail';
import { MockEngine } from './MockEngine';
import { QuizEngine } from './QuizEngine';
import { TraineeAnalysis } from './TraineeAnalysis';



// Chart data
const progressData = [
  { name: 'Mon', score: 65, duration: 25 },
  { name: 'Tue', score: 72, duration: 30 },
  { name: 'Wed', score: 78, duration: 28 },
  { name: 'Thu', score: 85, duration: 35 },
  { name: 'Fri', score: 82, duration: 32 },
  { name: 'Sat', score: 90, duration: 40 },
  { name: 'Sun', score: 88, duration: 38 }
];

const skillData = [
  { subject: 'Technical', A: 85, fullMark: 100 },
  { subject: 'Communication', A: 70, fullMark: 100 },
  { subject: 'Problem Solving', A: 90, fullMark: 100 },
  { subject: 'Behavioral', A: 75, fullMark: 100 },
  { subject: 'Confidence', A: 80, fullMark: 100 }
];

const categoryData = [
  { name: 'Technical', value: 45, color: '#3b82f6' },
  { name: 'Behavioral', value: 25, color: '#10b981' },
  { name: 'System Design', value: 20, color: '#f59e0b' },
  { name: 'General', value: 10, color: '#8b5cf6' }
];

const agentPerformanceData = [
  { agent: 'Alex', score: 88, sessions: 12 },
  { agent: 'Sarah', score: 92, sessions: 8 },
  { agent: 'Viktor', score: 85, sessions: 15 },
  { agent: 'Mike', score: 78, sessions: 6 },
  { agent: 'Emma', score: 95, sessions: 10 }
];

export const TrainingGym = () => {
  const [view, setView] = useState('dashboard');
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setView('detail');
  };

  const renderDashboard = () =>
  <div className="space-y-8 animate-in fade-in duration-500">
      {/* Training Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
      { label: 'Avg Score', value: '82%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Agents', value: '8', icon: Award, color: 'text-pink-600', bg: 'bg-pink-50' },
      { label: 'Mock Int.', value: '12', icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Quizzes', value: '36', icon: BookOpen, color: 'text-cyan-600', bg: 'bg-cyan-50' }].
      map((stat, i) =>
      <div key={i} className="p-4 rounded-2xl bg-white border border-black/5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn("p-1.5 rounded-lg", stat.bg, stat.color)}>
                <stat.icon size={12} />
              </div>
              <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            </div>
            <h3 className="text-sm font-black tracking-tight">{stat.value}</h3>
          </div>
      )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Progress Line Chart */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Activity className="text-emerald-500" size={16} />
              Weekly Progress
            </h3>
            <span className="text-xs text-gray-500">Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Skills Radar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="text-blue-500" size={16} />
              Skill Analysis
            </h3>
            <span className="text-xs text-gray-500">Current level</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar name="Skills" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <PieChart className="text-purple-500" size={16} />
              Training Categories
            </h3>
            <span className="text-xs text-gray-500">Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {categoryData.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-gray-600">{cat.name}: {cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Performance Bar Chart */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Trophy className="text-orange-500" size={16} />
              Agent Performance
            </h3>
            <span className="text-xs text-gray-500">Average scores</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="agent" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="sessions" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-xs text-gray-600">Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-xs text-gray-600">Sessions</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Clock className="text-indigo-500" size={16} />
              Recent Activity
            </h3>
            <span className="text-xs text-gray-500">Timeline</span>
          </div>
          <div className="space-y-3">
            {[
              { time: '2h ago', action: 'Completed mock interview', agent: 'Alex', score: 88 },
              { time: '5h ago', action: 'Finished quiz session', agent: 'Sarah', score: 92 },
              { time: '1d ago', action: 'Started system design', agent: 'Viktor', score: 85 },
              { time: '2d ago', action: 'Completed behavioral', agent: 'Mike', score: 78 }
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{activity.action}</p>
                  <p className="text-[10px] text-gray-500">{activity.agent} • {activity.time}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600">{activity.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {view === 'dashboard' && renderDashboard()}
      {view === 'detail' && selectedAgent &&
      <AgentDetail
        agent={selectedAgent}
        onBack={() => setView('dashboard')}
        onSelectMode={(mode) => setView(mode)} />

      }
      {view === 'mock' && selectedAgent &&
      <MockEngine
        agent={selectedAgent}
        questions={demoQuestions}
        onExit={() => setView('dashboard')} />

      }
      {view === 'quiz' && selectedAgent &&
      <QuizEngine
        agent={selectedAgent}
        questions={demoQuestions}
        onExit={() => setView('dashboard')} />

      }
      {view === 'analysis' && <TraineeAnalysis />}
      {view === 'history' && <TraineeAnalysis />} {/* History is part of analysis for now */}
    </div>);

};