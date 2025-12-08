// app/agents/marketplace/page.jsx
"use client";

import React, { useState, useEffect } from 'react'; // Added useEffect
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiShoppingCart, FiLock, FiGlobe, FiCheck, FiPlus, FiCpu, FiLoader, FiArrowRight } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Constants
import { uiColors, sectionVariants, itemVariants } from '@/app/callagents/_constants/uiConstants';

// Components
import CreateInterviewModal from '@/app/agents/recruiter/_components/CreateInterviewModal'; 

// --- FETCH REAL MARKETPLACE DATA (Placeholder for now, usually fetches from API) ---
// For now we keep the mock list for browsing, but the BUY action will be real.
const MARKETPLACE_AGENTS = [
    {
        id: 1, // Changed to Integer IDs to match DB
        title: 'Google System Design Interviewer',
        creator: 'Ex-Googler',
        description: 'Hardcore system design drill. Covers Load Balancing, Sharding, and CAP Theorem.',
        priceOwner: 500,
        priceTrain: 50,
        rating: 4.8,
        users: 1200,
        tags: ['Tech', 'System Design']
    },
    // ... add more if needed
];

export default function MarketplacePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAgent, setSelectedAgent] = useState(null); 
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // In a real app, you would fetch MARKETPLACE_AGENTS from an API here
    // useEffect(() => { fetch('/api/marketplace/listings')... }, []);

    const filteredAgents = MARKETPLACE_AGENTS.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateCustomAgent = () => {
        setIsCreateModalOpen(true);
    };

    return (
        <div className="p-6 lg:p-8 space-y-8 pb-20 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                <div>
                    <h1 className={`text-3xl font-extrabold ${uiColors.textPrimary}`}>Agent Marketplace</h1>
                    <p className={`${uiColors.textSecondary} mt-2 text-lg`}>Clone expert interviewers or create your own custom practice bot.</p>
                </div>
                
                <button 
                    onClick={handleCreateCustomAgent}
                    className={`group flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 ${uiColors.accentPrimaryGradient}`}
                >
                    <div className="p-1 bg-white/20 rounded-lg mr-3">
                        <FiPlus className="w-5 h-5" />
                    </div>
                    <span>Create Custom Agent</span>
                </button>
            </div>

            {/* Search */}
            <div className={`flex flex-col md:flex-row gap-4 p-1 rounded-xl`}>
                <div className={`flex items-center px-4 py-3 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm flex-1`}>
                    <FiSearch className={`mr-3 ${uiColors.textSecondary} w-5 h-5`} />
                    <input 
                        type="text" 
                        placeholder="Search for roles (e.g. 'Java', 'Sales')..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`bg-transparent outline-none w-full ${uiColors.textPrimary} text-lg placeholder-gray-400`}
                    />
                </div>
            </div>

            {/* Grid */}
            <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                variants={sectionVariants} initial="hidden" animate="visible"
            >
                {/* Custom Agent Card (Visual Only in Grid) */}
                 <motion.div 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    onClick={handleCreateCustomAgent}
                    className={`flex flex-col p-6 rounded-2xl border-2 border-dashed ${uiColors.borderPrimary} ${uiColors.bgPrimary} hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 cursor-pointer transition-all items-center justify-center text-center h-full min-h-[280px] group`}
                >
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 text-gray-400 group-hover:text-cyan-600 flex items-center justify-center mb-4 transition-colors">
                        <FiPlus className="w-8 h-8" />
                    </div>
                    <h3 className={`text-xl font-bold ${uiColors.textPrimary} group-hover:text-cyan-600 transition-colors`}>Create Custom Agent</h3>
                    <p className={`text-sm ${uiColors.textSecondary} mt-2 max-w-xs`}>
                        Paste a specific Job Description to generate a private training bot just for you.
                    </p>
                </motion.div>

                {filteredAgents.map(agent => (
                    <MarketplaceCard key={agent.id} agent={agent} onBuy={() => setSelectedAgent(agent)} />
                ))}
            </motion.div>

            {/* Purchase Modal */}
            <PurchaseModal 
                isOpen={!!selectedAgent} 
                onClose={() => setSelectedAgent(null)} 
                agent={selectedAgent} 
            />

            {/* Create Custom Agent Modal */}
            <CreateInterviewModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                mode="trainee"
            />
        </div>
    );
}

// --- SUB-COMPONENTS ---

