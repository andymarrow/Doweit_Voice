// app/agents/recruiter/[agentid]/candidates/page.jsx
"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiMoreHorizontal } from 'react-icons/fi';
import { uiColors, itemVariants } from '@/app/callagents/_constants/uiConstants';
import CandidateAnalysisModal from '../_components/CandidateAnalysisModal';

// Mock Candidates Data
const MOCK_CANDIDATES = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", score: 92, status: "Shortlisted", date: "2 hrs ago" },
    { id: 2, name: "Bob Smith", email: "bob@tech.com", score: 74, status: "Review", date: "5 hrs ago" },
    { id: 3, name: "Charlie Day", email: "charlie@mail.com", score: 45, status: "Rejected", date: "1 day ago" },
    { id: 4, name: "Dana White", email: "dana@ufc.com", score: 88, status: "Shortlisted", date: "2 days ago" },
    { id: 5, name: "Evan Wright", email: "evan@write.com", score: 62, status: "Review", date: "3 days ago" },
];

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    const filteredCandidates = MOCK_CANDIDATES.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Candidates</h1>
                    <p className={`${uiColors.textSecondary} text-sm`}>Showing {filteredCandidates.length} applicants</p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${uiColors.textSecondary}`} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} outline-none focus:ring-2 ring-cyan-500/30 transition-all text-sm`}
                        />
                    </div>
                    <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                        <FiFilter />
                    </button>
                    <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                        <FiDownload />
                    </button>
                </div>
            </div>

            {/* List Table */}
            <motion.div 
                className={`flex-1 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm overflow-hidden`}
                variants={itemVariants} initial="hidden" animate="visible"
            >
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase bg-gray-50 dark:bg-gray-900/50 ${uiColors.textSecondary} sticky top-0 z-10`}>
                            <tr>
                                <th className="px-6 py-4 font-medium">Candidate</th>
                                <th className="px-6 py-4 font-medium">Fit Score</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Applied</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${uiColors.borderPrimary}`}>
                            {filteredCandidates.map((candidate) => (
                                <tr 
                                    key={candidate.id} 
                                    onClick={() => setSelectedCandidate(candidate)}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-medium ${uiColors.textPrimary}`}>{candidate.name}</div>
                                                <div className={`text-xs ${uiColors.textSecondary}`}>{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${candidate.score >= 80 ? 'bg-green-500' : candidate.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${candidate.score}%` }}
                                                />
                                            </div>
                                            <span className={`font-bold ${candidate.score >= 80 ? 'text-green-600' : candidate.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {candidate.score}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                                            ${candidate.status === 'Shortlisted' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 
                                              candidate.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                                              'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${uiColors.textSecondary}`}>{candidate.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${uiColors.textSecondary} transition-colors`}>
                                            <FiMoreHorizontal />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <CandidateAnalysisModal 
                        isOpen={!!selectedCandidate} 
                        onClose={() => setSelectedCandidate(null)} 
                        candidate={selectedCandidate} 
                    />
                )}
            </AnimatePresence>

        </div>
    );
}