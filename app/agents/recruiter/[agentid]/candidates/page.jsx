// app/agents/recruiter/[agentid]/candidates/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiDownload, FiMoreHorizontal, FiLoader, FiUserX } from 'react-icons/fi';
import { uiColors, itemVariants } from '@/app/callagents/_constants/uiConstants';
import CandidateAnalysisModal from '../_components/CandidateAnalysisModal';
import { useCallAgent } from '@/app/callagents/[agentid]/_context/CallAgentContext';
import { toast } from 'react-hot-toast';

export default function CandidatesPage() {
    const agent = useCallAgent(); // Get context
    const [candidates, setCandidates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Selection state for Modal
    const [selectedCandidateId, setSelectedCandidateId] = useState(null);
    const [fullCandidateData, setFullCandidateData] = useState(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // 1. Fetch List on Mount
    useEffect(() => {
        if (agent?.id) {
            fetchCandidates();
        }
    }, [agent?.id]);

    const fetchCandidates = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/callagents/${agent.id}/candidates`);
            if (!res.ok) throw new Error("Failed to load candidates");
            const data = await res.json();
            setCandidates(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not load candidate list.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Fetch Full Details when clicking a row
    const handleRowClick = async (candidateId) => {
        setSelectedCandidateId(candidateId);
        setIsLoadingDetails(true);
        try {
            const res = await fetch(`/api/callagents/${agent.id}/candidates/${candidateId}`);
            if (!res.ok) throw new Error("Failed to load details");
            const data = await res.json();
            
            // Normalize data for the Modal (Mapping DB fields to Modal props)
            const normalizedData = {
                id: data.id,
                name: data.candidateName || "Unknown Candidate",
                email: data.candidateEmail || "No Email",
                score: data.fitScore || 0,
                // If analysisData exists, use it, otherwise mock structure to prevent crash
                analysis: data.analysisData || { skillRadar: [], timelineSentiment: [], summary: "Pending Analysis..." },
                transcript: data.transcript || [],
                audioUrl: data.audioUrl,
                screenshots: data.screenshots || [],
                status: data.status,
                date: new Date(data.createdAt).toLocaleDateString()
            };

            setFullCandidateData(normalizedData);
        } catch (error) {
            toast.error("Could not open candidate details.");
            setSelectedCandidateId(null); // Close modal on error
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Filter Logic
    const filteredCandidates = candidates.filter(c => 
        (c.candidateName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.candidateEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full space-y-6">
            
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Candidates</h1>
                    <p className={`${uiColors.textSecondary} text-sm`}>
                        {isLoading ? 'Syncing...' : `Showing ${filteredCandidates.length} applicants`}
                    </p>
                </div>
                
                <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${uiColors.textSecondary}`} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} outline-none focus:ring-2 ring-cyan-500/30 transition-all text-sm ${uiColors.textPrimary}`}
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
            <div className={`flex-1 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm overflow-hidden relative`}>
                
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 z-10">
                        <FiLoader className="w-8 h-8 animate-spin text-cyan-600" />
                    </div>
                ) : filteredCandidates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <FiUserX className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className={`text-lg font-bold ${uiColors.textPrimary}`}>No Candidates Found</h3>
                        <p className={`text-sm ${uiColors.textSecondary}`}>Share your interview link to start receiving applications.</p>
                    </div>
                ) : (
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
                                    <motion.tr 
                                        key={candidate.id} 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        onClick={() => handleRowClick(candidate.id)}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3 shadow-sm">
                                                    {(candidate.candidateName || '?').charAt(0)}
                                                </div>
                                                <div>
                                                    <div className={`font-medium ${uiColors.textPrimary}`}>{candidate.candidateName || 'Unknown'}</div>
                                                    <div className={`text-xs ${uiColors.textSecondary}`}>{candidate.candidateEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full rounded-full ${
                                                            (candidate.fitScore || 0) >= 80 ? 'bg-green-500' : 
                                                            (candidate.fitScore || 0) >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} 
                                                        style={{ width: `${candidate.fitScore || 0}%` }}
                                                    />
                                                </div>
                                                <span className={`font-bold ${
                                                    (candidate.fitScore || 0) >= 80 ? 'text-green-600' : 
                                                    (candidate.fitScore || 0) >= 50 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {candidate.fitScore || 0}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize
                                                ${candidate.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 
                                                  candidate.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                                                  'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                                }`}>
                                                {candidate.status}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${uiColors.textSecondary}`}>
                                            {new Date(candidate.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className={`p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 ${uiColors.textSecondary} transition-colors`}>
                                                <FiMoreHorizontal />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Analysis Modal */}
            <AnimatePresence>
                {selectedCandidateId && (
                    <CandidateAnalysisModal 
                        isOpen={!!selectedCandidateId} 
                        onClose={() => { setSelectedCandidateId(null); setFullCandidateData(null); }} 
                        // If data is loading, pass a temporary skeleton or the minimal data we have
                        candidate={fullCandidateData} 
                        isLoading={isLoadingDetails}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}