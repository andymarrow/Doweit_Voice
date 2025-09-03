// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/Integrations/apikeys/_components/ShowApiKeyModal.jsx
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCopy, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { uiColors } from '../../../_constants/uiConstants';

export default function ShowApiKeyModal({ isOpen, onClose, apiKey }) {
    if (!apiKey) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey.key);
        toast.success("API Key copied to clipboard!");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <motion.div /* ... */ className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-lg`}>
                        <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                            <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>API Key Created</h3>
                            <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}><FiX /></button>
                        </div>
                        
                        <div className={`p-4 rounded-md mb-4 text-sm flex items-start space-x-3 ${uiColors.alertWarningBg} border ${uiColors.alertWarningBorder}`}>
                            <FiAlertTriangle className={`w-6 h-6 flex-shrink-0 ${uiColors.alertWarningText}`} />
                            <p className={uiColors.alertWarningText}>
                                <span className="font-semibold">Important:</span> Please copy this key and store it in a safe place. You will not be able to see it again.
                            </p>
                        </div>
                        
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>
                                Key for "{apiKey.name}"
                            </label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={apiKey.key}
                                    className={`flex-grow font-mono text-xs rounded-md p-2 ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary}`}
                                />
                                <button onClick={handleCopy} className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`} title="Copy Key">
                                    <FiCopy />
                                </button>
                            </div>
                        </div>

                        <div className={`flex justify-end pt-6 mt-4 border-t ${uiColors.borderPrimary}`}>
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 text-sm font-semibold rounded-md text-white ${uiColors.accentPrimaryGradient}`}
                            >
                                Done
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}