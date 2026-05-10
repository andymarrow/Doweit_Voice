import React from 'react';
import {
  ChevronLeft,
  Star,
  Target,
  Trophy,
  Zap,
  Play,
  HelpCircle,
  Clock,
  MessageSquare,
  BarChart3,

  ArrowRight } from
'lucide-react';

import { cn } from '@/lib/utils';







export const AgentDetail = ({ agent, onBack, onSelectMode }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
        
        <ChevronLeft size={16} />
        Back to Gym
      </button>

      {/* Agent Overview Card */}
      <div className="p-8 rounded-[2rem] bg-white border border-black/5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -mr-48 -mt-48" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="relative shrink-0">
            <img src={agent.avatar} className="w-32 h-32 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl" alt="" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
              <Star size={20} className="fill-current" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-3xl font-black tracking-tight">{agent.name}</h2>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  agent.difficulty === 'Expert' ? "bg-red-50 text-red-600" :
                  agent.difficulty === 'Intermediate' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {agent.difficulty}
                </span>
              </div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{agent.role}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
              { label: 'Sessions', value: agent.sessions, icon: MessageSquare },
              { label: 'Avg Score', value: `${agent.avgScore}%`, icon: Target },
              { label: 'Mastery', value: `${agent.mastery}%`, icon: Trophy },
              { label: 'XP Multiplier', value: '1.5x', icon: Zap }].
              map((stat, i) =>
              <div key={i} className="p-3 rounded-2xl bg-gray-50/50 border border-black/5">
                  <div className="flex items-center gap-1.5 mb-1 justify-center md:justify-start">
                    <stat.icon size={12} className="text-gray-400" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-lg font-black tracking-tight">{stat.value}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                <span className="text-muted-foreground">Mastery Progress</span>
                <span className="text-emerald-600">{agent.mastery}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-1000"
                  style={{ width: `${agent.mastery}%` }} />
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Mode Selection */}
      <div className="space-y-6">
        <h3 className="text-lg font-black tracking-tight">Select Training Mode</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mock Interview Card */}
          <button
            onClick={() => onSelectMode('mock')}
            className="group p-8 rounded-[2.5rem] bg-gray-900 text-white border border-white/5 shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] -mr-32 -mt-32 group-hover:bg-blue-500/20 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Play size={32} fill="currentColor" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight mb-2">Mock Interview</h4>
                <p className="text-sm text-gray-400 leading-relaxed">Real-time AI interview simulation with voice interaction and follow-up questions.</p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">~30 mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-orange-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">+500 XP</span>
                </div>
                <div className="ml-auto p-2 rounded-xl bg-white/10 group-hover:bg-blue-500 transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </button>

          {/* Quiz Mode Card */}
          <button
            onClick={() => onSelectMode('quiz')}
            className="group p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-left relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-colors" />
            <div className="relative z-10 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                <HelpCircle size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight mb-2 text-gray-900">Quiz Mode</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">Knowledge and concept testing with instant feedback and AI explanations.</p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-black/5">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">~15 mins</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-orange-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500">+200 XP</span>
                </div>
                <div className="ml-auto p-2 rounded-xl bg-gray-900 text-white group-hover:bg-emerald-600 transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity for this Agent */}
      <div className="p-8 rounded-[2rem] bg-gray-50 border border-black/5 space-y-6">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <BarChart3 size={18} className="text-gray-400" />
          Recent Performance with {agent.name}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
          { date: 'Mar 14', type: 'Mock', score: 88, xp: 250 },
          { date: 'Mar 12', type: 'Quiz', score: 92, xp: 120 },
          { date: 'Mar 10', type: 'Mock', score: 75, xp: 180 }].
          map((session, i) =>
          <div key={i} className="p-4 rounded-2xl bg-white border border-black/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{session.date} • {session.type}</p>
                <p className="text-sm font-black">{session.score}%</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">+{session.xp} XP</p>
                <button className="text-[10px] font-bold text-gray-400 hover:text-gray-900 transition-colors">Details</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

};