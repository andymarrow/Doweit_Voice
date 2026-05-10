// app/interview/[agentid]/page.jsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiVideo, FiCheckCircle, FiLoader, FiCpu } from 'react-icons/fi';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Clock,
  Shield,
  Video,
  User,
  AlertCircle,
  Camera,
  Wifi,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  FileText,
  X,
  Mail,
  Phone,
  Globe,
  Briefcase,
  Upload,
  Link as LinkIcon,
  Linkedin,
  ShieldCheck,
  Send,
  MessageCircle
} from 'lucide-react';
import Image from 'next/image';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';
import { useVapiInterview } from '../../vapi';
import { useGeminiInterview } from '../../gemini';

// Constants & Utilities
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// --- CONSTANTS ---
const SCREENSHOT_COUNT = 10;
const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

// Function to check interview access based on dates
const checkInterviewAccess = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        if (today < start) {
            return 'not_open'; // Interview hasn't started yet
        } else if (today > end) {
            return 'closed'; // Interview has ended
        } else {
            return 'open'; // Interview is active
        }
    } else if (start) {
        start.setHours(0, 0, 0, 0);
        return today < start ? 'not_open' : 'open';
    } else {
        return 'open'; // Default to open if no dates set
    }
};

export default function InterviewPage({ params }) {
    const { interviewid, candidateid } = params;
    
    // Use the parameters directly from the URL structure
    const interviewLinkId = interviewid;
    const candidatePublicId = candidateid;
    
    // --- INTERVIEW HOOKS (both must be called unconditionally per Rules of Hooks) ---
    const vapiInterview = useVapiInterview();
    const geminiInterview = useGeminiInterview();

    // --- STATE ---
    const [step, setStep] = useState('loading'); // loading, welcome, intro, form, check, session, completed, complete, not_open, closed
    const [mode, setMode] = useState('live'); // demo or live
    const [accessStatus, setAccessStatus] = useState('loading'); // loading, open, not_open, closed
    const [interviewData, setInterviewData] = useState(null);
    const [candidateInfo, setCandidateInfo] = useState(null);
    const [permStatus, setPermStatus] = useState({ mic: false, camera: false });
    
    // Interview State - Only essential state for Vapi integration
    const [timeLeft, setTimeLeft] = useState(1800);
    const [showWarning, setShowWarning] = useState(false);
    const [checks, setChecks] = useState({
        microphone: 'pending',
        camera: 'pending',
        internet: 'pending',
        environment: 'pending'
    });
    const [micLevel, setMicLevel] = useState(0);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [chatInput, setChatInput] = useState('');

    // Route to the correct provider based on what the recruiter configured.
    // 'google' and 'gemini' both map to the Gemini Live hook; everything else uses Vapi.
    const isGoogleNative = interviewData?.voiceProvider === 'google' || interviewData?.voiceProvider === 'gemini';
    const activeInterview = isGoogleNative ? geminiInterview : vapiInterview;

    // Refs
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const vapiRef = useRef(null);
    const screenshotIntervals = useRef([]);

    // 1. Load Interview Data (REAL API)
    useEffect(() => {
        const fetchInterviewData = async () => {
            try {
                // Validate that we have both interview link and candidate ID
                if (!interviewLinkId || !candidatePublicId) {
                    throw new Error("Invalid interview link format");
                }

                const res = await fetch(`/api/interview/${interviewLinkId}?candidateId=${candidatePublicId}`);
                if (!res.ok) throw new Error("Interview not found or candidate not authorized");
                const data = await res.json();
                
                // Check access based on dates
                const access = checkInterviewAccess(data.position?.startDate, data.position?.endDate);
                setAccessStatus(access);
                
                // Set interview duration from position data
                if (data.position?.duration) {
                    setTimeLeft(data.position?.duration * 60); // Convert minutes to seconds
                }
                
                // Store interview data with position info
                setInterviewData({
                    ...data,
                    duration: data.position?.duration,
                    title: data.position?.title,
                    positionTitle: data.position?.title,
                    description: data.position?.description,
                    requirements: data.position?.requirements,
                    aiQuestions: data.position?.aiQuestions || [],
                    systemPrompt: data.position?.systemPrompt,
                    voiceProvider: data.position?.voiceProvider,
                    voiceId: data.position?.voiceId,
                    language: data.position?.language || 'English',
                    agentName: data.position?.agentName || 'Interview Assistant',
                    tone: data.position?.tone,
                    antiCheatEnabled: data.position?.antiCheatEnabled,
                    startDate: data.position?.startDate,
                    endDate: data.position?.endDate,
                });
                
                // Store candidate information
                setCandidateInfo({
                    id: data.candidate?.id,
                    candidateName: data.candidate?.candidateName,
                    candidateEmail: data.candidate?.candidateEmail,
                    candidatePhone: data.candidate?.candidatePhone,
                    experience: data.candidate?.experience,
                    country: data.candidate?.country,
                    portfolioUrl: data.candidate?.portfolioUrl,
                    linkedinUrl: data.candidate?.linkedinUrl,
                    resumeUrl: data.candidate?.resumeUrl
                });
                
                // Determine step based on access status and interview type
                if (access === 'not_open') {
                    setStep('not_open');
                } else if (access === 'closed') {
                    setStep('closed');
                } else if (data.type === 'magic_link') {
                    setStep('intro');
                } else {
                    setStep('welcome');
                }
            } catch (err) {
                console.error(err);
                setStep('error');
            }
        };
        
        fetchInterviewData();
    }, [interviewid, candidateid]);

    // 2. Interview session effects - Real Vapi integration
    useEffect(() => {
        if (step === 'session') {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
            }, 1000);

            // Show warning after 15 seconds for anti-cheat
            const warningTimer = setTimeout(() => {
                setShowWarning(true);
                setTimeout(() => setShowWarning(false), 5000);
            }, 15000);

            return () => {
                clearInterval(timer);
                clearTimeout(warningTimer);
            };
        }
    }, [step]);

    useEffect(() => {
        if (step === 'check') {
            runDeviceChecks();
        }
    }, [step]);

    // When entering the session step, re-bind the existing media stream to
    // videoRef so the hidden <video> element keeps frames flowing for the
    // anti-cheat canvas capture.
    useEffect(() => {
        if (step === 'session' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play?.().catch(() => {});
        }
    }, [step]);

    // 3. Cleanup on Unmount
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
        } catch (err) {
            console.error(err);
            toast.error("Microphone and Camera access is required.");
            setPermStatus({ mic: false, camera: false });
        }
    };

    // Real device testing functions
    const testCamera = async () => {
        setChecks(prev => ({ ...prev, camera: 'testing' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            
            // Test if we can get video tracks
            const videoTracks = stream.getVideoTracks();
            if (videoTracks.length > 0) {
                setChecks(prev => ({ ...prev, camera: 'success' }));
                return true;
            } else {
                setChecks(prev => ({ ...prev, camera: 'failed' }));
                return false;
            }
        } catch (error) {
            console.error('Camera test failed:', error);
            setChecks(prev => ({ ...prev, camera: 'failed' }));
            return false;
        }
    };

    const testMicrophone = async () => {
        setChecks(prev => ({ ...prev, microphone: 'testing' }));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Test audio levels
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            
            analyser.fftSize = 256;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const checkAudioLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setMicLevel(average);
                
                if (average > 10) {
                    setChecks(prev => ({ ...prev, microphone: 'success' }));
                    return true;
                }
                
                // Continue checking for a few seconds
                setTimeout(() => checkAudioLevel(), 100);
            };
            
            checkAudioLevel();
            
            // Store the stream for cleanup
            if (!streamRef.current) {
                streamRef.current = stream;
            }
            
            return true;
        } catch (error) {
            console.error('Microphone test failed:', error);
            setChecks(prev => ({ ...prev, microphone: 'failed' }));
            return false;
        }
    };

    const testInternet = async () => {
        setChecks(prev => ({ ...prev, internet: 'testing' }));
        try {
            // Test connectivity with a simple fetch
            const startTime = Date.now();
            const response = await fetch('/api/interview/test', { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            const endTime = Date.now();
            
            if (response.ok && (endTime - startTime) < 3000) {
                setChecks(prev => ({ ...prev, internet: 'success' }));
                return true;
            } else {
                setChecks(prev => ({ ...prev, internet: 'failed' }));
                return false;
            }
        } catch (error) {
            console.error('Internet test failed:', error);
            setChecks(prev => ({ ...prev, internet: 'failed' }));
            return false;
        }
    };

    const testEnvironment = async () => {
        setChecks(prev => ({ ...prev, environment: 'testing' }));
        try {
            // Check browser capabilities
            const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
            const hasWebGL = (() => {
                try {
                    const canvas = document.createElement('canvas');
                    return !!(window.WebGLRenderingContext && 
                        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
                } catch (e) {
                    return false;
                }
            })();
            
            // Check screen size
            const screenCheck = window.screen.width >= 1024 && window.screen.height >= 768;
            
            if (hasGetUserMedia && hasWebGL && screenCheck) {
                setChecks(prev => ({ ...prev, environment: 'success' }));
                return true;
            } else {
                setChecks(prev => ({ ...prev, environment: 'failed' }));
                return false;
            }
        } catch (error) {
            console.error('Environment test failed:', error);
            setChecks(prev => ({ ...prev, environment: 'failed' }));
            return false;
        }
    };

    const runDeviceChecks = async () => {
        // Reset all checks to pending
        setChecks({
            microphone: 'pending',
            camera: 'pending',
            internet: 'pending',
            environment: 'pending'
        });
        
        // Run tests in sequence
        await testInternet();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testEnvironment();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testCamera();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await testMicrophone();
    };

    const handleBackButton = () => {
        // Stop any active streams
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        
        // Clear video
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        
        // Reset checks
        setChecks({
            microphone: 'pending',
            camera: 'pending',
            internet: 'pending',
            environment: 'pending'
        });
        
        // Go back to intro
        setStep('intro');
    };

const handleRecheckButton = () => {
    runDeviceChecks();
};

const startInterview = async () => {
    if (!interviewData) return toast.error("Interview data not found.");
    if (!activeInterview.canStart) return toast.error("Interview system is not ready.");

    try {
        const success = await activeInterview.startInterview(interviewData, candidateInfo);

        if (success) {
            setStep('session');
            toast.success("Interview started successfully!");
            // Anti-cheat: schedule 10 photo captures spread across the
            // interview duration. captureAndUploadFrame reads from videoRef,
            // which a hidden <video> in the session UI keeps alive.
            scheduleScreenshots(candidatePublicId || candidateid);
        }
    } catch (error) {
        console.error('Failed to start interview:', error);
        toast.error("Could not start interview. Please try again.");
    }
};

const handleSendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    if (!activeInterview.supportsChat) {
        toast.error('Chat is only available with Gemini voices');
        return;
    }
    const ok = activeInterview.sendText(text);
    if (ok !== false) setChatInput('');
};

const endInterview = async () => {
    try {
        await activeInterview.stopInterview();

        if (activeInterview.transcript.length > 0) {
            const transcriptData = JSON.stringify(activeInterview.transcript);

            const response = await fetch('/api/interview/save-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId: candidateid,
                    interviewData: transcriptData
                })
            });

            if (response.ok) {
                console.log('Interview transcript saved successfully');
                toast.success('Interview completed successfully!');
            } else {
                console.error('Failed to save interview transcript');
                toast.error('Failed to save interview data');
            }
        }

        setStep('completed');

    } catch (error) {
        console.error('Error ending interview:', error);
        toast.error('Error ending interview');
    }
};

    // --- ANTI-CHEAT ENGINE ---
    // captureAndUploadFrame: grabs one JPEG from the live <video> element,
    // posts it to /api/interview/snapshot which forwards to UploadThing and
    // appends the URL to candidateApplications.snapshotUrls.
    const captureAndUploadFrame = async (candidateRef) => {
        const video = videoRef.current;
        if (!video || !candidateRef) return;
        if (!video.videoWidth || !video.videoHeight) {
            console.warn('[Anti-Cheat] video has no dimensions yet — skipping capture');
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob) return;

            const formData = new FormData();
            formData.append('image', blob, 'snapshot.jpg');
            formData.append('candidateId', String(candidateRef));

            try {
                const res = await fetch('/api/interview/snapshot', {
                    method: 'POST',
                    body: formData
                });
                if (res.ok) {
                    const data = await res.json().catch(() => ({}));
                    console.log(`[Anti-Cheat] Snapshot uploaded (${data.count || '?'}/${SCREENSHOT_COUNT})`);
                } else {
                    console.error('[Anti-Cheat] Snapshot upload failed:', res.status);
                }
            } catch (err) {
                console.error('Snapshot upload failed', err);
            }
        }, 'image/jpeg', 0.7);
    };

    // scheduleScreenshots: spreads SCREENSHOT_COUNT captures evenly (with a
    // small jitter) across the interview duration, plus one immediate capture.
    const scheduleScreenshots = (candidateRef) => {
        if (interviewData?.antiCheatEnabled === false) return;

        const durationMinutes = interviewData?.duration || 30;
        const durationMs = durationMinutes * 60 * 1000;

        // Clear any existing schedule.
        screenshotIntervals.current.forEach(clearTimeout);
        screenshotIntervals.current = [];

        const slot = durationMs / SCREENSHOT_COUNT;
        for (let i = 0; i < SCREENSHOT_COUNT; i++) {
            // Center each capture in its slot with up to ±25% jitter.
            const center = slot * (i + 0.5);
            const jitter = (Math.random() - 0.5) * slot * 0.5;
            const delay = Math.max(2000, center + jitter); // never sooner than 2s
            const id = setTimeout(() => captureAndUploadFrame(candidateRef), delay);
            screenshotIntervals.current.push(id);
        }

        // Initial capture once the video element has had a beat to bind.
        const firstId = setTimeout(() => captureAndUploadFrame(candidateRef), 3000);
        screenshotIntervals.current.push(firstId);

        console.log(`[Anti-Cheat] Scheduled ${SCREENSHOT_COUNT} snapshots over ${durationMinutes}m`);
    };

    // --- DEMO HANDLERS ---

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setStep('complete');
        }
    };

    const allSuccess = ['internet', 'camera', 'microphone'].every(key => checks[key] === 'success');

    // --- RENDERERS ---

    if (step === 'loading') {
        return <div className="h-full flex items-center justify-center"><FiLoader className="w-10 h-10 animate-spin text-cyan-600" /></div>;
    }

    // Invalid Interview Link Error
    if (step === 'error') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Interview Link</h2>
                    <p className="text-gray-600 mb-6">
                        Sorry you use wrong link check your email
                    </p>
                    <div className="bg-red-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-red-600">
                            Please check your email for the correct interview link and try again.
                        </p>
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    // Interview Not Open (today < start date)
    if (step === 'not_open') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Not Open Yet</h2>
                    <p className="text-gray-600 mb-6">
                        This interview is scheduled to start on{' '}
                        {interviewData?.startDate && (
                            <span className="font-semibold">
                                {new Date(interviewData.startDate).toLocaleDateString()}
                            </span>
                        )}
                        . Please come back on the start date to begin your interview.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Interview:</span> {interviewData?.title || 'Loading...'}
                        </p>
                        {interviewData?.startDate && (
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">Start Date:</span> {new Date(interviewData.startDate).toLocaleDateString()}
                            </p>
                        )}
                        {interviewData?.endDate && (
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">End Date:</span> {new Date(interviewData.endDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    // Interview Closed (today > end date)
    if (step === 'closed') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview Closed</h2>
                    <p className="text-gray-600 mb-6">
                        This interview ended on{' '}
                        {interviewData?.endDate && (
                            <span className="font-semibold">
                                {new Date(interviewData.endDate).toLocaleDateString()}
                            </span>
                        )}
                        . The interview period is now over.
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold">Interview:</span> {interviewData?.title || 'Loading...'}
                        </p>
                        {interviewData?.startDate && (
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">Start Date:</span> {new Date(interviewData.startDate).toLocaleDateString()}
                            </p>
                        )}
                        {interviewData?.endDate && (
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold">End Date:</span> {new Date(interviewData.endDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => window.close()}
                        className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    // Mode Selection
    if (step === 'mode-selection') {
        return (
            <div className="bg-gray-50 py-8 px-4 overflow-y-auto">
                <div className="max-w-2xl w-full">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-8">
                            <h1 className="text-2xl font-bold tracking-tight mb-6">Select Interview Mode</h1>
                            <div className="space-y-4">
                                <button
                                    onClick={() => { setMode('production'); setStep('loading'); }}
                                    className="w-full p-6 bg-blue-50 border border-blue-200 rounded-2xl hover:bg-blue-100 transition-all text-left">
                                    <h3 className="font-bold text-blue-900 mb-2">Production Mode</h3>
                                    <p className="text-blue-700 text-sm">Real AI interview with Vapi integration and live transcription</p>
                                </button>
                                <button
                                    onClick={() => { setMode('demo'); setStep('intro'); }}
                                    className="w-full p-6 bg-emerald-50 border border-emerald-200 rounded-2xl hover:bg-emerald-100 transition-all text-left">
                                    <h3 className="font-bold text-emerald-900 mb-2">Demo Mode</h3>
                                    <p className="text-emerald-700 text-sm">Mock interview with simulated AI responses for testing</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Demo Interview Introduction
    if (step === 'intro') {
        return (
            <div className="bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl">
                        <div className="bg-black p-8 text-white text-center">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="text-white" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight">{interviewData?.title || 'Loading...'}</h1>
                            <p className="text-gray-400 mt-1">Welcome, {candidateInfo?.candidateName || 'Candidate'} · {interviewData?.position?.department || 'Technology'} · AI Voice Interview</p>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                                <p className="text-sm text-blue-800 font-medium">
                                    <strong>Important:</strong> Please complete your candidate registration first before proceeding with the interview. 
                                    If you haven't registered yet, please visit the registration link provided to you.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Clock size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                                    </div>
                                    <p className="font-bold">{interviewData?.duration || 30} minutes</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <Video size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Format</span>
                                    </div>
                                    <p className="font-bold">AI Voice Agent</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    Required Permissions
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                        <Mic size={18} />
                                        <span className="text-sm font-bold">Microphone Access</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                        <Camera size={18} />
                                        <span className="text-sm font-bold">Camera Access</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900">Important Instructions</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: Wifi, text: 'Ensure a stable internet connection throughout the session.' },
                                        { icon: Volume2, text: 'Find a quiet environment with minimal background noise.' },
                                        { icon: Camera, text: 'Keep your camera enabled for anti-cheat monitoring.' },
                                        { icon: AlertCircle, text: 'Do not switch browser tabs or minimize the window.' }
                                    ].map((item, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1 bg-gray-100 rounded-lg text-gray-500">
                                                <item.icon size={14} />
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    onClick={() => setStep('check')}
                                    className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                                    Continue to Device Check <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="text-center text-gray-400 text-xs mt-6">
                        Powered by <span className="font-bold text-gray-600">RecruitAI</span> · Secure & Private
                    </p>
                </div>
            </div>
        );
    }

    
    // Demo Device Check
    if (step === 'check') {
        return (
            <div className="bg-gray-50 py-8 px-4">
                <div className="max-w-2xl mx-auto w-full">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-8">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold tracking-tight">Device & Environment Check</h1>
                                <p className="text-gray-500 text-sm mt-1">Let's make sure your setup is ready for the AI interview.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-800">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover transform scale-x-[-1]"
                                        />
                                        {checks.camera === 'testing' && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Camera size={48} className="text-white animate-pulse mb-3" />
                                                    <p className="text-white text-sm font-bold">Initializing Camera...</p>
                                                </div>
                                            </div>
                                        )}
                                        {checks.camera === 'failed' && (
                                            <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <X size={48} className="text-red-500 mb-3" />
                                                    <p className="text-red-500 text-sm font-bold">Camera Access Failed</p>
                                                    <p className="text-red-400 text-xs mt-1">Please check camera permissions</p>
                                                </div>
                                            </div>
                                        )}
                                        {checks.camera === 'pending' && (
                                            <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
                                                <div className="text-center">
                                                    <Camera size={48} className="text-gray-400 mb-3" />
                                                    <p className="text-gray-400 text-sm font-bold">Camera Test Pending</p>
                                                </div>
                                            </div>
                                        )}
                                        {checks.camera === 'success' && (
                                            <>
                                                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Preview</span>
                                                </div>
                                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                                    <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Camera Ready</span>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Mic size={16} className={checks.microphone === 'success' ? 'text-emerald-500' : checks.microphone === 'failed' ? 'text-red-500' : 'text-gray-400'} />
                                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Microphone Level</span>
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                                checks.microphone === 'success' ? 'text-emerald-600' : 
                                                checks.microphone === 'failed' ? 'text-red-600' : 
                                                checks.microphone === 'testing' ? 'text-yellow-600' : 'text-gray-600'
                                            }`}>
                                                {checks.microphone === 'success' ? 'Working' : 
                                                 checks.microphone === 'failed' ? 'Failed' : 
                                                 checks.microphone === 'testing' ? 'Testing...' : 'Pending'}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full transition-all duration-200 ${
                                                    checks.microphone === 'success' ? 'bg-emerald-500' : 
                                                    checks.microphone === 'failed' ? 'bg-red-500' : 
                                                    'bg-gray-400'
                                                }`}
                                                style={{ width: `${micLevel}%` }}
                                            />
                                        </div>
                                        {checks.microphone === 'failed' && (
                                            <p className="text-xs text-red-600 mt-2">Please check microphone permissions</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'internet', label: 'Internet Stability', icon: Wifi, desc: 'Checking connection speed & latency' },
                                        { id: 'camera', label: 'Camera Availability', icon: Camera, desc: 'Verifying face detection & lighting' },
                                        { id: 'microphone', label: 'Audio Input', icon: Mic, desc: 'Testing microphone sensitivity' }
                                    ].map((item) => (
                                        <div key={item.id} className={`p-4 rounded-2xl border transition-all ${
                                            checks[item.id] === 'success' ? 'bg-emerald-50 border-emerald-100' : 
                                            checks[item.id] === 'failed' ? 'bg-red-50 border-red-100' : 
                                            checks[item.id] === 'testing' ? 'bg-yellow-50 border-yellow-100' : 
                                            'bg-white border-gray-100'
                                        }`}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${
                                                        checks[item.id] === 'success' ? 'bg-emerald-500 text-white' : 
                                                        checks[item.id] === 'failed' ? 'bg-red-500 text-white' : 
                                                        checks[item.id] === 'testing' ? 'bg-yellow-500 text-white' : 
                                                        'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        <item.icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{item.label}</p>
                                                        <p className="text-[10px] text-gray-500">{item.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    {checks[item.id] === 'testing' && <RefreshCw size={18} className="text-yellow-500 animate-spin" />}
                                                    {checks[item.id] === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                                                    {checks[item.id] === 'failed' && <X size={18} className="text-red-500" />}
                                                    {checks[item.id] === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-100"></div>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                        <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-800 leading-relaxed">
                                            <span className="font-bold">Pro Tip:</span> Ensure you are in a well-lit room and using headphones for the best experience.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex items-center justify-between gap-4">
                                <button
                                    onClick={handleBackButton}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                                    <ChevronLeft size={20} /> Back
                                </button>
                                <div className="flex gap-3 flex-1">
                                    <button
                                        onClick={handleRecheckButton}
                                        className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                                        <RefreshCw size={16} /> Retry Check
                                    </button>
                                    <button
                                        onClick={startInterview}
                                        disabled={!allSuccess}
                                        className="flex-[2] bg-black text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Start Interview <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Production Welcome View
    if (step === 'welcome') {
        return (
            <WelcomeView 
                agent={agent} 
                candidate={candidate} 
                setCandidate={setCandidate}
                handlePermissions={handlePermissions}
                permStatus={permStatus}
                onStart={startInterview}
                isConnecting={status === 'connecting'}
            />
        );
    }

    // Production Interview View
    if (step === 'interview') {
        return (
            <div className="flex flex-col h-full bg-gray-900 text-white p-4">
                <div className="flex-1 flex gap-4 min-h-0 mb-4">
                    <div className="flex-1 bg-gray-800 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-gray-700 shadow-2xl">
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

                    <div className="flex-1 bg-black rounded-2xl relative overflow-hidden border border-gray-700 shadow-2xl">
                        <UserVideoFeed stream={streamRef.current} videoRef={videoRef} />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2" />
                            Live Camera
                        </div>
                    </div>
                </div>

                <div className="h-48 flex gap-4">
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

                    <div className="w-64 flex flex-col gap-3">
                        <div className="flex-1 bg-gray-800/50 rounded-2xl border border-gray-700 flex items-center justify-center flex-col p-4 text-center">
                            <span className="text-4xl font-mono font-bold text-gray-500">
                                <LiveTimer isActive={status === 'active'} />
                            </span>
                            <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Duration</span>
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

    // Real Vapi AI Interview Session
    if (step === 'session') {
        return (
            <div className="bg-black text-white flex flex-col min-h-screen">
                {/* Hidden video element keeping the camera stream alive so the
                    anti-cheat canvas capture has frames to read. The actual
                    video preview is in the avatar block below. */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="absolute opacity-0 pointer-events-none w-1 h-1"
                    style={{ left: -9999, top: -9999 }}
                />
                <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">R</div>
                        <div className="h-4 w-px bg-white/20"></div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Interview Session</p>
                            <p className="text-sm font-bold">{interviewData?.positionTitle || 'Interview'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                            <Clock size={14} className="text-emerald-500" />
                            <span className="text-xs font-mono font-bold">
                                Question {activeInterview.currentQuestionIndex + 1} of {interviewData?.aiQuestions?.length || 0}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                                    {activeInterview.isActive ? 'LIVE' : 'CONNECTING'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Video size={14} className="text-white/60" />
                                <Mic size={14} className="text-white/60" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-12">
                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${activeInterview.isActive ? 'scale-110 border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : ''}`}>
                                        <User size={80} className="text-white/20" />
                                    </div>

                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                                            <div className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-indigo-500 animate-pulse' : 'bg-white/20'}`}></div>
                                            {interviewData?.agentName || 'AI Interviewer'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-lg font-bold">{interviewData?.agentName || 'AI Interviewer'}</h2>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Interviewer</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-6">
                                <div className="relative">
                                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-gray-900 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                            <User size={80} className="text-gray-400" />
                                        </div>
                                    </div>

                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                                        <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                                            <div className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`}></div>
                                            {candidateInfo?.candidateName || 'Candidate'}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <h2 className="text-lg font-bold">{candidateInfo?.candidateName || 'You'}</h2>
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Candidate</p>
                                </div>
                            </div>
                        </div>

                        <div className="w-full max-w-3xl">
                            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                
                                {/* Current Question Display */}
                                {activeInterview.currentQuestionIndex < (interviewData?.aiQuestions?.length || 0) && (
                                    <div className="text-center mb-6">
                                        <p className="text-sm text-gray-400 mb-2">Current Question:</p>
                                        <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                                            "{interviewData?.aiQuestions?.[activeInterview.currentQuestionIndex] || 'Loading question...'}"
                                        </p>
                                    </div>
                                )}

                                {/* Live Transcript */}
                                <div className="max-h-64 overflow-y-auto space-y-3">
                                    <h3 className="text-sm font-bold text-gray-400 mb-3">Live Transcript:</h3>
                                    {activeInterview.transcript.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">Waiting for conversation to start...</p>
                                    ) : (
                                        activeInterview.transcript.map((item, index) => (
                                            <div key={index} className={`flex ${item.role === 'AI' ? 'justify-start' : 'justify-end'} mb-2`}>
                                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                                    item.role === 'AI'
                                                        ? 'bg-indigo-900/50 text-indigo-100 border border-indigo-700/30'
                                                        : 'bg-emerald-900/50 text-emerald-100 border border-emerald-700/30'
                                                }`}>
                                                    <span className="block text-xs opacity-70 font-bold mb-1 uppercase">{item.role}</span>
                                                    {item.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Chat input — only available for providers that support text (Gemini Live) */}
                                {activeInterview.supportsChat && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageCircle size={14} className="text-indigo-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                                                Text Chat (fallback if voice isn't working)
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                                                placeholder={activeInterview.isActive ? 'Type a message to the AI…' : 'Connecting…'}
                                                disabled={!activeInterview.isActive}
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-indigo-500/50 disabled:opacity-50"
                                            />
                                            <button
                                                onClick={handleSendChat}
                                                disabled={!activeInterview.isActive || !chatInput.trim()}
                                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                            >
                                                <Send size={14} />
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="h-24 border-t border-white/10 bg-black/50 backdrop-blur-md px-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                                <Shield size={18} className="text-emerald-500" />
                                <div className="hidden sm:block">
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Interview Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {activeInterview.isActive && (
                                <button
                                    onClick={endInterview}
                                    className="px-8 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
                                End Interview
                            </button>
                            )}
                        </div>
                    </div>
                </main>

                {/* Connection Status */}
                {activeInterview.isConnecting && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-white text-lg font-bold">Connecting to AI Interviewer...</p>
                            <p className="text-gray-400 text-sm mt-2">Please wait while we establish the connection</p>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {activeInterview.error && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                        <div className="bg-red-900/90 border border-red-500 rounded-2xl p-8 max-w-md text-center">
                            <X size={48} className="text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-red-400 mb-2">Interview Error</h3>
                            <p className="text-red-300 mb-6">{activeInterview.error}</p>
                            <button
                                onClick={() => setStep('check')}
                                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Back to Device Check
                            </button>
                        </div>
                    </div>
                )}

                {/* Anti-Cheat Warning */}
                <AnimatePresence>
                    {showWarning && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                            <div className="bg-red-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-400">
                                <AlertCircle size={20} />
                                <p className="text-sm font-bold">Warning: Multiple faces detected on camera.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Interview Completed - Simple completion message
    if (step === 'completed' || step === 'complete') {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="max-w-2xl w-full bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FiCheckCircle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Interview Completed Successfully!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        You have successfully completed the interview. We have sent the results to your email.
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                        Thank you for your time. The recruiter will review your performance and contact you if needed.
                    </p>
                </div>
            </div>
        );
    }
}

// --- SUB-COMPONENTS ---

function WelcomeView({ agent, candidate, setCandidate, handlePermissions, permStatus, onStart, isConnecting }) {
    return (
        <div className="max-w-4xl mx-auto pt-10 px-4 md:px-0">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                    <h1 className="text-4xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        {agent.name}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                        You are about to start an automated AI interview managed by <strong>{agent.recruiterName || 'Doweit Recruiter'}</strong>.
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
                            disabled={!permStatus.camera || !candidate.name || isConnecting}
                            className={`w-full py-4 rounded-xl font-bold text-white text-lg shadow-lg transition-transform hover:scale-[1.02] active:scale-95 flex items-center justify-center
                                ${(!permStatus.camera || !candidate.name) ? 'bg-gray-400 cursor-not-allowed' : uiColors.accentPrimaryGradient}`}
                        >
                            {isConnecting ? <FiLoader className="animate-spin" /> : 'Start Interview'}
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
            className="w-full h-full object-cover transform scale-x-[-1]"
        />
    );
}

function LiveTimer({ isActive }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    const format = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const s = (totalSeconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return <>{format(seconds)}</>;
}
