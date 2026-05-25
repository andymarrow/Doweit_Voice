"use client";
// Shared public-position marketplace UI used by both recruiters (in
// /recruiter, replacing the old Library page) and trainees (in /trainee).
// The only difference between the two surfaces is `buyerType`, which the
// /api/marketplace/positions/[id]/buy route uses to decide whether the
// purchased copy clones into job_positions (recruiter) or trainee_interviews
// (trainee). The cloned row then naturally surfaces in the buyer's existing
// "My Interviews" list — no extra plumbing needed.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShoppingBag, Search, Star, Clock, HelpCircle, Zap, X, Eye, Loader2,
  AlertCircle, ChevronRight, User, Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

// Truncate to first N words (keeps trailing ellipsis if cut)
function firstWords(text, n) {
  if (!text) return '';
  const parts = String(text).trim().split(/\s+/);
  if (parts.length <= n) return parts.join(' ');
  return parts.slice(0, n).join(' ') + '…';
}

// Interactive star row. When `readOnly`, click handlers are noops.
function Stars({ value = 0, onPick, readOnly = false, size = 14 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(shown);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(n)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => !readOnly && onPick?.(n)}
            className={cn(
              'transition-transform',
              !readOnly && 'hover:scale-110 cursor-pointer'
            )}
          >
            <Star
              size={size}
              className={filled ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}
              fill={filled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ─── View / Buy Modal ────────────────────────────────────────────── */
function ViewModal({ position, buyerType, onClose, onPurchased }) {
  const [agg, setAgg] = useState({
    averageRating: position?.averageRating || 0,
    ratingCount: position?.ratingCount || 0,
    userRating: null,
  });
  const [ratingLoading, setRatingLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  // Load the caller's current rating + canonical aggregate
  useEffect(() => {
    let alive = true;
    if (!position) return;
    setRatingLoading(true);
    fetch(`/api/marketplace/positions/${position.id}/rate`)
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (data && !data.error) setAgg(data);
      })
      .catch(() => {})
      .finally(() => alive && setRatingLoading(false));
    return () => { alive = false; };
  }, [position]);

  const onRate = useCallback(async (n) => {
    if (agg.userRating === n) return; // no-op
    try {
      const res = await fetch(`/api/marketplace/positions/${position.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: n }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Rating failed');
      setAgg(data);
      toast.success(agg.userRating ? 'Rating updated' : 'Thanks for rating!');
    } catch (err) {
      toast.error(err.message);
    }
  }, [agg.userRating, position?.id]);

  const onBuy = useCallback(async () => {
    if (buying) return;
    setBuying(true);
    try {
      const res = await fetch(`/api/marketplace/positions/${position.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      toast.success(
        `Purchased! ${data.tokensSpent} tokens spent. Find it in your ${
          buyerType === 'trainee' ? 'My Interviews' : 'Interviews'
        } list.`
      );
      onPurchased?.(data);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBuying(false);
    }
  }, [buying, position?.id, buyerType, onPurchased, onClose]);

  if (!position) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-4 flex items-start justify-between rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold flex-shrink-0">
              {(position.title || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-sm truncate">{position.title}</h2>
              <p className="text-white/70 text-[11px] truncate">{position.department || 'General'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* 60-word description */}
          {position.description && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5">
                Description
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {firstWords(position.description, 60)}
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={Clock}       label="Duration"  value={`${position.duration || 30} min`} color="text-purple-500" />
            <Stat icon={HelpCircle}  label="Questions" value={position.questionCount || 0}      color="text-blue-500" />
            <Stat icon={Zap}         label="Tokens"    value={position.price || 0}              color="text-amber-500" />
          </div>

          {/* Rating */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                Rate this position
              </p>
              {ratingLoading ? (
                <Loader2 size={11} className="animate-spin text-gray-400" />
              ) : (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Avg {agg.averageRating.toFixed(1)} · {agg.ratingCount} {agg.ratingCount === 1 ? 'rating' : 'ratings'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Stars value={agg.userRating || 0} onPick={onRate} size={20} />
              {agg.userRating != null && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  Your rating: {agg.userRating}/5
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5">
              One rating per user. Clicking a different star replaces your previous vote.
            </p>
          </div>

          {/* Seller */}
          {position.sellerName && (
            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <User size={12} />
              <span>Listed by <span className="font-medium text-gray-700 dark:text-gray-300">{position.sellerName}</span></span>
            </div>
          )}

          {/* Buy button */}
          <button
            onClick={onBuy}
            disabled={buying}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-60 transition-all"
          >
            {buying ? (
              <><Loader2 size={13} className="animate-spin" /> Processing…</>
            ) : (
              <><Zap size={13} fill="currentColor" /> Buy Interview — {position.price || 0} Tokens</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 text-center">
      <Icon size={13} className={cn('mx-auto mb-1', color)} />
      <p className="text-[9px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">{label}</p>
      <p className="text-xs font-bold text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  );
}

/* ─── Card ────────────────────────────────────────────────────────── */
function PositionCard({ position, onView }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all flex flex-col overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-blue-500" />

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {(position.title || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm leading-tight truncate text-gray-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
              {position.title}
            </h3>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{position.department || 'General'}</p>
          </div>
        </div>

        {/* Description: first 20 words */}
        {position.description && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            {firstWords(position.description, 20)}
          </p>
        )}

        {/* Rating row */}
        <div className="flex items-center gap-2 mb-3">
          <Stars value={position.averageRating || 0} readOnly size={11} />
          <span className="text-[10px] text-gray-400 dark:text-gray-500">
            {(position.averageRating || 0).toFixed(1)}
            {position.ratingCount > 0 && ` · ${position.ratingCount}`}
          </span>
        </div>

        {/* Stats: duration / questions / tokens */}
        <div className="grid grid-cols-3 gap-1.5 mb-3 mt-auto">
          <Pill icon={Clock}      value={`${position.duration || 30}m`}        color="purple" />
          <Pill icon={HelpCircle} value={position.questionCount || 0}          color="blue" />
          <Pill icon={Zap}        value={position.price || 0}                  color="amber" />
        </div>

        {/* View button */}
        <button
          onClick={() => onView(position)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-800/50 text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-white text-[11px] font-bold transition-all"
        >
          <Eye size={11} /> View <ChevronRight size={11} className="opacity-60" />
        </button>
      </div>
    </div>
  );
}

function Pill({ icon: Icon, value, color }) {
  const map = {
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800',
    blue:   'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800',
    amber:  'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800',
  };
  return (
    <div className={cn('flex items-center justify-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold', map[color])}>
      <Icon size={10} />
      {value}
    </div>
  );
}

/* ─── Marketplace Page ────────────────────────────────────────────── */
export function Marketplace({ buyerType = 'recruiter', onNavigate }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/marketplace/positions', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setPositions(data.positions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!search.trim()) return positions;
    const q = search.toLowerCase();
    return positions.filter((p) =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    );
  }, [positions, search]);

  const onPurchased = useCallback(() => {
    // Bump the buyer to their My Interviews / sessions list so they can take it.
    if (buyerType === 'trainee') onNavigate?.('sessions');
    else onNavigate?.('interviews');
  }, [buyerType, onNavigate]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center">
          <ShoppingBag size={16} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Marketplace</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Browse public interview positions
            {buyerType === 'recruiter' ? ' — purchase to add to your own library' : ' — buy to take as practice'}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, department, or description…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-purple-400 dark:focus:border-purple-500 text-xs text-gray-900 dark:text-white placeholder-gray-400 transition-all"
        />
      </div>

      {/* Result count */}
      <div className="text-[11px] text-gray-500 dark:text-gray-400">
        {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'position' : 'positions'} found`}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={20} className="animate-spin text-purple-600" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <AlertCircle size={32} className="text-red-400 mb-2" />
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Failed to load marketplace</p>
          <p className="text-[10px] text-gray-400 mb-3">{error}</p>
          <button onClick={load} className="text-[11px] text-purple-600 hover:underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Briefcase size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-xs font-bold text-gray-600 dark:text-gray-300">No public positions found</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            {search ? 'Try a different search.' : 'Recruiters will list public positions here.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="mt-3 text-[11px] text-purple-600 hover:underline">
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PositionCard key={p.id} position={p} onView={setSelected} />
          ))}
        </div>
      )}

      {/* Modal */}
      {selected && (
        <ViewModal
          position={selected}
          buyerType={buyerType}
          onClose={() => setSelected(null)}
          onPurchased={onPurchased}
        />
      )}
    </div>
  );
}

// Backwards-compat export so the existing import in app/recruiter/page.jsx
// (which does `import { Library } from './modules/Library'`) keeps working
// during the rename. We re-export the same component under the old name.
export const Library = Marketplace;
