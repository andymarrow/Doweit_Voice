// app/agents/recruiter/[agentid]/page.jsx
"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiUsers, FiActivity, FiClock, FiUserCheck, FiMoreHorizontal, 
    FiFilter, FiDownload, FiSearch, FiExternalLink, FiCopy
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Context & Constants
import { useCallAgent } from '@/app/callagents/[agentid]/_context/CallAgentContext';
import { uiColors, sectionVariants, itemVariants } from '@/app/callagents/_constants/uiConstants';

// Dummy Data for Candidates
const CANDIDATES = [
    { id: 1, name: "Alice Johnson", email: "alice@example.com", score: 92, status: "Recommended", date: "2 hrs ago", avatar: null },
    { id: 2, name: "Bob Smith", email: "bob@tech.com", score: 85, status: "Review", date: "5 hrs ago", avatar: null },
    { id: 3, name: "Charlie Day", email: "charlie@mail.com", score: 45, status: "Rejected", date: "1 day ago", avatar: null },
    { id: 4, name: "Dana White", email: "dana@ufc.com", score: 88, status: "Recommended", date: "2 days ago", avatar: null },
];

export default function InterviewDashboard() {
    const agent = useCallAgent(); // Access current agent data
    const [searchTerm, setSearchTerm] = useState('');

    const handleCopyLink = () => {
        const link = `${window.location.origin}/interview/${agent.id}`; // In reality, use a secure hash
        navigator.clipboard.writeText(link);
        toast.success("Interview link copied!");
    };

    return (
        <div className="flex flex-col space-y-8 min-h-full pb-10">
            
            {/* --- TOP HEADER --- */}
            <motion.div 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>
                        {agent.name} <span className="text-gray-400 font-normal text-lg">Dashboard</span>
                    </h1>
                    <p className={`text-sm ${uiColors.textSecondary} flex items-center mt-1`}>
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        Active Interview • Created {new Date(agent.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleCopyLink}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${uiColors.borderPrimary} ${uiColors.bgSecondary} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${uiColors.textPrimary}`}
                    >
                        <FiCopy className="mr-2" /> Copy Link
                    </button>
                    <button className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg ${uiColors.accentPrimaryGradient}`}>
                        <FiExternalLink className="mr-2" /> View as Candidate
                    </button>
                </div>
            </motion.div>

            {/* --- STATS GRID --- */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                variants={sectionVariants} initial="hidden" animate="visible"
            >
                <StatCard label="Total Candidates" value="124" icon={FiUsers} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-900/20" />
                <StatCard label="Avg Fit Score" value="76%" icon={FiActivity} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-900/20" />
                <StatCard label="Avg Duration" value="12m" icon={FiClock} color="text-orange-500" bg="bg-orange-50 dark:bg-orange-900/20" />
                <StatCard label="Shortlisted" value="18" icon={FiUserCheck} color="text-green-500" bg="bg-green-50 dark:bg-green-900/20" />
            </motion.div>

            {/* --- ANALYTICS ROW --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Score Distribution Chart (CSS Only) */}
                <motion.div 
                    className={`lg:col-span-2 p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                >
                    <h3 className={`font-semibold mb-6 ${uiColors.textPrimary}`}>Score Distribution</h3>
                    <div className="flex items-end justify-between h-48 space-x-2 px-2">
                        {[10, 25, 45, 80, 50, 30, 15].map((h, i) => (
                            <div key={i} className="flex flex-col items-center flex-1 group">
                                <div className="relative w-full flex justify-center">
                                    <div 
                                        style={{ height: `${h}%` }} 
                                        className={`w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-cyan-500/50 to-blue-500/80 group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300`}
                                    ></div>
                                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-black text-white px-2 py-1 rounded">
                                        {h}
                                    </div>
                                </div>
                                <span className={`text-xs mt-2 ${uiColors.textSecondary}`}>
                                    {['<40', '40-50', '50-60', '60-70', '70-80', '80-90', '90+'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Agent Performance Mini-Card */}
                <motion.div 
                    className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                >
                    <h3 className={`font-semibold mb-4 ${uiColors.textPrimary}`}>Agent Health</h3>
                    <div className="space-y-4">
                        <HealthItem label="Sentiment Analysis" value="Positive" score={85} />
                        <HealthItem label="Question Completion" value="98%" score={98} />
                        <HealthItem label="Technical Depth" value="High" score={90} />
                    </div>
                    
                    <div className={`mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-dashed ${uiColors.borderPrimary}`}>
                        <p className={`text-xs ${uiColors.textSecondary} italic`}>
                            "The agent is performing well, but consider shortening the introduction to reduce drop-off."
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* --- CANDIDATES LIST --- */}
            <motion.div 
                className={`flex flex-col rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm overflow-hidden`}
                variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Table Header Controls */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${uiColors.textSecondary}`} />
                        <input 
                            type="text" 
                            placeholder="Search candidates..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 border-none outline-none focus:ring-2 ring-cyan-500/30 ${uiColors.textPrimary}`}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.textSecondary} hover:bg-gray-50 dark:hover:bg-gray-800`}>
                            <FiFilter />
                        </button>
                        <button className={`p-2 rounded-lg border ${uiColors.borderPrimary} ${uiColors.textSecondary} hover:bg-gray-50 dark:hover:bg-gray-800`}>
                            <FiDownload />
                        </button>
                    </div>
                </div>

                {/* List Items */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase bg-gray-50 dark:bg-gray-900/50 ${uiColors.textSecondary}`}>
                            <tr>
                                <th className="px-6 py-3 font-medium">Candidate</th>
                                <th className="px-6 py-3 font-medium">Fit Score</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${uiColors.borderPrimary}`}>
                            {CANDIDATES.map((candidate) => (
                                <tr key={candidate.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-r from-blue-400 to-indigo-500 mr-3`}>
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className={`font-medium ${uiColors.textPrimary}`}>{candidate.name}</div>
                                                <div className={`text-xs ${uiColors.textSecondary}`}>{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <span className={`font-bold ${candidate.score > 80 ? 'text-green-600' : candidate.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                                {candidate.score}%
                                            </span>
                                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full ml-3 overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${candidate.score > 80 ? 'bg-green-500' : candidate.score > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                    style={{ width: `${candidate.score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border
                                            ${candidate.status === 'Recommended' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800' : 
                                              candidate.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800' :
                                              'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                                            }`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 ${uiColors.textSecondary}`}>{candidate.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors`}>
                                            <FiMoreHorizontal />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

        </div>
    );
}

// --- SUB-COMPONENTS ---

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <motion.div 
            className={`p-5 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex items-center justify-between`}
            whileHover={{ y: -2 }}
        >
            <div>
                <p className={`text-xs font-medium uppercase tracking-wider ${uiColors.textSecondary} mb-1`}>{label}</p>
                <h3 className={`text-2xl font-bold ${uiColors.textPrimary}`}>{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${bg} ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
        </motion.div>
    );
}

function HealthItem({ label, value, score }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className={uiColors.textSecondary}>{label}</span>
                <span className={`font-medium ${uiColors.textPrimary}`}>{value}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${score}%` }}
                ></div>
            </div>
        </div>
    );
}