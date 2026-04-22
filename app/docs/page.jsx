"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
    Search, 
    Book, 
    Terminal, 
    Zap, 
    MessageSquare, 
    PhoneCall, 
    Code2, 
    Briefcase,
    ArrowRight,
    Github,
    ExternalLink,
    HelpCircle
} from "lucide-react";

// --- IMPORT DATA AND MODAL ---
import { docsContent } from "./_data/content";
import DocReaderModal from "./_components/DocReaderModal";
import { uiColors } from "../voice-agents-dashboard/_constants/uiConstants";

// --- 1. DEFINE ANIMATION VARIANTS (FIXES THE ERROR) ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export default function DocsPage() {
    const [search, setSearch] = useState("");
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenDoc = (docKey) => {
        const content = docsContent[docKey];
        if (content) {
            setSelectedDoc(content);
            setIsModalOpen(true);
        } else {
            // Fallback for docs not yet in our data map
            setSelectedDoc({
                title: docKey,
                category: "Resources",
                icon: Book,
                content: "Documentation for this section is currently being updated. Please check back shortly or contact support for immediate assistance.",
                steps: ["Contact support", "Check the Github Wiki"]
            });
            setIsModalOpen(true);
        }
    };

    const categories = [
        {
            title: "Getting Started",
            icon: Zap,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-500/10",
            links: ["Introduction", "Quick Start Guide", "Architecture Overview"]
        },
        {
            title: "Call Agents",
            icon: PhoneCall,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-500/10",
            links: ["Configuring Voices", "Prompt Engineering", "Handling Transfers"]
        },
        {
            title: "Web SDK",
            icon: Code2,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-500/10",
            links: ["SDK Installation", "Function Registration", "Manifest Syncing"]
        },
        {
            title: "Recruitment AI",
            icon: Briefcase,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-500/10",
            links: ["JD Ingestion", "Magic Links", "Scorecard Analysis"]
        },
        {
            title: "Character AI",
            icon: MessageSquare,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-500/10",
            links: ["Creating Persona", "Behavior Tags", "Voice Cloning"]
        },
        {
            title: "API Reference",
            icon: Terminal,
            color: "text-pink-500",
            bg: "bg-pink-50 dark:bg-pink-500/10",
            links: ["Authentication", "Endpoints", "Webhooks"]
        }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans pb-24">
            
            {/* --- HERO SEARCH SECTION --- */}
            <div className="relative w-full py-20 px-6 overflow-hidden border-b border-gray-100 dark:border-gray-800">
                <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-900/30 z-0"></div>
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-3xl z-0"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-600/5 rounded-full blur-3xl z-0"></div>

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <motion.h1 
                        className="text-4xl md:text-6xl font-black tracking-tighter mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">help?</span>
                    </motion.h1>
                    
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all text-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pt-16">
                
                {/* --- QUICK START BENTO --- */}
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <Link href="/callagents/getting-started" className="md:col-span-2">
                        <motion.div variants={itemVariants} className="group relative h-full p-8 rounded-[2.5rem] bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden border border-gray-800">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl group-hover:bg-cyan-500/20 transition-all"></div>
                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/40">
                                    <Zap className="w-6 h-6 fill-white" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Complete Quickstart</h2>
                                <p className="text-gray-400 max-w-md mb-8">Learn the core concepts of Doweit Voice and deploy your first agent in under 5 minutes.</p>
                                <div className="flex items-center gap-2 font-bold text-cyan-400 group-hover:gap-4 transition-all cursor-pointer">
                                    Start Learning <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    <motion.div variants={itemVariants} onClick={() => handleOpenDoc("Authentication")} className="p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col justify-between group cursor-pointer hover:shadow-xl transition-all">
                        <div>
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold mb-2 dark:text-white">API Keys</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage keys for custom integrations.</p>
                        </div>
                        <div className="mt-8 text-gray-400 group-hover:text-purple-500 transition-colors">
                            <ArrowRight className="w-6 h-6" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* --- CATEGORY GRID --- */}
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                    <Book className="w-6 h-6 text-cyan-500" />
                    Browse by Category
                </h2>
                
                <motion.div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    {categories.map((cat, i) => (
                        <motion.div 
                            key={i}
                            variants={itemVariants}
                            className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-cyan-500/30 transition-all group"
                        >
                            <div className={`w-10 h-10 rounded-lg ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-lg mb-4">{cat.title}</h3>
                            <ul className="space-y-3">
                                {cat.links.map((link, j) => (
                                    <li 
                                        key={j} 
                                        onClick={() => handleOpenDoc(link)}
                                        className="flex items-center justify-between text-sm text-gray-500 hover:text-cyan-500 dark:text-gray-400 dark:hover:text-cyan-400 transition-colors cursor-pointer"
                                    >
                                        {link}
                                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>

                {/* --- COMMUNITY & FOOTER --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-16 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col items-start p-8 rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10">
                        <Github className="w-10 h-10 text-cyan-600 mb-6" />
                        <h3 className="text-xl font-bold mb-2">Open Source SDK</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">Contribute to the project or report bugs directly on GitHub.</p>
                        <button className="flex items-center gap-2 text-sm font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                            GitHub Repository <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex flex-col items-start p-8 rounded-[2rem] bg-purple-500/5 border border-purple-500/10">
                        <HelpCircle className="w-10 h-10 text-purple-600 mb-6" />
                        <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">Get in touch with our engineering team for specialized support.</p>
                        <button className="px-6 py-3 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold text-sm hover:opacity-90 transition-opacity">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {/* --- THE DOC READER MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <DocReaderModal 
                        isOpen={isModalOpen} 
                        onClose={() => setIsModalOpen(false)} 
                        docData={selectedDoc} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}