"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Activity, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

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

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};


export const TraineeAnalysis = ({ onSelectAgent, onStartNew }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Training Logs</h1>
                <p className="text-gray-500 mt-1">Select an agent to view your detailed session history and performance reports.</p>
            </div>

            {/* Grid of Agents */}
            <motion.div 
                variants={sectionVariants} initial="hidden" animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {TRAINED_AGENTS.map((agent) => (
                    <button 
                        key={agent.id} 
                        onClick={() => onSelectAgent?.(agent.id)}
                        className="group relative p-4 rounded-xl border border-black/5 bg-white hover:border-emerald-500 transition-all shadow-sm hover:shadow-md flex flex-col h-36 justify-between overflow-hidden text-left"
                    >
                        {/* Decorative Background Gradient */}
                        <div className={cn(
                            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-50",
                            agent.theme === 'blue' ? "bg-blue-500/10" :
                            agent.theme === 'purple' ? "bg-purple-500/10" :
                            "bg-cyan-500/10"
                        )}></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-3">
                                {/* Icon Box */}
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold",
                                    agent.avgScore >= 80 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                )}>
                                    {agent.name.charAt(0)}
                                </div>
                                {/* Score Badge */}
                                <span className="text-xs font-bold px-2 py-1 rounded-md border border-black/5 bg-gray-50 text-gray-900">
                                    Avg: {agent.avgScore}%
                                </span>
                            </div>
                            
                            <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">{agent.name}</h3>
                            <div className="text-sm text-gray-500 flex items-center">
                                <Layers className="mr-2 w-4 h-4 text-gray-400" /> {agent.totalSessions} Total Sessions
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex justify-between items-center border-t border-black/5 pt-4 mt-2">
                            <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="mr-1.5 w-3 h-3" /> {agent.lastSession}
                            </span>
                            <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider flex items-center group-hover:translate-x-1 transition-transform">
                                View Logs <ChevronRight className="ml-1 w-3 h-3" />
                            </span>
                        </div>
                    </button>
                ))}

                {/* Empty State / Add New */}
                <button 
                    onClick={onStartNew}
                    className="group p-4 rounded-xl border-2 border-dashed border-black/10 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex flex-col items-center justify-center text-center h-36 cursor-pointer"
                >
                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-emerald-100 text-gray-400 group-hover:text-emerald-600 flex items-center justify-center mb-2 transition-colors">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900">Start New Track</h3>
                    <p className="text-xs text-gray-500 mt-1">Find more agents</p>
                </button>
            </motion.div>
        </div>
    );
}
