// app/callagents/knowledgebase/_components/KbDoweitChat.jsx
"use client";

import React from 'react';
import { FiCpu, FiSend, FiRefreshCcw, FiLoader, FiCheck } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path

// Placeholder component for Doweit Chat KB generation
// Receive isCreating state from parent and onCreateKb handler
function KbDoweitChat({ isCreating, onCreateKb /* Add other props like agentId if needed */ }) { // *** isCreating prop ***
    // Placeholder state for chat input and messages
    const [chatInput, setChatInput] = React.useState('');
    const [chatMessages, setChatMessages] = React.useState([]); // e.g., [{ role: 'user', text: '...' }, { role: 'ai', text: '...' }]
    const [isGeneratingResponse, setIsGeneratingResponse] = React.useState(false); // State for AI response generation

    // Simulate sending a message
    const handleSendMessage = (e) => {
        e.preventDefault();
        // Disable if creating overall KB OR if AI is generating response
        if (isCreating || isGeneratingResponse || !chatInput.trim()) return;

        const userMessage = chatInput.trim();
        setChatMessages(prevMessages => [...prevMessages, { role: 'user', text: userMessage }]);
        setChatInput('');
        setIsGeneratingResponse(true); // Set AI generating state
        console.log("Sending message to simulated Doweit Chat:", userMessage);

        // Simulate AI response after a delay
        setTimeout(() => {
            const aiResponse = `Based on "${userMessage}", I can generate a draft knowledge base structure. Would you like me to proceed?`; // Example response
            setChatMessages(prevMessages => [...prevMessages, { role: 'ai', text: aiResponse }]);
            setIsGeneratingResponse(false); // Clear AI generating state
        }, 1500); // Simulate AI thinking time
    };

     // Simulate generating KB from chat conversation
     const handleGenerateKb = () => {
         // Disable if creating overall KB OR if AI is generating response
          if (isCreating || isGeneratingResponse) return;

         console.log("Simulating KB generation from chat...");
          // Process the chat conversation and structure it into KB data
         const generatedKbData = {
             name: "Generated KB from Chat", // Suggest a name
             description: "Generated based on conversation with Doweit Chat.",
             content: [{ type: 'text', value: "Sample content generated from chat..." }], // Simulate generated content
             isPublic: false,
             status: 'processing', // Generated content might need processing
         };
         // Call the parent handler to create the new KB
         if (onCreateKb) { // Check if handler is provided
             onCreateKb(generatedKbData); // Parent handles the async creation AND modal closing/navigation
         } else {
              console.warn("onCreateKb handler not provided to KbDoweitChat.");
              alert("Simulating generation of KB. Data ready to be sent to parent handler.");
         }
     };

     // Determine if input/send button is disabled
     const isInputDisabled = isCreating || isGeneratingResponse;
     const isSendButtonDisabled = isInputDisabled || !chatInput.trim();

     // Determine if Finalize button is disabled
     const isFinalizeButtonDisabled = isCreating || isGeneratingResponse || chatMessages.length === 0;


    return (
        <div className="space-y-6 flex flex-col h-full">
            {/* Chat Messages Area */}
            <div className={`flex-grow overflow-y-auto p-4 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} text-sm space-y-4 hide-scrollbar`}>
                 {chatMessages.length === 0 ? (
                     <div className={`text-center italic ${uiColors.textPlaceholder}`}>
                          <FiCpu className="inline-block mr-2 w-5 h-5" /> How can I help you create your Knowledge Base?
                     </div>
                 ) : (
                      chatMessages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                               <div className={`max-w-[85%] p-3 rounded-lg ${
                                   msg.role === 'user'
                                       ? `${uiColors.chatBubbleUserBg} ${uiColors.chatBubbleUserText}`
                                       : `${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`
                               }`}>
                                  {msg.text}
                              </div>
                          </div>
                      ))
                 )}
                 {isGeneratingResponse && (
                      <div className="flex justify-start">
                          <div className={`max-w-[85%] p-3 rounded-lg ${uiColors.chatBubbleAgentBg} ${uiColors.chatBubbleAgentText}`}>
                              <FiLoader className="animate-spin inline-block mr-2" /> DoweitChat is thinking...
                          </div>
                      </div>
                 )}
            </div>

            {/* Chat Input Area */}
             <form onSubmit={handleSendMessage} className="flex-shrink-0 flex space-x-2 mt-4">
                 <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={isInputDisabled} // Use disabled state
                      className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                      placeholder="Ask DoweitChat to generate a KB..."
                 />
                 <button
                      type="submit"
                      disabled={isSendButtonDisabled} // Use disabled state
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                      {isGeneratingResponse ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiSend className="mr-2 w-4 h-4" />}
                      Send
                 </button>
             </form>

            {/* Optional: Button to trigger final KB creation based on chat */}
             {chatMessages.length > 0 && !isGeneratingResponse && ( // Show if messages exist and AI is not thinking
                 <div className="flex justify-end mt-4">
                     <button
                         onClick={handleGenerateKb} // Call handler to finalize KB
                         disabled={isFinalizeButtonDisabled} // Use disabled state
                         className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} disabled:opacity-50 disabled:cursor-not-allowed`}
                     >
                         <FiCheck className="mr-2 w-4 h-4" /> Finalize Knowledge Base
                     </button>
                 </div>
             )}

        </div>
    );
}

export default KbDoweitChat;