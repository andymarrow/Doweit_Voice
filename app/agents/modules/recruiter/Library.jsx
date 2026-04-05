"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  Filter,
  Plus,

  MessageSquare,
  Code,
  Briefcase,
  Star,
  Copy,

  X,

  Clock,
  Target,
  Zap,
  ChevronRight,

  Save,

  HelpCircle,

  Shield,
  Globe,
  Smile,
  AlertCircle,

  TrendingUp,

  BarChart3,
  Cpu } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// --- Data Models ---























































// --- Mock Data ---

const MOCK_TEMPLATES = [
{
  id: 'tpl_react_sr',
  title: 'Senior React Engineer',
  category: 'Technical',
  description: 'Advanced assessment for senior frontend roles. Focuses on architectural patterns, performance optimization, and complex state management scenarios.',
  rating: 4.9,
  usageCount: 1240,
  difficulty: 'Senior',
  duration: 45,
  questionCount: 12,
  language: 'English',
  price: 150,
  isFree: false,
  tags: ['React', 'TypeScript', 'Frontend', 'Architecture'],
  version: '2.4.0',
  lastUpdated: '2024-03-15',
  performance: {
    completionRate: 92,
    avgCandidateScore: 74,
    hiringAccuracy: 88
  },
  questions: [
  {
    id: 'q1',
    text: 'Explain the internal reconciliation process in React 18 and how Concurrent Mode changes rendering priorities.',
    type: 'technical',
    difficulty: 'hard',
    expectedAnswer: 'Should mention Fiber architecture, lanes, and how React can interrupt rendering to handle high-priority updates.',
    evaluationCriteria: ['Deep understanding of React internals', 'Clarity of explanation', 'Mention of Fiber/Lanes'],
    followUpLogic: 'If they mention Fiber, ask about the difference between the current and work-in-progress trees.'
  }],

  evaluation: [
  {
    id: 'ec1',
    name: 'Technical Depth',
    weight: 40,
    scoringType: '1-10',
    aiInstruction: 'Evaluate the candidate\'s understanding of underlying principles, not just syntax.'
  }],

  agent: {
    persona: 'Alex - Senior Architect',
    voiceModel: 'en-US-Standard-C',
    tone: 'formal',
    interviewStyle: 'stress-test',
    language: 'English',
    followUpStrategy: 'aggressive'
  },
  rawConfig: {
    engine: 'gemini-1.5-pro',
    temperature: 0.7,
    max_tokens: 2048
  }
},
{
  id: 'tpl_pm_lead',
  title: 'Lead Product Manager',
  category: 'Leadership',
  description: 'Evaluates strategic thinking, roadmap prioritization, and stakeholder management skills for product leadership roles.',
  rating: 4.8,
  usageCount: 850,
  difficulty: 'Expert',
  duration: 60,
  questionCount: 8,
  language: 'English',
  price: 0,
  isFree: true,
  tags: ['Product', 'Strategy', 'Leadership', 'Roadmap'],
  version: '1.2.1',
  lastUpdated: '2024-02-28',
  performance: {
    completionRate: 85,
    avgCandidateScore: 68,
    hiringAccuracy: 91
  },
  questions: [],
  evaluation: [],
  agent: {
    persona: 'Sarah - Head of Product',
    voiceModel: 'en-GB-Standard-A',
    tone: 'friendly',
    interviewStyle: 'conversational',
    language: 'English',
    followUpStrategy: 'moderate'
  },
  rawConfig: {}
},
{
  id: 'tpl_sys_design',
  title: 'System Design Fundamentals',
  category: 'Technical',
  description: 'Foundational system design concepts including load balancing, caching strategies, and database sharding.',
  rating: 4.7,
  usageCount: 3200,
  difficulty: 'Mid',
  duration: 40,
  questionCount: 10,
  language: 'English',
  price: 75,
  isFree: false,
  tags: ['Backend', 'System Design', 'Scalability'],
  version: '3.0.0',
  lastUpdated: '2024-03-10',
  performance: {
    completionRate: 95,
    avgCandidateScore: 71,
    hiringAccuracy: 84
  },
  questions: [],
  evaluation: [],
  agent: {
    persona: 'Viktor - Staff Engineer',
    voiceModel: 'en-US-Standard-D',
    tone: 'strict',
    interviewStyle: 'structured',
    language: 'English',
    followUpStrategy: 'minimal'
  },
  rawConfig: {}
}];


