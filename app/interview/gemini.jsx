"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { GoogleGenAI, Modality } from '@google/genai';

// Phrases the AI interviewer says when the interview is done. We watch the
// streamed AI transcript for these and auto-stop the session, so the
// candidate doesn't have to manually click "End" after the goodbye.
const END_PHRASES = [
    'thank you for completing the interview',
    'thanks for completing the interview',
    'thanks for joining',
    'thank you for your time',
    'we are done with the interview',
    "we're done with the interview",
    'that concludes our interview',
    'that wraps up the interview',
    'this concludes the interview',
    'goodbye',
    'have a great day',
];

function transcriptEndsTheInterview(text) {
    if (!text) return false;
    const lower = String(text).toLowerCase();
    return END_PHRASES.some((phrase) => lower.includes(phrase));
}

// Fetch the Google API key from the backend — same endpoint as TestAgentSidePanel
const getGoogleKey = async () => {
    try {
        const res = await fetch('/api/integrations/google/key');
        if (!res.ok) throw new Error('Failed to fetch Google Key');
        const data = await res.json();
        return data.apiKey;
    } catch (e) {
        console.error('getGoogleKey error:', e);
        return null;
    }
};

// ── PCM helpers (identical to TestAgentSidePanel) ─────────────────────────────
const floatTo16BitPCM = (float32Array) => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    return buffer;
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
};

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useGeminiInterview() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [callStatus, setCallStatus]     = useState('idle');
    const [transcript, setTranscript]     = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [error, setError]               = useState(null);

    // Refs for audio I/O (same as TestAgentSidePanel)
    const geminiSessionRef      = useRef(null);
    const audioInputContextRef  = useRef(null);
    const audioOutputContextRef = useRef(null);
    const mediaStreamRef        = useRef(null);
    const processorRef          = useRef(null);
    const nextPlayTimeRef       = useRef(0);
    const activeSourcesRef      = useRef([]);

    // Refs that mirror state so stale-closure callbacks see current values
    const transcriptRef         = useRef([]);
    const interviewDataRef      = useRef(null);
    const candidateDataRef      = useRef(null);
    // Latches once we've decided the interview is over so multiple end-phrase
    // matches don't fire stopInterview() repeatedly.
    const endTriggeredRef       = useRef(false);
    const endTimerRef           = useRef(null);

    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    useEffect(() => () => {
        if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
            endTimerRef.current = null;
        }
    }, []);

    // ── Playback helpers ───────────────────────────────────────────────────────
    const cancelScheduledPlayback = useCallback(() => {
        activeSourcesRef.current.forEach(s => {
            try { s.onended = null; } catch (_) {}
            try { s.stop(); }        catch (_) {}
            try { s.disconnect(); }  catch (_) {}
        });
        activeSourcesRef.current = [];
        const ctx = audioOutputContextRef.current;
        nextPlayTimeRef.current = ctx && ctx.state !== 'closed' ? ctx.currentTime : 0;
    }, []);

    const playStreamedAudio = useCallback((base64Data) => {
        try {
            if (!audioOutputContextRef.current) {
                audioOutputContextRef.current = new window.AudioContext({ sampleRate: 24000 });
            }
            const ctx = audioOutputContextRef.current;

            const binary = window.atob(base64Data);
            const bytes  = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

            // CRITICAL: slice to guarantee byte alignment before Int16Array view
            const int16   = new Int16Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
            const float32 = new Float32Array(int16.length);
            for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0;

            const buffer = ctx.createBuffer(1, float32.length, 24000);
            buffer.copyToChannel(float32, 0);

            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);

            const now   = ctx.currentTime;
            const start = nextPlayTimeRef.current < now ? now : nextPlayTimeRef.current;
            source.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
                try { source.disconnect(); } catch (_) {}
            };
            source.start(start);
            activeSourcesRef.current.push(source);
            nextPlayTimeRef.current = start + buffer.duration;
        } catch (e) {
            console.error('Gemini interview playback error:', e);
        }
    }, []);

    // ── Microphone capture ─────────────────────────────────────────────────────
    const stopAudioIO = useCallback(() => {
        cancelScheduledPlayback();
        if (processorRef.current)          { processorRef.current.disconnect();          processorRef.current = null; }
        if (audioInputContextRef.current)  { audioInputContextRef.current.close();       audioInputContextRef.current = null; }
        if (mediaStreamRef.current)        { mediaStreamRef.current.getTracks().forEach(t => t.stop()); mediaStreamRef.current = null; }
        if (audioOutputContextRef.current) { audioOutputContextRef.current.close();      audioOutputContextRef.current = null; }
        nextPlayTimeRef.current = 0;
    }, [cancelScheduledPlayback]);

    const startAudioInput = useCallback(async () => {
        try {
            const ctx = new window.AudioContext({ sampleRate: 16000 });
            audioInputContextRef.current = ctx;
            if (ctx.state === 'suspended') await ctx.resume();

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, autoGainControl: true, noiseSuppression: true }
            });
            mediaStreamRef.current = stream;

            const source    = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                // Guard: session may have closed while the processor buffer was still draining
                if (!geminiSessionRef.current) return;
                try {
                    const pcm16 = floatTo16BitPCM(e.inputBuffer.getChannelData(0));
                    const b64   = arrayBufferToBase64(pcm16);
                    geminiSessionRef.current.sendRealtimeInput({ audio: { mimeType: 'audio/pcm;rate=16000', data: b64 } });
                } catch (_) {
                    // Swallow "WebSocket is already in CLOSING or CLOSED state" errors
                    // that fire during the last few processor cycles after session teardown
                }
            };

            source.connect(processor);
            processor.connect(ctx.destination);
        } catch (e) {
            console.error('Gemini interview mic error:', e);
            setError('Microphone access failed: ' + e.message);
        }
    }, []);

    // ── Message handler (mirrors TestAgentSidePanel.handleGeminiMessage) ───────
    const handleGeminiMessage = useCallback((message) => {
        const sc = message.serverContent;
        if (!sc) return;

        // VAD interruption — cancel queued playback
        if (sc.interrupted) {
            cancelScheduledPlayback();
            return;
        }

        // Audio chunks from model
        if (sc.modelTurn?.parts) {
            for (const part of sc.modelTurn.parts) {
                if (part.inlineData) playStreamedAudio(part.inlineData.data);
            }
        }

        // AI transcript (accumulate streaming tokens into one bubble)
        if (sc.outputTranscription?.text) {
            const text = sc.outputTranscription.text;
            const prev = transcriptRef.current;
            const last = prev[prev.length - 1];
            const next = last?.role === 'AI'
                ? [...prev.slice(0, -1), { ...last, text: last.text + text }]
                : [...prev, { role: 'AI', text, timestamp: new Date().toISOString() }];
            transcriptRef.current = next;
            setTranscript(next);

            // Auto-end when the AI announces the interview is over. Inspect the
            // accumulated AI bubble so we still match phrases that were split
            // across streaming chunks. Delay the stop so the goodbye audio
            // finishes playing first.
            const aggregated = next[next.length - 1]?.text || '';
            if (
                !endTriggeredRef.current &&
                transcriptEndsTheInterview(aggregated)
            ) {
                endTriggeredRef.current = true;
                if (endTimerRef.current) clearTimeout(endTimerRef.current);
                endTimerRef.current = setTimeout(() => {
                    const session = geminiSessionRef.current;
                    geminiSessionRef.current = null;
                    if (session) { try { session.close(); } catch (_) {} }
                    stopAudioIO();
                    setCallStatus('ended');
                }, 2500);
            }
        }

        // Candidate transcript
        if (sc.inputTranscription?.text) {
            const text = sc.inputTranscription.text;
            const prev = transcriptRef.current;
            const last = prev[prev.length - 1];
            const next = last?.role === 'Candidate'
                ? [...prev.slice(0, -1), { ...last, text: last.text + text }]
                : [...prev, { role: 'Candidate', text, timestamp: new Date().toISOString() }];
            transcriptRef.current = next;
            setTranscript(next);

            // Advance question index when candidate finishes a turn
            if (interviewDataRef.current) {
                const total = (interviewDataRef.current.aiQuestions || []).length;
                setCurrentQuestionIndex(prev => prev < total - 1 ? prev + 1 : prev);
            }
        }
    }, [cancelScheduledPlayback, playStreamedAudio, stopAudioIO]);

    // ── Start interview ────────────────────────────────────────────────────────
    const startInterview = useCallback(async (interviewData, candidateData) => {
        if (!interviewData || !candidateData) {
            toast.error('Missing interview or candidate data');
            return false;
        }

        // Fetch key the same way TestAgentSidePanel does
        const apiKey = await getGoogleKey();
        if (!apiKey) {
            toast.error('Google API key not configured. Add it in Settings → Integrations.');
            return false;
        }

        interviewDataRef.current  = interviewData;
        candidateDataRef.current  = candidateData;
        transcriptRef.current     = [];
        endTriggeredRef.current   = false;
        if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
            endTimerRef.current = null;
        }

        setIsConnecting(true);
        setCallStatus('connecting');
        setError(null);
        setTranscript([]);
        setCurrentQuestionIndex(0);

        try {
            const ai = new GoogleGenAI({ apiKey });
            const systemText = buildInterviewPrompt(interviewData, candidateData).replace(/\n/g, ' ');

            console.log('[Gemini Interview] Connecting with', {
                voiceId: interviewData.voiceId || 'Aoede',
                language: interviewData.language,
                promptLength: systemText.length,
            });

            const session = await ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    // Per Live API docs, transcription is enabled with an empty object —
                    // passing a `model` field here can cause the server to reject the config.
                    outputAudioTranscription: {},
                    inputAudioTranscription:  {},
                    systemInstruction: { parts: [{ text: systemText }] },
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: interviewData.voiceId || 'Aoede' } }
                    }
                },
                callbacks: {
                    onopen: () => {
                        console.log('[Gemini Interview] Session opened');
                        setIsConnecting(false);
                        setCallStatus('in-progress');
                        toast.success('Connected to AI Interviewer');
                        startAudioInput();

                        // Kick off the AI's first turn. Gemini Live needs a client
                        // input before it will speak. We send a short text nudge.
                        const cData  = candidateDataRef.current;
                        const name   = cData?.candidateName || 'the candidate';
                        setTimeout(() => {
                            const s = geminiSessionRef.current;
                            if (!s) {
                                console.warn('[Gemini Interview] Trigger skipped — session ref not ready');
                                return;
                            }
                            try {
                                s.sendClientContent({
                                    turns: [{ role: 'user', parts: [{ text: `Hello, I am ${name}. Please begin the interview.` }] }],
                                });
                                console.log('[Gemini Interview] Trigger message sent');
                            } catch (e) {
                                console.error('[Gemini Interview] Trigger failed:', e);
                            }
                        }, 600);
                    },
                    onmessage: (msg) => handleGeminiMessage(msg),
                    onclose: (event) => {
                        // Server-side close reason is invaluable for debugging — log everything.
                        console.warn('[Gemini Interview] Session closed:', {
                            code: event?.code,
                            reason: event?.reason,
                            wasClean: event?.wasClean,
                            event,
                        });
                        geminiSessionRef.current = null;
                        stopAudioIO();
                        setCallStatus(prev => prev === 'in-progress' ? 'ended' : prev);
                    },
                    onerror: (e) => {
                        console.error('[Gemini Interview] Session error:', e);
                        geminiSessionRef.current = null;
                        setError(e?.message || 'Connection error');
                        setCallStatus('error');
                        setIsConnecting(false);
                        stopAudioIO();
                        toast.error('Interview connection failed');
                    }
                }
            });
            geminiSessionRef.current = session;
            return true;
        } catch (e) {
            console.error('Failed to start Gemini interview:', e);
            setCallStatus('error');
            setError(e.message);
            setIsConnecting(false);
            stopAudioIO();
            toast.error(`Failed to start interview: ${e.message}`);
            return false;
        }
    }, [handleGeminiMessage, startAudioInput, stopAudioIO]);

    // ── Send a text message into the live session (chat fallback) ─────────────
    const sendText = useCallback((text) => {
        const session = geminiSessionRef.current;
        const trimmed = (text || '').trim();
        if (!session || !trimmed) return false;
        try {
            session.sendClientContent({
                turns: [{ role: 'user', parts: [{ text: trimmed }] }],
            });
            // Mirror it into the transcript so the UI shows what the user typed.
            const next = [
                ...transcriptRef.current,
                { role: 'Candidate', text: trimmed, timestamp: new Date().toISOString() },
            ];
            transcriptRef.current = next;
            setTranscript(next);
            return true;
        } catch (e) {
            console.error('[Gemini Interview] sendText failed:', e);
            toast.error('Could not send message — connection may be closed');
            return false;
        }
    }, []);

    // ── Stop interview ─────────────────────────────────────────────────────────
    const stopInterview = useCallback(() => {
        // Null the ref BEFORE closing so onaudioprocess draining stops sending
        const session = geminiSessionRef.current;
        geminiSessionRef.current = null;
        if (session) {
            try { session.close(); } catch (_) {}
        }
        stopAudioIO();
        setCallStatus('ended');
        toast.success('Interview completed');
    }, [stopAudioIO]);

    // ── Save transcript ────────────────────────────────────────────────────────
    const saveInterviewData = useCallback(async (candidateId) => {
        if (!candidateId || transcriptRef.current.length === 0) return null;
        try {
            const interviewText = transcriptRef.current.map(t => `${t.role}: ${t.text}`).join('\n\n');
            const response = await fetch('/api/interview/save-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId,
                    interviewData: interviewText,
                    transcript: transcriptRef.current,
                    callData: { provider: 'gemini' }
                })
            });
            if (!response.ok) throw new Error('Failed to save interview data');
            return await response.json();
        } catch (e) {
            console.error('Save interview data error:', e);
            return null;
        }
    }, []);

    // ── Reset ──────────────────────────────────────────────────────────────────
    const reset = useCallback(() => {
        const session = geminiSessionRef.current;
        geminiSessionRef.current = null;
        if (session) { try { session.close(); } catch (_) {} }
        stopAudioIO();
        setCallStatus('idle');
        setTranscript([]);
        setCurrentQuestionIndex(0);
        setError(null);
        setIsConnecting(false);
        transcriptRef.current    = [];
        interviewDataRef.current = null;
        candidateDataRef.current = null;
        endTriggeredRef.current  = false;
        if (endTimerRef.current) {
            clearTimeout(endTimerRef.current);
            endTimerRef.current = null;
        }
    }, [stopAudioIO]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            const session = geminiSessionRef.current;
            geminiSessionRef.current = null;
            if (session) { try { session.close(); } catch (_) {} }
            stopAudioIO();
        };
    }, [stopAudioIO]);

    // ── Public API (identical shape to useVapiInterview) ──────────────────────
    return {
        isConnecting,
        callStatus,
        transcript,
        currentQuestionIndex,
        error,
        startInterview,
        stopInterview,
        saveInterviewData,
        sendText,
        reset,
        isActive:  callStatus === 'in-progress',
        isEnded:   callStatus === 'ended',
        canStart:  callStatus === 'idle' && !isConnecting,
        supportsChat: true,
    };
}

