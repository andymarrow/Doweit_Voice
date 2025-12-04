// app/interview/[agentid]/page.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiVideo, FiCheckCircle, FiLoader, FiXCircle, FiCpu } from 'react-icons/fi';
import Image from 'next/image';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';

// Constants & Utilities
import { uiColors } from '@/app/callagents/_constants/uiConstants';
import { uploadFileToFirebase } from '@/lib/firebase/upload'; // You must have this helper

// --- MOCK AGENT FETCH (Replace with real API later) ---
const fetchPublicAgentData = async (agentId) => {
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    return {
        id: agentId,
        name: "Senior React Developer Interview",
        recruiterName: "Sarah Connor",
        avatarUrl: null, // Default
        voiceProvider: "vapi", // or 'google'
        voiceId: "uuid-voice-id",
        greetingMessage: "Hello! I'm here to assess your React skills. Could you start by introducing yourself?",
        recruitmentConfig: {
            antiCheatEnabled: true,
            durationLimit: 900 // 15 mins
        }
    };
};

// --- CONSTANTS ---
const SCREENSHOT_COUNT = 10;
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

export default function InterviewPage({ params }) {
    const { agentid } = params;
    
    // --- STATE ---
    const [step, setStep] = useState('loading'); // loading, welcome, interview, completed
    const [agent, setAgent] = useState(null);
    const [candidate, setCandidate] = useState({ name: '', email: '' });
    const [permStatus, setPermStatus] = useState({ mic: false, camera: false });
    
    // Interview State
    const [status, setStatus] = useState('idle'); // idle, connecting, active, ended
    const [transcripts, setTranscripts] = useState([]);
    const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
    
    // Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const vapiRef = useRef(null);
    const screenshotIntervals = useRef([]);

    // 1. Load Agent Data
    useEffect(() => {
        fetchPublicAgentData(agentid).then(data => {
            setAgent(data);
            setStep('welcome');
        }).catch(err => {
            toast.error("Interview invalid or expired.");
        });
    }, [agentid]);

    // 2. Cleanup on Unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (vapiRef.current) {
                vapiRef.current.stop();
            }
            screenshotIntervals.current.forEach(clearTimeout);
        };
    }, []);

    // --- HANDLERS ---

    const handlePermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            setPermStatus({ mic: true, camera: true });
            // Attach to video element if it exists (it won't exist until next step, so we do it in useEffect later)
        } catch (err) {
            console.error(err);
            toast.error("Microphone and Camera access is required.");
            setPermStatus({ mic: false, camera: false });
        }
    };

    const startInterview = async () => {
        if (!candidate.name || !candidate.email) return toast.error("Please fill in your details.");
        if (!permStatus.camera) return toast.error("Please allow camera access.");

        setStep('interview');
        setStatus('connecting');

        // Initialize Vapi
        if (!VAPI_PUBLIC_KEY) return toast.error("System Error: Voice Key Missing");
        
        const vapi = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        // Setup Listeners
        vapi.on('call-start', () => {
            setStatus('active');
            scheduleScreenshots(); // Start Anti-Cheat
        });
        
        vapi.on('speech-start', () => setIsAgentSpeaking(true));
        vapi.on('speech-end', () => setIsAgentSpeaking(false));
        
        vapi.on('message', (msg) => {
            if (msg.type === 'transcript' && msg.transcriptType === 'final') {
                setTranscripts(prev => [...prev, { 
                    role: msg.role === 'assistant' ? 'AI' : 'You', 
                    text: msg.transcript 
                }]);
            }
        });

        vapi.on('call-end', () => {
            setStatus('ended');
            setStep('completed');
        });

        // Start Call
        try {
            await vapi.start({
                model: {
                    provider: "google",
                    model: "gemini-2.5-flash",
                    messages: [
                        { role: "system", content: `You are an interviewer. Your name is ${agent.name}. Interview the candidate named ${candidate.name}.` }
                    ]
                },
                voice: {
                    provider: agent.voiceProvider,
                    voiceId: agent.voiceId,
                }
            });
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    const endInterview = () => {
        if (vapiRef.current) vapiRef.current.stop();
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setStep('completed');
    };

    // --- ANTI-CHEAT ENGINE ---
    const scheduleScreenshots = () => {
        if (!agent.recruitmentConfig.antiCheatEnabled) return;

        // Take 10 screenshots at random intervals within 15 minutes (or session duration)
        const durationMs = 1000 * 60 * 10; // Assume 10 min avg
        
        for (let i = 0; i < SCREENSHOT_COUNT; i++) {
            const randomDelay = Math.random() * durationMs;
            const timeoutId = setTimeout(() => captureAndUploadFrame(), randomDelay);
            screenshotIntervals.current.push(timeoutId);
        }
        
        // Take one immediately
        captureAndUploadFrame();
    };

    const captureAndUploadFrame = async () => {
        if (!videoRef.current || !candidate.email) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        
        canvas.toBlob(async (blob) => {
            if (!blob) return;
            // Name: interview_id/email/timestamp.jpg
            const fileName = `interviews/${agent.id}/${candidate.email}/${Date.now()}.jpg`;
            // NOTE: In a real app, use a client-side upload or signed URL. 
            // For now, assume uploadFileToFirebase handles this.
            // await uploadFileToFirebase(blob, fileName); 
            console.log(`[Anti-Cheat] Snapshot taken: ${fileName}`);
        }, 'image/jpeg', 0.7);
    };

    // --- RENDERERS ---

    if (step === 'loading') {
        return <div className="h-full flex items-center justify-center"><FiLoader className="w-10 h-10 animate-spin text-cyan-600" /></div>;
    }

    if (step === 'welcome') {
        return (
            <WelcomeView 
                agent={agent} 
                candidate={candidate} 
                setCandidate={setCandidate}
                handlePermissions={handlePermissions}
                permStatus={permStatus}
                onStart={startInterview}
            />
        );
    }

    if (step === 'interview') {
        return (
            <div className="flex flex-col h-full bg-gray-900 text-white p-4">
                {/* --- ROW 1: SPLIT SCREEN --- */}
                <div className="flex-1 flex gap-4 min-h-0 mb-4">
                    
                    {/* LEFT: AI AVATAR */}
                    <div className="flex-1 bg-gray-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-gray-700 shadow-2xl">
                        {/* Audio Wave Animation */}
                        <div className={`absolute inset-0 bg-gradient-to-t from-cyan-900/50 to-transparent transition-opacity duration-300 ${isAgentSpeaking ? 'opacity-100' : 'opacity-0'}`} />
                        
                        <div className={`relative w-40 h-40 rounded-full border-4 transition-all duration-300 ${isAgentSpeaking ? 'border-cyan-400 scale-110 shadow-[0_0_40px_rgba(34,211,238,0.5)]' : 'border-gray-600 scale-100'}`}>
                            {agent.avatarUrl ? (
                                <Image src={agent.avatarUrl} alt="AI" fill className="object-cover rounded-full" />
                            ) : (
                                <div className="w-full h-full bg-gray-700 rounded-full flex items-center justify-center">
                                    <FiCpu className="w-16 h-16 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div className="mt-6 text-xl font-medium tracking-wide">{agent.name}</div>
                        <div className={`mt-2 text-sm font-bold uppercase tracking-widest ${isAgentSpeaking ? 'text-cyan-400 animate-pulse' : 'text-gray-500'}`}>
                            {isAgentSpeaking ? 'Speaking...' : 'Listening'}
                        </div>
                    </div>

                    {/* RIGHT: USER CAMERA */}
                    <div className="flex-1 bg-black rounded-2xl relative overflow-hidden border border-gray-700 shadow-2xl">
                        <UserVideoFeed stream={streamRef.current} videoRef={videoRef} />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                            Live Camera
                        </div>
                    </div>
                </div>

                {/* --- ROW 2: TRANSCRIPT & CONTROLS --- */}
                <div className="h-48 flex gap-4">
                    {/* Transcripts */}
                    <div className="flex-1 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-6 overflow-y-auto">
                        <div className="space-y-3">
                            {transcripts.length === 0 && <span className="text-gray-500 italic">Waiting for conversation to start...</span>}
                            {transcripts.map((t, i) => (
                                <div key={i} className={`flex ${t.role === 'AI' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${t.role === 'AI' ? 'bg-gray-700 text-gray-200' : 'bg-cyan-900/50 text-cyan-100'}`}>
                                        <span className="block text-xs opacity-50 font-bold mb-1 uppercase">{t.role}</span>
                                        {t.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Controls Side */}
                    <div className="w-64 flex flex-col gap-3">
                        <div className="flex-1 bg-gray-800/50 rounded-2xl border border-gray-700 flex items-center justify-center flex-col p-4 text-center">
                            <span className="text-4xl font-mono font-bold text-gray-500">12:45</span>
                            <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Time Remaining</span>
                        </div>
                        <button 
                            onClick={endInterview}
                            className="h-16 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl transition-colors flex items-center justify-center text-lg uppercase tracking-wide shadow-lg"
                        >
                            End Interview
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'completed') {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Interview Completed</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        Thank you, {candidate.name}. We have received your submission. The AI analysis has started and the recruiter will be notified shortly.
                    </p>
                    <button className={`w-full py-3 rounded-xl font-semibold text-white ${uiColors.accentPrimaryGradient}`}>
                        Close Window
                    </button>
                </div>
            </div>
        );
    }
}

// --- SUB-COMPONENTS ---

function WelcomeView({ agent, candidate, setCandidate, handlePermissions, permStatus, onStart }) {
    return (
        <div className="max-w-4xl mx-auto pt-10 px-4 md:px-0">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Info Side */}
                <div>
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        {agent.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        You are about to start an automated AI interview managed by <strong>{agent.recruiterName}</strong>.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                            <FiVideo className="w-6 h-6 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-blue-700 dark:text-blue-300">Camera Required</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400">
                                    We capture random snapshots during the interview to verify your identity.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                            <FiMic className="w-6 h-6 text-purple-500 mt-1 mr-3 flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-purple-700 dark:text-purple-300">Clear Audio Needed</h4>
                                <p className="text-sm text-purple-600 dark:text-purple-400">
                                    Ensure you are in a quiet environment. The AI will speak and listen in real-time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Side */}
                <div className={`p-8 rounded-2xl shadow-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                    <h3 className={`text-xl font-bold mb-6 ${uiColors.textPrimary}`}>Candidate Details</h3>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Full Name</label>
                            <input 
                                type="text" 
                                value={candidate.name}
                                onChange={(e) => setCandidate({...candidate, name: e.target.value})}
                                className={`w-full p-3 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 ring-cyan-500/50 transition-all`}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Email Address</label>
                            <input 
                                type="email" 
                                value={candidate.email}
                                onChange={(e) => setCandidate({...candidate, email: e.target.value})}
                                className={`w-full p-3 rounded-lg border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 ring-cyan-500/50 transition-all`}
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {!permStatus.camera ? (
                            <button 
                                onClick={handlePermissions}
                                className={`w-full py-3 rounded-lg font-semibold border-2 border-dashed border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 transition-colors flex items-center justify-center`}
                            >
                                <FiVideo className="mr-2" /> Allow Camera & Mic
                            </button>
                        ) : (
                            <div className="flex items-center justify-center p-3 text-green-600 bg-green-50 dark:bg-green-900/20 rounded-lg font-medium">
                                <FiCheckCircle className="mr-2" /> Devices Ready
                            </div>
                        )}

                        <button 
                            onClick={onStart}
                            disabled={!permStatus.camera || !candidate.name}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-95
                                ${(!permStatus.camera || !candidate.name) ? 'bg-gray-400 cursor-not-allowed' : uiColors.accentPrimaryGradient}`}
                        >
                            Start Interview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function UserVideoFeed({ stream, videoRef }) {
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream, videoRef]);

    return (
        <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
    );
}