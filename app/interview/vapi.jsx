"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { toast } from 'react-hot-toast';

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;

export function useVapiInterview() {
    const [isConnecting, setIsConnecting] = useState(false);
    const [callStatus, setCallStatus] = useState('idle');
    const [transcript, setTranscript] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [callData, setCallData] = useState({});
    const [error, setError] = useState(null);

    const vapiRef = useRef(null);
    const interviewDataRef = useRef(null);
    const candidateDataRef = useRef(null);
    const transcriptRef = useRef([]);

    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    useEffect(() => {
        if (!VAPI_PUBLIC_KEY || vapiRef.current) return;

        const vapi = new Vapi(VAPI_PUBLIC_KEY);
        vapiRef.current = vapi;

        vapi.on('call-start', (call) => {
            setCallData(call || {});
            setCallStatus('in-progress');
            setIsConnecting(false);
        });

        vapi.on('call-end', () => {
            setCallStatus('ended');
        });

        vapi.on('error', (err) => {
            console.error('Vapi error:', err);
            const msg = err?.error?.message?.[0] || err?.message || 'Unknown Vapi error';
            setCallStatus('error');
            setError(msg);
            setIsConnecting(false);
            toast.error(`Interview error: ${msg}`);
        });

        vapi.on('message', (message) => {
            if (message.type === 'status-update') {
                if (message.status === 'in-progress') {
                    setCallStatus('in-progress');
                    setIsConnecting(false);
                }
                if (message.status === 'ended') {
                    setCallStatus('ended');
                }
            }

            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const role = message.role === 'assistant' ? 'AI' : 'Candidate';
                const entry = { role, text: message.transcript, timestamp: new Date().toISOString() };
                const next = [...transcriptRef.current, entry];
                transcriptRef.current = next;
                setTranscript(next);

                if (message.role === 'user' && interviewDataRef.current) {
                    const total = (interviewDataRef.current.aiQuestions || []).length;
                    setCurrentQuestionIndex(prev => prev < total - 1 ? prev + 1 : prev);
                }
            }
        });

        return () => {
            try { vapi.stop(); } catch (_) {}
        };
    }, []);

    const startInterview = useCallback(async (interviewData, candidateData) => {
        if (!vapiRef.current) {
            toast.error('Vapi not initialized — check NEXT_PUBLIC_VAPI_PUBLIC_KEY');
            return false;
        }
        if (!interviewData || !candidateData) {
            toast.error('Missing interview or candidate data');
            return false;
        }

        interviewDataRef.current = interviewData;
        candidateDataRef.current = candidateData;
        transcriptRef.current = [];

        setIsConnecting(true);
        setCallStatus('connecting');
        setError(null);
        setTranscript([]);
        setCurrentQuestionIndex(0);

        try {
            const systemPrompt = buildInterviewPrompt(interviewData, candidateData);
            const questions = interviewData.aiQuestions || [];
            const firstQuestion = questions[0] || 'Tell me about yourself and your experience.';

            // Map our provider name to the value Vapi expects.
            // VoiceModal returns 'vapi' / '11labs' / 'google' as platform names —
            // but Vapi's voice.provider does NOT accept 'google', so anything
            // non-Vapi/non-11labs falls back to 'vapi' here. (Google routes via
            // the Gemini hook elsewhere, never reaches this code.)
            const providerRaw = (interviewData.voiceProvider || 'vapi').toLowerCase();
            let voiceProvider;
            if (providerRaw === 'elevenlabs' || providerRaw === '11labs') voiceProvider = '11labs';
            else if (providerRaw === 'vapi') voiceProvider = 'vapi';
            else voiceProvider = 'vapi';

            const vapiPayload = {
                model: {
                    provider: 'google',
                    model: 'gemini-2.5-flash',
                    messages: [{ role: 'system', content: systemPrompt }],
                },
                voice: {
                    provider: voiceProvider,
                    voiceId: interviewData.voiceId || 'monitor',
                },
                firstMessage: `Hello ${candidateData.candidateName}! Welcome to your interview${interviewData.title ? ` for the ${interviewData.title} role` : ''}. ${firstQuestion}`,
                recordingEnabled: true,
                server: {
                    url: process.env.NEXT_PUBLIC_WEBHOOK_URL,
                },
                metadata: {
                    candidateId: String(candidateData.id || candidateData.publicId || ''),
                    provider: 'vapi',
                },
            };

            const call = await vapiRef.current.start(vapiPayload);
            if (call) setCallData(call);
            return true;
        } catch (err) {
            console.error('Failed to start Vapi interview:', err);
            setCallStatus('error');
            setError(err.message);
            setIsConnecting(false);
            toast.error(`Failed to start interview: ${err.message}`);
            return false;
        }
    }, []);

    const stopInterview = useCallback(() => {
        if (!vapiRef.current) return;
        try {
            vapiRef.current.stop();
            setCallStatus('ended');
            toast.success('Interview completed');
        } catch (err) {
            console.error('Error stopping interview:', err);
            toast.error('Error stopping interview');
        }
    }, []);

    const saveInterviewData = useCallback(async (candidateId) => {
        const t = transcriptRef.current;
        if (!candidateId || t.length === 0) return null;

        try {
            const interviewText = t.map(item => `${item.role}: ${item.text}`).join('\n\n');
            const response = await fetch('/api/interview/save-transcript', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    candidateId,
                    interviewData: interviewText,
                    transcript: t,
                    callData,
                }),
            });
            if (!response.ok) throw new Error('Failed to save interview data');
            return await response.json();
        } catch (err) {
            console.error('Error saving interview data:', err);
            toast.error('Failed to save interview data');
            return null;
        }
    }, [callData]);

    const reset = useCallback(() => {
        setCallStatus('idle');
        setTranscript([]);
        setCurrentQuestionIndex(0);
        setError(null);
        setIsConnecting(false);
        setCallData({});
        transcriptRef.current = [];
        interviewDataRef.current = null;
        candidateDataRef.current = null;
    }, []);

    // Vapi web calls are voice-only — chat input isn't supported. Returning false
    // lets the UI hide the chat box for Vapi without conditional plumbing.
    const sendText = useCallback(() => false, []);

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
        isActive: callStatus === 'in-progress',
        isEnded: callStatus === 'ended',
        canStart: callStatus === 'idle' && !isConnecting,
        supportsChat: false,
    };
}

