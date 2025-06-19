// voice-agents-CallAgents/[agentid]/_components/TestAgentSidePanel.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    FiX, FiPhone, FiMessageCircle, FiUser, FiSend, FiVolume2 // Icons
} from 'react-icons/fi';

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Define the width of the panel
const panelWidth = 'w-80'; // Example width: w-80 is 320px in Tailwind defaults

function TestAgentSidePanel({ isOpen, onClose, agentId }) {
    const [testMethod, setTestMethod] = useState(null); // 'voice' or 'chat'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userName, setUserName] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]); // Placeholder for messages

    const panelRef = useRef(null); // Ref for the panel element

    // Effect to reset state when opening/closing or agentId changes
    useEffect(() => {
        if (isOpen) {
            // Reset when panel opens (optional, but good for fresh test runs)
            setTestMethod(null);
            setPhoneNumber('');
            setUserName('');
            setChatInput('');
            setChatMessages([]); // Clear previous chat messages
        } else {
             // Optional: reset when panel closes
             setTestMethod(null);
             setPhoneNumber('');
             setUserName('');
             setChatInput('');
             setChatMessages([]);
        }
         // Add agentId to dependency array if state *should* reset per agent
    }, [isOpen, agentId]); // Removed agentId as it doesn't affect state reset logic based on current implementation


     // Handle clicks outside the panel to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
                 onClose();
             }
         };
         // Bind the event listener
         document.addEventListener("mousedown", handleClickOutside);
         return () => {
             // Unbind the event listener on clean up
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose]); // Re-run if isOpen or onClose changes


    // Placeholder functions for actions
    const handleCallMe = () => {
        console.log(`Calling ${userName} at ${phoneNumber} for agent ${agentId}`);
        // Implement actual call initiation logic here
        alert(`Simulating call to ${phoneNumber} (${userName}) for Agent ID: ${agentId}`); // Placeholder action
        // Optionally close the panel or reset state after initiation
        // onClose();
    };

    const handleSendChatMessage = (e) => {
        e.preventDefault(); // Prevent form submission if used in a form
        if (chatInput.trim()) {
            const newMessage = { id: Date.now(), text: chatInput, sender: 'user' };
            setChatMessages([...chatMessages, newMessage]);
            setChatInput('');
            // Implement logic to send message to agent and receive response
             console.log(`Sending chat message "${chatInput}" to agent ${agentId}`);
             // Add a placeholder AI response after a short delay
             setTimeout(() => {
                 setChatMessages(prevMessages => [
                     ...prevMessages,
                     { id: Date.now() + 1, text: "Hello! How can I help you today?", sender: 'agent' } // Placeholder response
                 ]);
             }, 500);
        }
    };

    // Render nothing if not open
    if (!isOpen) return null;


    return (
         // Backdrop Overlay
        <div className="fixed inset-0 z-50 flex justify-end " onClick={onClose}> {/* Use flex justify-end to keep space for panel */}
            {/* The actual panel */}
            <div
                ref={panelRef} // Attach ref here
                className={`flex flex-col h-full ${panelWidth} ${uiColors.bgPrimary} shadow-xl transition-transform ease-in-out duration-300`}
                onClick={(e) => e.stopPropagation()} // Prevent clicks inside panel from closing it
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Test Agent</h3>
                     <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close">
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Method Selection */}
                <div className={`flex border-b ${uiColors.borderPrimary}`}>
                    <button
                         className={`flex-1 text-center py-3 text-sm font-medium transition-colors ${
                             testMethod === 'voice'
                                 ? `${uiColors.accentPrimaryGradient} text-white`
                                 : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                         }`}
                         onClick={() => setTestMethod('voice')}
                    >
                         <FiVolume2 className="inline-block mr-1 w-4 h-4" /> Voice
                    </button>
                    <button
                         className={`flex-1 text-center py-3 text-sm font-medium transition-colors ${
                             testMethod === 'chat'
                                 ? `${uiColors.accentPrimaryGradient} text-white`
                                 : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                         }`}
                         onClick={() => setTestMethod('chat')}
                    >
                        <FiMessageCircle className="inline-block mr-1 w-4 h-4" /> Chat
                    </button>
                </div>

                {/* Content based on method */}
                <div className="flex-grow overflow-y-auto p-4 hide-scrollbar">
                    {!testMethod && (
                        <div className={`text-center ${uiColors.textSecondary} pt-8`}>
                            Select a method to test your agent.
                        </div>
                    )}

                    {/* Voice Test Form */}
                    {testMethod === 'voice' && (
                        <div className="flex flex-col space-y-4">
                            <div>
                                <label htmlFor="userName" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>
                                    Your Name
                                </label>
                                <div className="flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}">
                                     <FiUser className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                                     <input
                                        type="text"
                                        id="userName"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>
                                    Phone Number
                                </label>
                                 <div className="flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}">
                                    <FiPhone className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                                    <input
                                        type="tel" // Use type="tel" for phone numbers
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                                        placeholder="e.g., +14155552671"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCallMe}
                                disabled={!phoneNumber || !userName} // Disable if fields are empty
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm ${
                                     (!phoneNumber || !userName) ? 'opacity-50 cursor-not-allowed' : uiColors.accentPrimaryGradient // Dim when disabled
                                }`}
                            >
                                Call Me
                            </button>
                        </div>
                    )}

                    {/* Chat Test UI (Placeholder) */}
                    {testMethod === 'chat' && (
                        <div className="flex flex-col h-full"> {/* Flex column to stack messages and input */}
                            <div className="flex-grow overflow-y-auto space-y-3 pb-4"> {/* Messages area */}
                                {chatMessages.length === 0 ? (
                                    <div className={`text-center text-sm ${uiColors.textSecondary}`}>
                                        Start a chat...
                                    </div>
                                ) : (
                                     chatMessages.map(msg => (
                                         <div
                                             key={msg.id}
                                             className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                         >
                                             <div className={`rounded-lg p-2 max-w-[80%] text-sm ${
                                                 msg.sender === 'user'
                                                     ? `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}`
                                                     : `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`
                                             }`}>
                                                 {msg.text}
                                             </div>
                                         </div>
                                     ))
                                )}
                                {/* Add a ref here to auto-scroll to the latest message */}
                                {/* <div ref={messagesEndRef} /> */}
                            </div>
                             {/* Chat Input */}
                            <form onSubmit={handleSendChatMessage} className={`flex items-center pt-4 border-t ${uiColors.borderPrimary}`}> {/* Form for easy submit on Enter */}
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    className={`flex-grow p-2 text-sm rounded-l-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                                    placeholder="Type a message..."
                                />
                                <button
                                    type="submit"
                                     disabled={!chatInput.trim()}
                                     className={`p-2 rounded-r-md transition-colors ${!chatInput.trim() ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient} text-white`}`}
                                >
                                    <FiSend className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default TestAgentSidePanel;