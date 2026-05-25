"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecruiterDashboard } from './modules/Dashboard';
import { MyInterviews } from './modules/MyInterviews';
import { InterviewDetail } from './modules/InterviewDetail';
import { CreateInterview } from './modules/CreateInterview';
import { CandidateDatabase } from './modules/CandidateDatabase';
import { Marketplace as RecruiterMarketplace } from './modules/Marketplace';
import { Tokens as RecruiterTokens } from './modules/Tokens';
import { Settings as RecruiterSettings } from './modules/Settings';
import {
  Bell,
  Search,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Settings,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  UserCircle,
  LayoutDashboard,
  Users,
  BarChart3,
  PlusCircle,
  Coins,
  ClipboardCheck,
  History
} from
  'lucide-react';
import { cn } from '@/lib/utils';

function RecruiterApp() {
  const searchParams = useSearchParams();

  const [activeModule, setActiveModule] = useState('recruiter');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [activeInterviewTab, setActiveInterviewTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const s = searchParams.get('section');
    const m = searchParams.get('module');
    if (s) setActiveSection(s);
    if (m) setActiveModule(m);
  }, [searchParams]);


  const recruiterItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'Interviews', icon: Briefcase },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings }];
  const renderContent = () => {
    if (activeModule === 'recruiter') {
      switch (activeSection) {
        case 'dashboard': return <RecruiterDashboard onNavigate={setActiveSection} />;
        case 'interviews': return (
          <MyInterviews
            onSelectInterview={(id) => {
              setSelectedInterviewId(id);
              setActiveInterviewTab('dashboard');
            }} />);
        case 'create': return <CreateInterview />;
        case 'candidates': return <CandidateDatabase />;
        case 'marketplace': return <RecruiterMarketplace buyerType="recruiter" onNavigate={(section) => setActiveSection(section)} />;
        case 'tokens': return <RecruiterTokens />;
        case 'settings': return <RecruiterSettings />;
        default: return <div className="py-10 text-center text-gray-400 italic">Coming soon...</div>;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans selection:bg-purple-100 selection:text-purple-900 flex flex-col">

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Section Switcher (Module Specific) */}
        {(activeModule === 'recruiter' || activeModule === 'trainee') &&
          <aside className={cn(
            "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 transition-all duration-300 z-40",
            isSidebarCollapsed ? "w-16" : "w-56"
          )}>
            {/* Shrink/Expand Button */}
            <div className="flex justify-end p-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              </button>
            </div>
            
            <div className={cn(
              "px-4 space-y-6 h-full overflow-hidden",
              isSidebarCollapsed ? "hidden" : "block"
            )}>
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  <h1 className="text-xl font-black tracking-tighter text-purple-700 dark:text-purple-400 flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-600 dark:bg-purple-500 rounded flex items-center justify-center text-white text-xs">H</div>
                    Recruiter Ai
                  </h1>
                  {recruiterItems.map((item) =>
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                          activeSection === item.id ?
                            "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-white shadow-md" :
                            "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                        )}>

                        <item.icon size={16} />
                        {item.label}
                      </button>
                    )
                  }
                </div>
              </div>

              {/* Quick Actions / Stats Placeholder */}
              <div className="px-2 space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-100 dark:bg-purple-900 border border-cyan-200 dark:border-purple-700 space-y-2">
                  <p className="text-[10px] font-bold text-cyan-700 dark:text-purple-300 uppercase tracking-widest">Credits</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-cyan-800 dark:text-purple-400">1,240</span>
                    <span className="text-[10px] font-bold text-cyan-600/60 dark:text-purple-500/60">pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Icons-only view when collapsed */}
            {isSidebarCollapsed && (
              <div className="px-2 space-y-4 h-full overflow-hidden">
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-purple-600 dark:bg-purple-500 rounded flex items-center justify-center text-white text-xs font-bold">H</div>
                </div>
                <div className="space-y-2">
                  {recruiterItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={cn(
                        "w-full p-2 rounded-xl transition-all flex justify-center",
                        activeSection === item.id ?
                          "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-white" :
                          "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                      )}
                      title={item.label}
                    >
                      <item.icon size={16} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        }

        {/* Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto transition-all duration-300",
          activeModule === 'candidate' ? "p-0" : "p-8",
          (activeModule === 'recruiter' || activeModule === 'trainee') ? (isSidebarCollapsed ? "ml-16" : "ml-56") : ""
        )}>
          <div className={cn(
            "mx-auto",
            activeModule === 'candidate' ? "max-w-none" : "max-w-6xl"
          )}>
            {renderContent()}
          </div>
        </main>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Full-screen InterviewDetail overlay */}
      {activeSection === 'interviews' && selectedInterviewId && (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto">
          <div className="p-6 min-h-screen">
            <InterviewDetail
              interviewId={selectedInterviewId}
              activeTab={activeInterviewTab}
              onTabChange={(tab) => setActiveInterviewTab(tab)}
              onBack={() => setSelectedInterviewId(null)}
            />
          </div>
        </div>
      )}
    </div>);
}

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" /></div>}>
      <RecruiterApp />
    </Suspense>
  );
}