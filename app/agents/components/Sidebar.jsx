import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  PlusCircle,
  Users,
  Library,
  Coins,
  Settings,
  GraduationCap,
  UserCircle,
  ShoppingBag,
  LogOut
} from
  'lucide-react';

import { cn } from '../lib/utils';








export const Sidebar = ({
  activeModule,
  setActiveModule,
  activeSection,
  setActiveSection
}) => {
  const recruiterItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'My Interviews', icon: Briefcase },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'create', label: 'Create Interview', icon: PlusCircle },
    { id: 'candidates', label: 'Candidate Database', icon: Users },
    { id: 'library', label: 'Agent Library', icon: Library },
    { id: 'tokens', label: 'Token Management', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings }];


  const traineeItems = [
    { id: 'gym', label: 'Training Gym', icon: GraduationCap },
    { id: 'history', label: 'Training History', icon: Library },
    { id: 'analysis', label: 'Skill Analysis', icon: BarChart3 },
    { id: 'achievements', label: 'Achievements', icon: LayoutDashboard }];


  const modules = [
    { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
    { id: 'trainee', label: 'Trainee', icon: GraduationCap },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'candidate', label: 'Candidate Demo', icon: UserCircle }];


  return (
    <div className="w-64 h-screen bg-[#2e013f6b] text-white flex flex-col border-r border-white/10">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-blue-500 flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center text-black">H</div>
          Recruiter AI
        </h1>
      </div>

      <div className="px-4 mb-8">
        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-4 block px-2">
          Module Selection
        </label>
        <div className="grid grid-cols-2 gap-2">
          {modules.map((m) =>
            <button
              key={m.id}
              onClick={() => {
                setActiveModule(m.id);
                if (m.id === 'recruiter') setActiveSection('dashboard');
                if (m.id === 'trainee') setActiveSection('gym');
              }}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200",
                activeModule === m.id ?
                  "bg-blue-800 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                  "bg-white/5 border-transparent text-white/60 hover:bg-white/10 hover:text-white"
              )}>

              <m.icon size={18} className="mb-1" />
              <span className="text-[10px] font-medium">{m.label}</span>
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        <label className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-4 block px-2">
          {activeModule === 'recruiter' ? 'Recruiter Navigation' : 'Trainee Navigation'}
        </label>

        <div className="space-y-1">
          {(activeModule === 'recruiter' ? recruiterItems : traineeItems).map((item) =>
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeSection === item.id ?
                  "bg-white/10 text-white" :
                  "text-white/50 hover:bg-white/5 hover:text-white"
              )}>

              <item.icon size={20} className={cn(
                "transition-colors",
                activeSection === item.id ? "text-emerald-500" : "group-hover:text-emerald-400"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 mb-4">
          <img src="https://picsum.photos/seed/user/100/100" className="w-10 h-10 rounded-xl" alt="User" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Kamla Kineh</p>
            <p className="text-xs text-white/40 truncate">Admin Account</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-white/50 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>);

};