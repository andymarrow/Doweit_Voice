//app/callagents/Integrations/apikeys/_components/ApiKeyTable.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiTrash2, FiKey } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { uiColors, itemVariants } from '../../../_constants/uiConstants';

const formatKey = (key) => `...${key.slice(-4)}`;
const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

export default function ApiKeyTable({ keys, onDelete }) {
    const handleCopy = (key) => {
        navigator.clipboard.writeText(key);
        toast.success("API Key copied to clipboard!");
    };
    
    if (keys.length === 0) {
        // ... (empty state remains the same)
        return (
            <div className={`text-center py-16 border-2 border-dashed ${uiColors.borderPrimary} rounded-lg`}>
                <FiKey className={`mx-auto w-12 h-12 mb-4 ${uiColors.textPlaceholder}`} />
                <h3 className={`font-semibold ${uiColors.textPrimary}`}>No API Keys Found</h3>
                <p className={`mt-1 text-sm ${uiColors.textSecondary}`}>Click "Create New API Key" to get started.</p>
            </div>
        );
    }

    return (
        <div className={`rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}>
            {/* --- FIX: Added a scrollable wrapper div --- */}
            <div className="overflow-x-auto hide-scrollbar">
                {/* --- And added a minimum width to the table to force scrolling --- */}
                <table className="w-full min-w-[600px] text-sm">
                    <thead>
                        <tr className={`border-b ${uiColors.borderPrimary}`}>
                            <th className={`text-left p-4 font-medium ${uiColors.textSecondary}`}>NAME</th>
                            <th className={`text-left p-4 font-medium ${uiColors.textSecondary}`}>KEY</th>
                            <th className={`text-left p-4 font-medium ${uiColors.textSecondary}`}>DATE CREATED</th>
                            <th className={`text-right p-4 font-medium ${uiColors.textSecondary}`}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((key, index) => (
                            <motion.tr 
                                key={key.id}
                                className={`border-b ${uiColors.borderPrimary} last:border-b-0`}
                                variants={itemVariants}
                            >
                                <td className={`p-4 font-medium ${uiColors.textPrimary}`}>{key.name}</td>
                                <td className={`p-4 font-mono ${uiColors.textSecondary}`}>{formatKey(key.key)}</td>
                                <td className={`p-4 ${uiColors.textSecondary}`}>{formatDate(key.createdAt)}</td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => handleCopy(key.key)} className={`p-2 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`} title="Copy Key">
                                            <FiCopy />
                                        </button>
                                        <button onClick={() => onDelete(key)} className={`p-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500`} title="Delete Key">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}