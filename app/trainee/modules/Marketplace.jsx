"use client";
import React, { useState, useMemo } from 'react';
import {
  ShoppingBag, Search, Star, Clock, Users, Zap, ChevronRight,
  X, Mic, Brain, BookOpen, Code, Globe, Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoAgents } from './demoData';
import { toast } from 'react-hot-toast';

const CATEGORIES = ['All', 'Technical', 'Behavioral', 'Quiz', 'Product'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const catIcon = (c) => {
  if (c === 'Technical') return Code;
  if (c === 'Behavioral') return Brain;
  if (c === 'Quiz') return BookOpen;
  if (c === 'Product') return Globe;
  return Mic;
};

const diffColor = {
  Easy:   'bg-blue-50 text-blue-600 border border-blue-100',
  Medium: 'bg-purple-50 text-purple-600 border border-purple-100',
  Hard:   'bg-indigo-50 text-indigo-700 border border-indigo-100',
};

/* ─── Agent Detail Modal ────────────────────────────────────────── */
const AgentModal = ({ agent, onClose, onStart }) => {
  if (!agent) return null;
  const Icon = catIcon(agent.category);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className={cn('bg-gradient-to-r px-6 py-5 rounded-t-2xl flex items-start justify-between', agent.color)}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-xl shadow-md">
              {agent.avatar}
            </div>
            <div>
              <h2 className="text-white font-black text-base">{agent.name}</h2>
              <p className="text-white/80 text-xs">{agent.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">{agent.description}</p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Rating', value: `${agent.rating}/5` },
              { label: 'Sessions', value: agent.sessions.toLocaleString() },
              { label: 'Cost', value: `${agent.tokenCost} tokens` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider mb-1">{label}</p>
                <p className="text-sm font-black text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase', diffColor[agent.difficulty])}>
              {agent.difficulty}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[10px] font-black uppercase border border-gray-100">
              <Clock size={9} /> {agent.duration}
            </span>
            {agent.specialties.map(sp => (
              <span key={sp} className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black border border-purple-100">{sp}</span>
            ))}
          </div>

          <button
            onClick={() => onStart(agent)}
            className={cn('w-full py-3 rounded-xl bg-gradient-to-r text-white font-black text-sm hover:opacity-90 transition-all shadow-lg', agent.color)}
          >
            Start Session — {agent.tokenCost} Tokens
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Agent Card ────────────────────────────────────────────────── */
const AgentCard = ({ agent, onView }) => {
  const Icon = catIcon(agent.category);
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-200 overflow-hidden flex flex-col">
      <div className={cn('h-1.5 w-full bg-gradient-to-r', agent.color)} />
      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={cn('w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-black text-base flex-shrink-0 shadow-md', agent.color)}>
            {agent.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm group-hover:text-purple-700 transition-colors">{agent.name}</h3>
              {agent.featured && (
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200">
                  ⭐ Featured
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 truncate">{agent.title}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{agent.description}</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1 mb-3">
          {agent.specialties.slice(0, 2).map(sp => (
            <span key={sp} className="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-600 text-[9px] font-bold border border-purple-100">{sp}</span>
          ))}
          {agent.specialties.length > 2 && (
            <span className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-500 text-[9px] font-bold">+{agent.specialties.length - 2}</span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3 mt-auto">
          <span className="flex items-center gap-1"><Star size={10} className="text-yellow-400" fill="currentColor" /> {agent.rating}</span>
          <span className="flex items-center gap-1"><Users size={10} /> {agent.sessions.toLocaleString()}</span>
          <span className="flex items-center gap-1"><Clock size={10} /> {agent.duration}</span>
          <span className={cn('ml-auto px-2 py-0.5 rounded-lg text-[9px] font-black uppercase', diffColor[agent.difficulty])}>{agent.difficulty}</span>
        </div>

        {/* Cost + CTA */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1 text-xs font-black text-purple-600">
            <Zap size={12} fill="currentColor" /> {agent.tokenCost}
            <span className="text-[9px] font-bold text-gray-400">tokens</span>
          </div>
          <button
            onClick={() => onView(agent)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md shadow-purple-200"
          >
            View Agent <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Marketplace Page ──────────────────────────────────────────── */
export const TraineeMarketplace = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => demoAgents.filter(a => {
    const m = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.title.toLowerCase().includes(search.toLowerCase()) || a.specialties.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const c = category === 'All' || a.category === category;
    const d = difficulty === 'All' || a.difficulty === difficulty;
    return m && c && d;
  }), [search, category, difficulty]);

  const handleStart = (agent) => {
    toast.success(`Starting session with ${agent.name}!`);
    setSelected(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <ShoppingBag size={16} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Agent Marketplace</h2>
            <p className="text-xs text-gray-400">Discover AI coaches tailored to your goals</p>
          </div>
        </div>
      </div>

      {/* Featured banner */}
      {demoAgents.filter(a => a.featured).length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">⭐ Featured Agent</p>
              <h3 className="text-xl font-black mb-1">{demoAgents.find(a => a.featured)?.name} — {demoAgents.find(a => a.featured)?.title}</h3>
              <p className="text-white/80 text-xs max-w-md">{demoAgents.find(a => a.featured)?.description?.slice(0, 100)}...</p>
            </div>
            <button
              onClick={() => setSelected(demoAgents.find(a => a.featured))}
              className="flex-shrink-0 px-5 py-2.5 rounded-xl bg-white text-purple-700 text-xs font-black hover:bg-white/90 transition-all shadow-lg"
            >
              Try Now
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search agents by name or specialty..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20">
            {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span><span className="font-black text-gray-700">{filtered.length}</span> agents found</span>
        {CATEGORIES.filter(c => c !== 'All').map(c => (
          <span key={c}><span className="font-black text-gray-600">{demoAgents.filter(a => a.category === c).length}</span> {c}</span>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-bold text-gray-500">No agents found</p>
          <button onClick={() => { setSearch(''); setCategory('All'); setDifficulty('All'); }} className="mt-2 text-xs text-purple-600 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(a => <AgentCard key={a.id} agent={a} onView={setSelected} />)}
        </div>
      )}

      {selected && <AgentModal agent={selected} onClose={() => setSelected(null)} onStart={handleStart} />}
    </div>
  );
};