// --- Components ---

const TemplateCard =




({ template, onPreview, onUse, isOwned }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onPreview(template)}
      className="group p-5 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">
      
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner",
          template.category === 'Technical' ? "bg-blue-50 text-blue-600" :
          template.category === 'Leadership' ? "bg-purple-50 text-purple-600" :
          "bg-emerald-50 text-emerald-600"
        )}>
          {template.category === 'Technical' ? <Code size={24} /> :
          template.category === 'Leadership' ? <Briefcase size={24} /> :
          <MessageSquare size={24} />}
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold">{template.rating}</span>
          </div>
          <span className={cn(
            "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest",
            template.difficulty === 'Senior' || template.difficulty === 'Expert' ? "bg-red-50 text-red-600" :
            template.difficulty === 'Mid' ? "bg-orange-50 text-orange-600" :
            "bg-emerald-50 text-emerald-600"
          )}>
            {template.difficulty}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-sm font-black tracking-tight group-hover:text-emerald-600 transition-colors">{template.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-2 py-0.5 bg-gray-50 rounded border border-black/5">{template.category}</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{template.language}</span>
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{template.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-2 my-5">
        <div className="p-2 rounded-xl bg-gray-50 border border-black/5 flex items-center gap-2">
          <HelpCircle size={12} className="text-gray-400" />
          <div>
            <p className="text-[7px] uppercase font-bold text-muted-foreground tracking-wider">Questions</p>
            <p className="text-[10px] font-bold">{template.questionCount}</p>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-gray-50 border border-black/5 flex items-center gap-2">
          <Clock size={12} className="text-gray-400" />
          <div>
            <p className="text-[7px] uppercase font-bold text-muted-foreground tracking-wider">Duration</p>
            <p className="text-[10px] font-bold">{template.duration}m</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-muted-foreground">{template.usageCount.toLocaleString()} uses</span>
          {template.isFree ?
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Free</span> :
          isOwned ?
          <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Owned</span> :

          <div className="flex items-center gap-1 text-yellow-600">
              <Zap size={10} className="fill-yellow-600" />
              <span className="text-[10px] font-black uppercase tracking-widest">{template.price}</span>
            </div>
          }
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onPreview(template)}
            className="p-2 rounded-xl border border-black/5 hover:bg-gray-50 transition-all">
            
            <Search size={14} className="text-gray-400" />
          </button>
          <button
            onClick={() => onUse(template)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold transition-all shadow-lg",
              template.isFree || isOwned ?
              "bg-gray-900 text-white hover:bg-black shadow-black/10" :
              "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/20"
            )}>
            
            {template.isFree || isOwned ? <Copy size={12} /> : <Shield size={12} />}
            {template.isFree || isOwned ? 'Use Template' : 'Unlock'}
          </button>
        </div>
      </div>
    </motion.div>);

};

const TemplatePreviewModal =




