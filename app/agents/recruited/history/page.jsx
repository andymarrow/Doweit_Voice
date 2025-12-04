// app/agents/recruited/history/page.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiClock, FiChevronRight, FiActivity, FiLayers, FiCalendar } from 'react-icons/fi';
import { uiColors, sectionVariants } from '@/app/callagents/_constants/uiConstants';

// Mock Data: Agents the user has trained with
const TRAINED_AGENTS = [
    { 
        id: 1, 
        name: "Google System Design", 
        lastSession: "2 hours ago", 
        totalSessions: 12, 
        avgScore: 85,
        theme: "blue"
    },
    { 
        id: 2, 
        name: "Behavioral Interview", 
        lastSession: "Yesterday", 
        totalSessions: 5, 
        avgScore: 72,
        theme: "purple"
    },
    { 
        id: 3, 
        name: "React Technical", 
        lastSession: "3 days ago", 
        totalSessions: 8, 
        avgScore: 90,
        theme: "cyan"
    },
];

export default function GlobalHistoryPage() {
    return (
        <div className="p-6 lg:p-8 space-y-8 mx-auto h-full">
            
            {/* Header */}
            <div>
                <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Training Logs</h1>
                <p className={`${uiColors.textSecondary} mt-1`}>Select an agent to view your detailed session history and performance reports.</p>
            </div>

            {/* Grid of Agents */}
            <motion.div 
                variants={sectionVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {TRAINED_AGENTS.map((agent) => (
                    // Link to the specific agent's page (user will switch to History tab manually or we can add ?tab=history param later)
                    <Link key={agent.id} href={`/agents/recruited/${agent.id}`} legacyBehavior>
                        <a className={`group relative p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-cyan-500 transition-all shadow-sm hover:shadow-lg flex flex-col h-48 justify-between overflow-hidden`}>
                            
                            {/* Decorative Background Gradient */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-${agent.theme}-500/5 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50`}></div>

                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    {/* Icon Box */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold
                                        ${agent.avgScore >= 80 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'}`}>
                                        {agent.name.charAt(0)}
                                    </div>
                                    {/* Score Badge */}
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.textPrimary}`}>
                                        Avg: {agent.avgScore}%
                                    </span>
                                </div>
                                
                                <h3 className={`font-bold text-lg ${uiColors.textPrimary} mb-1 group-hover:text-cyan-600 transition-colors`}>{agent.name}</h3>
                                <div className={`text-sm ${uiColors.textSecondary} flex items-center`}>
                                    <FiLayers className="mr-2 text-gray-400" /> {agent.totalSessions} Total Sessions
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-4 mt-2">
                                <span className={`text-xs ${uiColors.textSecondary} flex items-center`}>
                                    <FiClock className="mr-1.5" /> {agent.lastSession}
                                </span>
                                <span className="text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1 transition-transform">
                                    View Logs <FiChevronRight className="ml-1" />
                                </span>
                            </div>
                        </a>
                    </Link>
                ))}

                {/* Empty State / Add New */}
                <Link href="/agents/marketplace" legacyBehavior>
                    <a className={`group p-6 rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all flex flex-col items-center justify-center text-center h-48 cursor-pointer`}>
                        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 text-gray-400 group-hover:text-cyan-600 flex items-center justify-center mb-3 transition-colors">
                            <FiActivity className="w-6 h-6" />
                        </div>
                        <h3 className={`font-bold ${uiColors.textPrimary}`}>Start New Track</h3>
                        <p className={`text-xs ${uiColors.textSecondary} mt-1`}>Find more agents to train with</p>
                    </a>
                </Link>
            </motion.div>
        </div>
    );
}