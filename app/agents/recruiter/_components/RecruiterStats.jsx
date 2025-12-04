// app/agents/recruiter/_components/RecruiterStats.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiActivity, FiCheckCircle } from 'react-icons/fi';
import { uiColors } from '../../../callagents/_constants/uiConstants';

export default function RecruiterStats({ agents, isLoading }) {
    // Calculate demo stats
    const totalCandidates = agents.reduce((acc, curr) => acc + curr.candidates, 0);
    const activeInterviews = agents.filter(a => a.status === 'active').length;
    const avgScore = Math.round(agents.reduce((acc, curr) => acc + curr.avgFitScore, 0) / (agents.length || 1));

    const stats = [
        { label: 'Total Candidates', value: totalCandidates, icon: FiUsers, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
        { label: 'Active Jobs', value: activeInterviews, icon: FiBriefcase, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        { label: 'Avg Fit Score', value: `${avgScore}%`, icon: FiActivity, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
        { label: 'Hired (Demo)', value: '12', icon: FiCheckCircle, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    ];

    if (isLoading) return <div className="h-32 w-full animate-pulse bg-gray-200 dark:bg-gray-800 rounded-xl"></div>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, idx) => (
                <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${uiColors.bgPrimary} p-5 rounded-xl border ${uiColors.borderPrimary} shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-semibold ${stat.color} bg-white dark:bg-gray-800 px-2 py-1 rounded-full border ${uiColors.borderPrimary}`}>
                            +2.5%
                        </span>
                    </div>
                    <div className={`text-2xl font-bold ${uiColors.textPrimary}`}>{stat.value}</div>
                    <div className={`text-xs ${uiColors.textSecondary} mt-1`}>{stat.label}</div>
                </motion.div>
            ))}
        </div>
    );
}