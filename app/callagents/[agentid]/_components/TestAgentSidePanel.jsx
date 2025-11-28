"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiX, FiPhone, FiMessageCircle, FiUser, FiSend, FiLoader, FiAlertTriangle, FiGlobe, FiMic, FiSquare } from 'react-icons/fi';
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
    
    // --- GEMINI REFS ---
    const geminiSessionRef = useRef(null); 
    const audioInputContextRef = useRef(null); 
    const audioOutputContextRef = useRef(null); 
    const mediaStreamRef = useRef(null);
    const processorRef = useRef(null);
    const nextPlayTimeRef = useRef(0); // Tracks when the next chunk should play

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
    // EXISTING VAPI CALL LOGIC
    // ------------------------------------------------------------------
    const saveCallData = async () => {
        if (transcriptBuffer.length === 0 && !vapiCallData) return;

        console.log("Vapi call data received on end:", vapiCallData);

        const callDetails = {
            customerName: userName,
            direction: 'inbound',
            status: 'Completed', 
            duration: callStartTime ? Math.floor((Date.now() - new Date(callStartTime).getTime()) / 1000) : 0,
            startTime: callStartTime || new Date().toISOString(),
            endTime: new Date().toISOString(),
            transcript: transcriptBuffer,
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
    // 3. GEMINI NATIVE LOGIC (UPDATED WITH FIXES)
    // ------------------------------------------------------------------

    // A. START MICROPHONE
    const startAudioInput = async () => {
        try {
            const audioContext = new window.AudioContext({ sampleRate: 16000 });
            audioInputContextRef.current = audioContext;

            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                } 
            });
            mediaStreamRef.current = stream;

            const source = audioContext.createMediaStreamSource(stream);
            
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                if (!geminiSessionRef.current) return; 

                const inputData = e.inputBuffer.getChannelData(0); // Float32 from Mic
                const pcm16 = floatTo16BitPCM(inputData); // Convert to Int16
                const base64Audio = arrayBufferToBase64(pcm16); // Convert to Base64

                geminiSessionRef.current.sendRealtimeInput({
                    audio: {
                        mimeType: "audio/pcm;rate=16000",
                        data: base64Audio
                    }
                });
            };

            source.connect(processor);
            processor.connect(audioContext.destination); 

        } catch (e) {
            console.error("Failed to capture audio:", e);
            setCallError("Microphone access failed: " + e.message);
            stopGeminiSession();
        }
    };

    // B. STOP MICROPHONE & PLAYBACK
    const stopAudioInput = () => {
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (audioInputContextRef.current) {
            audioInputContextRef.current.close();
            audioInputContextRef.current = null;
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioOutputContextRef.current) {
            audioOutputContextRef.current.close();
            audioOutputContextRef.current = null;
        }
        nextPlayTimeRef.current = 0;
    };

    // C. PLAY STREAMED AUDIO (FIXED BYTE ALIGNMENT)
    const playStreamedAudio = (base64Data) => {
        try {
            if (!audioOutputContextRef.current) {
                audioOutputContextRef.current = new window.AudioContext({ sampleRate: 24000 });
            }
            const ctx = audioOutputContextRef.current;

            const binaryString = window.atob(base64Data);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // CRITICAL FIX: Use slice to ensure proper byte alignment for Int16Array
            const int16Data = new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
            
            const float32Data = new Float32Array(int16Data.length);
            for (let i = 0; i < int16Data.length; i++) {
                float32Data[i] = int16Data[i] / 32768.0;
            }

            const buffer = ctx.createBuffer(1, float32Data.length, 24000);
            buffer.copyToChannel(float32Data, 0);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const currentTime = ctx.currentTime;
            const startTime = nextPlayTimeRef.current < currentTime ? currentTime : nextPlayTimeRef.current;
            
            source.start(startTime);
            nextPlayTimeRef.current = startTime + buffer.duration;

        } catch (e) {
            console.error("Playback error", e);
        }
    };

    // D. PROMPT BUILDER
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

    // E. START SESSION (UPDATED CONFIG)
    const handleStartGeminiSession = async () => {
        if (!geminiApiKey || !userName) return toast.error("Enter name.");
        if (isConnecting || callStatus === 'in-progress') return;

        setIsConnecting(true);
        setCallStatus('connecting');
        setGeminiTranscript([]);
        setGeminiAudioChunks([]); 
        nextPlayTimeRef.current = 0;
        
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        const systemInstructionText = buildGeminiSystemPrompt().replace(/\n/g, " ");

        try {
            const session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    // Set both Audio response AND Transcriptions enabled
                    responseModalities: [Modality.AUDIO], 
                    outputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
                    inputAudioTranscription: { model: "gemini-2.5-flash-native-audio-preview-09-2025" },
                    
                    systemInstruction: { parts: [{ text: systemInstructionText }] },
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: agent.voiceConfig.voiceId || "Kore" } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        setIsConnecting(false);
                        setCallStatus('in-progress');
                        toast.success("Connected to Doweit Live.");
                        startAudioInput(); 
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

    // F. HANDLE INCOMING MESSAGES (UPDATED PARSING)
    const handleGeminiMessage = (message) => {
        const serverContent = message.serverContent;

        // 1. Handle Interruption (VAD)
        if (serverContent?.interrupted) {
            console.log("Bot interrupted by user");
            // We can't clear the buffer of a running context easily, but we can reset the pointer logic
            if (audioOutputContextRef.current) {
                 nextPlayTimeRef.current = audioOutputContextRef.current.currentTime;
            }
            return; 
        }

        // 2. Audio Chunks
        const modelTurn = serverContent?.modelTurn;
        if (modelTurn?.parts) {
            for (const part of modelTurn.parts) {
                if (part.inlineData) {
                    const chunk = part.inlineData.data;
                    setGeminiAudioChunks(prev => [...prev, chunk]);
                    playStreamedAudio(chunk);
                }
            }
        }

        // 3. Model Text Transcription (Correct Location)
        if (serverContent?.outputTranscription?.text) {
            const text = serverContent.outputTranscription.text;
            setGeminiTranscript(prev => {
                const last = prev[prev.length - 1];
                if (last && last.role === 'model') {
                    return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                }
                return [...prev, { role: 'model', text: text, time: Date.now() }];
            });
        }

        // 4. User Input Transcription (Correct Location)
        if (serverContent?.inputTranscription?.text) {
            const text = serverContent.inputTranscription.text;
            setGeminiTranscript(prev => [...prev, { role: 'user', text: text, time: Date.now() }]);
        }
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
        stopAudioInput(); // Kills Mic & Speaker contextss
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
                // Stitch all chunks
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
                        {isGoogleNative ? <span className="flex items-center gap-2"><FiGlobe className="text-blue-500"/>Doweit Native</span> : `Test: ${agentName}`}
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
                                        Start Doweit Live
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
                                        placeholder={callStatus === 'in-progress' ? "Type to Doweit..." : "Connect first..."}
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
