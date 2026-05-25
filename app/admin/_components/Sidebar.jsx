"use client";
import { LayoutDashboard, Briefcase, GraduationCap, Wallet, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'wallet',    label: 'Wallet',    icon: Wallet },
  { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
  { id: 'trainee',   label: 'Trainee',   icon: GraduationCap },
];

export default function Sidebar({ active, onNav, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="flex flex-col h-screen sticky top-0 shrink-0 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-200"
      style={{ width: collapsed ? 52 : 200 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center shrink-0">
          <Shield size={13} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-none">Admin</p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-0.5">Doweit Voice</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-1.5 overflow-y-auto">
        {NAV.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150
                ${isActive
                  ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-700 dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              <Icon size={14} className="shrink-0" />
              {!collapsed && (
                <span className="text-[11px] font-medium truncate">{label}</span>
              )}
              {isActive && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-1.5 space-y-0.5">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
          {!collapsed && <span className="text-[11px]">Collapse</span>}
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={13} className="shrink-0" />
          {!collapsed && <span className="text-[11px]">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
