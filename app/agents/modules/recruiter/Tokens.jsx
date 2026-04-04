import React, { useState } from 'react';
import {
  Zap,
  History,
  CreditCard,
  TrendingUp,
  ArrowUpRight,

  Plus,
  CheckCircle2,



  ShieldCheck,

  Wallet,
  Coins } from

'lucide-react';
import { cn } from '../../lib/utils';

const transactions = [
{ id: '1', type: 'purchase', amount: 5000, date: '2024-03-10', status: 'completed', description: 'Enterprise Pack Purchase' },
{ id: '2', type: 'usage', amount: -50, date: '2024-03-09', status: 'completed', description: 'Interview Session: Frontend Developer' },
{ id: '3', type: 'usage', amount: -50, date: '2024-03-08', status: 'completed', description: 'Interview Session: Product Manager' },
{ id: '4', type: 'bonus', amount: 100, date: '2024-03-05', status: 'completed', description: 'Weekly Active Bonus' },
{ id: '5', type: 'usage', amount: -50, date: '2024-03-04', status: 'completed', description: 'Interview Session: UX Designer' }];


const packages = [
{ id: 'starter', name: 'Starter', tokens: 500, price: 49, popular: false, desc: 'Perfect for small teams' },
{ id: 'pro', name: 'Professional', tokens: 2000, price: 149, popular: true, desc: 'Most popular for growing startups' },
{ id: 'enterprise', name: 'Enterprise', tokens: 10000, price: 499, popular: false, desc: 'Best value for high-volume hiring' }];


export const Tokens = () => {
  const [selectedPackage, setSelectedPackage] = useState('pro');
  const [showTopUp, setShowTopUp] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Token Management</h2>
          <p className="text-xs text-muted-foreground">Monitor your usage and top up your balance.</p>
        </div>
        <button
          onClick={() => setShowTopUp(!showTopUp)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
          
          <Plus size={16} />
          {showTopUp ? 'View History' : 'Top Up Tokens'}
        </button>
      </div>

      {!showTopUp ?
      <>
          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                    <Wallet size={20} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Current Balance</span>
                </div>
                <div className="flex items-end gap-3">
                  <h3 className="text-5xl font-black tracking-tighter">12,450</h3>
                  <span className="text-emerald-400 text-sm font-bold mb-2 uppercase tracking-widest flex items-center gap-1">
                    <Zap size={14} fill="currentColor" />
                    Tokens
                  </span>
                </div>
                <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Monthly Usage</p>
                      <p className="text-sm font-bold">2,450 <span className="text-[10px] text-gray-500">/ 5,000</span></p>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cost Per Interview</p>
                      <p className="text-sm font-bold">50 <span className="text-[10px] text-gray-500">Tokens</span></p>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                    Usage Report
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Quick Stats</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last 30 Days</span>
                  <span className="text-xs font-bold text-emerald-600">+15%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Interviews Run</span>
                  <span className="text-xs font-bold">48</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Avg. Cost</span>
                  <span className="text-xs font-bold">52.4</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                <p className="text-[10px] text-blue-800 leading-relaxed font-medium">
                  You have enough tokens for approximately <span className="font-black">249</span> more interviews.
                </p>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History size={18} className="text-gray-400" />
                Transaction History
              </h3>
              <button className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:underline">Download CSV</button>
            </div>
            <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-black/5">
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {transactions.map((tx) =>
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                          "p-2 rounded-xl",
                          tx.type === 'purchase' ? "bg-emerald-50 text-emerald-600" :
                          tx.type === 'usage' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                        )}>
                              {tx.type === 'purchase' ? <ArrowUpRight size={14} /> : <Coins size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-900">{tx.description}</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">ID: #{tx.id}482</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{tx.date}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                        "text-xs font-black",
                        tx.amount > 0 ? "text-emerald-600" : "text-gray-900"
                      )}>
                            {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">{tx.status}</span>
                          </div>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </> : (

      /* Top Up View */
      <div className="space-y-8 animate-in zoom-in-95 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) =>
          <div
            key={pkg.id}
            onClick={() => setSelectedPackage(pkg.id)}
            className={cn(
              "p-8 rounded-3xl border-2 transition-all cursor-pointer relative group",
              selectedPackage === pkg.id ?
              "border-emerald-500 bg-emerald-50/30 shadow-xl shadow-emerald-500/10" :
              "border-black/5 bg-white hover:border-gray-200"
            )}>
            
                {pkg.popular &&
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-widest shadow-lg">
                    Most Popular
                  </div>
            }
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black tracking-tight">{pkg.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{pkg.desc}</p>
                  </div>
                  <div className="flex items-end gap-2">
                    <h4 className="text-4xl font-black tracking-tighter">${pkg.price}</h4>
                    <span className="text-xs text-muted-foreground font-bold mb-1">/ one-time</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-emerald-600" fill="currentColor" />
                      <span className="text-sm font-black">{pkg.tokens.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Tokens</span>
                  </div>
                  <button className={cn(
                "w-full py-3 rounded-xl text-xs font-bold transition-all",
                selectedPackage === pkg.id ?
                "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" :
                "bg-gray-100 text-gray-600 group-hover:bg-gray-900 group-hover:text-white"
              )}>
                    Select Package
                  </button>
                </div>
              </div>
          )}
          </div>

          <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-white border border-black/5 shadow-sm space-y-8">
            <h3 className="text-lg font-black tracking-tight flex items-center gap-3">
              <CreditCard size={24} className="text-gray-400" />
              Payment Details
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <input type="text" placeholder="**** **** **** 4242" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 rounded" />
                    <div className="w-8 h-5 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Expiry Date</label>
                  <input type="text" placeholder="MM / YY" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">CVC</label>
                  <input type="text" placeholder="***" className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-medium" />
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-black/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total to Pay</p>
                <p className="text-2xl font-black tracking-tight">${packages.find((p) => p.id === selectedPackage)?.price}</p>
              </div>
              <button className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2">
                <ShieldCheck size={18} />
                Pay Securely
              </button>
            </div>
          </div>
        </div>)
      }
    </div>);

};