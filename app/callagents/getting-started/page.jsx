"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
    FiCpu, 
    FiBookOpen, 
    FiPhoneCall, 
    FiPlayCircle, 
    FiArrowRight, 
    FiFileText, 
    FiMessageSquare,
    FiCheckCircle
} from 'react-icons/fi';
import { uiColors, sectionVariants, itemVariants } from '../_constants/uiConstants';

// Step Data for the guide
const steps = [
    {
        id: 1,
        title: "Create an Agent",
        description: "Start from scratch or use a template. Define your agent's persona, language, and the exact voice you want it to use.",
        icon: FiCpu,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        border: "border-blue-200 dark:border-blue-500/20"
    },
    {
        id: 2,
        title: "Feed it Knowledge",
        description: "Upload PDFs, paste website URLs, or write text to give your agent the context it needs to answer questions accurately.",
        icon: FiBookOpen,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        border: "border-purple-200 dark:border-purple-500/20"
    },
    {
        id: 3,
        title: "Define Actions",
        description: "Teach your agent to extract data, schedule appointments, or transfer calls to humans when things get complicated.",
        icon: FiCheckCircle,
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-500/10",
        border: "border-cyan-200 dark:border-cyan-500/20"
    },
    {
        id: 4,
        title: "Test & Deploy",
        description: "Use the live simulator to test your agent. Once perfect, connect a phone number or embed it on your website.",
        icon: FiPhoneCall,
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        border: "border-emerald-200 dark:border-emerald-500/20"
    }
];

export default function GettingStartedPage() {
    return (
        <motion.div 
            className="flex flex-col space-y-8 w-full max-w-6xl mx-auto pb-12"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            {/* --- HERO SECTION --- */}
            <div className={`relative overflow-hidden rounded-3xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} p-8 md:p-12 shadow-sm`}>
                {/* Background Glow Effects */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-400/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">
                            Welcome to Doweit Voice
                        </div>
                        <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight ${uiColors.textPrimary} leading-tight`}>
                            Let's build your first <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">AI Voice Agent</span>
                        </h1>
                        <p className={`text-base md:text-lg ${uiColors.textSecondary} max-w-xl leading-relaxed`}>
                            Automate your calls, scale your customer support, and build capability-driven assistants in minutes. Follow this guide to get started.
                        </p>
                        
                        <div className="pt-4 flex flex-wrap gap-4">
                            <Link href="/callagents">
                                <button className={`flex items-center px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] ${uiColors.accentPrimaryGradient}`}>
                                    Create Agent Now <FiArrowRight className="ml-2" />
                                </button>
                            </Link>
                            <button className={`flex items-center px-6 py-3 rounded-xl font-bold transition-colors border ${uiColors.borderPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary}`}>
                                View Templates
                            </button>
                        </div>
                    </div>

                    {/* Progress Tracker (Mockup matching the sidebar badge) */}
                    <div className={`w-full md:w-72 p-6 rounded-2xl border ${uiColors.borderPrimary} bg-white/50 dark:bg-black/20 backdrop-blur-sm shrink-0`}>
                        <h3 className={`text-sm font-bold uppercase tracking-widest ${uiColors.textPlaceholder} mb-4`}>Setup Progress</h3>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-black text-cyan-600 dark:text-cyan-400">0%</span>
                            <span className={`text-sm font-medium ${uiColors.textSecondary} mb-1`}>Completed</span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-6">
                            <div className="h-full w-[5%] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full" />
                        </div>
                        <ul className={`text-sm space-y-3 ${uiColors.textSecondary}`}>
                            <li className="flex items-center gap-2 opacity-50"><div className="w-4 h-4 rounded-full border-2 border-gray-400" /> Create an Agent</li>
                            <li className="flex items-center gap-2 opacity-50"><div className="w-4 h-4 rounded-full border-2 border-gray-400" /> Add Knowledge</li>
                            <li className="flex items-center gap-2 opacity-50"><div className="w-4 h-4 rounded-full border-2 border-gray-400" /> Test Call</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* --- STEP-BY-STEP GRID --- */}
            <div>
                <h2 className={`text-2xl font-bold mb-6 ${uiColors.textPrimary}`}>How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((step, index) => (
                        <motion.div 
                            key={step.id}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className={`relative p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm hover:shadow-lg transition-all overflow-hidden group`}
                        >
                            {/* Number Background Watermark */}
                            <div className="absolute -right-4 -bottom-8 text-8xl font-black text-gray-100 dark:text-gray-800/50 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                                {step.id}
                            </div>
                            
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border ${step.bg} ${step.color} ${step.border} shadow-inner relative z-10`}>
                                <step.icon className="w-6 h-6" />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${uiColors.textPrimary} relative z-10`}>{step.title}</h3>
                            <p className={`text-sm leading-relaxed ${uiColors.textSecondary} relative z-10`}>
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* --- VIDEO TUTORIAL PLACEHOLDER --- */}
            {/* --- VIDEO TUTORIAL --- */}
            <motion.div variants={itemVariants} className={`p-1 rounded-3xl bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-md`}>
                <div className={`w-full aspect-video rounded-[22px] bg-gray-900 overflow-hidden relative border ${uiColors.borderPrimary}`}>
                    <iframe
                        className="w-full h-full border-none"
                        /* REPLACE THE SRC BELOW WITH YOUR REAL YOUTUBE EMBED URL */
                        src="https://www.youtube.com/embed/EObAWAk0UUc?rel=0&modestbranding=1" 
                        title="Doweit Voice Quickstart Tutorial"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                    ></iframe>
                </div>
            </motion.div>

            {/* --- RESOURCES FOOTER --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <a href="#" className={`flex items-center gap-4 p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group`}>
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <FiFileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold ${uiColors.textPrimary} group-hover:text-blue-500 transition-colors`}>Read the Documentation</h4>
                        <p className={`text-sm ${uiColors.textSecondary}`}>Detailed guides, API references, and best practices.</p>
                    </div>
                </a>
                
                <a href="#" className={`flex items-center gap-4 p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group`}>
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <FiMessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className={`font-bold ${uiColors.textPrimary} group-hover:text-purple-500 transition-colors`}>Join the Community</h4>
                        <p className={`text-sm ${uiColors.textSecondary}`}>Connect with other developers on Discord.</p>
                    </div>
                </a>
            </div>

        </motion.div>
    );
}