({ template, onClose, onUse, isOwned }) => {
  const [activeTab, setActiveTab] = useState('questions');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl h-[90vh] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white shadow-sm border border-black/5">
              <BookOpen size={24} className="text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">{template.title}</h3>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-[8px] font-bold text-gray-500 uppercase tracking-widest">v{template.version}</span>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{template.category} • Professional Template</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-gray-900">
            
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Template Info & Metrics */}
          <div className="w-80 border-r border-black/5 bg-gray-50/30 p-6 overflow-y-auto no-scrollbar space-y-8">
            {/* Info Card */}
            <div className="p-5 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Difficulty</p>
                <p className="text-sm font-black text-gray-900">{template.difficulty}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <p className="text-sm font-black">{template.rating}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Users</p>
                  <p className="text-sm font-black">{template.usageCount.toLocaleString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Duration</p>
                  <p className="text-sm font-black">{template.duration}m</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Questions</p>
                  <p className="text-sm font-black">{template.questionCount}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</h4>
              <p className={cn(
                "text-xs text-gray-600 leading-relaxed transition-all",
                !isDescriptionExpanded && "line-clamp-3"
              )}>
                {template.description}
              </p>
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-[10px] font-bold text-emerald-600 hover:underline">
                
                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
              </button>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Skills & Tools</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) =>
                <span key={tag} className="px-2 py-1 rounded-lg bg-white border border-black/5 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    {tag}
                  </span>
                )}
              </div>
            </div>

            {/* Performance Insights */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Performance Insights</h4>
              <div className="space-y-3">
                {[
                { label: 'Avg Candidate Score', value: template.performance.avgCandidateScore, icon: Target, color: 'text-emerald-600' },
                { label: 'Completion Rate', value: template.performance.completionRate, icon: TrendingUp, color: 'text-blue-600' },
                { label: 'Drop-off Rate', value: 100 - template.performance.completionRate, icon: BarChart3, color: 'text-red-600' }].
                map((stat, i) =>
                <div key={i} className="p-3 rounded-2xl bg-white border border-black/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon size={14} className={stat.color} />
                      <span className="text-xs font-black">{stat.value}%</span>
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Tabs */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 border-b border-black/5 flex gap-8">
              {[
              { id: 'questions', label: 'Questions', icon: HelpCircle },
              { id: 'evaluation', label: 'Evaluation', icon: Target },
              { id: 'agent', label: 'Agent Config', icon: Cpu },
              { id: 'raw', label: 'Code View', icon: Code }].
              map((tab) =>
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "py-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 transition-all",
                  activeTab === tab.id ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-400 hover:text-gray-600"
                )}>
                
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 no-scrollbar bg-gray-50/20">
              <AnimatePresence mode="wait">
                {activeTab === 'questions' &&
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4">
                  
                    {template.questions.map((q, i) =>
                  <QuestionCard key={q.id} question={q} index={i} />
                  )}
                  </motion.div>
                }

                {activeTab === 'evaluation' &&
                <motion.div
                  key="evaluation"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-4">
                  
                    {template.evaluation.map((c) =>
                  <div key={c.id} className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-black">{c.name}</h5>
                          <span className="text-xs font-black text-emerald-600">{c.weight}% Weight</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="px-2 py-1 rounded-lg bg-gray-50 text-[9px] font-bold text-gray-500 uppercase tracking-widest border border-black/5">
                            Scoring: {c.scoringType}
                          </div>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50/50 border border-black/5">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">AI Instruction</p>
                          <p className="text-[11px] text-gray-600 leading-relaxed">{c.aiInstruction}</p>
                        </div>
                      </div>
                  )}
                  </motion.div>
                }

                {activeTab === 'agent' &&
                <motion.div
                  key="agent"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="grid grid-cols-1 gap-6">
                  
                    <div className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border border-black/5">
                          <img src={`https://picsum.photos/seed/${template.agent.persona}/200/200`} alt="" />
                        </div>
                        <div>
                          <h5 className="text-base font-black">{template.agent.persona}</h5>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Persona</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                      { label: 'Voice Model', value: template.agent.voiceModel, icon: Globe },
                      { label: 'Tone', value: template.agent.tone, icon: Smile },
                      { label: 'Interview Style', value: template.agent.interviewStyle, icon: Target },
                      { label: 'Language', value: template.agent.language, icon: Globe }].
                      map((item, i) =>
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-black/5">
                            <div className="flex items-center gap-2">
                              <item.icon size={14} className="text-gray-400" />
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                            </div>
                            <span className="text-xs font-black capitalize">{item.value}</span>
                          </div>
                      )}
                      </div>
                    </div>
                  </motion.div>
                }

                {activeTab === 'raw' &&
                <motion.div
                  key="raw"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="h-full">
                  
                    <div className="h-full p-6 rounded-3xl bg-gray-900 text-emerald-400 font-mono text-[11px] overflow-auto shadow-inner relative group">
                      <button className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all opacity-0 group-hover:opacity-100">
                        <Copy size={14} />
                      </button>
                      <pre>{JSON.stringify(template, null, 2)}</pre>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 bg-gray-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-black/5 text-xs font-bold hover:bg-white transition-all">
            
            Cancel
          </button>
          <button className="px-6 py-2.5 rounded-xl border border-black/5 text-xs font-bold hover:bg-white transition-all flex items-center gap-2">
            <Save size={14} />
            Save Template
          </button>
          <button
            onClick={() => onUse(template)}
            className={cn(
              "px-8 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2",
              template.isFree || isOwned ?
              "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20" :
              "bg-yellow-500 text-white hover:bg-yellow-600 shadow-yellow-500/20"
            )}>
            
            {template.isFree || isOwned ? <Copy size={16} /> : <Shield size={16} />}
            {template.isFree || isOwned ? 'Use This Template' : `Buy & Use Template`}
          </button>
        </div>
      </motion.div>
    </div>);

};

