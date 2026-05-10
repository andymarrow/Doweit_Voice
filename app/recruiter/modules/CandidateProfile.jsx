import React from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  Zap,
  FileText,
  MessageSquare,
  AlertCircle } from
'lucide-react';
import { cn } from '@/lib/utils';







export const CandidateProfile = ({ candidate, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-xl h-full max-h-[90vh] bg-white shadow-2xl rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-black/5 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-gray-900 border border-transparent hover:border-black/5">
              
              <ArrowLeft size={18} />
            </button>
            <div>
              <h3 className="text-base font-black tracking-tight">{candidate.name}</h3>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Candidate Profile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-all shadow-lg shadow-black/10">
              Download Report
            </button>
            <button className="p-2 rounded-xl border border-black/5 hover:bg-white transition-all">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-0.5">
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Fit Score</p>
              <h4 className="text-lg font-black text-emerald-900">{candidate.fitScore}%</h4>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-center space-y-0.5">
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Confidence</p>
              <h4 className="text-lg font-black text-blue-900">{candidate.confidenceScore}%</h4>
            </div>
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100 text-center space-y-0.5">
              <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest">Duration</p>
              <h4 className="text-lg font-black text-purple-900">{candidate.duration}</h4>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText size={14} className="text-emerald-600" />
                Contact Information
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-black/5">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm">
                    <Mail size={14} className="text-gray-400" />
                  </div>
                  <span className="font-semibold text-gray-700">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-black/5">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm">
                    <Phone size={14} className="text-gray-400" />
                  </div>
                  <span className="font-semibold text-gray-700">{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs p-3 rounded-xl bg-gray-50 border border-black/5">
                  <div className="p-1.5 rounded-lg bg-white shadow-sm">
                    <Calendar size={14} className="text-gray-400" />
                  </div>
                  <span className="font-semibold text-gray-700">Applied on {candidate.date}</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Shield size={14} className="text-emerald-600" />
                Integrity Check
              </h4>
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-emerald-900">No Cheating Detected</p>
                  <p className="text-[8px] text-emerald-700 mt-0.5">Tab switching: 0 | AI Voice: 0</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Evaluation */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Zap size={14} className="text-emerald-600" />
              AI Evaluation Summary
            </h4>
            <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-4">
              <p className="text-[11px] leading-relaxed text-gray-600 italic font-medium">
                "Sarah demonstrated exceptional proficiency in React and System Design. Her answers were structured, technical, and showed deep understanding of state management. She is highly recommended for the Senior role."
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600">Strengths</p>
                  <ul className="space-y-1.5">
                    {['Technical Depth', 'Communication', 'Problem Solving'].map((s) =>
                    <li key={s} className="text-[10px] flex items-center gap-2 text-emerald-700 font-semibold">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                          <CheckCircle2 size={10} />
                        </div>
                        {s}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-3">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-orange-600">Weaknesses</p>
                  <ul className="space-y-1.5">
                    {['Testing Experience'].map((w) =>
                    <li key={w} className="text-[10px] flex items-center gap-2 text-orange-700 font-semibold">
                        <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                          <AlertCircle size={10} />
                        </div>
                        {w}
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Preview */}
          <div className="space-y-4 pb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare size={14} className="text-emerald-600" />
              Interview Transcript
            </h4>
            <div className="space-y-4">
              {[
              { speaker: 'Viktor (AI)', text: 'Can you explain how you handle state management in large React apps?' },
              { speaker: 'Sarah', text: 'In large applications, I typically use a combination of Context API for global UI state and something like TanStack Query for server state. If the complexity grows, I might introduce Redux Toolkit or Zustand...' }].
              map((msg, i) =>
              <div key={i} className={cn(
                "p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm",
                msg.speaker.includes('AI') ?
                "bg-white border border-black/5" :
                "bg-emerald-50 border border-emerald-100 ml-6"
              )}>
                  <p className="font-black mb-1 text-[9px] uppercase tracking-widest text-gray-400">{msg.speaker}</p>
                  <p className="font-medium text-gray-700">{msg.text}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

};