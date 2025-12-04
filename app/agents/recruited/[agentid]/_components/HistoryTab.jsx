// app/agents/recruited/[agentid]/_components/HistoryTab.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiClock, FiActivity, FiChevronRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { uiColors, itemVariants } from '@/app/callagents/_constants/uiConstants';

// Import the Analysis Modal
import TrainingAnalysisModal from './TrainingAnalysisModal';

// Mock Data
const MOCK_SESSIONS = [
    { id: 101, date: 'Today, 10:30 AM', duration: '12m 45s', score: 92, improvement: 5, status: 'completed' },
    { id: 102, date: 'Yesterday, 4:15 PM', duration: '8m 20s', score: 87, improvement: 12, status: 'completed' },
    { id: 103, date: 'Oct 24, 2023', duration: '15m 00s', score: 75, improvement: -5, status: 'completed' },
    { id: 104, date: 'Oct 20, 2023', duration: '5m 10s', score: 80, improvement: 0, status: 'aborted' },
];

export default function HistoryTab({ agentId }) {
    const [selectedSession, setSelectedSession] = useState(null);

    return (
        <div className="h-full flex flex-col">
            <h3 className={`text-lg font-bold mb-4 ${uiColors.textPrimary}`}>Recent Sessions</h3>
            
            <div className="space-y-3">
                {MOCK_SESSIONS.map((session, index) => (
                    <motion.div
                        key={session.id}
                        variants={itemVariants}
                        initial="hidden" animate="visible" transition={{ delay: index * 0.1 }}
                        onClick={() => setSelectedSession(session)}
                        className={`group relative p-4 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-cyan-500 transition-all cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between`}
                    >
                        {/* Left Info */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                                ${session.score >= 90 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                                  session.score >= 70 ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30' : 
                                  'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'}`}>
                                {session.score}
                            </div>
                            <div>
                                <div className={`font-semibold ${uiColors.textPrimary}`}>{session.date}</div>
                                <div className={`text-xs ${uiColors.textSecondary} flex items-center gap-2`}>
                                    <span className="flex items-center"><FiClock className="mr-1"/> {session.duration}</span>
                                    {session.improvement !== 0 && (
                                        <span className={`flex items-center ${session.improvement > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {session.improvement > 0 ? <FiTrendingUp className="mr-1"/> : <FiTrendingDown className="mr-1"/>}
                                            {Math.abs(session.improvement)}% vs prev
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Arrow */}
                        <div className={`p-2 rounded-full ${uiColors.bgSecondary} group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors`}>
                            <FiChevronRight className={`text-gray-400 group-hover:text-cyan-600`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {selectedSession && (
                    <TrainingAnalysisModal 
                        isOpen={!!selectedSession} 
                        onClose={() => setSelectedSession(null)} 
                        session={selectedSession} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}