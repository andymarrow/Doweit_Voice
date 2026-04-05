"use client";
import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  UserPlus,

  ExternalLink,
  Trash2 } from















'lucide-react';
import { demoCandidates } from '../../data/demoData';
import { cn } from '../../lib/utils';
import { CandidateProfile } from './CandidateProfile';


export const CandidateDatabase = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  const filteredCandidates = demoCandidates.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Candidate Database</h2>
          <p className="text-xs text-muted-foreground">Manage and track all candidates across your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-black/5 bg-white text-xs font-bold hover:bg-gray-50 transition-all">
            <Download size={16} />
            Export CSV
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
            <UserPlus size={16} />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or skills..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-xs" />
          
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-[10px] font-bold uppercase tracking-wider">
            
            <option>All Status</option>
            <option>Completed</option>
            <option>In Progress</option>
          </select>
          <button className="p-2.5 rounded-xl border border-black/5 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Fit Score</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Recommendation</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredCandidates.map((candidate) =>
              <tr
                key={candidate.id}
                onClick={() => setSelectedCandidate(candidate)}
                className="group hover:bg-gray-50/50 transition-colors cursor-pointer">
                
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-xs group-hover:text-emerald-600 transition-colors">{candidate.name}</p>
                        <p className="text-[10px] text-muted-foreground">{candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          candidate.fitScore > 80 ? "bg-emerald-500" :
                          candidate.fitScore > 60 ? "bg-orange-500" : "bg-red-500"
                        )}
                        style={{ width: `${candidate.fitScore}%` }} />
                      
                      </div>
                      <span className="text-xs font-bold">{candidate.fitScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                    candidate.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                    candidate.status === 'In Progress' ? "bg-blue-50 text-blue-600" :
                    "bg-gray-100 text-gray-600"
                  )}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {candidate.date}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                    candidate.recommendation === 'Recommended' ? "bg-emerald-100 text-emerald-700" :
                    candidate.recommendation === 'Review' ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  )}>
                      {candidate.recommendation}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-emerald-600">
                        <ExternalLink size={14} />
                      </button>
                      <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile View Modal */}
      {selectedCandidate &&
      <CandidateProfile
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)} />

      }
    </div>);

};
