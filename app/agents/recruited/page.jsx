// app/agents/recruited/page.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPlay, FiBarChart2 } from 'react-icons/fi';
import { uiColors, sectionVariants } from '@/app/callagents/_constants/uiConstants';

const MY_AGENTS = [
    { id: 1, title: "Google System Design", xp: 1200, level: 5, lastPlayed: "2 days ago" },
    { id: 2, title: "Behavioral Interview", xp: 450, level: 2, lastPlayed: "Yesterday" },
];

export default function MyGymPage() {
    return (
        <div className="p-6 space-y-8">
            <h1 className={`text-3xl font-bold ${uiColors.textPrimary}`}>My Training Gym</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                <Link href="/agents/marketplace" legacyBehavior>
                    <a className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all cursor-pointer h-64 group`}>
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="text-4xl text-gray-400 group-hover:text-cyan-500 font-light">+</span>
                        </div>
                        <span className={`font-semibold ${uiColors.textSecondary} group-hover:text-cyan-600`}>Add New Trainer</span>
                    </a>
                </Link>

                {/* Agent Cards */}
                {MY_AGENTS.map((agent) => (
                    <Link key={agent.id} href={`/agents/recruited/${agent.id}`} legacyBehavior>
                        <motion.a 
                            variants={sectionVariants} initial="hidden" animate="visible"
                            whileHover={{ y: -5 }}
                            className={`relative flex flex-col p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm hover:shadow-lg transition-all cursor-pointer h-64 justify-between`}
                        >
                            <div>
                                <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-2`}>{agent.title}</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-lg">Lvl {agent.level}</span>
                                    <span className={`text-xs ${uiColors.textSecondary}`}>{agent.xp} XP</span>
                                </div>
                            </div>

                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-2/3"></div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className={`text-xs ${uiColors.textSecondary}`}>Last: {agent.lastPlayed}</span>
                                <button className={`p-2 rounded-full bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400`}>
                                    <FiPlay fill="currentColor" />
                                </button>
                            </div>
                        </motion.a>
                    </Link>
                ))}
            </div>
        </div>
    );
}