import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  ExternalLink,
  Trash2,
  Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CandidateProfile } from './CandidateProfile';
import { toast } from 'react-hot-toast';

export const CandidateDatabase = () => {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch('/api/recruiter/applications');
        if (!response.ok) throw new Error('Failed to fetch candidates');
        
        const data = await response.json();
        setCandidates(data);
      } catch (err) {
        console.error('CandidateDatabase error:', err);
        setError(err.message);
        toast.error('Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter((c) => {
    const matchesSearch = c.candidateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.candidateEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.jobDepartment?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCandidate = async (candidateId) => {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      const response = await fetch(`/api/recruiter/applications?id=${candidateId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete candidate');
      
      // Remove from local state
      setCandidates(candidates.filter(c => c.id !== candidateId));
      toast.success('Candidate deleted successfully');
      
      // Close profile modal if it was open for this candidate
      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(null);
      }
    } catch (error) {
      console.error('Delete candidate error:', error);
      toast.error('Failed to delete candidate');
    }
  };

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
            <option>applied</option>
            <option>screening</option>
            <option>interviewing</option>
            <option>completed</option>
            <option>offered</option>
            <option>rejected</option>
            <option>hired</option>
          </select>
          <button className="p-2.5 rounded-xl border border-black/5 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-sm text-gray-500">Loading candidates...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load candidates</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredCandidates.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-gray-600 font-medium mb-2">No candidates found</p>
          <p className="text-sm text-gray-500 mb-4">Start by creating interview links to collect candidate applications</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && filteredCandidates.length > 0 && (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-gray-50/50">
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Position</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Fit Score</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Date</th>
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
                        {candidate.candidateName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-xs group-hover:text-emerald-600 transition-colors">{candidate.candidateName || 'Unknown'}</p>
                        <p className="text-[10px] text-muted-foreground">{candidate.candidateEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-xs">{candidate.jobTitle || 'Unknown Position'}</p>
                      <p className="text-[10px] text-muted-foreground">{candidate.jobDepartment || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {(() => {
                      const resultArr = Array.isArray(candidate.result) ? candidate.result : [];
                      const score = Math.min(100, resultArr.reduce((s, c) => s + (c.score || 0), 0));
                      return (
                        <div className="flex items-center gap-3">
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                score > 80 ? "bg-emerald-500" :
                                score > 60 ? "bg-orange-500" : "bg-red-500"
                              )}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{score}%</span>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider",
                    candidate.isRejected ? "bg-red-50 text-red-600" :
                    candidate.status === 'hired' ? "bg-emerald-50 text-emerald-600" :
                    candidate.status === 'completed' ? "bg-green-50 text-green-600" :
                    candidate.status === 'screening' ? "bg-blue-50 text-blue-600" :
                    candidate.status === 'interviewing' ? "bg-purple-50 text-purple-600" :
                    candidate.status === 'offered' ? "bg-cyan-50 text-cyan-600" :
                    "bg-gray-100 text-gray-600"
                  )}>
                      {candidate.isRejected ? 'Rejected' : (candidate.status || 'applied')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground">
                    {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-emerald-600">
                        <ExternalLink size={14} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCandidate(candidate.id);
                        }}
                        className="p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-red-600">
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
      )}

      {/* Profile View Modal */}
      {selectedCandidate && (
        <CandidateProfile
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)} />
      )}
    </div>);

};