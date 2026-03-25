import React from 'react';
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
  Zap } from
'lucide-react';
import { cn } from '../../lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';

const volumeData = [
{ name: 'Mon', count: 12 },
{ name: 'Tue', count: 18 },
{ name: 'Wed', count: 15 },
{ name: 'Thu', count: 25 },
{ name: 'Fri', count: 32 },
{ name: 'Sat', count: 10 },
{ name: 'Sun', count: 8 }];


const qualityData = [
{ name: 'Frontend', score: 82 },
{ name: 'Backend', score: 75 },
{ name: 'Mobile', score: 88 },
{ name: 'DevOps', score: 70 },
{ name: 'Design', score: 92 }];






export const RecruiterDashboard = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Recruiter Dashboard</h2>
          <p className="text-xs text-muted-foreground">Welcome back! Here's what's happening with your interviews.</p>
        </div>
        <button
          onClick={() => onNavigate?.('create')}
          className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
          
          <Plus size={16} />
          Create New Interview
        </button>
      </div>

      {/* Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
        { label: 'Total Interviews', value: '12', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+2' },
        { label: 'Total Candidates', value: '458', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12%' },
        { label: 'Avg. Fit Score', value: '74%', icon: Target, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+3%' },
        { label: 'Tokens Left', value: '2,450', icon: Coins, color: 'text-purple-600', bg: 'bg-purple-50', trend: '-150' },
        { label: 'Active Agents', value: '8', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50', trend: 'Stable' },
        { label: 'Marketplace Sales', value: '$1,240', icon: ShoppingBag, color: 'text-pink-600', bg: 'bg-pink-50', trend: '+$240' }].
        map((stat, i) =>
        <div key={i} className="p-3 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-2 rounded-xl group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                <stat.icon size={14} />
              </div>
              <span className={cn(
              "text-[8px] font-bold px-1.5 py-0.5 rounded-full",
              stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" :
              stat.trend.startsWith('-') ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
            )}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
            <h3 className="text-base font-black tracking-tight">{stat.value}</h3>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                  
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
            <h3 className="text-sm font-bold mb-6">Candidate Quality Trend</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={qualityData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                  
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm h-full">
            <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
              <Clock size={16} className="text-orange-600" />
              Recent Activity
            </h3>
            <div className="space-y-6">
              {[
              { type: 'INTERVIEW COMPLETED', user: 'Sarah Johnson', time: '12m ago', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { type: 'NEW CANDIDATE', user: 'Michael Chen', time: '45m ago', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
              { type: 'AGENT PUBLISHED', user: 'Viktor Agent', time: '2h ago', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { type: 'TOKENS ADDED', user: 'Wallet', time: '5h ago', icon: Coins, color: 'text-purple-600', bg: 'bg-purple-50' },
              { type: 'CHEATING DETECTED', user: 'Anonymous', time: '1d ago', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' }].
              map((activity, i) =>
              <div key={i} className="flex gap-3 group cursor-pointer">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", activity.bg, activity.color)}>
                    <activity.icon size={14} />
                  </div>
                  <div className="flex-1 border-b border-gray-50 pb-4 group-last:border-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{activity.type}</p>
                      <span className="text-[9px] text-gray-400">{activity.time}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-900">{activity.user}</p>
                  </div>
                </div>
              )}
            </div>
            <button className="w-full mt-4 py-2 rounded-xl bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-colors">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>);

};