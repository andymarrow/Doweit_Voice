// app/agents/recruiter/[agentid]/_components/CandidateAnalysisModal.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiX, FiPlay, FiPause, FiDownload, FiCheck, FiXCircle, 
    FiShield, FiMail, FiMapPin, FiLinkedin, FiFileText, FiCpu, FiAlertCircle,
    FiGlobe
} from 'react-icons/fi';
import Image from 'next/image';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    PieChart, Pie, Cell
} from 'recharts';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// --- MOCK DATA FOR VISUALS ---

const SKILL_DATA = [
    { subject: 'Technical', A: 95, fullMark: 100 },
    { subject: 'Communication', A: 70, fullMark: 100 },
    { subject: 'Culture Fit', A: 85, fullMark: 100 },
    { subject: 'Problem Solving', A: 90, fullMark: 100 },
    { subject: 'Confidence', A: 65, fullMark: 100 },
    { subject: 'Pacing', A: 60, fullMark: 100 },
];

const TIMELINE_DATA = [
    { time: '0m', sentiment: 40, label: 'Intro' },
    { time: '2m', sentiment: 60, label: 'History' },
    { time: '4m', sentiment: 85, label: 'Technical' },
    { time: '6m', sentiment: 90, label: 'Deep Dive' },
    { time: '8m', sentiment: 70, label: 'Scenario' },
    { time: '10m', sentiment: 50, label: 'Questions' },
    { time: '12m', sentiment: 80, label: 'Closing' },
];

const SENTIMENT_DATA = [
    { name: 'Positive', value: 65, color: '#10B981' },
    { name: 'Neutral', value: 25, color: '#F59E0B' },
    { name: 'Negative', value: 10, color: '#EF4444' },
];

const SCREENSHOTS = Array(6).fill('/imagePlaceholder.jpg'); 

