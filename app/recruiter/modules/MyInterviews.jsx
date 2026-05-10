import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Plus,
  Copy,
  ExternalLink,
  MoreVertical,
  Clock,
  Users,
  Calendar,
  Loader2,
  Trash2,
  X,
  MapPin,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useSession } from '@/lib/auth-client';

const calculateStatus = (startDate, endDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  if (start && end) {
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    if (today < start) return 'draft';
    if (today >= start && today <= end) return 'active';
    return 'closed';
  }
  if (start) {
    start.setHours(0, 0, 0, 0);
    return today < start ? 'draft' : 'active';
  }
  return 'draft';
};

const statusConfig = {
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
  closed: { label: 'Closed', classes: 'bg-red-50 text-red-600 border-red-200' },
};

export const MyInterviews = ({ onSelectInterview }) => {
  const { data: session, isPending } = useSession();
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!session?.user?.id) { setIsLoading(false); return; }
      try {
        const res = await fetch(`/api/recruiter/createInterview?userId=${session.user.id}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setPositions(data.data || []);
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load interviews');
      } finally {
        setIsLoading(false);
      }
    };
    if (!isPending) fetchInterviews();
  }, [session, isPending]);

  const handleDelete = async (positionId) => {
    try {
      const res = await fetch(`/api/recruiter/createInterview?positionId=${positionId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Interview deleted');
      setPositions(prev => prev.filter(p => p.id !== positionId));
      setDeleteConfirm(null);
      setActiveDropdown(null);
    } catch {
      toast.error('Failed to delete interview');
    }
  };

  const filteredPositions = positions.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const s = calculateStatus(p.startDate, p.endDate);
    const matchStatus = statusFilter === 'all' || s === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    active: positions.filter(p => calculateStatus(p.startDate, p.endDate) === 'active').length,
    draft: positions.filter(p => calculateStatus(p.startDate, p.endDate) === 'draft').length,
    closed: positions.filter(p => calculateStatus(p.startDate, p.endDate) === 'closed').length,
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="ml-2 text-sm text-gray-500">Loading positions...</span>
    </div>
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Interviews</h2>
          <p className="text-[11px] text-muted-foreground">{positions.length} total positions</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus size={14} /> New Interview
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: positions.length, color: 'text-blue-600', bg: 'bg-blue-50', filter: 'all' },
          { label: 'Active', value: counts.active, color: 'text-emerald-600', bg: 'bg-emerald-50', filter: 'active' },
          { label: 'Draft', value: counts.draft, color: 'text-gray-600', bg: 'bg-gray-100', filter: 'draft' },
          { label: 'Closed', value: counts.closed, color: 'text-red-500', bg: 'bg-red-50', filter: 'closed' },
        ].map((s) => (
          <button
            key={s.filter}
            onClick={() => setStatusFilter(s.filter)}
            className={cn(
              "p-3 rounded-xl border text-left transition-all hover:shadow-sm",
              statusFilter === s.filter ? `${s.bg} border-current ${s.color}` : "bg-white border-gray-100"
            )}
          >
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
            <h3 className={cn("text-xl font-black", s.color)}>{s.value}</h3>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or department..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 text-xs"
          />
        </div>
        <button className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
          <Filter size={14} className="text-gray-500" />
        </button>
      </div>

      {/* Empty State */}
      {filteredPositions.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Briefcase size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-500">No interviews found</p>
          <p className="text-xs text-gray-400 mt-1">Create your first interview position to get started</p>
        </div>
      )}

      {/* Interview Cards — compact grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filteredPositions.map((position) => {
          const status = calculateStatus(position.startDate, position.endDate);
          const sc = statusConfig[status] || statusConfig.draft;
          const appUrl = typeof window !== 'undefined'
            ? `${window.location.origin}/interview/${position.id}`
            : `/interview/${position.id}`;

          return (
            <div
              key={position.id}
              className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all p-3.5"
            >
              {/* Top row */}
              <div className="flex items-start gap-2.5 mb-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {position.title.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm leading-tight truncate group-hover:text-emerald-700 transition-colors">
                    {position.title}
                  </h4>
                  <p className="text-[10px] text-gray-400 truncate">{position.department || 'Engineering'}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border",
                    sc.classes
                  )}>
                    {sc.label}
                  </span>
                  <div className="relative">
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === position.id ? null : position.id)}
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <MoreVertical size={13} className="text-gray-400" />
                    </button>
                    {activeDropdown === position.id && (
                      <div className="absolute right-0 top-6 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
                        <button
                          onClick={() => { setDeleteConfirm(position); setActiveDropdown(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Clock size={10} /> {position.duration || 30}min
                </span>
                <span className="flex items-center gap-1">
                  <HelpCircle size={10} /> {position.questionCount || 0}Q
                </span>
                {position.location && (
                  <span className="flex items-center gap-1 truncate">
                    <MapPin size={10} /> {position.location}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1">
                  <Calendar size={10} />
                  {position.createdAt ? new Date(position.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </span>
              </div>

              {/* Date range */}
              {(position.startDate || position.endDate) && (
                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-3">
                  <Calendar size={10} className="text-emerald-500" />
                  <span>{position.startDate ? new Date(position.startDate).toLocaleDateString() : '—'}</span>
                  <span className="mx-1">→</span>
                  <span>{position.endDate ? new Date(position.endDate).toLocaleDateString() : '—'}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => onSelectInterview(position.id)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-colors"
                >
                  <ExternalLink size={11} /> Details
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(appUrl);
                    toast.success('Link copied!');
                  }}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold hover:bg-gray-50 transition-colors"
                >
                  <Copy size={11} /> Link
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">Delete Interview?</h3>
              <button onClick={() => setDeleteConfirm(null)} className="p-1 rounded hover:bg-gray-100">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-lg mb-3">
              <p className="font-semibold text-sm">{deleteConfirm.title}</p>
              <p className="text-xs text-gray-500">{deleteConfirm.department || 'Engineering'}</p>
            </div>
            <p className="text-xs text-red-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
