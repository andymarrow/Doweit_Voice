"use client";
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
  Filter } from
'lucide-react';
import { cn } from '../../lib/utils';
import { demoTrainingAgents, demoQuestions } from '../../data/demoData';

import { AgentDetail } from './AgentDetail';
import { MockEngine } from './MockEngine';
import { QuizEngine } from './QuizEngine';
import { TraineeAnalysis } from './TraineeAnalysis';



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
      { label: 'Sessions', value: '48', icon: History, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Avg Score', value: '82%', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total XP', value: '12.4k', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Mastery', value: 'Lvl 12', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agent Training Library */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
              <Award size={20} className="text-emerald-500" />
              Agent Training Library
            </h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                type="text"
                placeholder="Search agents..."
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-black/5 text-xs focus:ring-emerald-500/10 w-48" />
              
              </div>
              <button className="p-2 rounded-xl bg-white border border-black/5 hover:bg-gray-50 transition-colors">
                <Filter size={16} className="text-gray-500" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {demoTrainingAgents.map((agent) =>
          <div
            key={agent.id}
            onClick={() => handleAgentClick(agent)}
            className="group p-5 rounded-3xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden">
            
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={20} className="text-gray-400" />
                </div>
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <img src={agent.avatar} className="w-16 h-16 rounded-2xl object-cover border border-black/5" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-emerald-500 border-2 border-white flex items-center justify-center text-white">
                      <Star size={10} fill="currentColor" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black truncate">{agent.name}</h4>
                      <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest",
                    agent.difficulty === 'Expert' ? "bg-red-50 text-red-600" :
                    agent.difficulty === 'Intermediate' ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                        {agent.difficulty}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{agent.role}</p>
                    <div className="flex items-center gap-3 pt-2">
                      <div className="flex items-center gap-1">
                        <Target size={10} className="text-gray-400" />
                        <span className="text-[10px] font-bold">{agent.avgScore}%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <History size={10} className="text-gray-400" />
                        <span className="text-[10px] font-bold">{agent.sessions} sess.</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="text-emerald-600">{agent.mastery}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${agent.mastery}%` }} />
                
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                onClick={(e) => {e.stopPropagation();setSelectedAgent(agent);setView('mock');}}
                className="py-2 rounded-xl bg-gray-900 text-white text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5">
                
                    <Play size={10} fill="currentColor" />
                    Mock
                  </button>
                  <button
                onClick={(e) => {e.stopPropagation();setSelectedAgent(agent);setView('quiz');}}
                className="py-2 rounded-xl bg-gray-100 text-gray-900 text-[9px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5">
                
                    <HelpCircle size={10} />
                    Quiz
                  </button>
                </div>
              </div>
          )}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          {/* Skill Progress Overview */}
          <div className="p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm space-y-6">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Skill Progress
            </h3>
            <div className="space-y-4">
              {[
            { label: 'Technical', progress: 85, color: 'bg-blue-500' },
            { label: 'Communication', progress: 70, color: 'bg-emerald-500' },
            { label: 'Problem Solving', progress: 90, color: 'bg-purple-500' },
            { label: 'Behavioral', progress: 65, color: 'bg-orange-500' }].
            map((skill, i) =>
            <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">{skill.label}</span>
                    <span>{skill.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                  className={cn("h-full transition-all duration-1000", skill.color)}
                  style={{ width: `${skill.progress}%` }} />
                
                  </div>
                </div>
            )}
            </div>
            <button
            onClick={() => setView('analysis')}
            className="w-full py-3 rounded-xl bg-gray-50 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
            
              Full Analysis
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Recent Training Sessions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <History size={18} className="text-gray-400" />
              Recent Sessions
            </h3>
            <div className="space-y-3">
              {[
            { agent: 'Alex', type: 'Mock', score: 88, date: '2h ago' },
            { agent: 'Sarah', type: 'Quiz', score: 95, date: '5h ago' },
            { agent: 'Viktor', type: 'Mock', score: 72, date: '1d ago' }].
            map((session, i) =>
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-black/5 shadow-sm">
                  <img src={`https://picsum.photos/seed/${session.agent}/100/100`} className="w-10 h-10 rounded-xl" alt="" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{session.agent} • {session.type}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">{session.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-emerald-600">{session.score}%</p>
                  </div>
                </div>
            )}
            </div>
          </div>

          {/* Recommended Training */}
          <div className="p-6 rounded-[2rem] bg-gray-900 text-white space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-16 -mt-16" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <Zap size={16} />
                <h3 className="text-[10px] font-bold uppercase tracking-widest">Recommended</h3>
              </div>
              <p className="text-xs font-bold leading-tight">Improve your System Design skills with Viktor.</p>
              <button className="w-full py-2.5 rounded-xl bg-emerald-600 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors">
                Start Training
              </button>
            </div>
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