export default function CandidateAnalysisModal({ isOpen, onClose, candidate }) {
    const [activeTab, setActiveTab] = useState('analysis');
    const [isPlaying, setIsPlaying] = useState(false);

    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row ${uiColors.bgPrimary} border border-gray-200 dark:border-gray-800`}
            >
                {/* --- LEFT SIDEBAR: PROFILE & ACTIONS --- */}
                <div className="w-full md:w-80 flex-shrink-0 bg-gray-50/80 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    
                    {/* Profile Header */}
                    <div className="p-6 flex flex-col items-center text-center border-b border-gray-200 dark:border-gray-800">
                        <div className="relative w-28 h-28 mb-4 group">
                            <div className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-cyan-500 to-blue-600 shadow-xl ring-4 ring-white dark:ring-gray-800`}>
                                {candidate.name.charAt(0)}
                            </div>
                            <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-2 border-white dark:border-gray-800" title="Online" />
                        </div>
                        <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>{candidate.name}</h2>
                        <p className={`text-sm ${uiColors.textSecondary} mb-4`}>Applied 2 days ago</p>
                        
                        <div className="flex gap-2">
                            <SocialIcon icon={FiMail} />
                            <SocialIcon icon={FiLinkedin} />
                            <SocialIcon icon={FiGlobe} />
                        </div>
                    </div>

                    {/* Fit Score Card */}
                    <div className="p-6">
                        <div className={`p-5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 text-center`}>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">AI Fit Score</p>
                            <div className="flex items-center justify-center mb-2">
                                <span className={`text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${candidate.score >= 80 ? 'from-green-500 to-emerald-700' : 'from-yellow-500 to-orange-600'}`}>
                                    {candidate.score}
                                </span>
                                <span className="text-xl text-gray-400 ml-1">/100</span>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${candidate.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {candidate.score >= 80 ? 'Highly Recommended' : 'Review Needed'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-6 space-y-3 mb-6">
                        <StatRow label="Experience" value="Senior" />
                        <StatRow label="Location" value="London, UK" />
                        <StatRow label="Salary" value="$120k - $140k" />
                    </div>

                    {/* Action Footer */}
                    <div className="mt-auto p-6 space-y-3">
                        <button className={`w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 ${uiColors.accentPrimaryGradient} flex items-center justify-center transition-transform active:scale-95`}>
                            <FiCheck className="mr-2" /> Shortlist Candidate
                        </button>
                        <button className="w-full py-3 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center">
                            <FiXCircle className="mr-2" /> Reject
                        </button>
                    </div>
                </div>

                {/* --- RIGHT CONTENT: ANALYSIS DASHBOARD --- */}
                <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-gray-950">
                    
                    {/* Top Tabs */}
                    <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex space-x-8">
                            <TabButton label="AI Analysis" active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                            <TabButton label="Transcript" active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} />
                            <TabButton label="Anti-Cheat" active={activeTab === 'anticheat'} onClick={() => setActiveTab('anticheat')} />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <FiX className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        
                        {activeTab === 'analysis' && (
                            <div className="space-y-8">
                                {/* Top Row: Radar & Insights */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    
                                    {/* 1. Skill Radar Chart */}
                                    <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50`}>
                                        <h3 className={`text-lg font-bold mb-6 flex items-center ${uiColors.textPrimary}`}>
                                            <FiCpu className="mr-2 text-purple-500" /> Skill Competency Matrix
                                        </h3>
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_DATA}>
                                                    <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar name="Candidate" dataKey="A" stroke="#06b6d4" strokeWidth={3} fill="#06b6d4" fillOpacity={0.3} />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* 2. Executive Summary & Sentiment */}
                                    <div className="space-y-6">
                                        <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-blue-50/50 dark:bg-blue-900/10`}>
                                            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-3">AI Executive Summary</h3>
                                            <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                                                {candidate.name} shows <strong>exceptional technical depth</strong> in React patterns, specifically regarding performance optimization. However, communication style was occasionally verbose. They align well with the team culture but may need coaching on concise reporting.
                                            </p>
                                        </div>

                                        <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex items-center justify-between`}>
                                            <div>
                                                <h3 className={`text-lg font-bold mb-1 ${uiColors.textPrimary}`}>Sentiment Analysis</h3>
                                                <p className={`text-xs ${uiColors.textSecondary}`}>Tone consistency throughout call</p>
                                            </div>
                                            <div className="w-32 h-32">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie data={SENTIMENT_DATA} innerRadius={25} outerRadius={40} paddingAngle={5} dataKey="value">
                                                            {SENTIMENT_DATA.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Row: Timeline Chart */}
                                <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm`}>
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className={`text-lg font-bold flex items-center ${uiColors.textPrimary}`}>
                                            <FiAlertCircle className="mr-2 text-cyan-500" /> Interview Engagement Timeline
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className="text-xs flex items-center text-gray-500"><div className="w-2 h-2 rounded-full bg-cyan-500 mr-1"/> Confidence</span>
                                        </div>
                                    </div>
                                    <div className="h-[250px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={TIMELINE_DATA}>
                                                <defs>
                                                    <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                                <Tooltip contentStyle={{backgroundColor: '#1F2937', borderColor: '#374151', color: '#fff'}} itemStyle={{color: '#fff'}} />
                                                <Area type="monotone" dataKey="sentiment" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSentiment)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'transcript' && (
                            <div className="space-y-6 max-w-4xl mx-auto">
                                {/* Audio Player */}
                                <div className={`sticky top-0 z-10 p-4 rounded-2xl border ${uiColors.borderPrimary} bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-lg`}>
                                    <div className="flex items-center space-x-4">
                                        <button 
                                            onClick={() => setIsPlaying(!isPlaying)}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 ${uiColors.accentPrimaryGradient}`}
                                        >
                                            {isPlaying ? <FiPause className="w-5 h-5" /> : <FiPlay className="w-5 h-5 ml-1" />}
                                        </button>
                                        
                                        <div className="flex-1 space-y-1">
                                            <div className="h-8 flex items-center space-x-1">
                                                {/* Fake Waveform */}
                                                {Array.from({ length: 40 }).map((_, i) => (
                                                    <div 
                                                        key={i} 
                                                        className={`w-1 rounded-full transition-all duration-300 ${i < 15 ? 'bg-cyan-500 h-6' : 'bg-gray-300 dark:bg-gray-700 h-3'}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between text-xs font-mono text-gray-500">
                                                <span>04:12</span>
                                                <span>12:45</span>
                                            </div>
                                        </div>

                                        <button className={`p-2.5 rounded-xl border ${uiColors.borderPrimary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
                                            <FiDownload className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Messages */}
                                <div className="space-y-6 pb-10">
                                    <TranscriptItem role="AI" text="Could you explain the difference between optimistic UI and standard loading states?" time="02:15" />
                                    <TranscriptItem role="Candidate" text="Sure. Standard loading waits for the server response before updating the UI. Optimistic UI updates immediately, assuming success, then rolls back if it fails." time="02:22" />
                                    <TranscriptItem role="AI" text="Excellent definition. When would you avoid using optimistic UI?" time="02:45" />
                                    <TranscriptItem role="Candidate" text="Probably for critical transactions, like payments, where false positives are dangerous." time="02:50" />
                                </div>
                            </div>
                        )}

                        {activeTab === 'anticheat' && (
                            <div className="space-y-6">
                                <div className={`p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 flex items-start`}>
                                    <FiShield className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Security Report</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            No suspicious tab switching detected. Audio environment matches visual environment. 10/10 snapshots verified.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {SCREENSHOTS.map((src, i) => (
                                        <div key={i} className="group relative aspect-video rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-black cursor-pointer hover:ring-2 ring-cyan-500 transition-all">
                                            <Image src={src} alt={`Snapshot ${i}`} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md font-mono">
                                                {(i + 1) * 2}:34
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function SocialIcon({ icon: Icon }) {
    return (
        <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
            <Icon className="w-4 h-4" />
        </button>
    );
}

function StatRow({ label, value }) {
    return (
        <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className={uiColors.textSecondary}>{label}</span>
            <span className={`font-semibold ${uiColors.textPrimary}`}>{value}</span>
        </div>
    );
}

function TabButton({ label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`pb-4 text-sm font-semibold transition-all relative ${active ? 'text-cyan-600 dark:text-cyan-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
        >
            {label}
            {active && (
                <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full"
                />
            )}
        </button>
    );
}

function TranscriptItem({ role, text, time }) {
    const isAi = role === 'AI';
    return (
        <div className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex flex-col ${isAi ? 'items-start' : 'items-end'} max-w-[80%]`}>
                <div className="flex items-center space-x-2 mb-1">
                    <span className={`text-xs font-bold ${isAi ? 'text-cyan-600' : 'text-gray-500'}`}>{role}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{time}</span>
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    isAi 
                    ? 'bg-cyan-50 dark:bg-cyan-900/10 text-gray-800 dark:text-gray-200 border border-cyan-100 dark:border-cyan-900/30 rounded-tl-sm' 
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-tr-sm'
                }`}>
                    {text}
                </div>
            </div>
        </div>
    );
}