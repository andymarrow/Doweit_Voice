// app/agents/recruited/analysis/page.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, Legend
} from 'recharts';
import { FiTrendingUp, FiAward, FiTarget, FiActivity, FiZap, FiCheckCircle } from 'react-icons/fi';
import { uiColors, sectionVariants, itemVariants } from '@/app/callagents/_constants/uiConstants';

// --- ROBUST DEMO DATA ---

// 1. Performance Trend (Score history over 6 sessions)
const PERFORMANCE_DATA = [
    { session: 'S1', score: 45, confidence: 30, date: 'Oct 1' },
    { session: 'S2', score: 55, confidence: 45, date: 'Oct 5' },
    { session: 'S3', score: 52, confidence: 50, date: 'Oct 8' },
    { session: 'S4', score: 68, confidence: 65, date: 'Oct 12' },
    { session: 'S5', score: 75, confidence: 70, date: 'Oct 15' },
    { session: 'S6', score: 88, confidence: 85, date: 'Today' },
];

// 2. Skill Matrix (Radar Chart data)
const SKILL_DATA = [
    { subject: 'Technical', A: 85, fullMark: 100 },
    { subject: 'Communication', A: 65, fullMark: 100 },
    { subject: 'Confidence', A: 90, fullMark: 100 },
    { subject: 'Pacing', A: 50, fullMark: 100 },
    { subject: 'Empathy', A: 70, fullMark: 100 },
    { subject: 'Conciseness', A: 60, fullMark: 100 },
];

// 3. Activity (Bar Chart)
const ACTIVITY_DATA = [
    { name: 'Mon', quizzes: 4, interviews: 1 },
    { name: 'Tue', quizzes: 3, interviews: 0 },
    { name: 'Wed', quizzes: 2, interviews: 2 },
    { name: 'Thu', quizzes: 5, interviews: 0 },
    { name: 'Fri', quizzes: 1, interviews: 1 },
    { name: 'Sat', quizzes: 0, interviews: 0 },
    { name: 'Sun', quizzes: 6, interviews: 2 },
];

export default function GlobalAnalysisPage() {
    return (
        <div className="p-6 lg:p-8 space-y-8 pb-20 mx-auto">
            
            {/* --- HEADER SECTION --- */}
            <motion.div 
                variants={itemVariants} initial="hidden" animate="visible"
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className={`text-3xl font-bold ${uiColors.textPrimary}`}>Analysis & Growth</h1>
                    <p className={`${uiColors.textSecondary} mt-1`}>Detailed breakdown of your interview performance metrics.</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold flex items-center">
                        <FiTrendingUp className="mr-2" /> Top 15% of Trainees
                    </span>
                </div>
            </motion.div>

            {/* --- TOP METRICS CARDS --- */}
            <motion.div 
                variants={sectionVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
                <MetricCard title="Overall Score" value="78%" icon={FiAward} trend="+12%" color="blue" />
                <MetricCard title="Interviews" value="14" icon={FiActivity} trend="3 this week" color="purple" />
                <MetricCard title="Avg. Confidence" value="High" icon={FiZap} trend="Steady" color="yellow" />
                <MetricCard title="Streaks" value="5 Days" icon={FiTarget} trend="Personal Best" color="green" />
            </motion.div>

            {/* --- MAIN CHARTS ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-96">
                
                {/* 1. PROGRESSION CHART (Takes up 2/3 width) */}
                <motion.div 
                    variants={itemVariants} initial="hidden" animate="visible"
                    className={`lg:col-span-2 p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex flex-col`}
                >
                    <div className="mb-6 flex justify-between items-center">
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>Performance Trajectory</h3>
                        <select className={`text-xs p-1 rounded bg-gray-100 dark:bg-gray-800 ${uiColors.textSecondary} border-none outline-none`}>
                            <option>Last 30 Days</option>
                            <option>All Time</option>
                        </select>
                    </div>
                    
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={PERFORMANCE_DATA}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="session" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" name="Score" />
                                <Area type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorConf)" name="Confidence" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 2. SKILL RADAR (Takes up 1/3 width) */}
                <motion.div 
                    variants={itemVariants} initial="hidden" animate="visible"
                    className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex flex-col`}
                >
                    <h3 className={`text-lg font-bold mb-2 ${uiColors.textPrimary}`}>Skill Matrix</h3>
                    <p className={`text-xs ${uiColors.textSecondary} mb-4`}>Areas of strength vs weakness</p>
                    
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_DATA}>
                                <PolarGrid stroke="#E5E7EB" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="My Skills" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.4} />
                                <Tooltip content={<CustomTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* --- BOTTOM ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 3. ACTIVITY CHART */}
                <motion.div 
                    variants={itemVariants} initial="hidden" animate="visible"
                    className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                >
                    <h3 className={`text-lg font-bold mb-6 ${uiColors.textPrimary}`}>Weekly Activity</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ACTIVITY_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="quizzes" name="Quizzes Taken" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="interviews" name="Interviews" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* 4. AI INSIGHTS & SUGGESTIONS */}
                <motion.div 
                    variants={itemVariants} initial="hidden" animate="visible"
                    className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex flex-col`}
                >
                    <h3 className={`text-lg font-bold mb-4 flex items-center ${uiColors.textPrimary}`}>
                        <FiZap className="text-yellow-500 mr-2" /> AI Insights
                    </h3>
                    
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <InsightCard 
                            type="success"
                            title="Rapid Improvement"
                            text="Your technical accuracy has improved by 25% over the last 3 sessions. Keep focusing on System Design."
                        />
                        <InsightCard 
                            type="warning"
                            title="Pacing Issue"
                            text="You tend to speak very fast (190 wpm) in the first 2 minutes of an interview. Try to slow down your introductions."
                        />
                        <InsightCard 
                            type="info"
                            title="Suggested Training"
                            text="Based on your radar chart, your 'Conciseness' score is lagging. We recommend the 'STAR Method' flashcard deck."
                        />
                    </div>
                </motion.div>
            </div>

        </div>
    );
}

// --- SUB-COMPONENTS ---

// 1. Metric Card (Top Row)
function MetricCard({ title, value, icon: Icon, trend, color }) {
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        yellow: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    };

    return (
        <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex items-start justify-between hover:shadow-md transition-shadow`}>
            <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${uiColors.textSecondary} mb-1`}>{title}</p>
                <h4 className={`text-3xl font-extrabold ${uiColors.textPrimary}`}>{value}</h4>
                <p className={`text-xs mt-2 font-medium ${uiColors.textSecondary} flex items-center`}>
                    <FiTrendingUp className="mr-1" /> {trend}
                </p>
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}

// 2. Insight Card (AI Feedback)
function InsightCard({ type, title, text }) {
    const styles = {
        success: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
        warning: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
        info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
    };

    return (
        <div className={`p-4 rounded-r-xl border-l-4 ${styles[type]} border-t border-r border-b ${uiColors.borderPrimary}`}>
            <h5 className={`font-bold text-sm mb-1 ${uiColors.textPrimary}`}>{title}</h5>
            <p className={`text-xs leading-relaxed ${uiColors.textSecondary}`}>{text}</p>
        </div>
    );
}

// 3. Custom Tooltip for Recharts
function CustomTooltip({ active, payload, label }) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                <p className="font-bold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: <span className="font-bold">{entry.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
}