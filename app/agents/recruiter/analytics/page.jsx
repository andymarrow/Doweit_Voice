// app/agents/recruiter/analytics/page.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { uiColors, sectionVariants } from '@/app/callagents/_constants/uiConstants';

export default function RecruiterAnalyticsPage() {
    return (
        <div className="p-6 space-y-8 pb-20">
            <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Hiring Analytics</h1>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Time to Hire" value="14 Days" change="-2.5 days" trend="up" />
                <MetricCard title="Offer Acceptance" value="85%" change="+5%" trend="up" />
                <MetricCard title="Active Candidates" value="342" change="+12" trend="neutral" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Funnel Chart */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}>
                    <h3 className={`text-lg font-bold mb-6 ${uiColors.textPrimary}`}>Recruitment Funnel</h3>
                    <div className="space-y-4">
                        <FunnelBar label="Applied" count={1200} percent={100} color="bg-blue-500" />
                        <FunnelBar label="AI Screened" count={1200} percent={100} color="bg-cyan-500" />
                        <FunnelBar label="Passed Threshold" count={450} percent={37} color="bg-teal-500" />
                        <FunnelBar label="Shortlisted" count={120} percent={10} color="bg-green-500" />
                        <FunnelBar label="Offer Sent" count={15} percent={1.2} color="bg-purple-500" />
                    </div>
                </motion.div>

                {/* Source Chart (Simple Circle CSS) */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible" className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex flex-col items-center justify-center`}>
                    <h3 className={`text-lg font-bold mb-6 self-start ${uiColors.textPrimary}`}>Candidate Sources</h3>
                    <div className="relative w-48 h-48 rounded-full border-8 border-cyan-100 dark:border-gray-800 flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            {/* LinkedIn Segment (60%) */}
                            <path className="text-blue-600" strokeDasharray="60, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" stroke="currentColor" strokeWidth="3.8" fill="none" />
                            {/* Direct Segment (25%) */}
                            <path className="text-green-500" strokeDasharray="25, 100" strokeDashoffset="-60" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" stroke="currentColor" strokeWidth="3.8" fill="none" />
                            {/* Referral Segment (15%) */}
                            <path className="text-purple-500" strokeDasharray="15, 100" strokeDashoffset="-85" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" stroke="currentColor" strokeWidth="3.8" fill="none" />
                        </svg>
                        <div className="absolute text-center">
                            <span className="block text-2xl font-bold text-gray-800 dark:text-white">1.2k</span>
                            <span className="text-xs text-gray-500">Total</span>
                        </div>
                    </div>
                    <div className="flex gap-4 mt-6 text-xs">
                        <div className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span> LinkedIn (60%)</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span> Direct (25%)</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span> Referral (15%)</div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, change, trend }) {
    return (
        <motion.div variants={sectionVariants} className={`p-5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}>
            <p className={`text-sm ${uiColors.textSecondary} uppercase tracking-wider`}>{title}</p>
            <div className="flex items-end justify-between mt-2">
                <h3 className={`text-3xl font-bold ${uiColors.textPrimary}`}>{value}</h3>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {change}
                </span>
            </div>
        </motion.div>
    );
}

function FunnelBar({ label, count, percent, color }) {
    return (
        <div className="relative">
            <div className="flex justify-between text-sm mb-1">
                <span className={uiColors.textPrimary}>{label}</span>
                <span className={uiColors.textSecondary}>{count} ({percent}%)</span>
            </div>
            <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1 }}
                    className={`h-full rounded-full ${color}`} 
                />
            </div>
        </div>
    );
}