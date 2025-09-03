// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/[agentid]/_components/TestAgentSidePanel.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiPhone, FiMessageCircle, FiUser, FiSend, FiVolume2, FiLoader, FiAlertTriangle, FiGlobe } from 'react-icons/fi';
import Vapi from '@vapi-ai/web';
import { uiColors } from '../../_constants/uiConstants';
import { toast } from 'react-hot-toast';

const VAPI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

const getElevenLabsKeyForUser = async () => {
    // THIS IS NOT SECURE FOR PRODUCTION. Replace with a backend call.
    return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
};

const panelWidth = 'w-80';

function TestAgentSidePanel({ isOpen, onClose, agent }) {
    // --- State Management ---
    const [testMethod, setTestMethod] = useState('web');
    const [userName, setUserName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Call Status for BOTH Web and Phone
    const [isConnecting, setIsConnecting] = useState(false); // Used for phone call loading state
    const [callStatus, setCallStatus] = useState('idle');    // Vapi SDK status for web calls
    const [callError, setCallError] = useState(null);
    
    const [elevenLabsApiKey, setElevenLabsApiKey] = useState(null);

    // Refs
    const panelRef = useRef(null);
    const vapiRef = useRef(null);

    const agentId = agent?.id;
    const agentName = agent?.name || 'Unnamed Agent';

    // --- Effects ---

    // Initialize Vapi SDK and event listeners for Web Calls
    useEffect(() => {
        if (!vapiRef.current && VAPI_PUBLIC_API_KEY) {
            const vapi = new Vapi(VAPI_PUBLIC_API_KEY);
            vapiRef.current = vapi;
            console.log("Vapi SDK initialized for web calls.");

            // --- Friend's Transcript Logic ---
            let transcriptBuffer = [];
            let callStartTime = null;

            const saveTranscript = async (customerName) => {
                if (transcriptBuffer.length === 0) return;
                
                const callDetails = {
                    // For web calls, we don't have a phone number, but can pass the name
                    customerName: customerName,
                    direction: 'inbound', // Web calls can be considered inbound tests
                    status: 'completed',
                    duration: callStartTime ? Math.floor((Date.now() - new Date(callStartTime).getTime()) / 1000) : 0,
                    startTime: callStartTime || new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    transcript: JSON.stringify(transcriptBuffer), // Send transcript as a JSON string
                };

                try {
                    const response = await fetch(`/api/callagents/${agentId}/calls`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(callDetails),
                    });
                    if (!response.ok) throw new Error(await response.text());
                    console.log("Web call transcript saved successfully.");
                    toast.success("Test call transcript saved.");
                } catch (err) {
                    console.error("Error saving web call transcript:", err);
                    toast.error("Could not save transcript.");
                }
            };

            // Vapi Event Listeners from Friend
            vapi.on("call-status", (status) => {
                console.log("Vapi Call Status:", status);
                setCallStatus(status);
                if (status === 'connected') {
                    callStartTime = new Date().toISOString();
                    transcriptBuffer = []; // Clear buffer for new call
                }
                if (status === 'ended') {
                    toast.success("Web call ended.");
                    saveTranscript(userName); // Pass the user's name to be saved
                }
            });

            vapi.on("message", (message) => {
                if (message.type === "transcript" && message.transcriptType === "final") {
                    transcriptBuffer.push({
                        role: message.role,
                        text: message.transcript,
                        timestamp: Date.now(),
                    });
                }
            });

            vapi.on("error", (error) => {
                console.error("Vapi Web SDK Error:", error);
                const errorMessage = error?.error?.message?.[0] || error.message || 'An unknown Vapi error occurred.';
                setCallStatus('error');
                setCallError(errorMessage);
                toast.error(`Web Call Error: ${errorMessage}`);
            });
        }
    }, [agentId, userName]); // Add agentId and userName as deps to ensure saveTranscript has the latest values

    // Reset state and fetch keys when panel opens or agent changes
    useEffect(() => {
        if (isOpen) {
            setUserName('');
            setPhoneNumber('');
            setCallError(null);
            setIsConnecting(false);
            setCallStatus('idle');

            const fetchKeys = async () => {
                if (agent?.voiceConfig?.voiceProvider === 'elevenlabs') {
                    const key = await getElevenLabsKeyForUser();
                    if (!key) {
                        toast.error("ElevenLabs API key not found.");
                        setCallError("ElevenLabs API key is missing.");
                    }
                    setElevenLabsApiKey(key);
                }
            };
            fetchKeys();
        } else {
            if (vapiRef.current && callStatus !== 'idle') {
                try { vapiRef.current.stop(); } catch (e) {}
            }
        }
    }, [isOpen, agent]);

    // Handle clicks outside panel
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isCallActive = isConnecting || callStatus === 'connecting' || callStatus === 'connected';
            if (panelRef.current && !panelRef.current.contains(event.target) && isOpen && !isCallActive) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose, isConnecting, callStatus]);

    // --- Call Handlers ---

    // Web Call Handler (Client-side)
    const handleStartWebCall = useCallback(async () => {
        if (!vapiRef.current || !agentId || !userName) {
            toast.error("Please enter your name to start a web call.");
            return;
        }
        if (callStatus === 'connected' || callStatus === 'connecting') {
            vapiRef.current.stop();
            return;
        }
        setCallStatus('connecting');
        setCallError(null);

        try {
            // Friend's detailed prompt logic
            let everyContentPrompt = `${agent.prompt || "You are a helpful assistant."}`;
            if (agent.knowledgeBase?.content) {
                const kbContent = Array.isArray(agent.knowledgeBase.content) ? agent.knowledgeBase.content.map(item => item.value).join('\n\n') : String(agent.knowledgeBase.content);
                if (kbContent.trim()) everyContentPrompt += `\n\n--- KNOWLEDGE BASE ---\n${kbContent}\n--- END KNOWLEDGE BASE ---`;
            }

            const vapiPayload = {
                model: {
                    provider: "google",
                    model: "gemini-1.5-flash",
                    messages: [{ role: "system", content: everyContentPrompt }],
                },
                voice: { provider: '', voiceId: agent.voiceConfig.voiceId },
                firstMessage: agent.greetingMessage || "Hello!",
            };

            if (agent.voiceConfig.voiceProvider === 'elevenlabs') {
                if (!elevenLabsApiKey) throw new Error("ElevenLabs API key is missing.");
                vapiPayload.voice.provider = '11labs';
                vapiPayload.voice.elevenLabsApiKey = elevenLabsApiKey;
            } else {
                vapiPayload.voice.provider = agent.voiceConfig.voiceProvider || 'vapi';
            }
            vapiRef.current.start(vapiPayload);
        } catch (error) {
            setCallStatus('error');
            setCallError(error.message);
            toast.error(`Failed to start call: ${error.message}`);
        }
    }, [agent, userName, callStatus, elevenLabsApiKey]);

    // Phone Call Handler (Backend)
    const handleStartPhoneCall = useCallback(async () => {
        if (!agentId || !userName || !phoneNumber) {
            toast.error("Please enter your name and phone number.");
            return;
        }
        setIsConnecting(true);
        setCallError(null);
        try {
            const response = await fetch(`/api/callagents/${agentId}/start-test-call`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumber, userName }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "An unknown error occurred.");
            toast.success("Call initiated! Your phone will ring shortly.");
        } catch (error) {
            setCallError(error.message);
            toast.error(`Error: ${error.message}`);
        } finally {
            setIsConnecting(false);
        }
    }, [agentId, userName, phoneNumber]);
    
    // --- Render Logic ---

    if (!isOpen || !agent) return null;

    const webCallButtonText = callStatus === 'connected' ? 'End Web Call' : (callStatus === 'connecting' ? 'Connecting...' : 'Start Web Call');
    const isElevenLabsCallButNoKey = (agent?.voiceConfig?.voiceProvider === 'elevenlabs' && !elevenLabsApiKey);
    const isWebCallButtonDisabled = callStatus === 'connecting' || !userName || !VAPI_PUBLIC_API_KEY || isElevenLabsCallButNoKey;
    const isPhoneCallButtonDisabled = isConnecting || !userName || !phoneNumber;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div ref={panelRef} className={`flex flex-col h-full ${panelWidth} ${uiColors.bgPrimary} shadow-xl`} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Test: {agentName}</h3>
                    {callStatus !== 'idle' && testMethod === 'web' && (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${callStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {callStatus.charAt(0).toUpperCase() + callStatus.slice(1)}
                            {callStatus === 'connecting' && <FiLoader className="inline-block ml-1 w-3 h-3 animate-spin" />}
                        </span>
                    )}
                    <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`} title="Close" disabled={isConnecting || callStatus === 'connecting' || callStatus === 'connected'}>
                        <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>
                </div>

                {/* Method Selection Tabs */}
                <div className={`flex border-b ${uiColors.borderPrimary}`}>
                    <button onClick={() => setTestMethod('web')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'web' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiGlobe /> Web</button>
                    <button onClick={() => setTestMethod('phone')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'phone' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiPhone /> Phone</button>
                    <button onClick={() => setTestMethod('chat')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'chat' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiMessageCircle /> Chat</button>
                </div>

                {/* Content based on selected tab */}
                <div className="flex-grow overflow-y-auto p-4">
                    {callError && <div className={`p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm mb-4`}><FiAlertTriangle className="inline-block mr-2 w-4 h-4" />{callError}</div>}

                    {/* WEB CALL TAB */}
                    {testMethod === 'web' && (
                        <div className="flex flex-col space-y-4">
                            {!VAPI_PUBLIC_API_KEY && <div className={`p-3 rounded-md ${uiColors.alertWarningBg} ${uiColors.alertWarningText} text-sm`}>VAPI Public Key not configured.</div>}
                            <div>
                                <label htmlFor="userNameWeb" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Your Name</label>
                                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                    <FiUser className={`w-4 h-4 text-gray-400 ml-3 mr-2`} />
                                    <input type="text" id="userNameWeb" value={userName} onChange={(e) => setUserName(e.target.value)} disabled={callStatus !== 'idle'} className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none disabled:opacity-50`} placeholder="Enter your name" />
                                </div>
                            </div>
                            <button onClick={handleStartWebCall} disabled={isWebCallButtonDisabled} className={`w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm text-white ${isWebCallButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : (callStatus === 'connected' ? 'bg-red-600 hover:bg-red-700' : uiColors.accentPrimaryGradient)}`}>
                                {callStatus === 'connecting' && <FiLoader className="inline-block mr-2 w-4 h-4 animate-spin" />}
                                {webCallButtonText}
                            </button>
                        </div>
                    )}

                    {/* PHONE CALL TAB */}
                    {testMethod === 'phone' && (
                        <div className="flex flex-col space-y-4">
                            <p className={`text-xs ${uiColors.textSecondary}`}>Our service will call you and connect you to the agent.</p>
                             <div>
                                <label htmlFor="userNamePhone" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Your Name</label>
                                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                    <FiUser className={`w-4 h-4 text-gray-400 ml-3 mr-2`} />
                                    <input type="text" id="userNamePhone" value={userName} onChange={(e) => setUserName(e.target.value)} disabled={isConnecting} className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none disabled:opacity-50`} placeholder="Enter your name" />
                                </div>
                             </div>
                             <div>
                                <label htmlFor="phoneNumber" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Phone Number</label>
                                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                    <FiPhone className={`w-4 h-4 text-gray-400 ml-3 mr-2`} />
                                    <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} disabled={isConnecting} className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none disabled:opacity-50`} placeholder="e.g., +251..." />
                                </div>
                             </div>
                             <button onClick={handleStartPhoneCall} disabled={isPhoneCallButtonDisabled} className={`w-full px-4 py-2 rounded-md font-semibold text-sm text-white ${isPhoneCallButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : uiColors.accentPrimaryGradient}`}>
                                {isConnecting ? <FiLoader className="inline-block mr-2 w-4 h-4 animate-spin" /> : 'Call Me'}
                             </button>
                        </div>
                    )}

                    {/* CHAT TAB */}
                    {testMethod === 'chat' && (
                        <div className="text-center text-sm text-gray-500 pt-8">Chat simulation will be available soon.</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestAgentSidePanel;