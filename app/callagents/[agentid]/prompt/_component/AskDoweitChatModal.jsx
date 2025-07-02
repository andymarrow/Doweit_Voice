"use client";

import React from 'react';
import { FiX, FiCpu, FiBookOpen } from 'react-icons/fi'; // Import additional icons for context display

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Adjust path as necessary

// Receive agent object from parent
function AskDoweitChatModal({ isOpen, onClose, agent }) {
    if (!isOpen) return null;

    // Extract relevant info from agent object
    const agentId = agent?.id;
    const agentName = agent?.name || 'Unnamed Agent';
    const promptText = agent?.prompt || 'No prompt available.';
    const knowledgeBaseId = agent?.knowledgeBaseId;

    // Basic modal backdrop and centered content structure
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" onClick={onClose}> {/* Added p-4 for padding on small screens */}
            <div
                className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] flex flex-col`} // Max width adjusted slightly, added max-h, flex-col
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
            >
                {/* Header */}
                <div className={`flex items-center justify-between border-b ${uiColors.borderPrimary} pb-3 mb-4 flex-shrink-0`}> {/* Added flex-shrink-0 */}
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Ask DoweitChat (Copilot)</h3>
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Modal Body (Placeholder) - Make scrollable */}
                <div className={`flex-grow overflow-y-auto ${uiColors.textSecondary} text-sm space-y-4`}> {/* Adjusted text size, added space-y, overflow */}
                     <p>Provide context or ask DoweitChat for suggestions for your agent's prompt or configuration.</p>
                     <p className="italic text-xs">Current Agent: {agentName} (ID: {agentId})</p>

                     {/* Display Context */}
                      <div>
                         <h4 className={`font-semibold ${uiColors.textPrimary} mb-2`}>Agent Context:</h4>
                          <div className={`${uiColors.bgSecondary} border ${uiColors.borderPrimary} rounded-md p-3 text-xs space-y-2 max-h-40 overflow-y-auto`}> {/* Added max-h and overflow */}
                              <p><strong>Prompt:</strong> {promptText.substring(0, 200)}{promptText.length > 200 ? '...' : ''}</p> {/* Show truncated prompt */}
                              <p><strong>Linked KB:</strong> {knowledgeBaseId ? `KB ID ${knowledgeBaseId}` : 'None'}</p>
                              {/* Add other relevant agent config details here */}
                          </div>
                      </div>

                     {/* Input/Chat Area (Placeholder) */}
                      <div>
                          <label htmlFor="doweitChatInput" className={`block text-sm font-medium mb-2 ${uiColors.textSecondary}`}>Your Question:</label>
                          <textarea
                             id="doweitChatInput" // Added ID
                             className={`block w-full h-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                             placeholder="e.g., How can I make the greeting more friendly?"
                         ></textarea>
                      </div>

                     {/* Actions */}
                      <div className="flex justify-end">
                          {/* Example button: Get Suggestion */}
                           <button
                                className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                // Add onClick handler to send query to backend/AI service
                                disabled // Disable for now as it's a placeholder
                           >
                               <FiCpu className="mr-2 w-4 h-4" /> Get Suggestions
                           </button>
                      </div>

                     {/* AI Response Area (Placeholder) */}
                      {/* <div>
                          <h4 className={`font-semibold ${uiColors.textPrimary} mb-2`}>Suggestions:</h4>
                           <div className={`${uiColors.bgSecondary} border ${uiColors.borderPrimary} rounded-md p-3 text-xs italic ${uiColors.textPlaceholder} max-h-40 overflow-y-auto`}>
                                Suggestions will appear here...
                           </div>
                      </div> */}

                </div>

                {/* Footer (Optional) */}
                {/* <div className={`flex justify-end border-t ${uiColors.borderPrimary} pt-3 mt-4 flex-shrink-0`}> */}
                    {/* Keep close button if needed in footer */}
                     {/* <button onClick={onClose} className={`px-4 py-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`}>
                        Close
                    </button> */}
                {/* </div> */}
            </div>
        </div>
    );
}

export default AskDoweitChatModal;