"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { RecruiterDashboard } from './modules/recruiter/Dashboard';
import { MyInterviews } from './modules/recruiter/MyInterviews';
import { InterviewDetail } from './modules/recruiter/InterviewDetail';
import { CreateInterview } from './modules/recruiter/CreateInterview';
import { Analysis } from './modules/recruiter/Analysis';
import { CandidateDatabase } from './modules/recruiter/CandidateDatabase';
import { Library as RecruiterLibrary } from './modules/recruiter/Library';
import { Tokens as RecruiterTokens } from './modules/recruiter/Tokens';
import { Settings as RecruiterSettings } from './modules/recruiter/Settings';
import { TrainingGym } from './modules/trainee/TrainingGym';
import { TraineeAnalysis } from './modules/trainee/TraineeAnalysis';
import { CandidateModule } from './modules/candidate/CandidateModule';
import { Marketplace } from './modules/marketplace/Marketplace';

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
  Library,
  Coins,
  ClipboardCheck,
  History
} from
  'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const searchParams = useSearchParams();

  const [activeModule, setActiveModule] = useState('recruiter');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedInterviewId, setSelectedInterviewId] = useState(null);
  const [activeInterviewTab, setActiveInterviewTab] = useState('dashboard');

  useEffect(() => {
    const s = searchParams.get('section');
    const m = searchParams.get('module');
    if (s) setActiveSection(s);
    if (m) setActiveModule(m);
  }, [searchParams]);


  const recruiterItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'interviews', label: 'Interviews', icon: Briefcase },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'tokens', label: 'Tokens', icon: Coins },
    { id: 'settings', label: 'Settings', icon: Settings }];


  const interviewTabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'candidate', label: 'Candidates', icon: Users },
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'activity', label: 'Activity', icon: History }];


  const traineeItems = [
    { id: 'gym', label: 'Gym', icon: GraduationCap },
    { id: 'history', label: 'History', icon: Library },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 }];


  const modules = [
    { id: 'recruiter', label: 'Recruiter', icon: Briefcase },
    { id: 'trainee', label: 'Trainee', icon: GraduationCap },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
    { id: 'candidate', label: 'Demo', icon: UserCircle }];


  const renderContent = () => {
    if (activeModule === 'candidate') return <CandidateModule />;
    if (activeModule === 'marketplace') return <Marketplace />;

    if (activeModule === 'recruiter') {
      if (activeSection === 'interviews' && selectedInterviewId) {
        return (
          <InterviewDetail
            interviewId={selectedInterviewId}
            activeTab={activeInterviewTab}
            onTabChange={(tab) => setActiveInterviewTab(tab)}
            onBack={() => setSelectedInterviewId(null)} />);


      }

      switch (activeSection) {
        case 'dashboard': return <RecruiterDashboard onNavigate={setActiveSection} />;
        case 'interviews': return (
          <MyInterviews
            onSelectInterview={(id) => {
              setSelectedInterviewId(id);
              setActiveInterviewTab('dashboard');
            }} />);


        case 'create': return <CreateInterview />;
        case 'analysis': return <Analysis />;
        case 'candidates': return <CandidateDatabase />;
        case 'library': return <RecruiterLibrary />;
        case 'tokens': return <RecruiterTokens />;
        case 'settings': return <RecruiterSettings />;
        default: return <div className="py-10 text-center text-gray-400 italic">Coming soon...</div>;
      }
    }

    if (activeModule === 'trainee') {
      switch (activeSection) {
        case 'gym': return <TrainingGym />;
        case 'history': return <TraineeAnalysis />;
        case 'analysis': return <TraineeAnalysis />;
        default: return <div className="py-10 text-center text-gray-400 italic">Coming soon...</div>;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col">
      {/* Top Navbar: Global Module Switcher */}
      <header className="sticky top-0 z-50 bg-white border-b border-black/5 shadow-sm h-14 flex items-center px-6 justify-between shrink-0">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter text-blue-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center text-white text-xs">H</div>
            Recruiter Ai
          </h1>

          <nav className="flex items-center gap-1">
            {modules.map((m) =>
              <button
                key={m.id}
                onClick={() => {
                  setActiveModule(m.id);
                  if (m.id === 'recruiter') setActiveSection('dashboard');
                  if (m.id === 'trainee') setActiveSection('gym');
                  if (m.id === 'marketplace') setActiveSection('market');
                  if (m.id === 'candidate') setActiveSection('demo');
                }}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2",
                  activeModule === m.id ?
                    "bg-emerald-50 text-blue-800 shadow-sm" :
                    "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}>

                <m.icon size={14} />
                {m.label}
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-gray-200 focus:ring-0 transition-all text-xs w-48" />

          </div>
          <div className="flex items-center gap-2 border-l border-black/5 pl-4">
            <button className="p-2 rounded-xl hover:bg-gray-50 text-gray-500 relative transition-all">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 overflow-hidden border border-black/5">
                <img src="https://picsum.photos/seed/user/100/100" alt="User" className="w-full h-full object-cover" />
              </div>
              <ChevronRight size={12} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Section Switcher (Module Specific) */}
        {(activeModule === 'recruiter' || activeModule === 'trainee') &&
          <aside className="w-56 bg-white border-r border-black/5 flex flex-col shrink-0 animate-in slide-in-from-left duration-300">
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  {activeModule === 'recruiter' && selectedInterviewId ?
                    <>
                      {interviewTabs.map((item) =>
                        <button
                          key={item.id}
                          onClick={() => setActiveInterviewTab(item.id)}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                            activeInterviewTab === item.id ?
                              "bg-emerald-600 text-white shadow-md" :
                              "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                          )}>

                          <item.icon size={16} />
                          {item.label}
                        </button>
                      )}
                      <div className="pt-4 mt-4 border-t border-black/5">
                        <button
                          onClick={() => setSelectedInterviewId(null)}
                          className="w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-3 transition-all">

                          <ChevronLeft size={16} />
                          Back to List
                        </button>
                      </div>
                    </> :

                    (activeModule === 'recruiter' ? recruiterItems : traineeItems).map((item) =>
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          "w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3",
                          activeSection === item.id ?
                            "bg-blue-900 text-white shadow-md" :
                            "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Credits</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-emerald-700">1,240</span>
                    <span className="text-[10px] font-bold text-emerald-600/60">pts</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-black/5 space-y-2">
              <button className="w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-3 transition-all">
                <HelpCircle size={16} />
                Support
              </button>
              <button className="w-full px-3 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 flex items-center gap-3 transition-all">
                <Settings size={16} />
                Settings
              </button>
            </div>
          </aside>
        }

        {/* Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto",
          activeModule === 'candidate' ? "p-0" : "p-8"
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
    </div>);

}