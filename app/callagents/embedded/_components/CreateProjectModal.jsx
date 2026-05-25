"use client";
// app/callagents/embedded/_components/CreateProjectModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiShoppingBag, FiBriefcase, FiHeadphones, FiLoader } from 'react-icons/fi';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

const templates = [
    { id: 'blank', title: 'Empty Project', desc: 'Start with a blank canvas.', icon: FiPlus, color: 'text-blue-500' },
    { id: 'ecommerce', title: 'E-Commerce Agent', desc: 'Pre-built cart & checkout intents.', icon: FiShoppingBag, color: 'text-purple-500' },
    { id: 'saas', title: 'SaaS Navigator', desc: 'App navigation and helpdesk.', icon: FiBriefcase, color: 'text-cyan-500' },
    { id: 'support', title: 'Support Bot', desc: 'FAQ and ticket creation.', icon: FiHeadphones, color: 'text-emerald-500' },
];

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState('blank');
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setSelectedTemplate('blank');
            setProjectName('');
            setError(null);
            setIsCreating(false);
        }
    }, [isOpen]);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        
        setIsCreating(true);
        setError(null);

        try {
            const response = await fetch('/api/sdk/apps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName.trim(),
                    domainWhitelist: [] // Empty defaults to all allowed in dev
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create project');
            }

            const newApp = await response.json();
            onSuccess(newApp); // Pass to parent to update UI
        } catch (err) {
            setError(err.message);
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                ref={modalRef}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className={`relative w-full max-w-3xl ${uiColors.bgPrimary} rounded-2xl shadow-2xl border ${uiColors.borderPrimary} overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${uiColors.borderPrimary}`}>
                    <h3 className={`text-xl font-bold ${uiColors.textPrimary}`}>
                        {step === 1 ? 'Create Web Voice Assistant' : 'Name Your Project'}
                    </h3>
                    <button onClick={onClose} className={`p-2 rounded-lg ${uiColors.hoverBgSubtle} transition-colors`}>
                        <FiX className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {templates.map(tpl => (
                                <div 
                                    key={tpl.id}
                                    onClick={() => setSelectedTemplate(tpl.id)}
                                    className={`cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center
                                        ${selectedTemplate === tpl.id 
                                            ? `border-cyan-500 ${uiColors.accentSubtleBg}` 
                                            : `${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`
                                        }`}
                                >
                                    <div className={`w-14 h-14 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center mb-4 ${tpl.color}`}>
                                        <tpl.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className={`font-bold text-lg mb-1 ${uiColors.textPrimary}`}>{tpl.title}</h4>
                                    <p className={`text-sm ${uiColors.textSecondary}`}>{tpl.desc}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="e.g., Main Website Assistant"
                                    className={`w-full p-3 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.textPrimary} focus:ring-2 focus:ring-cyan-500 outline-none transition-all`}
                                />
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-5 border-t ${uiColors.borderPrimary} flex justify-between bg-gray-50/50 dark:bg-gray-900/50`}>
                    {step === 2 ? (
                        <button onClick={() => setStep(1)} className={`px-5 py-2.5 rounded-lg font-medium ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}>
                            Back
                        </button>
                    ) : <div></div>}
                    
                    {step === 1 ? (
                        <button onClick={() => setStep(2)} className={`px-6 py-2.5 rounded-lg font-bold text-white ${uiColors.accentPrimaryGradient} transition-all`}>
                            Continue
                        </button>
                    ) : (
                        <button onClick={handleCreate} disabled={!projectName.trim() || isCreating} className={`flex items-center px-6 py-2.5 rounded-lg font-bold text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50 transition-all`}>
                            {isCreating ? <FiLoader className="w-5 h-5 animate-spin mr-2" /> : null}
                            Create Assistant
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}