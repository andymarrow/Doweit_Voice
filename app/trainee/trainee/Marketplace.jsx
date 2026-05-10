import React from 'react';
import {

  Search,
  Filter,
  Star,

  Zap,
  ShieldCheck,

  Users } from
'lucide-react';
import { demoTrainingAgents } from './demoData';


export const Marketplace = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Marketplace</h2>
          <p className="text-xs text-muted-foreground">Discover and purchase professional AI interview agents.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100 text-xs">
          <Zap size={16} className="fill-current" />
          <span className="font-bold">2,450 Tokens</span>
        </div>
      </div>

      {/* Featured Banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden group">
        <img
          src="https://picsum.photos/seed/market/1200/400"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          alt="" />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest w-fit">
            Featured Agent
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Master System Design</h3>
          <p className="text-gray-300 text-xs max-w-xs">Get exclusive access to Viktor, our expert System Design interviewer.</p>
          <button className="px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold w-fit hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            Unlock for 500 Tokens
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search agents..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-xs" />
          
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-lg border border-black/5 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all text-[10px] font-bold uppercase tracking-wider">
            <option>All Categories</option>
            <option>Technical</option>
            <option>Behavioral</option>
          </select>
          <button className="p-2 rounded-lg border border-black/5 bg-white hover:bg-gray-50 transition-colors">
            <Filter size={14} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...demoTrainingAgents, ...demoTrainingAgents].map((agent, i) =>
        <div key={i} className="group p-3.5 rounded-xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="relative mb-3">
              <img src={agent.avatar} className="w-full h-32 rounded-lg object-cover" alt="" />
              <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-white/90 backdrop-blur shadow-sm text-[9px] font-bold flex items-center gap-0.5">
                <Star size={10} className="text-orange-500 fill-current" />
                4.9
              </div>
              <div className="absolute bottom-2 left-2 flex gap-1">
                <div className="px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur text-white text-[8px] font-bold uppercase tracking-wider">
                  {agent.difficulty}
                </div>
              </div>
            </div>

            <div className="space-y-0.5 mb-3">
              <h4 className="font-bold text-sm leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{agent.name}</h4>
              <p className="text-[10px] text-muted-foreground font-medium">{agent.role}</p>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users size={12} />
                <span>2.4k</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck size={12} />
                <span>Verified</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <div className="flex items-center gap-0.5">
                <Zap size={14} className="text-orange-500 fill-current" />
                <span className="font-bold text-sm">150</span>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-[10px] font-bold hover:bg-black transition-all">
                Purchase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>);

};