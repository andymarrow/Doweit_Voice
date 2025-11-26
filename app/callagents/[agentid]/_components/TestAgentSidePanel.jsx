"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiPhone, FiMessageCircle, FiUser, FiSend, FiVolume2, FiLoader, FiAlertTriangle, FiGlobe, FiMic, FiSquare } from 'react-icons/fi';
import Vapi from '@vapi-ai/web';
import { GoogleGenAI, Modality } from '@google/genai'; // Import Gemini SDK
import { uiColors } from '../../_constants/uiConstants';
import { toast } from 'react-hot-toast';
import { convertToWav } from './audioUtils'; // Helper for audio stitching
import { uploadFileToFirebase } from '@/lib/firebase/upload'; // Helper for uploading stitched audio

// --- VAPI SDK Initialization ---
const VAPI_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// --- Helper Functions ---
const getElevenLabsKeyForUser = async () => {
    // THIS IS NOT SECURE FOR PRODUCTION. Replace with a backend call.
    return process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
};

// --- Securely Fetch Google Key ---
const getGoogleKey = async () => {
    try {
        const res = await fetch('/api/integrations/google/key');
        if (!res.ok) throw new Error('Failed to fetch Google Key');
        const data = await res.json();
        return data.apiKey;
    } catch (e) {
        console.error(e);
        return null;
    }
};

// --- AUDIO HELPERS FOR GEMINI INPUT ---
const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

// --- Component Definition ---
const panelWidth = 'w-96'; // Slightly wider for chat/gemini controls