const QuestionCard = ({ question, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="p-5 rounded-2xl bg-white border border-black/5 shadow-sm space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">{index + 1}</span>
          <span className={cn(
            "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
            question.type === 'technical' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
          )}>
            {question.type}
          </span>
        </div>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-widest",
          question.difficulty === 'hard' ? "text-red-500" : "text-emerald-500"
        )}>
          {question.difficulty}
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-bold leading-relaxed flex-1">{question.text}</p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg hover:bg-gray-50 text-gray-400 transition-all">
          
          <ChevronRight size={16} className={cn("transition-transform", isExpanded && "rotate-90")} />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded &&
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden">
          
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
              <div>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Expected Answer</p>
                <p className="text-[11px] text-gray-500 italic leading-relaxed">{question.expectedAnswer}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Evaluation Mapping</p>
                  <div className="flex flex-wrap gap-1.5">
                    {question.evaluationCriteria.map((c) =>
                  <span key={c} className="px-1.5 py-0.5 rounded bg-gray-50 text-[9px] font-medium text-gray-600">{c}</span>
                  )}
                  </div>
                </div>
                {question.followUpLogic &&
              <div>
                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-2">Follow-up Logic</p>
                    <p className="text-[11px] text-gray-500 leading-relaxed">{question.followUpLogic}</p>
                  </div>
              }
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

};

const PurchaseModal =




({ template, balance, onClose, onConfirm }) => {
  const isInsufficient = balance < template.price;

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-yellow-50 text-yellow-500 flex items-center justify-center mx-auto shadow-inner">
            <Shield size={40} />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight">Unlock Template</h3>
            <p className="text-xs text-muted-foreground">You are about to unlock the <span className="font-bold text-gray-900">"{template.title}"</span> enterprise template.</p>
          </div>

          <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Balance</span>
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-black">{balance}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Template Price</span>
              <div className="flex items-center gap-1.5 text-red-500">
                <span className="text-sm font-black">- {template.price}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-black/5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Remaining</span>
              <div className={cn(
                "flex items-center gap-1.5",
                isInsufficient ? "text-red-500" : "text-emerald-600"
              )}>
                <Zap size={14} className={cn(isInsufficient ? "text-red-500" : "text-emerald-600", "fill-current")} />
                <span className="text-sm font-black">{balance - template.price}</span>
              </div>
            </div>
          </div>

          {isInsufficient &&
          <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3 text-left">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-[10px] font-bold text-red-700 leading-relaxed">
                Insufficient tokens. Please top up your balance to unlock this template.
              </p>
            </div>
          }

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isInsufficient}
              className={cn(
                "w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl",
                isInsufficient ?
                "bg-gray-100 text-gray-400 cursor-not-allowed" :
                "bg-gray-900 text-white hover:bg-black shadow-black/20"
              )}>
              
              Confirm Purchase
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition-all">
              
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </div>);

};

// --- Main Library Component ---

