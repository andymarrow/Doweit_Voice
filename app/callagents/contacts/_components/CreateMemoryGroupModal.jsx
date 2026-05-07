"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFileText } from 'react-icons/fi';
import { uiColors } from '../../_constants/uiConstants';
import { toast } from 'react-hot-toast';

export default function CreateMemoryGroupModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) {
            toast.error("Memory Group name is required.");
            return;
        }

        console.log("Submitting Memory Group:", formData);
        toast.success("Memory Group created successfully!");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className={`relative w-full max-w-5xl h-[600px] max-h-[90vh] flex flex-col md:flex-row rounded-2xl shadow-2xl ${uiColors.bgPrimary} border ${uiColors.borderPrimary} overflow-hidden`}
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Left Side: How it Works (Info Panel) */}
                <div className={`hidden md:flex flex-col w-[380px] shrink-0 border-r ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-900/50 p-8 overflow-y-auto custom-scrollbar`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>How it Works?</h3>
                        <FiX className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" /> {/* Decorative close icon as seen in screenshot */}
                    </div>

                    {/* Graphic/Hero Image Placeholder */}
                    <div className="w-full h-40 bg-black rounded-xl mb-6 flex items-center justify-center relative overflow-hidden border border-gray-800">
                        {/* Recreating the "Synthflow Memory Groups" graphic via CSS/Text */}
                        <div className="absolute top-4 left-4 text-white text-xs font-bold">Doweit Voice</div>
                        <h2 className="text-white text-2xl font-bold z-10">Memory Groups</h2>
                        
                        {/* Decorative circles */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                            <div className="w-16 h-16 rounded-full border-2 border-purple-500 absolute -right-8 opacity-80" />
                            <div className="w-16 h-16 rounded-full border-2 border-purple-500 absolute -right-4 opacity-60" />
                            <div className="w-16 h-16 rounded-full border-2 border-purple-500 opacity-40" />
                            <div className="w-16 h-16 rounded-full bg-black border-2 border-black absolute -right-12 z-10" />
                        </div>
                        
                        <div className="absolute bottom-4 left-4 text-white/70 text-[10px] max-w-[150px] leading-tight">
                            Create a Memory Group to share conversation context across agents.
                        </div>
                    </div>

                    {/* Explainer Text */}
                    <p className={`text-sm mb-4 leading-relaxed ${uiColors.textSecondary}`}>
                        Create a Memory Group to share conversation context across agents.
                    </p>
                    <ul className={`text-sm space-y-2.5 mb-8 list-disc list-outside ml-4 ${uiColors.textSecondary}`}>
                        <li>Store conversation history and insights in one shared space</li>
                        <li>Attach one or more AI agents so they all recall the same context</li>
                        <li>Agents not linked to the group can't see or update its memories</li>
                        <li>Move contacts and transcripts between groups whenever you need</li>
                    </ul>

                    {/* Documentation Link */}
                    <a href="#" className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline mt-auto">
                        <FiFileText className="w-4 h-4" /> Documentation
                    </a>
                </div>

                {/* Right Side: Form Content */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
                    
                    {/* Header */}
                    <div className={`flex items-center justify-between px-8 py-5 border-b ${uiColors.borderPrimary} shrink-0`}>
                        <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>New Memory Group</h2>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={onClose}
                                className={`px-4 py-2.5 text-sm font-semibold rounded-lg border ${uiColors.borderPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary} transition-colors`}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSubmit}
                                className={`px-6 py-2.5 text-sm font-semibold rounded-lg text-white bg-gray-500 hover:bg-gray-600 transition-colors shadow-sm`}
                            >
                                Create
                            </button>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                        
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                                Memory Group Name
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter Name"
                                className={`w-full px-4 py-3 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary}`}
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                                Description
                            </label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Enter Description"
                                rows={5}
                                className={`w-full px-4 py-3 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 focus:ring-purple-500 text-sm ${uiColors.textPrimary} resize-none`}
                            />
                        </div>

                    </div>
                </div>

            </motion.div>
        </div>
    );
}