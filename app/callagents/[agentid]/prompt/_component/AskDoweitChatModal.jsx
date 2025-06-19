// voice-agents-CallAgents/[agentid]/_components/AskDoweitChatModal.jsx
"use client";

import React from 'react';
import { FiX } from 'react-icons/fi';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Adjust path as necessary

function AskDoweitChatModal({ isOpen, onClose, agentId }) { // Might need agentId
    if (!isOpen) return null;

    // Basic modal backdrop and centered content structure
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md`} // Max width adjusted slightly
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Ask DoweitChat (Copilot)</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Modal Body (Placeholder) */}
                <div className={`${uiColors.textSecondary} text-center py-8`}>
                     <p>DoweitChat (Copilot) interaction UI goes here.</p>
                     <p className="text-sm mt-2">This is a placeholder modal for Agent ID: {agentId}</p> {/* Example using agentId */}
                </div>

                {/* Footer (Optional) */}
                <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4`}>
                    <button onClick={onClose} className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AskDoweitChatModal;