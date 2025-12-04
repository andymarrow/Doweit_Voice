"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiX, FiPlay, FiAward, FiBookOpen, FiTarget, FiClock, FiTrendingUp, FiDownload, FiShare2, FiCheckCircle, FiXCircle, FiAlertTriangle 
} from 'react-icons/fi';
import { 
    RadialBarChart, RadialBar, Legend, ResponsiveContainer, 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine
} from 'recharts';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// --- RICH MOCK DATA ---

const TOPIC_MASTERY_DATA = [
    { name: 'System Design', score: 90, fill: '#8b5cf6' }, // Purple
    { name: 'Database', score: 45, fill: '#ef4444' },     // Red
    { name: 'Networking', score: 75, fill: '#06b6d4' },   // Cyan
    { name: 'Scalability', score: 60, fill: '#f59e0b' },  // Yellow
];

const PACING_DATA = [
    { question: 'Q1', time: 12, avg: 15, status: 'fast' },
    { question: 'Q2', time: 45, avg: 20, status: 'slow' },
    { question: 'Q3', time: 18, avg: 18, status: 'optimal' },
    { question: 'Q4', time: 8, avg: 15, status: 'fast' },
    { question: 'Q5', time: 30, avg: 25, status: 'slow' },
];

const DETAILED_FEEDBACK = [
    { 
        id: 1, 
        question: "How does Consistent Hashing minimize reorganization?", 
        yourAnswer: "It maps data to a circle ring.", 
        correctAnswer: "It maps both data AND nodes to a ring, so adding a node only affects its immediate neighbor.",
        status: "partial",
        topic: "System Design",
        timeSpent: "45s"
    },
    { 
        id: 2, 
        question: "Explain the CAP Theorem constraints.", 
        yourAnswer: "You can only have Consistency and Partition Tolerance.", 
        correctAnswer: "In a distributed system, you can only pick two: Consistency, Availability, Partition Tolerance.",
        status: "correct",
        topic: "Database",
        timeSpent: "12s"
    },
    { 
        id: 3, 
        question: "When should you use a Graph Database?", 
        yourAnswer: "For financial transactions.", 
        correctAnswer: "For highly interconnected data, like social networks or recommendation engines.",
        status: "wrong",
        topic: "Database",
        timeSpent: "30s"
    }
];

