"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiX, FiCopy, FiCheck, FiChevronRight, FiTerminal } from 'react-icons/fi';
// --- UPDATED IMPORT PATH ---
import { uiColors as importedColors } from '@/app/callagents/_constants/uiConstants'; 
import { toast } from 'react-hot-toast';

// Fallback colors in case the import fails
const uiColors = importedColors || {
    bgPrimary: 'bg-white dark:bg-gray-900',
    borderPrimary: 'border-gray-200 dark:border-gray-800',
    textPrimary: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-600 dark:text-gray-400',
    textPlaceholder: 'text-gray-400 dark:text-gray-500'
};

export default function DocReaderModal({ isOpen, onClose, docData }) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (text) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen || !docData) return null;

    const Icon = docData.icon || FiTerminal;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-4xl h-full max-h-[85vh] flex flex-col rounded-3xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary} overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- HEADER --- */}
                <div className={`flex items-center justify-between px-8 py-5 border-b ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-800/30`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center text-sm font-medium text-gray-400">
                            <span>Docs</span>
                            <FiChevronRight className="mx-2" />
                            <span className="text-gray-600 dark:text-gray-300">{docData.category}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors`}>
                        <FiX className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* --- BODY --- */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 hide-scrollbar">
                    <h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-6 ${uiColors.textPrimary}`}>
                        {docData.title}
                    </h1>
                    
                    <p className={`text-lg leading-relaxed mb-10 ${uiColors.textSecondary}`}>
                        {docData.content}
                    </p>

                    {/* Checklist Section */}
                    {docData.steps && (
                        <div className="mb-10">
                            <h3 className={`text-sm font-bold uppercase tracking-widest ${uiColors.textPlaceholder} mb-4`}>
                                Implementation Steps
                            </h3>
                            <div className="space-y-3">
                                {docData.steps.map((step, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <span className={`text-sm font-medium ${uiColors.textPrimary}`}>{step}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Code Section */}
                    {docData.code && (
                        <div className="mb-10">
                            <h3 className={`text-sm font-bold uppercase tracking-widest ${uiColors.textPlaceholder} mb-4`}>
                                Code Example
                            </h3>
                            <div className="relative group rounded-2xl bg-[#0D1117] border border-gray-800 overflow-hidden shadow-xl">
                                <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleCopy(docData.code)}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                                    >
                                        {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                                    </button>
                                </div>
                                <div className="px-4 py-2 bg-[#161B22] border-b border-gray-800 flex items-center gap-2">
                                    <FiTerminal className="w-3 h-3 text-gray-400" />
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Example Snippet</span>
                                </div>
                                <pre className="p-6 overflow-x-auto text-sm font-mono text-blue-300 leading-relaxed">
                                    <code>{docData.code}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- FOOTER --- */}
                <div className={`px-8 py-5 border-t ${uiColors.borderPrimary} bg-gray-50/30 flex items-center justify-between shrink-0`}>
                    <p className="text-xs text-gray-400 font-medium italic">Was this helpful?</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors">Yes</button>
                        <button className="px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-colors">No</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}