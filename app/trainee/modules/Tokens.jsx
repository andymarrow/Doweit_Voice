"use client";
import React, { useState, useEffect } from 'react';
import {
  Zap, History, CreditCard, TrendingUp, ArrowUpRight,
  Plus, CheckCircle2, ShieldCheck, Wallet, Coins, Star, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const packages = [
  { id: 'starter', name: 'Starter',      tokens: 300,   price: 19, popular: false, desc: 'Great for getting started' },
  { id: 'pro',     name: 'Professional', tokens: 1000,  price: 49, popular: true,  desc: 'Most popular for active learners' },
  { id: 'elite',   name: 'Elite',        tokens: 5000,  price: 149, popular: false, desc: 'Best value for serious training' },
];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const TraineeTokens = () => {
  const [selectedPackage, setSelectedPackage] = useState('pro');
  const [showTopUp, setShowTopUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ balance: 1000, transactions: [], stats: { monthlyUsed: 0, monthlyInterviews: 0, avgCost: 0 } });

  useEffect(() => {
    fetch('/api/tokens')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const { balance, transactions, stats } = data;
  const monthlyBudget = 500;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight">Token Wallet</h2>
          <p className="text-xs text-gray-400">Monitor usage and top up your balance.</p>
        </div>
        <button
          onClick={() => setShowTopUp(!showTopUp)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-200"
        >
          <Plus size={14} />
          {showTopUp ? 'View History' : 'Top Up'}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-purple-400" />
        </div>
      )}

      {!loading && !showTopUp && (
        <>
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Main balance card */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -mr-20 -mt-20" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] -ml-10 -mb-10" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/20">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Current Balance</span>
                </div>
                <div className="flex items-end gap-3">
                  <h3 className="text-5xl font-black tracking-tighter">{balance.toLocaleString()}</h3>
                  <span className="text-purple-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={14} fill="currentColor" /> Tokens
                  </span>
                </div>
                <div className="pt-5 border-t border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Monthly Usage</p>
                    <p className="text-xs font-black text-white">{stats.monthlyUsed} <span className="text-gray-500">/ {monthlyBudget}</span></p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min((stats.monthlyUsed / monthlyBudget) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <TrendingUp size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quick Stats</span>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'This month spent',    value: `${stats.monthlyUsed} tokens` },
                  { label: 'Avg per session',      value: stats.avgCost ? `${stats.avgCost} tokens` : '—' },
                  { label: 'Sessions this month',  value: String(stats.monthlyInterviews) },
                  { label: 'Rate',                 value: '10 tokens / min' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-black text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-100">
                <p className="text-[10px] text-purple-700 leading-relaxed font-medium">
                  {stats.avgCost > 0
                    ? <>You have enough for <span className="font-black">{Math.floor(balance / stats.avgCost)}</span> more sessions.</>
                    : <>1 minute of interview costs <span className="font-black">10 tokens</span>.</>}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black flex items-center gap-2">
                <History size={16} className="text-gray-400" />
                Transaction History
              </h3>
            </div>
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  No transactions yet. Complete an interview to see usage here.
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Transaction', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-5 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-xl',
                              tx.type === 'purchase' ? 'bg-blue-50 text-blue-600'
                              : tx.type === 'bonus'  ? 'bg-purple-50 text-purple-600'
                              : 'bg-gray-100 text-gray-500'
                            )}>
                              {tx.type === 'purchase' ? <ArrowUpRight size={13} /> : tx.type === 'bonus' ? <Star size={13} /> : <Coins size={13} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                              {tx.durationMinutes && (
                                <p className="text-[9px] text-gray-400">{tx.durationMinutes} min × 10 tokens</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-500">{formatDate(tx.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className={cn('text-xs font-black', tx.amount > 0 ? 'text-purple-600' : 'text-gray-800')}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Completed</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && showTopUp && (
        /* Top Up View */
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  'p-7 rounded-3xl border-2 transition-all cursor-pointer relative group',
                  selectedPackage === pkg.id
                    ? 'border-purple-500 bg-purple-50/30 shadow-xl shadow-purple-200'
                    : 'border-gray-100 bg-white hover:border-purple-200'
                )}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{pkg.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{pkg.desc}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <h4 className="text-4xl font-black tracking-tighter">${pkg.price}</h4>
                    <span className="text-xs text-gray-400 font-bold mb-1">/ one-time</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={15} className="text-purple-600" fill="currentColor" />
                      <span className="text-sm font-black">{pkg.tokens.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tokens</span>
                  </div>
                  <button className={cn(
                    'w-full py-2.5 rounded-xl text-xs font-black transition-all',
                    selectedPackage === pkg.id
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white'
                  )}>
                    Select Package
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-7">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
              <CreditCard size={22} className="text-gray-400" /> Payment Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Card Number</label>
                <input type="text" placeholder="**** **** **** 4242" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Expiry</label>
                  <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">CVC</label>
                  <input type="text" placeholder="***" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 text-xs font-medium transition-all" />
                </div>
              </div>
            </div>
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                <p className="text-2xl font-black tracking-tight">${packages.find(p => p.id === selectedPackage)?.price}</p>
              </div>
              <button className="px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-xs hover:from-purple-700 hover:to-blue-700 transition-all shadow-xl shadow-purple-200 flex items-center gap-2">
                <ShieldCheck size={16} /> Pay Securely
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
