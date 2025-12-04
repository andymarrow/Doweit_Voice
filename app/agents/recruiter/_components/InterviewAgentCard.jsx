// app/agents/recruiter/_components/InterviewAgentCard.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FiMoreHorizontal, FiUsers, FiClock, FiExternalLink, FiCopy, FiActivity } from 'react-icons/fi';
import { uiColors, toolItemVariants } from '../../../callagents/_constants/uiConstants';
import { toast } from 'react-hot-toast';

export default function InterviewAgentCard({ agent }) {
    
    const handleCopyLink = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const link = `${window.location.origin}/interview/${agent.linkId}`;
        navigator.clipboard.writeText(link);
        toast.success("Magic Link copied!");
    };

    return (
        <Link href={`/agents/recruiter/${agent.id}`} legacyBehavior>
            <motion.div 
                className={`group relative flex flex-col p-5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden`}
                variants={toolItemVariants}
                whileHover={{ y: -4 }}
            >
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize
                        ${agent.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 
                          agent.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {agent.status}
                    </span>
                </div>

                {/* Header: Avatar & Title */}
                <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-md mr-4 overflow-hidden relative
                        ${!agent.avatarUrl ? uiColors.accentPrimaryGradient : ''}`}>
                        {agent.avatarUrl ? (
                            <Image src={agent.avatarUrl} alt={agent.title} fill className="object-cover" />
                        ) : (
                            agent.title.charAt(0)
                        )}
                    </div>
                    <div className="max-w-[70%]">
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary} truncate`}>{agent.title}</h3>
                        <p className={`text-xs ${uiColors.textSecondary}`}>Created {new Date(agent.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className={`p-3 rounded-lg ${uiColors.bgSecondary}`}>
                        <div className={`text-xs ${uiColors.textSecondary} flex items-center mb-1`}>
                            <FiUsers className="mr-1.5" /> Candidates
                        </div>
                        <div className={`text-lg font-bold ${uiColors.textPrimary}`}>{agent.candidates}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${uiColors.bgSecondary}`}>
                        <div className={`text-xs ${uiColors.textSecondary} flex items-center mb-1`}>
                            <FiActivity className="mr-1.5" /> Avg Fit
                        </div>
                        <div className={`text-lg font-bold ${uiColors.textPrimary}`}>{agent.avgFitScore}%</div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button 
                        onClick={handleCopyLink}
                        className={`flex items-center text-xs font-medium ${uiColors.textSecondary} hover:text-cyan-600 dark:hover:text-purple-400 transition-colors z-10`}
                    >
                        <FiCopy className="mr-1.5" /> Copy Link
                    </button>
                    
                    <div className={`p-2 rounded-full ${uiColors.bgSecondary} group-hover:bg-cyan-100 dark:group-hover:bg-purple-900/30 transition-colors`}>
                        <FiExternalLink className={`w-4 h-4 ${uiColors.textSecondary} group-hover:text-cyan-600 dark:group-hover:text-purple-400`} />
                    </div>
                </div>

            </motion.div>
        </Link>
    );
}