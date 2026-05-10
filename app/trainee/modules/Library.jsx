"use client";
import React, { useState, useMemo } from 'react';
import {
  BookOpen, Search, Star, Clock, HelpCircle, Users,
  Calendar, X, Tag, ChevronRight, Plus, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoTemplates } from './demoData';
import { toast } from 'react-hot-toast';

const CATS = ['All', 'Technical', 'Behavioral', 'Quiz', 'Product'];

const catColor = {
  Technical: 'bg-purple-50 text-purple-700 border border-purple-100',
  Behavioral:'bg-blue-50 text-blue-700 border border-blue-100',
  Quiz:      'bg-indigo-50 text-indigo-700 border border-indigo-100',
  Product:   'bg-violet-50 text-violet-700 border border-violet-100',
};

const diffColor = {
  Easy:   'bg-blue-50 text-blue-600',
  Medium: 'bg-purple-50 text-purple-600',
  Hard:   'bg-indigo-50 text-indigo-700',
};

/* ─── Template Modal ────────────────────────────────────────────── */
const TemplateModal = ({ template, onClose, onUse }) => {
  if (!template) return null;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-base">
              {template.title.charAt(0)}
            </div>
            <div>
              <h2 className="text-white font-black text-sm leading-tight">{template.title}</h2>
              <p className="text-white/70 text-xs">{template.topic}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase', catColor[template.category] || 'bg-gray-50 text-gray-600')}>{template.category}</span>
            <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase', diffColor[template.difficulty])}>{template.difficulty}</span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[10px] font-black border border-gray-100"><Users size={9} /> {template.sessions} used</span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Duration', value: `${template.duration} min` },
              { label: 'Questions', value: template.questionCount },
              { label: 'Agent', value: template.agent },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-[9px] uppercase font-black text-gray-400 tracking-wider mb-1">{label}</p>
                <p className="text-sm font-black text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {template.tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100">
                  <Tag size={8} /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar size={12} />
            <span>Created {fmtDate(template.createdAt)}</span>
          </div>

          <button
            onClick={() => onUse(template)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-sm hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200"
          >
            Use This Template
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── Template Card ─────────────────────────────────────────────── */
const TemplateCard = ({ template, onView }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-200 overflow-hidden flex flex-col">
    <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500" />
    <div className="p-4 flex flex-col flex-1">
      {/* Header */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-purple-200">
          {template.title.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-black text-sm leading-tight truncate group-hover:text-purple-700 transition-colors">{template.title}</h3>
          <p className="text-[10px] text-gray-400 truncate">{template.topic}</p>
        </div>
        <span className={cn('flex-shrink-0 px-2 py-0.5 rounded-full text-[9px] font-black uppercase', catColor[template.category])}>{template.category}</span>
      </div>

      {/* Description */}
      <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">{template.description}</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-50 border border-purple-100">
          <Clock size={11} className="text-purple-500" />
          <div>
            <p className="text-[8px] uppercase font-bold text-purple-400 tracking-wider">Duration</p>
            <p className="text-[11px] font-black text-purple-700">{template.duration} min</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50 border border-blue-100">
          <HelpCircle size={11} className="text-blue-500" />
          <div>
            <p className="text-[8px] uppercase font-bold text-blue-400 tracking-wider">Questions</p>
            <p className="text-[11px] font-black text-blue-700">{template.questionCount}</p>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className={cn('px-2 py-0.5 rounded-lg text-[9px] font-black uppercase', diffColor[template.difficulty])}>{template.difficulty}</span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 ml-auto">
          <Users size={10} /> {template.sessions.toLocaleString()}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3 mt-auto">
        {template.tags.slice(0, 2).map(t => (
          <span key={t} className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-500 text-[9px] font-bold border border-gray-100">{t}</span>
        ))}
        {template.tags.length > 2 && (
          <span className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-400 text-[9px] font-bold">+{template.tags.length - 2}</span>
        )}
      </div>

      <button
        onClick={() => onView(template)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md shadow-purple-200"
      >
        <Eye size={11} /> View Details <ChevronRight size={10} className="opacity-70" />
      </button>
    </div>
  </div>
);

/* ─── Library Page ──────────────────────────────────────────────── */
export const TraineeLibrary = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => demoTemplates.filter(t => {
    const m = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.topic.toLowerCase().includes(search.toLowerCase()) || t.tags.some(g => g.toLowerCase().includes(search.toLowerCase()));
    const c = category === 'All' || t.category === category;
    return m && c;
  }), [search, category]);

  const handleUse = (template) => {
    toast.success(`"${template.title}" template loaded!`);
    setSelected(null);
    onNavigate?.('create');
  };

  const counts = { All: demoTemplates.length };
  CATS.filter(c => c !== 'All').forEach(c => {
    counts[c] = demoTemplates.filter(t => t.category === c).length;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
            <BookOpen size={16} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Session Library</h2>
            <p className="text-xs text-gray-400">Ready-made templates to jump straight into training</p>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200 self-start"
        >
          <Plus size={14} /> Custom Session
        </button>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {CATS.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border',
              category === c
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-md shadow-purple-200'
                : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200 hover:text-purple-600'
            )}
          >
            {c} <span className="opacity-60">({counts[c] ?? 0})</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search templates by title, topic, or tags..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 text-xs transition-all"
        />
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <BookOpen size={28} className="text-purple-500" />
          </div>
          <p className="text-sm font-bold text-gray-500">No templates found</p>
          <button onClick={() => { setSearch(''); setCategory('All'); }} className="mt-2 text-xs text-purple-600 hover:underline">Clear filters</button>
        </div>
      )}

      {/* Cards */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => <TemplateCard key={t.id} template={t} onView={setSelected} />)}
        </div>
      )}

      {selected && <TemplateModal template={selected} onClose={() => setSelected(null)} onUse={handleUse} />}
    </div>
  );
};