export default function TrainingAnalysisModal({ isOpen, onClose, session }) {
    const [activeView, setActiveView] = useState('insights'); // 'insights' | 'breakdown'

    if (!isOpen || !session) return null;

    // Calculate Grade
    const grade = session.score >= 90 ? 'A' : session.score >= 80 ? 'B' : session.score >= 70 ? 'C' : 'D';
    const gradeColor = session.score >= 80 ? 'text-green-500' : session.score >= 60 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${uiColors.bgPrimary} border border-gray-200 dark:border-gray-800`}
            >
                {/* --- HEADER: SUMMARY --- */}
                <div className="flex-shrink-0 p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* Left: Title & Date */}
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Session Report</h2>
                            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
                                Quiz Mode
                            </span>
                        </div>
                        <p className={`text-sm ${uiColors.textSecondary} mt-1 flex items-center`}>
                            <FiClock className="mr-1" /> Completed Today, 10:42 AM • 12 min duration
                        </p>
                    </div>

                    {/* Middle: The Grade */}
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <span className={`block text-4xl font-black ${gradeColor}`}>{grade}</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Grade</span>
                        </div>
                        <div className="h-10 w-px bg-gray-300 dark:bg-gray-700"></div>
                        <div className="text-center">
                            <span className={`block text-3xl font-bold ${uiColors.textPrimary}`}>{session.score}%</span>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Accuracy</span>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex gap-3">
                        <button className={`p-2.5 rounded-xl border ${uiColors.borderPrimary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${uiColors.textSecondary}`}>
                            <FiDownload className="w-5 h-5" />
                        </button>
                        <button className={`p-2.5 rounded-xl border ${uiColors.borderPrimary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${uiColors.textSecondary}`}>
                            <FiShare2 className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className={`p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors`}>
                            <FiX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* --- BODY CONTENT --- */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    
                    {/* TOP ROW: VISUALIZATIONS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        
                        {/* CHART 1: TOPIC MASTERY (Radial Bar) */}
                        <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-2 ${uiColors.textPrimary}`}>Topic Mastery</h3>
                            <p className={`text-xs ${uiColors.textSecondary} mb-4`}>Your strength across different subjects.</p>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={20} data={TOPIC_MASTERY_DATA}>
                                        <RadialBar
                                            minAngle={15}
                                            label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                                            background
                                            clockWise
                                            dataKey="score"
                                            cornerRadius={10}
                                        />
                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                                        <Tooltip contentStyle={{ borderRadius: '12px', background: '#1f2937', border: 'none', color: '#fff' }} />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* CHART 2: PACING ANALYSIS (Bar Chart) */}
                        <div className={`p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm`}>
                            <h3 className={`text-lg font-bold mb-2 ${uiColors.textPrimary}`}>Time per Question</h3>
                            <p className={`text-xs ${uiColors.textSecondary} mb-4`}>Speed vs Average (Seconds)</p>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={PACING_DATA} barGap={0}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                        <XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                        <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', background: '#1f2937', border: 'none', color: '#fff' }} />
                                        <Bar dataKey="time" name="Your Time" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={30}>
                                            {PACING_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.time > 30 ? '#ef4444' : '#06b6d4'} />
                                            ))}
                                        </Bar>
                                        <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Target', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* AI INSIGHTS BAR */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <InsightCard 
                            type="success" 
                            title="Strong System Design" 
                            text="You nailed the caching strategies. Your understanding of Redis vs Memcached is solid." 
                            icon={FiCheckCircle}
                        />
                        <InsightCard 
                            type="danger" 
                            title="Database Gaps" 
                            text="You confused NoSQL partition keys. This is a critical concept for this role." 
                            icon={FiXCircle}
                        />
                        <InsightCard 
                            type="warning" 
                            title="Too Slow on Q2" 
                            text="You spent 45s on a definition question. Try to trust your first instinct on basics." 
                            icon={FiAlertTriangle}
                        />
                    </div>

                    {/* DETAILED QUESTION BREAKDOWN */}
                    <div className="space-y-4">
                        <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-4`}>Detailed Breakdown</h3>
                        
                        {DETAILED_FEEDBACK.map((item) => (
                            <div key={item.id} className={`p-5 rounded-2xl border ${uiColors.borderPrimary} bg-white dark:bg-gray-950 flex flex-col md:flex-row gap-6 transition-all hover:shadow-md`}>
                                {/* Status Indicator */}
                                <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 border-r border-gray-100 dark:border-gray-800 pr-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2 
                                        ${item.status === 'correct' ? 'bg-green-100 text-green-600' : 
                                          item.status === 'partial' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                        {item.status === 'correct' ? <FiCheckCircle /> : item.status === 'partial' ? <FiAlertTriangle /> : <FiXCircle />}
                                    </div>
                                    <span className="text-xs font-mono text-gray-400">{item.timeSpent}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`font-semibold text-lg ${uiColors.textPrimary}`}>{item.question}</h4>
                                        <span className={`text-xs font-bold px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 ${uiColors.textSecondary}`}>{item.topic}</span>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className={`p-3 rounded-xl ${item.status === 'correct' ? 'bg-green-50/50 dark:bg-green-900/10' : 'bg-red-50/50 dark:bg-red-900/10'}`}>
                                            <span className="text-xs font-bold uppercase block mb-1 opacity-70">Your Answer</span>
                                            <p className={`text-sm ${uiColors.textPrimary}`}>{item.yourAnswer}</p>
                                        </div>
                                        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10">
                                            <span className="text-xs font-bold uppercase block mb-1 opacity-70 text-blue-600 dark:text-blue-400">Model Answer</span>
                                            <p className={`text-sm ${uiColors.textPrimary}`}>{item.correctAnswer}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Learn More Action */}
                                <div className="flex-shrink-0 flex items-center">
                                    <button className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-cyan-600 dark:text-cyan-400 transition-colors" title="View Learning Resource">
                                        <FiBookOpen className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* --- FOOTER: ACTIONS --- */}
                <div className={`p-6 border-t ${uiColors.borderPrimary} bg-white dark:bg-gray-950 flex justify-between items-center`}>
                    <div className="text-sm text-gray-500">
                        Total XP Earned: <span className="font-bold text-yellow-500">+150 XP</span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className={`px-6 py-3 rounded-xl font-bold border ${uiColors.borderPrimary} hover:bg-gray-100 dark:hover:bg-gray-800 ${uiColors.textSecondary}`}>
                            Close
                        </button>
                        <button className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg ${uiColors.accentPrimaryGradient} flex items-center`}>
                            <FiPlay className="mr-2" /> Train Again
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}

// --- SUB-COMPONENT: INSIGHT CARD ---
function InsightCard({ type, title, text, icon: Icon }) {
    const styles = {
        success: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        danger: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
    };

    const iconColor = {
        success: 'text-green-600',
        danger: 'text-red-600',
        warning: 'text-yellow-600'
    };

    return (
        <div className={`p-4 rounded-2xl border ${styles[type]} flex gap-3`}>
            <div className={`mt-1 ${iconColor[type]}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h4 className="font-bold text-sm mb-1">{title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}