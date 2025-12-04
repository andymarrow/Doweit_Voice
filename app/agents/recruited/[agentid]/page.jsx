// app/agents/recruited/[agentid]/page.jsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiPlay, FiZap, FiClock, FiTarget, FiTrendingUp, FiCpu, FiAward 
} from 'react-icons/fi';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { uiColors, sectionVariants, itemVariants } from '@/app/callagents/_constants/uiConstants';

// Components
import QuizGame from './_components/QuizGame';
import HistoryTab from './_components/HistoryTab';

// --- MOCK DATA ---
const PERFORMANCE_DATA = [
    { session: '1', score: 45 }, { session: '2', score: 55 },
    { session: '3', score: 50 }, { session: '4', score: 68 },
    { session: '5', score: 75 }, { session: '6', score: 88 },
];

const SKILL_DATA = [
    { subject: 'Tech', A: 80, fullMark: 100 },
    { subject: 'Soft Skills', A: 65, fullMark: 100 },
    { subject: 'Speed', A: 90, fullMark: 100 },
    { subject: 'Accuracy', A: 70, fullMark: 100 },
];

export default function TraineeGymPage({ params }) {
    const { agentid } = params;
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'history'
    const [gymMode, setGymMode] = useState('dashboard'); // 'dashboard', 'quiz'

    // Return to dashboard from quiz
    const handleExitQuiz = () => setGymMode('dashboard');

    return (
        <div className="flex flex-col h-full space-y-6 p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Google System Design</h1>
                    <p className={`text-sm ${uiColors.textSecondary} flex items-center mt-1`}>
                        <FiCpu className="mr-2 text-cyan-500" /> AI Trainer • Level 5 Mastery
                    </p>
                </div>
                {/* Global Tabs */}
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    <TabButton label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <TabButton label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>
            </div>

            {/* --- CONTENT AREA --- */}
            <div className="flex-1 min-h-0">
                
                {/* HISTORY TAB */}
                {activeTab === 'history' && <HistoryTab agentId={agentid} />}

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                        className="h-full flex flex-col space-y-6"
                    >
                        {gymMode === 'dashboard' && (
                            <>
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard label="XP Earned" value="1,250" icon={FiZap} color="text-yellow-500" bg="bg-yellow-500/10" />
                                    <StatCard label="Avg Score" value="78%" icon={FiTarget} color="text-green-500" bg="bg-green-500/10" />
                                    <StatCard label="Streak" value="3 Days" icon={FiTrendingUp} color="text-blue-500" bg="bg-blue-500/10" />
                                    <StatCard label="Time Trained" value="4h 20m" icon={FiClock} color="text-purple-500" bg="bg-purple-500/10" />
                                </div>

                                {/* Main Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                                    
                                    {/* Left Column: Actions & Progress (2/3 width) */}
                                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                                        
                                        {/* Action Modules */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Quiz Module */}
                                            <div 
                                                onClick={() => setGymMode('quiz')}
                                                className={`group p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-purple-500 transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden`}
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <FiZap className="w-24 h-24 text-purple-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mb-4">
                                                        <FiAward className="w-6 h-6" />
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Skill Drill</h3>
                                                    <p className={`text-xs ${uiColors.textSecondary} mt-1 mb-4`}>Quick-fire questions to test specific concepts.</p>
                                                    <span className="text-purple-600 font-bold text-sm flex items-center">Start Quiz <FiPlay className="ml-2 w-3 h-3"/></span>
                                                </div>
                                            </div>

                                            {/* Interview Module */}
                                            <div 
                                                onClick={() => window.open(`/interview/${agentid}?mode=training`, '_blank')}
                                                className={`group p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-cyan-500 transition-all cursor-pointer shadow-sm hover:shadow-md relative overflow-hidden`}
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                    <FiClock className="w-24 h-24 text-cyan-500" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 flex items-center justify-center mb-4">
                                                        <FiPlay className="w-6 h-6" />
                                                    </div>
                                                    <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Mock Interview</h3>
                                                    <p className={`text-xs ${uiColors.textSecondary} mt-1 mb-4`}>Full video simulation with anti-cheat & analysis.</p>
                                                    <span className="text-cyan-600 font-bold text-sm flex items-center">Enter Room <FiPlay className="ml-2 w-3 h-3"/></span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Progress Chart */}
                                        <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} flex-1 min-h-[300px]`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className={`font-bold ${uiColors.textPrimary}`}>Mastery Curve</h3>
                                                <select className={`text-xs p-1 rounded bg-gray-100 dark:bg-gray-800 ${uiColors.textSecondary} border-none outline-none`}>
                                                    <option>Score</option>
                                                    <option>Confidence</option>
                                                </select>
                                            </div>
                                            <ResponsiveContainer width="100%" height="90%">
                                                <AreaChart data={PERFORMANCE_DATA}>
                                                    <defs>
                                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                                    <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                                                    <Tooltip contentStyle={{backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff'}} itemStyle={{color: '#fff'}} />
                                                    <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Right Column: Radar & Insights (1/3 width) */}
                                    <div className="space-y-6 flex flex-col">
                                        
                                        {/* Radar Chart */}
                                        <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} h-80 flex flex-col`}>
                                            <h3 className={`font-bold ${uiColors.textPrimary} mb-2`}>Skill Balance</h3>
                                            <div className="flex-1">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={SKILL_DATA}>
                                                        <PolarGrid stroke="#E5E7EB" />
                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 'bold' }} />
                                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                        <Radar name="My Skills" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.4} />
                                                    </RadarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Weakness Insight */}
                                        <div className={`p-5 rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 flex-1`}>
                                            <h4 className="font-bold text-orange-800 dark:text-orange-200 mb-2 text-sm flex items-center">
                                                <FiTarget className="mr-2" /> Focus Area
                                            </h4>
                                            <p className="text-xs text-orange-700 dark:text-orange-300 leading-relaxed">
                                                Your <strong>Technical Accuracy</strong> is high, but your <strong>Speed</strong> drops significantly during "System Architecture" questions. Try the "Rapid Fire" quiz mode.
                                            </p>
                                            <button className="mt-4 w-full py-2 bg-white dark:bg-orange-900/40 text-orange-600 dark:text-orange-200 text-xs font-bold rounded-lg shadow-sm">
                                                Train Speed
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </>
                        )}

                        {/* Quiz Mode (Renders inside the dashboard area) */}
                        {gymMode === 'quiz' && (
                            <div className="h-full flex-1 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 overflow-hidden">
                                <QuizGame agentId={agentid} onExit={handleExitQuiz} />
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function TabButton({ label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                active 
                ? 'bg-white dark:bg-gray-700 shadow-sm text-cyan-600 dark:text-cyan-400' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
            {label}
        </button>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className={`p-4 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className={`text-xs ${uiColors.textSecondary} uppercase tracking-wider`}>{label}</p>
                <p className={`text-lg font-bold ${uiColors.textPrimary}`}>{value}</p>
            </div>
        </div>
    );
}