function TestAgentSidePanel({ isOpen, onClose, agent }) {
    // --- State Management ---
    const [testMethod, setTestMethod] = useState('web');
    
    // Form Inputs
    const [userName, setUserName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Call Status (shared by both Web and Phone)
    const [isConnecting, setIsConnecting] = useState(false); // Used for phone call loading state
    const [callStatus, setCallStatus] = useState('idle');    // Status for calls
    const [callError, setCallError] = useState(null);
    
    // VAPI State
    const [transcriptBuffer, setTranscriptBuffer] = useState([]);
    const [callStartTime, setCallStartTime] = useState(null);
    const [vapiCallData, setVapiCallData] = useState({});
    const [elevenLabsApiKey, setElevenLabsApiKey] = useState(null);

    // GEMINI State
    const [geminiApiKey, setGeminiApiKey] = useState(null);
    const [geminiTranscript, setGeminiTranscript] = useState([]); // For Gemini Chat UI
    const [geminiAudioChunks, setGeminiAudioChunks] = useState([]); // For Recording
    const [textInput, setTextInput] = useState(''); // For Gemini Chat Input

    // Refs
    const panelRef = useRef(null);
    const vapiRef = useRef(null);
    const geminiSessionRef = useRef(null); // Ref for Gemini Session
    const currentGeminiTurnAudioRef = useRef([]); // Audio for current turn playback
    
    // Audio Input Refs (Microphone)
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);

    const agentId = agent?.id;
    const agentName = agent?.name || 'Unnamed Agent';
    
    // Determine if this agent is configured for Google Native
    const isGoogleNative = agent?.voiceConfig?.voiceProvider === 'google';

    // --- Effects ---

    // Initialize Vapi SDK and event listeners for Web Calls
    useEffect(() => {
        // Only init Vapi if NOT using Google Native (or keep it for fallback)
        if (!vapiRef.current && VAPI_PUBLIC_API_KEY && !isGoogleNative) {
            const vapi = new Vapi(VAPI_PUBLIC_API_KEY);
            vapiRef.current = vapi;
            console.log("Vapi SDK initialized for web calls.");

            let localCallStartTime = null;
            
            // --- Event Listeners ---
            vapi.on("call-start", (status) => {
                console.log("Vapi call start update", status)
            });

            vapi.on("call-end", (status) => {
                console.log("Vapi call end update", status)
            });

            vapi.on("message", (message) => {
                console.log(message)
                if (message.type === 'status-update') {
                    console.log("Vapi Status Update:", message.status);
                    setCallStatus(message.status);

                    if (message.status === 'in-progress' && localCallStartTime === null ) {
                        localCallStartTime = new Date().toISOString()
                        setCallStartTime(new Date().toISOString())
                        setTranscriptBuffer([])
                    }

                    if (message.status === 'ended') {
                            toast.success("Web call ended.");
                    }
                }
                if (message.type === "transcript" && message.transcriptType === "final") {
                    setTranscriptBuffer(prev => [...prev, {
                        role: message.role,
                        message: message.transcript,
                        time: message.time,
                    }])
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
    }, [agentId, userName, isGoogleNative]);

    // Reset state and fetch keys when panel opens or agent changes
    useEffect(() => {
        if (isOpen) {
            setUserName('');
            setPhoneNumber('');
            setCallError(null);
            setIsConnecting(false);
            setCallStatus('idle');
            setGeminiTranscript([]);
            setGeminiAudioChunks([]);

            const fetchKeys = async () => {
                // If Google Native, fetch Google Key
                if (isGoogleNative) {
                    const key = await getGoogleKey();
                    if (!key) setCallError("Google API Key missing on server.");
                    setGeminiApiKey(key);
                    // Google Native doesn't support phone/PSTN yet in this context
                    if (testMethod === 'phone') setTestMethod('web'); 
                } else {
                    // Existing Logic for Vapi/11Labs
                    if (agent?.voiceConfig?.voiceProvider === 'elevenlabs') {
                        const key = await getElevenLabsKeyForUser();
                        if (!key) {
                            toast.error("ElevenLabs API key not found.");
                            setCallError("ElevenLabs API key is missing.");
                        }
                        setElevenLabsApiKey(key);
                    }
                }
            };
            fetchKeys();
        } else {
            // Stop Vapi
            if (vapiRef.current && callStatus !== 'idle') {
                try { vapiRef.current.stop(); } catch (e) {}
            }
            // Stop Gemini & Mic
            stopGeminiSession(); 
        }
    }, [isOpen, agentId, isGoogleNative]);

    // Handle clicks outside panel
    useEffect(() => {
        const handleClickOutside = (event) => {
            const isCallActive = isConnecting || callStatus === 'connecting' || callStatus === 'in-progress';
            if (panelRef.current && !panelRef.current.contains(event.target) && isOpen && !isCallActive) onClose();
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose, isConnecting, callStatus]);

    // Save Data Effect (VAPI ONLY - Existing)
    useEffect(()=>{
        if (callStatus === "ended" && !isGoogleNative) {
            saveCallData(null);
        }
    },[callStatus, isGoogleNative])

    // ------------------------------------------------------------------
    // EXISTING VAPI CALL LOGIC (RESTORED EXACTLY AS REQUESTED)
    // ------------------------------------------------------------------
    const saveCallData = async () => {
        if (transcriptBuffer.length === 0 && !vapiCallData) return;

        console.log("Vapi call data received on end:", vapiCallData);

        const callDetails = {
            customerName: userName,
            direction: 'inbound',
            status: 'Completed', // Using 'Completed' to match table styles
            duration: callStartTime ? Math.floor((Date.now() - new Date(callStartTime).getTime()) / 1000) : 0,
            startTime: callStartTime || new Date().toISOString(),
            endTime: new Date().toISOString(),
            transcript: transcriptBuffer,
            // *** NEW: Capture callId and recordingUrl from the Vapi call object ***
            callId: vapiCallData?.id || null, 
            recordingUrl: vapiCallData?.recordingUrl || null,
        };

        try {
            const response = await fetch(`/api/callagents/${agentId}/calls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(callDetails),
            });
            if (!response.ok) throw new Error(await response.text());
            console.log("Web call data (transcript & recording) saved successfully.");
            toast.success("Test call transcript saved.");
        } catch (err) {
            console.error("Error saving web call data:", err);
            toast.error("Could not save call data.");
        }
    };

    // Web Call Handler (Client-side) - VAPI ONLY
    const handleStartWebCall = useCallback(async () => {
        // If google native, delegate to new function
        if (isGoogleNative) {
            handleStartGeminiSession();
            return;
        }

        if (!vapiRef.current || !agentId || !userName) {
            toast.error("Please enter your name to start a web call.");
            return;
        }
        if (callStatus === 'in-progress' || callStatus === 'connecting') {
            vapiRef.current.stop();
            return;
        }
        setCallStatus('connecting');
        setCallError(null);

        try {
            
let everyContentPrompt = `
You are an AI assistant named ${agent?.name || 'Assistant'}.
${agent?.prompt ? `Your core instructions and persona details are: ${agent.prompt}` : 'Your purpose is to assist the user.'}
${agent?.voiceConfig?.language ? `Maintain conversations in the ${agent.voiceConfig.language} language.` : 'Use the default language of the call (likely English).'}
${agent?.greetingMessage ? `If you are the first speaker, you may choose to start the conversation with "${agent.greetingMessage}".` : ''}
${Array.isArray(agent?.customVocabulary) && agent.customVocabulary.length > 0 ? `Incorporate the following specific terms or phrases naturally where relevant: ${agent.customVocabulary.map(item => item.term).join(', ')}.` : ''}
Speak naturally as if in a real voice call. Be concise and directly address the user's needs or questions based on your instructions.
`.trim();

// Attach Knowledge Base (if available)
if (agent.knowledgeBase && agent.knowledgeBase.content) {
  const kbContent = Array.isArray(agent.knowledgeBase.content)
    ? agent.knowledgeBase.content.map(item => item.value).join('\n\n')
    : String(agent.knowledgeBase.content);

  if (kbContent.trim()) {
    everyContentPrompt += `

--- KNOWLEDGE BASE ---
You MUST use the information below to answer user questions. This is your primary source of truth.

${kbContent}
--- END KNOWLEDGE BASE ---`;
  }
}

// Cleanup whitespace
everyContentPrompt = everyContentPrompt.replace(/\s+/g, ' ').trim();

            // --- VAPI PAYLOAD (YOUR EXACT VERSION) ---
            const vapiPayload = {
                model: { 
                    provider: "google",
				    model: "gemini-2.5-flash", 
                    messages: [{ role: "system", content: everyContentPrompt }] },
                voice: { provider: '', voiceId: agent.voiceConfig.voiceId },
                firstMessage: agent.greetingMessage || "Hello!",
                recordingEnabled: agent.callConfig?.enableRecordings || false,
                server: {
                    url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
                }
            };

            if (agent.voiceConfig.voiceProvider === 'elevenlabs') {
                if (!elevenLabsApiKey) throw new Error("ElevenLabs API key is missing.");
                vapiPayload.voice.provider = '11labs';
                // vapiPayload.voice.elevenLabsApiKey = elevenLabsApiKey;
            } else {
                vapiPayload.voice.provider = agent.voiceConfig.voiceProvider || 'vapi';
            }
            vapiRef.current.start(vapiPayload).then(call=> setVapiCallData(call));
        } catch (error) {
            setCallStatus('error');
            setCallError(error.message);
            toast.error(`Failed to start call: ${error.message}`);
        }
    }, [agent, userName, callStatus, elevenLabsApiKey, isGoogleNative]);

    // Phone Call Handler (Backend) - VAPI ONLY
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

    // ------------------------------------------------------------------
    // 3. GEMINI NATIVE LOGIC (UPDATED WITH AUDIO INPUT CAPTURE)
    // ------------------------------------------------------------------

    // A. START MICROPHONE
    const startAudioInput = async () => {
        try {
            // Request Mic
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000 } });
            mediaStreamRef.current = stream;

            // Create Context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            
            // Use ScriptProcessor (Buffer 4096) to capture raw audio
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!geminiSessionRef.current) return; // Don't send if session closed

                const inputData = e.inputBuffer.getChannelData(0); // Float32
                const pcm16 = floatTo16BitPCM(inputData); // Convert to Int16
                const base64Audio = arrayBufferToBase64(pcm16); // Convert to Base64

                // Send to Gemini
                geminiSessionRef.current.sendRealtimeInput([{
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio
                }]);
            };

            source.connect(processor);
            processor.connect(audioContext.destination); // Activate processor

        } catch (e) {
            console.error("Failed to capture audio:", e);
            setCallError("Microphone access failed: " + e.message);
            stopGeminiSession();
        }
    };

    // B. STOP MICROPHONE
    const stopAudioInput = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    // C. PROMPT BUILDER
    const buildGeminiSystemPrompt = () => {
        let prompt = `You are an AI assistant named ${agentName}.`;
        if (agent.prompt) prompt += `\nInstructions: ${agent.prompt}`;
        
        if (agent.voiceConfig?.language) {
            prompt += `\nIMPORTANT: You must speak ONLY in ${agent.voiceConfig.language}. Do not switch languages unless explicitly asked.`;
        }
        if (agent.greetingMessage) prompt += `\nStart conversation with: "${agent.greetingMessage}"`;

        if (agent.knowledgeBase && agent.knowledgeBase.content) {
             const kbContent = Array.isArray(agent.knowledgeBase.content)
                ? agent.knowledgeBase.content.map(i => i.value).join('\n')
                : String(agent.knowledgeBase.content);
             if (kbContent.trim()) {
                prompt += `\n\n[KNOWLEDGE BASE]\nUse this information to answer:\n${kbContent}\n[END KNOWLEDGE BASE]`;
             }
        }
        return prompt;
    };

    // D. START SESSION
    const handleStartGeminiSession = async () => {
        if (!geminiApiKey || !userName) return toast.error("Enter name.");
        if (isConnecting || callStatus === 'in-progress') return;

        setIsConnecting(true);
        setCallStatus('connecting');
        setGeminiTranscript([]);
        setGeminiAudioChunks([]); 
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const systemInstruction = buildGeminiSystemPrompt();

        try {
            const session = await ai.live.connect({
                model: 'models/gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO], 
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voiceConfig.voiceId } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setCallStatus('in-progress');
                        toast.success("Connected to Gemini Live.");
                        startAudioInput(); // <--- THIS STARTS THE MIC
                    },
                    onmessage: (msg) => handleGeminiMessage(msg),
                    onclose: () => {
                        setCallStatus('ended');
                        saveGeminiCallData(); 
                    },
                    onerror: (e) => {
                        console.error(e);
                        setCallStatus('error');
                        setCallError(e.message);
                        setIsConnecting(false);
                        stopAudioInput();
                    }
                }
            });
            geminiSessionRef.current = session;
        } catch (e) {
            setCallStatus('error');
            setCallError(e.message);
            setIsConnecting(false);
        }
    };

    // E. HANDLE INCOMING MESSAGES
    const handleGeminiMessage = (message) => {
        // 1. Text
        const part = message.serverContent?.modelTurn?.parts?.[0];
        if (part?.text) {
            setGeminiTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + part.text }];
                }
                return [...prev, { role: 'model', text: part.text, time: Date.now() }];
            });
        }

        // 2. Audio
        if (part?.inlineData) {
            const chunk = part.inlineData.data;
            currentGeminiTurnAudioRef.current.push(chunk);
            setGeminiAudioChunks(prev => [...prev, chunk]);
        }

        // 3. Turn Complete -> Play Audio
        if (message.serverContent?.turnComplete) {
            playGeminiAudioQueue(currentGeminiTurnAudioRef.current);
            currentGeminiTurnAudioRef.current = [];
        }
    };

    // F. PLAY AUDIO
    const playGeminiAudioQueue = async (chunks) => {
        if (!chunks.length) return;
        try {
            const wavBuffer = convertToWav(chunks, "audio/pcm;rate=24000");
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });
            const audio = new Audio(URL.createObjectURL(blob));
            audio.play();
        } catch(e) { console.error("Playback error", e); }
    };

    // G. SEND TEXT (CHAT)
    const handleSendGeminiText = () => {
        if (!geminiSessionRef.current) return;
        const text = textInput.trim();
        if (!text) return;

        setGeminiTranscript(prev => [...prev, { role: 'user', text, time: Date.now() }]);
        geminiSessionRef.current.sendClientContent({
            turns: [{ role: 'user', parts: [{ text }] }]
        });
        setTextInput('');
    };

    // H. STOP SESSION
    const stopGeminiSession = () => {
        stopAudioInput(); // Kill Mic
        if (geminiSessionRef.current) {
            geminiSessionRef.current.close();
            geminiSessionRef.current = null;
        }
    };

    // I. SAVE DATA
    const saveGeminiCallData = async () => {
        if (geminiAudioChunks.length === 0 && geminiTranscript.length === 0) return;

        let recordingUrl = null;
        
        if (geminiAudioChunks.length > 0) {
            const uploadToast = toast.loading("Saving call recording...");
            try {
                const wavBuffer = convertToWav(geminiAudioChunks, "audio/pcm;rate=24000");
                const blob = new Blob([wavBuffer], { type: 'audio/wav' });
                const file = new File([blob], `gemini-${Date.now()}.wav`, { type: 'audio/wav' });
                recordingUrl = await uploadFileToFirebase(file, `user-${agent?.creatorId || 'anon'}`, 'calls');
                toast.success("Recording saved.");
            } catch (e) {
                console.error("Upload failed", e);
                toast.error("Failed to save recording.");
            } finally {
                toast.dismiss(uploadToast);
            }
        }

        const payload = {
            customerName: userName,
            direction: 'inbound',
            status: 'Completed',
            duration: 0, 
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            transcript: geminiTranscript.map(t => ({ role: t.role, message: t.text })),
            callId: `gemini-${Date.now()}`,
            recordingUrl: recordingUrl
        };

        try {
            const res = await fetch(`/api/callagents/${agentId}/calls`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) toast.success("Call log saved.");
        } catch (e) { console.error(e); }
    };
    
    // ------------------------------------------------------------------
    // RENDER
    // ------------------------------------------------------------------

    if (!isOpen || !agent) return null;

    const webCallButtonText = callStatus === 'in-progress' ? 'End Web Call' : (callStatus === 'connecting' ? 'Connecting...' : 'Start Web Call');
    const isElevenLabsCallButNoKey = (agent?.voiceConfig?.voiceProvider === 'elevenlabs' && !elevenLabsApiKey);
    const isWebCallButtonDisabled = !userName || (!VAPI_PUBLIC_API_KEY && !isGoogleNative) || (isElevenLabsCallButNoKey && !isGoogleNative);
    const isPhoneCallButtonDisabled = isConnecting || !userName || !phoneNumber;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />
            <div ref={panelRef} className={`relative flex flex-col h-full ${panelWidth} ${uiColors.bgPrimary} shadow-xl`} onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}>
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>
                        {isGoogleNative ? <span className="flex items-center gap-2"><FiGlobe className="text-blue-500"/> Gemini Native</span> : `Test: ${agentName}`}
                    </h3>
                    <div className="flex items-center gap-2">
                         {callStatus !== 'idle' && (
                            <span className={`text-xs px-2 py-1 rounded-full ${callStatus === 'in-progress' ? 'bg-green-100 text-green-800' : 'bg-yellow-100'}`}>
                                {callStatus}
                            </span>
                        )}
                        <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}>
                            <FiX />
                        </button>
                    </div>
                </div>

                {/* Method Selection Tabs */}
                <div className={`flex border-b ${uiColors.borderPrimary}`}>
                    <button onClick={() => setTestMethod('web')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'web' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiGlobe /> Web</button>
                    {!isGoogleNative && (
                        <button onClick={() => setTestMethod('phone')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'phone' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiPhone /> Phone</button>
                    )}
                    <button onClick={() => setTestMethod('chat')} className={`flex-1 flex items-center justify-center gap-2 text-center py-3 text-sm font-medium transition-colors ${testMethod === 'chat' ? `border-b-2 ${uiColors.accentPrimary} border-cyan-500 dark:border-purple-500` : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`}`}><FiMessageCircle /> Chat</button>
                </div>

                {/* Content based on selected tab */}
                <div className="flex-grow overflow-y-auto p-4">
                    {callError && <div className={`p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm mb-4`}><FiAlertTriangle className="inline-block mr-2 w-4 h-4" />{callError}</div>}

                    {/* WEB CALL TAB */}
                    {testMethod === 'web' && (
                        <div className="flex flex-col space-y-4">
                            {(!VAPI_PUBLIC_API_KEY && !isGoogleNative) && <div className={`p-3 rounded-md ${uiColors.alertWarningBg} ${uiColors.alertWarningText} text-sm`}>VAPI Public Key not configured.</div>}
                            <div>
                                <label htmlFor="userNameWeb" className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Your Name</label>
                                <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                    <FiUser className={`w-4 h-4 text-gray-400 ml-3 mr-2`} />
                                    <input type="text" id="userNameWeb" value={userName} onChange={(e) => setUserName(e.target.value)} disabled={callStatus === 'in-progress' || callStatus === 'connecting'} className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none disabled:opacity-50`} placeholder="Enter your name" />
                                </div>
                            </div>
                            
                            {isGoogleNative ? (
                                // GEMINI BUTTONS
                                callStatus === 'in-progress' ? (
                                    <button onClick={stopGeminiSession} className="w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm text-white bg-red-600 hover:bg-red-700 flex justify-center items-center gap-2">
                                        <FiSquare fill="currentColor" /> Stop Session
                                    </button>
                                ) : (
                                    <button onClick={handleStartGeminiSession} disabled={isWebCallButtonDisabled} className={`w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm text-white ${isWebCallButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : uiColors.accentPrimaryGradient}`}>
                                        {callStatus === 'connecting' ? <FiLoader className="inline-block mr-2 w-4 h-4 animate-spin" /> : <FiMic className="inline-block mr-2" />}
                                        Start Gemini Live
                                    </button>
                                )
                            ) : (
                                // VAPI BUTTONS
                                <button onClick={handleStartWebCall} disabled={isWebCallButtonDisabled} className={`w-full px-4 py-2 rounded-md font-semibold transition-colors text-sm text-white ${isWebCallButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : (callStatus === 'in-progress' ? 'bg-red-600 hover:bg-red-700' : uiColors.accentPrimaryGradient)}`}>
                                    {callStatus === 'connecting' && <FiLoader className="inline-block mr-2 w-4 h-4 animate-spin" />}
                                    {webCallButtonText}
                                </button>
                            )}
                        </div>
                    )}

                    {/* PHONE CALL TAB */}
                    {testMethod === 'phone' && !isGoogleNative && (
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
                        isGoogleNative ? (
                            <div className="h-full flex flex-col h-[400px]">
                                <div className="flex-grow border rounded p-2 mb-2 bg-gray-50 overflow-y-auto text-sm space-y-2">
                                    {geminiTranscript.length === 0 && <span className="text-gray-400 flex justify-center mt-10">Start session to chat...</span>}
                                    {geminiTranscript.map((t, i) => (
                                        <div key={i} className={`p-2 rounded max-w-[85%] ${t.role === 'user' ? 'ml-auto bg-blue-100' : 'bg-white border'}`}>
                                            <div className="font-xs text-gray-500 capitalize text-[10px] mb-1">{t.role}</div>
                                            <div>{t.text || t.message}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        value={textInput} 
                                        onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSendGeminiText()}
                                        className="flex-grow p-2 border rounded text-sm"
                                        placeholder={callStatus === 'in-progress' ? "Type to Gemini..." : "Connect first..."}
                                        disabled={callStatus !== 'in-progress'}
                                    />
                                    <button onClick={handleSendGeminiText} disabled={callStatus !== 'in-progress'} className="p-2 bg-blue-600 text-white rounded disabled:bg-gray-300">
                                        <FiSend />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-sm text-gray-500 pt-8">Chat simulation will be available soon.</div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default TestAgentSidePanel;