export const Library = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Categories');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [purchasingTemplate, setPurchasingTemplate] = useState(null);
  const [userTokens, setUserTokens] = useState(2500);
  const [purchasedIds, setPurchasedIds] = useState(['tpl_sys_design']);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredTemplates = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      const matchesSearch =
      t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(debouncedSearch.toLowerCase()));
      const matchesCategory = activeCategory === 'All Categories' || t.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [debouncedSearch, activeCategory]);

  const handleUseTemplate = (template) => {
    if (template.isFree || purchasedIds.includes(template.id)) {
      // Redirect to create interview with template ID
      router.push(`/?module=recruiter&section=create&templateId=${template.id}`);
    } else {
      setPurchasingTemplate(template);
    }
  };

  const handleConfirmPurchase = () => {
    if (!purchasingTemplate) return;

    // Simulate API call
    setUserTokens((prev) => prev - purchasingTemplate.price);
    setPurchasedIds((prev) => [...prev, purchasingTemplate.id]);

    // Success flow
    const templateId = purchasingTemplate.id;
    setPurchasingTemplate(null);
    setSelectedTemplate(null);

    // Redirect
    setTimeout(() => {
      router.push(`/?module=recruiter&section=create&templateId=${templateId}`);
    }, 500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <BookOpen size={18} />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Template Library</h2>
          </div>
          <p className="text-xs text-muted-foreground max-w-md">
            Accelerate your hiring with verified interview structures used by top engineering teams globally.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-2xl bg-white border border-black/5 shadow-sm flex items-center gap-3">
            <div className="flex flex-col items-end">
              <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Your Balance</p>
              <p className="text-sm font-black">{userTokens.toLocaleString()}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <Zap size={18} className="fill-yellow-500" />
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
            <Plus size={16} />
            Create Custom
          </button>
        </div>
      </div>

      {/* Advanced Search & Filters */}
      <div className="p-4 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, skill, or keyword (e.g. 'React', 'Backend', 'Senior')..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500/20 focus:ring-4 focus:ring-emerald-500/5 transition-all text-xs font-medium" />
            
          </div>
          <div className="flex gap-2">
            <div className="flex p-1 rounded-2xl bg-gray-50 border border-black/5">
              {['All Categories', 'Technical', 'Leadership', 'Soft Skills'].map((cat) =>
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeCategory === cat ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-gray-600"
                )}>
                
                  {cat}
                </button>
              )}
            </div>
            <button className="p-3.5 rounded-2xl border border-black/5 bg-white hover:bg-gray-50 transition-all text-gray-500">
              <Filter size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      {isLoading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) =>
        <div key={i} className="h-80 rounded-3xl bg-white border border-black/5 animate-pulse flex flex-col p-6 space-y-4">
              <div className="flex justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gray-100" />
                <div className="w-16 h-4 rounded bg-gray-100" />
              </div>
              <div className="space-y-2">
                <div className="w-3/4 h-6 rounded bg-gray-100" />
                <div className="w-1/2 h-4 rounded bg-gray-100" />
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl" />
              <div className="h-10 rounded-2xl bg-gray-100" />
            </div>
        )}
        </div> :
      filteredTemplates.length > 0 ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) =>
        <TemplateCard
          key={template.id}
          template={template}
          onPreview={setSelectedTemplate}
          onUse={handleUseTemplate}
          isOwned={purchasedIds.includes(template.id)} />

        )}
        </div> :

      <div className="h-96 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Search size={40} />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">No templates found</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
              We couldn't find any templates matching your current search or filters.
            </p>
          </div>
          <button
          onClick={() => {setSearchQuery('');setActiveCategory('All Categories');}}
          className="px-6 py-2.5 rounded-xl border border-black/5 text-xs font-bold hover:bg-white transition-all">
          
            Clear all filters
          </button>
        </div>
      }

      {/* Modals */}
      <AnimatePresence>
        {selectedTemplate &&
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUse={handleUseTemplate}
          isOwned={purchasedIds.includes(selectedTemplate.id)} />

        }
        {purchasingTemplate &&
        <PurchaseModal
          template={purchasingTemplate}
          balance={userTokens}
          onClose={() => setPurchasingTemplate(null)}
          onConfirm={handleConfirmPurchase} />

        }
      </AnimatePresence>
    </div>);

};
