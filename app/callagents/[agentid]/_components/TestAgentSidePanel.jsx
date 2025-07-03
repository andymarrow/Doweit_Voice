// voice-agents-CallAgents/[agentid]/_components/TestAgentSidePanel.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    FiX, FiPhone, FiMessageCircle, FiUser, FiSend, FiVolume2, FiLoader, FiAlertTriangle // Icons
} from 'react-icons/fi';
// *** Import Vapi Web SDK ***
import Vapi from '@vapi-ai/web';

// Import constants
import { uiColors } from '../../_constants/uiConstants';
import { toast } from 'react-hot-toast'; // Assuming toast is available


// *** IMPORTANT SECURITY WARNING: DO NOT EXPOSE YOUR VAPI API KEY IN CLIENT-SIDE CODE IN PRODUCTION ***
// This is for demonstration purposes ONLY.
// Replace with a secure backend endpoint that handles Vapi API calls.
const VAPI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY; // Recommended: use environment variable
const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);


// Define the width of the panel
const panelWidth = 'w-80'; // Example width: w-80 is 320px in Tailwind defaults

// Receive isOpen, onClose, and the full agent object
function TestAgentSidePanel({ isOpen, onClose, agent }) { // Receive agent prop

    const [testMethod, setTestMethod] = useState(null); // 'voice' or 'chat'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [userName, setUserName] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // *** State for Vapi call status ***
    const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'connecting', 'connected', 'ended', 'error'
    const [callError, setCallError] = useState(null); // Store Vapi error message

    // State for error messages specifically related to setup (like missing key)
    const [setupError, setSetupError] = useState(null);


    const panelRef = useRef(null); // Ref for the panel element
    // *** Ref for Vapi instance ***
    const vapiRef = useRef(null);


    // Get agent details from the prop
    const agentId = agent?.id;
    const agentName = agent?.name || 'Unnamed Agent';

    // Effect to initialize Vapi and set up event listeners
    useEffect(() => {
        // Initialize Vapi only once when the component mounts
        if (!vapiRef.current) {
             if (!VAPI_PUBLIC_API_KEY) {
                 console.error("VAPI_PUBLIC_API_KEY is not set. Voice test will not work.");
                  // Optionally set an error state in the UI
             } else {
                vapiRef.current = new Vapi(VAPI_PUBLIC_API_KEY);
                 console.log("Vapi SDK initialized.");

                 // *** Set up Vapi event listeners ***
                 vapiRef.current.on('call-status', (status) => {
                    console.log("Vapi Call Status:", status);
                    setCallStatus(status);
                    if (status === 'ended') {
                         // Optional: show end message or summary
                         toast.success("Call ended.");
                    }
                 });

                 vapiRef.current.on('message', (message) => {
                    console.log("Vapi Message:", message);
                    // Vapi message events contain real-time transcription and agent responses
                    // This is different from a chat bot log.
                    // You could potentially build a real-time transcript display here.
                    // For simplicity, we'll just log for now.
                    // If you want a chat-like interaction, you'd need a separate chat bot integration.
                 });

                 vapiRef.current.on('error', (error) => {
                    console.error("Vapi Error:", error);
                    setCallStatus('error'); // Set status to error
                    setCallError(error.message || 'An unknown Vapi error occurred.'); // Store error message
                     toast.error(`Vapi Error: ${error.message || 'Unknown error'}`); // Show toast
                 });
             }
        }

        // Cleanup function: Stop call and remove listeners when component unmounts or panel closes/agent changes
        return () => {
             console.log("Cleaning up Vapi...");
            if (vapiRef.current) {
                 try {
                    vapiRef.current.stop(); // Attempt to stop any active call
                 } catch (error) {
                     // Vapi.stop() might throw if called when not connected
                     console.warn("Vapi stop failed, likely already disconnected:", error);
                 }
                 // Vapi instance persists in the ref, listeners are managed by Vapi internally
            }
             // Clear call related state when agentId changes or panel closes
             setCallStatus('idle');
             setCallError(null);
        };
    }, [agentId]); // Re-run effect if agentId changes (new agent loaded)

    // Effect to reset state when opening/closing
    useEffect(() => {
        if (isOpen) {
            // Reset when panel opens (optional, but good for fresh test runs)
            setTestMethod(null);
            setPhoneNumber('');
            setUserName('');
            setChatInput('');
            setChatMessages([]); // Clear previous chat messages
        } else {
             // Optional: reset method when panel closes
             setTestMethod(null);
        }
         // agentId is in the dependency array of the Vapi effect, which handles call state reset
    }, [isOpen]);


     // Handle clicks outside the panel to close it
     useEffect(() => {
         const handleClickOutside = (event) => {
             // Prevent closing if a call is connecting or connected
             const isCallActive = callStatus === 'connecting' || callStatus === 'connected';
             if (panelRef.current && !panelRef.current.contains(event.target) && isOpen && !isCallActive) {
                 onClose();
             }
         };
         document.addEventListener("mousedown", handleClickOutside);
         return () => {
             document.removeEventListener("mousedown", handleClickOutside);
         };
     }, [isOpen, onClose, callStatus]); // Added callStatus to dependencies


// Helper to map your internal voice provider names to Vapi's expected names
const mapVoiceProviderToVapi = (provider) => {
    switch (provider?.toLowerCase()) { // Use lowercase for robustness
        case 'elevenlabs': return '11labs'; // Corrected from 'elevenlabs' to '11labs'
        case 'azure': return 'azure';
        // Add cases for other providers if you support them
        // case 'vapi': return 'vapi'; // If you store 'vapi' explicitly
        // case 'deepgram': return 'deepgram'; // etc.
        default:
            console.warn(`Unknown voice provider "${provider}". Falling back to '11labs'.`);
            return '11labs'; // Provide a safe default that Vapi supports
    }
};



    // --- Vapi Voice Call Handler ---
    // Use useCallback to memoize the handler
    const handleCallMe = useCallback(async () => {
        if (!vapiRef.current) {
            console.error("Vapi SDK not initialized.");
             toast.error("Test call unavailable. Vapi SDK not initialized.");
            return;
        }
        if (!agentId) {
             console.warn("Agent ID is missing.");
             toast.error("Cannot initiate call: Agent ID is missing.");
             return;
        }
         if (!phoneNumber || !userName) {
             toast.error("Please enter your name and phone number.");
             return;
         }

         // Stop ongoing call if connected
         if (callStatus === 'connected' || callStatus === 'connecting') {
             console.log("Attempting to stop ongoing call...");
             try {
                 vapiRef.current.stop(); // Stop the call
             } catch (error) {
                 console.error("Failed to stop Vapi call:", error);
                 toast.error("Failed to stop call.");
             }
             // Status will be updated by the 'call-status' event listener
             return;
         }

         // *** Initiate a new call ***
         console.log(`Initiating Vapi call for agent ${agentId} to ${phoneNumber} (${userName})`);
         setCallStatus('connecting'); // Set status immediately
         setCallError(null); // Clear previous errors

         try {

            const systemMessageContent = `
                 You are an AI assistant roleplaying as a character named ${agent?.name || 'Assistant'}.
                 ${agent?.prompt ? `Your core instructions and persona details are: ${agent.prompt}` : 'Your purpose is to assist the user.'}
                 ${agent?.voiceConfig?.language ? `Maintain conversations in the ${agent.voiceConfig.language} language.` : 'Use the default language of the call (likely English).'}
                 ${agent?.greetingMessage ? `If you are the first speaker, you may choose to start the conversation with "${agent.greetingMessage}".` : ''}
                 ${Array.isArray(agent?.customVocabulary) && agent.customVocabulary.length > 0 ? `Incorporate the following specific terms or phrases naturally where relevant: ${agent.customVocabulary.map(item => item.term).join(', ')}.` : ''}
                 Speak naturally as if in a real voice call. Be concise and directly address the user's needs or questions based on your instructions.
             `.trim().replace(/\s+/g, ' '); // Trim whitespace and condense multiple spaces



             // --- Prepare agent configuration for Vapi ---
             // Use the 'agent' prop which contains the full config fetched by the layout
             // NOTE: Vapi's agent object has many possible fields. We include the most relevant ones.
             // Check Vapi documentation for the exact structure expected: https://docs.vapi.ai/reference/api/agent/overview
             const vapiAgentConfig = {
    // These are the top-level properties expected by vapi.start() for web calls
    model: {
        // provider: (agent?.aiModel?.toLowerCase().includes('gemini') || agent?.aiModel?.toLowerCase().includes('google')) ? "google" : "openai",  // Assuming Google based on your desired model, or make this configurable from agent
        // model: agent?.aiModel || "gemini-1.5-flash", // Use model from agent config
         provider: "google",
        model: "gemini-1.5-flash",
        temperature: agent?.callConfig?.temperature ?? 0.7, // Add a default temperature or map from agent if available
        // Include messages array for system prompt and conversation history
        messages: [
            // The first message is the system message/prompt
            {
                role: "system",
                content: systemMessageContent,
                // You might enhance this system prompt further using other agent fields
                // For example:
                // content: `You are roleplaying as a character named ${agent?.name || 'Assistant'}. Your personality is: ${agent?.description || 'helpful and friendly'}. ${agent?.tagline ? `Your tagline is: ${agent?.tagline}.` : ''} ${agent?.greetingMessage ? `If you are the first speaker, start with "${agent?.greetingMessage}".` : ''} Your behavior traits include: ${agent?.behavior && Array.isArray(agent.behavior) && agent.behavior.length > 0 ? agent.behavior.join(', ') : 'friendly'}. Speak naturally as if in a real voice call. Be concise. Maintain this language: ${agent?.voiceConfig?.language || 'en'}. Your core instruction is: ${agent?.prompt || 'Respond to the user.'}`,
            },
            
        ],
    },
    voice: {
        // *** FIX: Map 'elevenlabs' (spelled out) to '11labs' (numeric) if that's the provider ***
        // Also handle other providers you might support based on Vapi's allowed list
        // provider: (agent?.voiceConfig?.voiceProvider === 'elevenlabs' ? '11labs' : agent?.voiceConfig?.voiceProvider) || '11labs', // Use 11labs as default fallback
       provider : 'vapi',
        voiceId: agent?.voiceConfig?.voiceId || 'Savannah', // Use voice ID from agent config, with fallback
        // Add other voice specific parameters if supported by Vapi config object (e.g., stability, similarityBoost)
        // stability: agent?.voiceConfig?.stability, // Add if you store and need to pass this
        // similarityBoost: agent?.voiceConfig?.similarity, // Add if you store and need to pass this
    },
    language: agent?.voiceConfig?.language || 'en', // Use language from agent config

    // *** Use firstMessage for the greeting, not prompt ***
    firstMessage: agent?.greetingMessage || "Hello!", // Use greeting message as the specific first message if needed

    // *** REMOVE properties that caused errors (not expected for vapi.start() web config) ***
    // prompt: agent?.prompt, // REMOVED - now in model.messages system role
    // name: agent?.name, // REMOVED - not expected here
    // maxDuration: agent?.callConfig?.callDurationLimit, // REMOVED
    // noiseCancellation: agent?.callConfig?.noiseCancellation, // REMOVED
    // tools: [], // REMOVED
    // phoneNumber: phoneNumber, // REMOVED
    // customer: { ... }, // REMOVED
};

console.log("[Workflow Page] Starting Vapi call with agent config:", vapiAgentConfig);

try {
    vapiRef.current.start(vapiAgentConfig);
    // States updated by 'call-start' event listener
} catch (e) {
    console.error("Error starting Vapi call:", e);
    setError(`Failed to start call: ${e.message}`);
    setIsCallActive(false); // Ensure state is false on failure
}
             // Status will be updated by the 'call-status' event listener

         } catch (error) {
             console.error("Error starting Vapi call:", error);
              // Set status to error
              // Check if the error is from Vapi's SDK itself or an API error within the try block
              if (error instanceof Error) { // Check if it's a standard Error object
                  setCallError(error.message || 'Failed to initiate call.');
                  toast.error(`Failed to initiate call: ${error.message || 'Unknown error'}`);
              } else { // Handle potential non-Error rejections
                   setCallError('Failed to initiate call.');
                   toast.error('Failed to initiate call.');
              }
             setCallStatus('error'); // Set status to error
         } finally {
             // isSavingWorkflow or a call initiating state managed locally if needed
         }
     }, [agentId, phoneNumber, userName, callStatus, agent, toast]); // Dependencies include agent prop and state/handlers


    // --- Chat Test Handler (Keep as placeholder, not Vapi voice interaction) ---
     const handleSendChatMessage = (e) => {
         e.preventDefault();
         if (chatInput.trim()) {
             const newMessage = { id: Date.now(), text: chatInput, sender: 'user' };
             setChatMessages([...chatMessages, newMessage]);
             setChatInput('');
             // Implement logic to send message to agent and receive response
              console.log(`Simulating sending chat message "${chatInput}" to agent ${agentId}`);
              // Add a placeholder AI response after a short delay
              setTimeout(() => {
                  setChatMessages(prevMessages => [
                      ...prevMessages,
                      { id: Date.now() + 1, text: "Hello! How can I help you today?", sender: 'agent' } // Placeholder response
                  ]);
              }, 500);
         }
     };


    // Render nothing if not open or if agent is null (layout should prevent this, but safeguard)
    if (!isOpen || !agent) return null;

    // Determine button text based on call status
    const callButtonText = callStatus === 'connected' ? 'End Call' : (callStatus === 'connecting' ? 'Connecting...' : 'Call Me');
    // Disable button if connecting, fields empty, no agent ID, Vapi key missing, or Vapi not initialized
    const isCallButtonDisabled = callStatus === 'connecting'  || !userName || !agentId || !VAPI_PUBLIC_API_KEY || !vapiRef.current;


    return (
         // Backdrop Overlay
        <div className="fixed inset-0 z-50 flex justify-end " onClick={onClose}>
            {/* The actual panel */}
            <div
                ref={panelRef}
                className={`flex flex-col h-full ${panelWidth} ${uiColors.bgPrimary} shadow-xl transition-transform ease-in-out duration-300`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}>
                     <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Test Agent: {agentName}</h3> {/* Show agent name */}
                     {/* Show Vapi status if not idle */}
                      {callStatus !== 'idle' && (
                          <span className={`text-xs font-medium ml-2 px-2 py-1 rounded-full ${
                              callStatus === 'connected' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                              callStatus === 'connecting' ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` :
                              callStatus === 'ended' ? `${uiColors.textSecondary}` : // Use secondary for ended status
                              callStatus === 'error' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                               `${uiColors.textSecondary}` // Default
                          }`}>
                             {callStatus.charAt(0).toUpperCase() + callStatus.slice(1)} {/* Capitalize status */}
                             {callStatus === 'connecting' && <FiLoader className="inline-block ml-1 w-3 h-3 animate-spin" />}
                          </span>
                      )}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close" disabled={callStatus === 'connecting'}> {/* Disable close while connecting */}
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Method Selection */}
                 {/* Disable method selection while call is active */}
                <div className={`flex border-b ${uiColors.borderPrimary} ${callStatus !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <button
                         className={`flex-1 text-center py-3 text-sm font-medium transition-colors ${
                             testMethod === 'voice'
                                 ? `${uiColors.accentPrimaryGradient} text-white`
                                 : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                         }`}
                         onClick={() => setTestMethod('voice')}
                         disabled={callStatus !== 'idle'} // Ensure disabled when call is active
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
                         disabled={callStatus !== 'idle'} // Ensure disabled when call is active
                    >
                        <FiMessageCircle className="inline-block mr-1 w-4 h-4" /> Chat
                    </button>
                </div>

                {/* Content based on method */}
                 {/* Apply disabled styles to content area while call is active */}
                <div className={`flex-grow overflow-y-auto p-4 hide-scrollbar ${callStatus !== 'idle' ? 'opacity-50' : ''}`}>
                    {!testMethod && (
                        <div className={`text-center ${uiColors.textSecondary} pt-8`}>
                            Select a method to test your agent.
                             {!VAPI_PUBLIC_API_KEY && (
                                 <p className={`mt-4 p-3 rounded-md ${uiColors.alertWarningBg} ${uiColors.alertWarningText} text-sm inline-block`}>
                                     <FiAlertTriangle className="inline-block mr-2 w-4 h-4" /> Vapi API Key not configured. Voice testing unavailable.
                                 </p>
                             )}
                        </div>
                    )}

                    {/* Voice Test Form */}
                    {testMethod === 'voice' && (
                         // Disable voice form inputs/buttons while call is active
                        <div className={`flex flex-col space-y-4 ${callStatus !== 'idle' ? 'pointer-events-none' : ''}`}>
                             {!VAPI_PUBLIC_API_KEY && (
                                 <div className={`p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                                     <FiAlertTriangle className="inline-block mr-2 w-4 h-4" /> Vapi API Key not configured. Voice testing disabled.
                                 </div>
                             )}
                             {callError && callStatus === 'error' && ( // Display specific Vapi call error if status is 'error'
                                  <div className={`p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                                      <FiAlertTriangle className="inline-block mr-2 w-4 h-4" /> Call Error: {callError}
                                  </div>
                             )}

                            <div>
                                <label htmlFor="userName" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>
                                    Your Name
                                </label>
                                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                     <FiUser className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                                     <input
                                        type="text"
                                        id="userName"
                                        value={userName}
                                        onChange={(e) => setUserName(e.target.value)}
                                        disabled={callStatus !== 'idle' || !VAPI_PUBLIC_API_KEY} // Disable input while call active or no Vapi key
                                        className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="Enter your name"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>
                                    Phone Number
                                </label>
                                 <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                    <FiPhone className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                         disabled={callStatus !== 'idle' || !VAPI_PUBLIC_API_KEY} // Disable input while call active or no Vapi key
                                        className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                                        placeholder="e.g., +14155552671"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCallMe} // This now handles Start/Stop
                                disabled={isCallButtonDisabled} // Use the disabled state
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm ${isCallButtonDisabled ? 'opacity-50 cursor-not-allowed' : (callStatus === 'connected' ? uiColors.alertDangerButtonBg : uiColors.accentPrimaryGradient) // Use danger color for End Call
                                } ${callStatus === 'connected' ? uiColors.alertDangerButtonText : 'text-white'}`}
                            >
                                 {/* Show loader inside button if connecting */}
                                {callStatus === 'connecting' && <FiLoader className="inline-block mr-2 w-4 h-4 animate-spin" />}
                                {callButtonText} {/* Use dynamic button text */}
                            </button>
                        </div>
                    )}

                    {/* Chat Test UI (Placeholder - Not integrated with Vapi voice) */}
                    {testMethod === 'chat' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-grow overflow-y-auto space-y-3 pb-4">
                                {chatMessages.length === 0 ? (
                                    <div className={`text-center text-sm ${uiColors.textSecondary}`}>
                                        Start a chat... (This is a simulated chat, not Vapi voice.)
                                    </div>
                                ) : (
                                     chatMessages.map((msg, index) => ( // Add index for key if no other unique ID
                                         <div
                                             key={msg.id || index} // Use msg.id if available, fallback to index
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
                            <form onSubmit={handleSendChatMessage} className={`flex items-center pt-4 border-t ${uiColors.borderPrimary}`}>
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