function MarketplaceCard({ agent, onBuy }) {
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5 }}
            className={`flex flex-col p-6 rounded-3xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm hover:shadow-xl transition-all cursor-pointer h-full group`}
            onClick={onBuy}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                    {agent.title.charAt(0)}
                </div>
                <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">
                    <span>★</span><span>{agent.rating}</span>
                </div>
            </div>
            
            <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-1 line-clamp-1 leading-tight`}>{agent.title}</h3>
            <p className={`text-xs font-bold uppercase tracking-wider ${uiColors.textSecondary} mb-4 opacity-70`}>by {agent.creator}</p>
            <p className={`text-sm ${uiColors.textSecondary} line-clamp-3 mb-6 flex-grow leading-relaxed`}>{agent.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
                {agent.tags.map(tag => (
                    <span key={tag} className={`text-xs px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 ${uiColors.textSecondary} font-medium border border-gray-100 dark:border-gray-700`}>{tag}</span>
                ))}
            </div>

            <div className="mt-auto pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className={`text-xs font-bold uppercase ${uiColors.textSecondary} opacity-60`}>Usage</span>
                    <span className={`text-sm font-bold ${uiColors.textPrimary}`}>{agent.users.toLocaleString()}+</span>
                </div>
                <button className={`text-sm font-bold text-cyan-600 dark:text-cyan-400 group-hover:underline flex items-center bg-cyan-50 dark:bg-cyan-900/10 px-4 py-2 rounded-lg transition-colors group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30`}>
                    Get Access <FiArrowRight className="ml-2 w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

function PurchaseModal({ isOpen, onClose, agent }) {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const router = useRouter();

    if (!isOpen || !agent) return null;

    const handlePurchase = async (type) => {
        setIsPurchasing(true);
        const cost = type === 'owner' ? agent.priceOwner : agent.priceTrain;

        try {
            const res = await fetch('/api/marketplace/buy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: agent.id, type })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Purchase failed");
            }

            toast.success(`Purchased for ${cost} tokens!`);
            onClose();

            // Optional: Redirect to the new agent or gym
            if (type === 'train') {
                router.push('/agents/recruited');
            } else {
                router.push(`/agents/recruiter/${data.newAgentId}`);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className={`relative w-full max-w-lg rounded-3xl ${uiColors.bgPrimary} shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 text-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4`}>
                        {agent.title.charAt(0)}
                    </div>
                    <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Unlock Agent</h2>
                    <p className={`text-sm ${uiColors.textSecondary} mt-2`}>{agent.title}</p>
                </div>

                <div className="p-8 space-y-4">
                    
                    {/* Option 1: Train Only */}
                    <button 
                        onClick={() => handlePurchase('train')}
                        disabled={isPurchasing}
                        className={`w-full group flex items-center justify-between p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all bg-white dark:bg-gray-900 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 text-left shadow-sm hover:shadow-md disabled:opacity-50`}
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 mr-4 group-hover:bg-cyan-200 dark:group-hover:bg-cyan-900/50 transition-colors">
                                {isPurchasing ? <FiLoader className="animate-spin w-6 h-6"/> : <FiGlobe className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${uiColors.textPrimary}`}>Trainee License</h3>
                                <p className={`text-xs ${uiColors.textSecondary} mt-1`}>Practice Only. Config Hidden.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-cyan-600">{agent.priceTrain}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Tokens</span>
                        </div>
                    </button>

                    {/* Option 2: Owner */}
                    <button 
                        onClick={() => handlePurchase('owner')}
                        disabled={isPurchasing}
                        className={`w-full group flex items-center justify-between p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all bg-white dark:bg-gray-900 hover:bg-purple-50 dark:hover:bg-purple-900/10 text-left shadow-sm hover:shadow-md disabled:opacity-50`}
                    >
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                                {isPurchasing ? <FiLoader className="animate-spin w-6 h-6"/> : <FiLock className="w-6 h-6" />}
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg ${uiColors.textPrimary}`}>Owner License</h3>
                                <p className={`text-xs ${uiColors.textSecondary} mt-1`}>Full Clone & Source Access.</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block text-2xl font-black text-purple-600">{agent.priceOwner}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Tokens</span>
                        </div>
                    </button>

                </div>
                
                <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                    <FiSearch className="transform rotate-45 w-5 h-5 text-gray-500" />
                </button>
            </motion.div>
        </div>
    );
}