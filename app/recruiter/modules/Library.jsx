import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Clock,
  Target,
  Briefcase,
  MapPin,
  Calendar,
  Globe,
  HelpCircle,
  Loader2,
  AlertCircle,
  Check,
  X,
  Eye,
  Zap,
  Shield,
  Link2,
  Copy,
  ChevronRight,
  BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const statusConfig = {
  active: { label: 'Active', classes: 'bg-blue-50 text-blue-700 border border-blue-200' },
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 border border-gray-200' },
  closed: { label: 'Closed', classes: 'bg-purple-50 text-purple-600 border border-purple-200' },
};

const expConfig = {
  junior: { label: 'Junior', classes: 'bg-blue-50 text-blue-600' },
  mid: { label: 'Mid', classes: 'bg-purple-50 text-purple-600' },
  senior: { label: 'Senior', classes: 'bg-indigo-50 text-indigo-600' },
  expert: { label: 'Expert', classes: 'bg-violet-50 text-violet-600' },
};

/* ─── Detail Modal ─────────────────────────────────────────────── */
const PositionModal = ({ position, onClose }) => {
  if (!position) return null;

  const sc = statusConfig[position.status] || statusConfig.draft;
  const exp = expConfig[position.requiredExperience?.toLowerCase()] || null;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const handleCopyLink = () => {
    if (position.magicLink) {
      navigator.clipboard.writeText(position.magicLink);
      toast.success('Interview link copied!');
    } else {
      toast.error('No interview link available');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 rounded-t-2xl flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-black text-lg">
              {position.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-black text-base leading-tight">{position.title}</h2>
              <p className="text-white/70 text-xs">{position.department || 'General'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status + badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", sc.classes)}>
              {sc.label}
            </span>
            {exp && (
              <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", exp.classes)}>
                {exp.label}
              </span>
            )}
            {position.antiCheatEnabled && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-200">
                <Shield size={9} /> Anti-cheat
              </span>
            )}
          </div>

          {/* Description */}
          {position.description && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{position.description}</p>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Clock, label: 'Duration', value: `${position.duration || 30} min`, color: 'text-purple-500' },
              { icon: HelpCircle, label: 'Questions', value: position.questionCount || 0, color: 'text-blue-500' },
              { icon: Target, label: 'Criteria', value: Array.isArray(position.evaluationCriteria) ? position.evaluationCriteria.length : 0, color: 'text-indigo-500' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-center">
                <Icon size={14} className={cn("mx-auto mb-1", color)} />
                <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
                <p className="text-sm font-black text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Briefcase, label: 'Employment', value: position.employmentType || '—' },
              { icon: MapPin, label: 'Location', value: position.location || '—' },
              { icon: Globe, label: 'Language', value: position.language || '—' },
              { icon: Zap, label: 'Voice', value: position.voiceProvider || '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <Icon size={13} className="text-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{label}</p>
                  <p className="text-xs font-bold text-gray-700 capitalize">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Timeline</p>
            {[
              { label: 'Registration Start', value: fmtDate(position.registrationStartDate) },
              { label: 'Registration End', value: fmtDate(position.registrationEndDate) },
              { label: 'Interview Start', value: fmtDate(position.startDate) },
              { label: 'Interview End', value: fmtDate(position.endDate) },
              { label: 'Created', value: fmtDate(position.createdAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-xs">
                <span className="text-gray-500">{label}</span>
                <span className="font-bold text-gray-700">{value}</span>
              </div>
            ))}
          </div>

          {/* Evaluation criteria */}
          {Array.isArray(position.evaluationCriteria) && position.evaluationCriteria.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-2">Evaluation Criteria</p>
              <div className="space-y-1.5">
                {position.evaluationCriteria.map((c, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                    <span className="text-xs text-gray-700 font-medium">{c.name || c.criteria || `Criterion ${i + 1}`}</span>
                    {c.weight != null && (
                      <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {c.weight}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview link */}
          {position.magicLink && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-black uppercase tracking-wider text-blue-400 mb-2">Interview Link</p>
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs text-blue-700 font-mono truncate">{position.magicLink}</p>
                <button
                  onClick={handleCopyLink}
                  className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-colors"
                >
                  <Copy size={10} /> Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Position Card ─────────────────────────────────────────────── */
const PositionCard = ({ position, onView }) => {
  const sc = statusConfig[position.status] || statusConfig.draft;
  const exp = expConfig[position.requiredExperience?.toLowerCase()] || null;
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-200 flex flex-col overflow-hidden">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500" />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-black text-sm flex-shrink-0 shadow-md shadow-purple-200">
              {position.title.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-sm leading-tight truncate group-hover:text-purple-700 transition-colors">
                {position.title}
              </h3>
              <p className="text-[10px] text-gray-400 truncate">{position.department || 'General'}</p>
            </div>
          </div>
          <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex-shrink-0 ml-1", sc.classes)}>
            {sc.label}
          </span>
        </div>

        {/* Description */}
        {position.description && (
          <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-3">
            {position.description}
          </p>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-purple-50 border border-purple-100">
            <Clock size={11} className="text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-[8px] uppercase font-bold text-purple-400 tracking-wider">Duration</p>
              <p className="text-[11px] font-black text-purple-700">{position.duration || 30} min</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50 border border-blue-100">
            <HelpCircle size={11} className="text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-[8px] uppercase font-bold text-blue-400 tracking-wider">Questions</p>
              <p className="text-[11px] font-black text-blue-700">{position.questionCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Tag row */}
        <div className="flex flex-wrap gap-1 mb-3">
          {position.employmentType && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              <Briefcase size={8} /> {position.employmentType}
            </span>
          )}
          {position.location && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              <MapPin size={8} /> {position.location}
            </span>
          )}
          {position.language && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-50 border border-gray-100 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
              <Globe size={8} /> {position.language}
            </span>
          )}
          {exp && (
            <span className={cn("px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider", exp.classes)}>
              {exp.label}
            </span>
          )}
        </div>

        {/* Criteria + anti-cheat */}
        <div className="flex items-center gap-3 mb-3 mt-auto">
          {Array.isArray(position.evaluationCriteria) && position.evaluationCriteria.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <Target size={10} className="text-purple-400" />
              {position.evaluationCriteria.length} criteria
            </span>
          )}
          {position.antiCheatEnabled && (
            <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium">
              <Check size={10} /> Anti-cheat
            </span>
          )}
        </div>

        {/* Date */}
        {fmtDate(position.createdAt) && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-3">
            <Calendar size={10} />
            <span>{fmtDate(position.createdAt)}</span>
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => onView(position)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[11px] font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md shadow-purple-200 group-hover:shadow-lg"
        >
          <Eye size={12} /> View Details <ChevronRight size={11} className="opacity-70" />
        </button>
      </div>
    </div>
  );
};

/* ─── Library Page ──────────────────────────────────────────────── */
export const Library = ({ onNavigate }) => {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const res = await fetch('/api/recruiter/library');
        if (!res.ok) throw new Error('Failed to fetch library');
        const data = await res.json();
        setPositions(data.positions || []);
      } catch (err) {
        console.error('Library error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const filteredPositions = useMemo(() => {
    return positions.filter(p => {
      const matchSearch = !searchQuery ||
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [positions, searchQuery, statusFilter]);

  const counts = {
    total: positions.length,
    active: positions.filter(p => p.status === 'active').length,
    draft: positions.filter(p => p.status === 'draft').length,
    closed: positions.filter(p => p.status === 'closed').length,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
              <BookOpen size={16} />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Interview Library</h2>
              <p className="text-xs text-gray-400">All published and draft interview positions</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => onNavigate?.('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200 self-start"
        >
          <Plus size={14} /> Create Interview
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: counts.total, filter: 'all', active: 'bg-gradient-to-br from-purple-600 to-blue-600 text-white border-transparent shadow-lg shadow-purple-200', inactive: 'bg-white border-gray-100 text-gray-600' },
          { label: 'Active', value: counts.active, filter: 'active', active: 'bg-blue-600 text-white border-transparent shadow-lg shadow-blue-200', inactive: 'bg-white border-gray-100 text-gray-600' },
          { label: 'Draft', value: counts.draft, filter: 'draft', active: 'bg-gray-700 text-white border-transparent shadow-lg shadow-gray-200', inactive: 'bg-white border-gray-100 text-gray-600' },
          { label: 'Closed', value: counts.closed, filter: 'closed', active: 'bg-purple-600 text-white border-transparent shadow-lg shadow-purple-200', inactive: 'bg-white border-gray-100 text-gray-600' },
        ].map(s => (
          <button
            key={s.filter}
            onClick={() => setStatusFilter(s.filter)}
            className={cn(
              "p-3 rounded-xl border text-left transition-all hover:shadow-md",
              statusFilter === s.filter ? s.active : s.inactive
            )}
          >
            <p className={cn("text-[9px] font-black uppercase tracking-wider mb-0.5", statusFilter === s.filter ? 'text-white/70' : 'text-gray-400')}>{s.label}</p>
            <h3 className="text-2xl font-black">{s.value}</h3>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, department, or description..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-300 text-xs transition-all"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="ml-2 text-sm text-gray-500">Loading library...</span>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <AlertCircle className="w-10 h-10 text-purple-400 mb-3" />
          <p className="text-sm font-semibold text-gray-600 mb-1">Failed to load library</p>
          <button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:underline">
            Retry
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && filteredPositions.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
            <BookOpen size={28} className="text-purple-500" />
          </div>
          {positions.length === 0 ? (
            <>
              <p className="text-sm font-bold text-gray-600 mb-1">No interviews yet</p>
              <p className="text-xs text-gray-400 mb-4">Create your first interview position to build your library</p>
              <button
                onClick={() => onNavigate?.('create')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-md"
              >
                <Plus size={13} /> Create Interview
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-600">No results found</p>
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}
                className="mt-2 text-xs text-purple-600 hover:underline"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Cards grid */}
      {!isLoading && !error && filteredPositions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPositions.map(position => (
            <PositionCard
              key={position.id}
              position={position}
              onView={setSelectedPosition}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedPosition && (
        <PositionModal
          position={selectedPosition}
          onClose={() => setSelectedPosition(null)}
        />
      )}
    </div>
  );
};
