// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/Integrations/apikeys/_components/CreateApiKeyModal.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLoader } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';

const modalVariants = { /* ... same as your previous modal ... */ };

export default function CreateApiKeyModal({ isOpen, onClose, onCreate }) {
    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setIsCreating(true);
        await onCreate(name.trim());
        // Reset state after successful creation
        setIsCreating(false);
        setName('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <motion.div /* ... */ className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                        <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                            <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Create New API Key</h3>
                            <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <label htmlFor="keyName" className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>
                                Name
                            </label>
                            <input
                                id="keyName"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., My Production Key"
                                className={`block w-full rounded-md p-2 ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2`}
                                disabled={isCreating}
                            />
                            <p className={`text-xs mt-2 ${uiColors.textPlaceholder}`}>Give your key a descriptive name for easy identification.</p>
                            <div className={`flex justify-end pt-6 mt-4 border-t ${uiColors.borderPrimary}`}>
                                <button
                                    type="submit"
                                    disabled={!name.trim() || isCreating}
                                    className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white disabled:opacity-50
                                        ${isCreating ? `bg-gray-400` : uiColors.accentPrimaryGradient}`
                                    }
                                >
                                    {isCreating ? <><FiLoader className="animate-spin mr-2" /> Creating...</> : 'Create Key'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}