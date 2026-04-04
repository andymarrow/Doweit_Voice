import React from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,



  ExternalLink,
  MoreVertical,
  Clock } from
'lucide-react';
import { demoInterviews } from '../../data/demoData';
import { cn } from '../../lib/utils';






export const MyInterviews = ({ onSelectInterview }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Interviews</h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors">
          <Plus size={16} />
          Create New
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        { label: 'Active', value: '12', color: 'text-emerald-600' },
        { label: 'Closed', value: '28', color: 'text-gray-600' },
        { label: 'Candidates', value: '1,432', color: 'text-blue-600' },
        { label: 'Avg. Score', value: '74%', color: 'text-indigo-600' }].
        map((stat, i) =>
        <div key={i} className="p-4 rounded-xl bg-white border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{stat.label}</p>
            <h3 className={cn("text-lg font-bold", stat.color)}>{stat.value}</h3>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search interviews..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-xs" />
          
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-lg border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-bold text-[10px] uppercase tracking-wider">
            <option>All Status</option>
            <option>Active</option>
            <option>Closed</option>
          </select>
          <button className="p-2 rounded-lg border border-black/5 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Interview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {demoInterviews.map((interview) =>
        <div key={interview.id} className="group p-4 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src={interview.agentAvatar} className="w-10 h-10 rounded-lg object-cover" alt="" />
                <div className="min-w-0">
                  <h4 className="font-bold text-sm leading-tight truncate group-hover:text-emerald-600 transition-colors">{interview.jobTitle}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{interview.company}</p>
                </div>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <MoreVertical size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">Candidates</p>
                <p className="text-sm font-bold">{interview.candidatesCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <p className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5">Avg Score</p>
                <p className="text-sm font-bold text-emerald-600">{interview.avgScore}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Ends: {interview.endingDate}</span>
              </div>
              <div className={cn(
              "px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-[8px]",
              interview.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-600"
            )}>
                {interview.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
              onClick={() => onSelectInterview(interview.id)}
              className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-colors">
              
                <ExternalLink size={12} />
                Details
              </button>
              <button className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-black/5 text-[10px] font-bold hover:bg-gray-50 transition-colors">
                <Copy size={12} />
                Link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

};