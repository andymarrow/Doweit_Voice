"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TraineeDashboard } from './modules/Dashboard';
import { MySessions }       from './modules/MySessions';
import { CreateSession }    from './modules/CreateSession';
import { TraineeMarketplace } from './modules/Marketplace';
import { TraineeTokens }    from './modules/Tokens';
import { TraineeSettings }  from './modules/Settings';
import {
  LayoutDashboard,
  RotateCcw,
  PlusCircle,
  ShoppingBag,
  Coins,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Bell,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileMenu from '@/components/ProfileMenu';

const NAV = [
  { id: 'dashboard',   label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'sessions',    label: 'My Interviews', icon: RotateCcw },
  { id: 'create',      label: 'Create',       icon: PlusCircle },
  { id: 'marketplace', label: 'Marketplace',  icon: ShoppingBag },
  { id: 'tokens',      label: 'Tokens',       icon: Coins },
  { id: 'settings',    label: 'Settings',     icon: Settings },
];

function TraineeContent() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const s = searchParams.get('section');
    if (s) setActiveSection(s);
  }, [searchParams]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':   return <TraineeDashboard   onNavigate={setActiveSection} />;
      case 'sessions':    return <MySessions          onNavigate={setActiveSection} />;
      case 'create':      return <CreateSession       onNavigate={setActiveSection} />;
      case 'marketplace': return <TraineeMarketplace  onNavigate={setActiveSection} />;
      case 'tokens':      return <TraineeTokens />;
      case 'settings':    return <TraineeSettings />;
      default:            return <div className="py-16 text-center text-gray-400 italic text-sm">Coming soon…</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex selection:bg-purple-100 selection:text-purple-900">

      {/* ─── Sidebar ──────────────────────────────────────────────── */}
      <aside className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen fixed left-0 top-0 z-40 flex flex-col transition-all duration-300 shadow-sm',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {/* Logo */}
        <div className={cn('flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 dark:border-gray-700', collapsed && 'justify-center px-0')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-200 dark:shadow-none flex-shrink-0">
            <GraduationCap size={16} />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-black tracking-tight text-purple-700 dark:text-purple-300 leading-tight">Trainee AI</h1>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Platform</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className={cn(
            'flex items-center justify-center h-7 w-7 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-300 text-gray-400 dark:text-gray-300 transition-all mx-auto my-2',
          )}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all',
                  active
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md shadow-purple-200 dark:shadow-none'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-gray-700 hover:text-purple-700 dark:hover:text-purple-300',
                  collapsed && 'justify-center px-0'
                )}
              >
                <item.icon size={16} className="flex-shrink-0" />
                {!collapsed && item.label}
              </button>
            );
          })}
        </nav>

        {/* XP Widget */}
        {!collapsed && (
          <div className="mx-3 mb-4 p-3.5 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200 dark:shadow-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/70 mb-1">XP Points</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black">3,840</span>
              <span className="text-[10px] font-bold text-white/60 flex items-center gap-0.5">
                <Zap size={10} fill="currentColor" /> Level 7
              </span>
            </div>
            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5" style={{ width: '68%' }} />
            </div>
            <p className="text-[9px] text-white/60 mt-1">680 XP to Level 8</p>
          </div>
        )}
        {collapsed && (
          <div className="mb-4 flex justify-center">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md" title="XP">
              <Zap size={14} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Profile menu — pinned to the bottom so theme + logout are always
            reachable, same pattern as the recruiter sidebar. */}
        <div className="border-t border-gray-100 dark:border-gray-700 px-2 py-3">
          <ProfileMenu collapsed={collapsed} variant="indigo" />
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className={cn(
        'flex-1 transition-all duration-300 min-h-screen',
        collapsed ? 'ml-16' : 'ml-56'
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 h-14 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-gray-800 dark:text-gray-100 capitalize">{NAV.find(n => n.id === activeSection)?.label}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-300 relative transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full border-2 border-white dark:border-gray-900" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-200 dark:shadow-none cursor-pointer">
              T
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8 max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default function TraineePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <TraineeContent />
    </Suspense>
  );
}