function buildInterviewPrompt(interviewData, candidateData) {
    const questions = interviewData.aiQuestions || [];
    const agentName = interviewData.agentName || 'Interview Assistant';
    const positionTitle = interviewData.positionTitle || interviewData.title || 'position';
    const language = interviewData.language || 'English';
    const tone = interviewData.tone || 'Friendly';
    const systemPrompt = interviewData.systemPrompt || '';

    return `You are ${agentName}, an AI interviewer conducting a structured interview for the ${positionTitle} position.

LANGUAGE: Conduct the entire interview in ${language}. Do not switch languages.
TONE: ${tone}.

INTERVIEW RULES:
- You are interviewing ${candidateData.candidateName}
- Ask the following questions in order: ${questions.map((q, i) => `${i + 1}. "${q}"`).join(', ')}
- After each question, wait for the candidate's complete response
- Do not ask questions outside the provided list
- Do not engage in general conversation — stay focused on the interview
- Keep responses concise

INTERVIEW FLOW:
1. Greet ${candidateData.candidateName} warmly in ${language}
2. Welcome them to the interview
3. Ask the first question, then wait for the response
4. Continue through all questions
5. When done: "Thank you for completing the interview. Goodbye ${candidateData.candidateName}!"

${systemPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${systemPrompt}` : ''}`;
}

export default useVapiInterview;
