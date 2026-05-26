"use client";
// app/callagents/embedded/_components/CreateProjectModal.jsx

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiX, FiLoader } from 'react-icons/fi';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// "Start from Scratch" is the only creation path that's actually wired up —
// the template options were placeholders for future presets. The modal now
// jumps straight to the project-name input.
export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
    const [projectName, setProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState(null);
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
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
                    domainWhitelist: [], // Empty defaults to all allowed in dev
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create project');
            }

            const newApp = await response.json();
            onSuccess(newApp);
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
                className={`relative w-full max-w-md ${uiColors.bgPrimary} rounded-2xl border ${uiColors.borderPrimary} overflow-hidden flex flex-col`}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-5 border-b ${uiColors.borderPrimary}`}>
                    <h3 className={`text-xl font-bold ${uiColors.textPrimary}`}>
                        Create Web Voice Assistant
                    </h3>
                    <button onClick={onClose} className={`p-2 rounded-lg ${uiColors.hoverBgSubtle} transition-colors`}>
                        <FiX className={`w-5 h-5 ${uiColors.textSecondary}`} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-sm">
                            {error}
                        </div>
                    )}

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
                            <p className={`mt-2 text-xs ${uiColors.textSecondary}`}>
                                You can rename it anytime from the project settings.
                            </p>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className={`p-5 border-t ${uiColors.borderPrimary} flex justify-end bg-gray-50/50 dark:bg-gray-900/50`}>
                    <button
                        onClick={handleCreate}
                        disabled={!projectName.trim() || isCreating}
                        className={`flex items-center px-6 py-2.5 rounded-lg font-bold text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50 transition-all`}
                    >
                        {isCreating ? <FiLoader className="w-5 h-5 animate-spin mr-2" /> : null}
                        Create Assistant
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