// ── Prompt builder ─────────────────────────────────────────────────────────────
function buildInterviewPrompt(interviewData, candidateData) {
    const questions     = interviewData.aiQuestions || [];
    const agentName     = interviewData.agentName   || 'Interview Assistant';
    const positionTitle = interviewData.positionTitle || interviewData.title || 'position';
    const systemPrompt  = interviewData.systemPrompt || '';
    const language      = interviewData.language     || 'English';
    const tone          = interviewData.tone         || 'Friendly';

    return `You are ${agentName}, an AI interviewer conducting a structured interview for the ${positionTitle} position.

LANGUAGE: Conduct the entire interview in ${language}. Do not switch languages.
TONE: ${tone}.

INTERVIEW RULES:
- You are interviewing ${candidateData.candidateName}
- Ask the following questions in order: ${questions.map((q, i) => `${i + 1}. "${q}"`).join(', ')}
- After each question, wait for the candidate's complete response
- Do not ask questions outside the provided list
- Do not engage in general conversation — stay focused on the interview
- Be professional and encouraging

INTERVIEW FLOW:
1. Greet ${candidateData.candidateName} warmly in ${language}
2. Welcome them to the interview
3. Ask the first question, then wait for the response
4. Ask the next question after each answer
5. After all questions: "Thank you for completing the interview. Goodbye ${candidateData.candidateName}!"

${systemPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${systemPrompt}` : ''}`;
}

export default useGeminiInterview;
