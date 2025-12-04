// app/agents/recruiter/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSearch, FiFilter, FiLoader } from 'react-icons/fi';

// Components
import RecruiterStats from './_components/RecruiterStats';
import InterviewAgentCard from './_components/InterviewAgentCard';
import CreateInterviewModal from './_components/CreateInterviewModal';

// Constants
import { uiColors, sectionVariants, itemVariants } from '../../callagents/_constants/uiConstants';

// --- DEMO DATA ---
const DEMO_AGENTS = [
    {
        id: '1',
        title: 'Senior React Developer',
        status: 'active',
        candidates: 124,
        avgFitScore: 78,
        createdAt: '2023-10-05T10:00:00Z',
        avatarUrl: null, // Default
        linkId: 'react-senior-xyz'
    },
    {
        id: '2',
        title: 'Sales Representative',
        status: 'active',
        candidates: 45,
        avgFitScore: 65,
        createdAt: '2023-10-12T14:30:00Z',
        avatarUrl: '/voiceagents/2.jpg',
        linkId: 'sales-rep-abc'
    },
    {
        id: '3',
        title: 'Customer Support Lead',
        status: 'draft',
        candidates: 0,
        avgFitScore: 0,
        createdAt: '2023-10-20T09:15:00Z',
        avatarUrl: '/voiceagents/4.jpg',
        linkId: 'support-lead-123'
    },
    {
        id: '4',
        title: 'Marketing Intern',
        status: 'closed',
        candidates: 210,
        avgFitScore: 82,
        createdAt: '2023-09-01T11:00:00Z',
        avatarUrl: null,
        linkId: 'marketing-intern-999'
    }
];

export default function RecruiterDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [agents, setAgents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Simulate Fetching Data
    useEffect(() => {
        const timer = setTimeout(() => {
            setAgents(DEMO_AGENTS);
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Filter Logic
    const filteredAgents = agents.filter(agent => 
        agent.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col space-y-8 p-6 lg:p-8 min-h-full">
            
            {/* Header & Actions */}
            <motion.div 
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className={`text-3xl font-bold ${uiColors.textPrimary}`}>Recruitment Dashboard</h1>
                    <p className={`${uiColors.textSecondary} mt-1`}>Manage your interview campaigns and candidates.</p>
                </div>
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 ${uiColors.accentPrimaryGradient}`}
                >
                    <FiPlus className="mr-2 w-5 h-5" /> Create New Interview
                </button>
            </motion.div>

            {/* Stats Overview */}
            <RecruiterStats agents={agents} isLoading={isLoading} />

            {/* Filters & Search */}
            <motion.div 
                className={`flex items-center space-x-4 p-4 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="relative flex-grow max-w-md">
                    <FiSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${uiColors.textSecondary}`} />
                    <input 
                        type="text" 
                        placeholder="Search job titles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg bg-transparent outline-none ${uiColors.textPrimary} placeholder-gray-400`}
                    />
                </div>
                <div className={`h-6 w-px bg-gray-200 dark:bg-gray-700`}></div>
                <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}>
                    <FiFilter />
                    <span>Filter</span>
                </button>
            </motion.div>

            {/* Agents Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <FiLoader className={`w-10 h-10 animate-spin ${uiColors.textAccent}`} />
                    <p className={`mt-4 ${uiColors.textSecondary}`}>Loading your workspace...</p>
                </div>
            ) : filteredAgents.length === 0 ? (
                <div className={`text-center py-20 ${uiColors.textSecondary}`}>
                    No interviews found matching "{searchTerm}".
                </div>
            ) : (
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredAgents.map(agent => (
                        <InterviewAgentCard key={agent.id} agent={agent} />
                    ))}
                </motion.div>
            )}

            {/* Create Modal */}
            <CreateInterviewModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
            />

        </div>
    );
}