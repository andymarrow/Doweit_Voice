"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import {
  Mic, Volume2, Clock, Shield, AlertCircle,
  Wifi, CheckCircle2, RefreshCw, ChevronRight, ChevronLeft, X,
  Briefcase, ShieldCheck, Send, MessageCircle, Loader2, User,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useVapiInterview } from '../vapi';
import { useGeminiInterview } from '../gemini';

// Mirrors app/interview/[interviewid]/[candidateid]/page.jsx but driven by
// /api/trainee/* and persists per-attempt transcripts/results into the
// trainee_interviews JSONB stores.

function newAttemptId() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

export default function TraineeInterviewPage() {
  const { interviewid } = useParams();
  const router = useRouter();

  // Both hooks must be called unconditionally (Rules of Hooks).
  const vapiInterview = useVapiInterview();
  const geminiInterview = useGeminiInterview();

  // ─── State ───────────────────────────────────────────────────────────
  const [step, setStep] = useState('loading'); // loading | error | intro | check | session | analyzing | completed
  const [interviewData, setInterviewData] = useState(null);
  const [permStatus, setPermStatus] = useState({ mic: false });
  const [checks, setChecks] = useState({
    microphone: 'pending',
    internet: 'pending',
    environment: 'pending',
  });
  const [micLevel, setMicLevel] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [showWarning, setShowWarning] = useState(false);

  const attemptIdRef = useRef(null);
  if (!attemptIdRef.current) attemptIdRef.current = newAttemptId();

  // Mic-only — trainee practice does not require camera.
  const streamRef = useRef(null);

  // Route to the correct provider — same pattern as app/interview.
  const isGoogleNative =
    interviewData?.voiceProvider === 'google' ||
    interviewData?.voiceProvider === 'gemini' ||
    interviewData?.interviewer === 'gemini';
  const activeInterview = isGoogleNative ? geminiInterview : vapiInterview;

  // ─── 1. Load interview from /api/trainee ────────────────────────────
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/trainee/interview/${interviewid}`, { cache: 'no-store' });
        const json = await res.json();
        if (!alive) return;
        if (!res.ok) throw new Error(json.error || 'Interview not found');
        setInterviewData({
          ...json.data,
          positionTitle: json.data.title,
        });
        setStep('intro');
      } catch (err) {
        console.error(err);
        if (alive) setStep('error');
      }
    })();
    return () => { alive = false; };
  }, [interviewid]);

  // ─── 2. Auto-run device checks when entering check step ─────────────
  useEffect(() => {
    if (step === 'check') runDeviceChecks();
  }, [step]);

  // ─── 3. Anti-cheat warning while in session ─────────────────────────
  useEffect(() => {
    if (step !== 'session') return;
    const t = setTimeout(() => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }, 15000);
    return () => clearTimeout(t);
  }, [step]);

  // ─── 4. Stream transcript saves while live ──────────────────────────
  useEffect(() => {
    if (step !== 'session') return;
    if (!activeInterview.transcript || activeInterview.transcript.length === 0) return;
    const t = setTimeout(() => {
      fetch(`/api/trainee/interview/${interviewid}/save-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attemptIdRef.current,
          transcript: activeInterview.transcript,
        }),
      }).catch(() => {});
    }, 1000);
    return () => clearTimeout(t);
  }, [activeInterview.transcript, step, interviewid]);

  // ─── 5. Cleanup streams on unmount ──────────────────────────────────
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      try { activeInterview.stopInterview?.(); } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Device test helpers ────────────────────────────────────────────
  const testMicrophone = async () => {
    setChecks((p) => ({ ...p, microphone: 'testing' }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      const src = ctx.createMediaStreamSource(stream);
      src.connect(analyser);
      analyser.fftSize = 256;
      const buf = new Uint8Array(analyser.frequencyBinCount);

      // Sample for ~3s; mark success as soon as we see any signal.
      let elapsed = 0;
      const tick = () => {
        analyser.getByteFrequencyData(buf);
        const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
        setMicLevel(avg);
        if (avg > 10) {
          setChecks((p) => ({ ...p, microphone: 'success' }));
          setPermStatus((p) => ({ ...p, mic: true }));
          return;
        }
        elapsed += 100;
        if (elapsed < 3000) {
          setTimeout(tick, 100);
        } else {
          // Mic permission granted but quiet — still pass.
          setChecks((p) => ({ ...p, microphone: 'success' }));
          setPermStatus((p) => ({ ...p, mic: true }));
        }
      };
      tick();

      if (!streamRef.current) streamRef.current = stream;
      return true;
    } catch (err) {
      console.error('Microphone test failed:', err);
      setChecks((p) => ({ ...p, microphone: 'failed' }));
      return false;
    }
  };

  const testInternet = async () => {
    setChecks((p) => ({ ...p, internet: 'testing' }));
    try {
      const t0 = Date.now();
      const res = await fetch('/api/trainee/dashboard', { method: 'HEAD', cache: 'no-cache' }).catch(() => null);
      const t1 = Date.now();
      // HEAD may 405 — just probe latency.
      if (t1 - t0 < 5000) {
        setChecks((p) => ({ ...p, internet: 'success' }));
        return true;
      }
      setChecks((p) => ({ ...p, internet: 'failed' }));
      return false;
    } catch {
      setChecks((p) => ({ ...p, internet: 'failed' }));
      return false;
    }
  };

  const testEnvironment = async () => {
    setChecks((p) => ({ ...p, environment: 'testing' }));
    try {
      const hasGUM = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasWebGL = (() => {
        try {
          const c = document.createElement('canvas');
          return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
        } catch { return false; }
      })();
      const screenOk = window.screen.width >= 1024 && window.screen.height >= 600;
      if (hasGUM && hasWebGL && screenOk) {
        setChecks((p) => ({ ...p, environment: 'success' }));
        return true;
      }
      setChecks((p) => ({ ...p, environment: 'failed' }));
      return false;
    } catch {
      setChecks((p) => ({ ...p, environment: 'failed' }));
      return false;
    }
  };

  const runDeviceChecks = async () => {
    setChecks({
      microphone: 'pending',
      internet: 'pending',
      environment: 'pending',
    });
    await testInternet();
    await new Promise((r) => setTimeout(r, 300));
    await testEnvironment();
    await new Promise((r) => setTimeout(r, 300));
    await testMicrophone();
  };

  const handleBack = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setChecks({ microphone: 'pending', internet: 'pending', environment: 'pending' });
    setStep('intro');
  };

  // ─── Start interview ─────────────────────────────────────────────────
  const startInterview = async () => {
    if (!interviewData) return toast.error('Interview data not loaded');

    // If a previous attempt left the hook in 'error' or 'ended' state,
    // canStart goes false and clicking Start would otherwise dead-end with
    // "Interview engine is not ready". Reset and proceed — only block while
    // an attempt is actively connecting/in-progress.
    if (!activeInterview.canStart) {
      if (activeInterview.isConnecting || activeInterview.isActive) {
        return toast.error('An interview is already in progress');
      }
      try { activeInterview.reset?.(); } catch {}
    }

    // Build a candidate-shaped object the existing hooks expect.
    const candidate = {
      candidateName: 'Trainee',
      id: attemptIdRef.current,
      publicId: attemptIdRef.current,
    };

    try {
      const ok = await activeInterview.startInterview(interviewData, candidate);
      if (ok) {
        setStep('session');
        toast.success('Interview started');
      }
    } catch (err) {
      console.error('Failed to start interview:', err);
      toast.error('Could not start interview');
    }
  };

  // ─── End interview → run analysis → result page ─────────────────────
  const endInterview = async () => {
    try {
      await activeInterview.stopInterview?.();
    } catch {}

    const transcript = activeInterview.transcript || [];

    setStep('analyzing');
    try {
      const res = await fetch(`/api/trainee/interview/${interviewid}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attemptIdRef.current,
          transcript,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      router.push(`/trainee/interview/${interviewid}/result/${data.attemptId}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Analysis failed');
      setStep('completed');
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

  const allSuccess = ['internet', 'microphone'].every((k) => checks[k] === 'success');

  // ─── Renderers ───────────────────────────────────────────────────────
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview not found</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t load this interview. It may have been deleted or you don&apos;t have access.
          </p>
          <button
            onClick={() => router.push('/trainee?section=sessions')}
            className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
          >
            Back to my interviews
          </button>
        </div>
      </div>
    );
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4">
          <Loader2 size={28} className="animate-spin mx-auto text-purple-500" />
          <h2 className="text-gray-900 font-black text-lg">Scoring your interview…</h2>
          <p className="text-gray-500 text-xs">
            Sending your transcript and evaluation criteria to the AI analyst.
          </p>
        </div>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 text-white flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>
          <h2 className="text-xl font-black tracking-tight">Interview ended</h2>
          <p className="text-gray-500 text-sm">
            Analysis didn&apos;t complete. You can retake the interview from your sessions list.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/trainee?section=sessions')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black"
            >
              My interviews
            </button>
            <button
              onClick={endInterview}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-xs font-black"
            >
              Retry analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl">
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-8 text-white text-center">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">{interviewData?.title || 'Practice Interview'}</h1>
              <p className="text-white/70 mt-1 text-sm">
                Trainee practice · {interviewData?.department || 'General'} · AI Voice Interview
              </p>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
                <p className="text-sm text-purple-800 font-medium">
                  <strong>Heads up:</strong> This is a practice attempt — every attempt is scored
                  independently and saved to your history. Speak naturally, the AI will guide you.
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
                    <Mic size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Format</span>
                  </div>
                  <p className="font-bold">{isGoogleNative ? 'Gemini Live' : 'Vapi Voice'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  Required Permission
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <Mic size={18} />
                    <span className="text-sm font-bold">Microphone Access (no camera needed)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Tips for the best practice</h3>
                <div className="space-y-3">
                  {[
                    { icon: Wifi, text: 'Stable internet keeps the AI from cutting out.' },
                    { icon: Volume2, text: 'Quiet room, headphones if you have them.' },
                    { icon: AlertCircle, text: 'Stay on this tab — switching can interrupt the call.' },
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

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => router.push('/trainee?section=sessions')}
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl text-gray-500 hover:bg-gray-100 text-sm font-bold"
                >
                  <ChevronLeft size={18} /> Back
                </button>
                <button
                  onClick={() => setStep('check')}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200"
                >
                  Continue to Device Check <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'check') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight">Device & Environment Check</h1>
                <p className="text-gray-500 text-sm mt-1">Quick check before we start the interview.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex flex-col items-center justify-center border border-purple-100">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center mb-3">
                      <Mic size={28} className="text-purple-600" />
                    </div>
                    <p className="text-sm font-black text-purple-700">Voice-only practice</p>
                    <p className="text-[11px] text-gray-500 mt-1 px-6 text-center">
                      No camera needed for trainee interviews — just your microphone.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Mic
                          size={16}
                          className={
                            checks.microphone === 'success'
                              ? 'text-emerald-500'
                              : checks.microphone === 'failed'
                              ? 'text-red-500'
                              : 'text-gray-400'
                          }
                        />
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Microphone Level
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          checks.microphone === 'success'
                            ? 'text-emerald-600'
                            : checks.microphone === 'failed'
                            ? 'text-red-600'
                            : checks.microphone === 'testing'
                            ? 'text-yellow-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {checks.microphone === 'success'
                          ? 'Working'
                          : checks.microphone === 'failed'
                          ? 'Failed'
                          : checks.microphone === 'testing'
                          ? 'Testing…'
                          : 'Pending'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full transition-all duration-200 ${
                          checks.microphone === 'success'
                            ? 'bg-emerald-500'
                            : checks.microphone === 'failed'
                            ? 'bg-red-500'
                            : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(100, micLevel)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { id: 'internet', label: 'Internet Stability', icon: Wifi, desc: 'Connection latency' },
                    { id: 'microphone', label: 'Audio Input', icon: Mic, desc: 'Mic sensitivity' },
                  ].map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        checks[item.id] === 'success'
                          ? 'bg-emerald-50 border-emerald-100'
                          : checks[item.id] === 'failed'
                          ? 'bg-red-50 border-red-100'
                          : checks[item.id] === 'testing'
                          ? 'bg-yellow-50 border-yellow-100'
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-xl ${
                              checks[item.id] === 'success'
                                ? 'bg-emerald-500 text-white'
                                : checks[item.id] === 'failed'
                                ? 'bg-red-500 text-white'
                                : checks[item.id] === 'testing'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
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
                          {checks[item.id] === 'pending' && (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed">
                      <span className="font-bold">Pro tip:</span> well-lit room + headphones gives the AI the cleanest input.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 flex items-center justify-between gap-4">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100"
                >
                  <ChevronLeft size={20} /> Back
                </button>
                <div className="flex gap-3 flex-1">
                  <button
                    onClick={runDeviceChecks}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} /> Retry Check
                  </button>
                  <button
                    onClick={startInterview}
                    disabled={!allSuccess || activeInterview.isConnecting}
                    className="flex-[2] bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {activeInterview.isConnecting ? 'Connecting…' : 'Start Interview'} <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Live session ────────────────────────────────────────────────────
  if (step === 'session') {
    const transcript = activeInterview.transcript || [];
    const questions = interviewData?.aiQuestions || [];
    const qIdx = activeInterview.currentQuestionIndex ?? 0;

    return (
      <div className="bg-black text-white flex flex-col min-h-screen">
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold">T</div>
            <div className="h-4 w-px bg-white/20" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/60">Practice Interview</p>
              <p className="text-sm font-bold">{interviewData?.title || 'Interview'}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {questions.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <Clock size={14} className="text-emerald-500" />
                <span className="text-xs font-mono font-bold">
                  Question {Math.min(qIdx + 1, questions.length)} of {questions.length}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                {activeInterview.isActive ? 'LIVE' : 'CONNECTING'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-12">
              {/* AI */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${activeInterview.isActive ? 'scale-110 border-purple-500/50 shadow-[0_0_50px_rgba(147,51,234,0.25)]' : ''}`}>
                    <span className="text-5xl font-black text-white/60">{(interviewData?.agentName || 'A').charAt(0)}</span>
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full">
                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                      <span className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-purple-500 animate-pulse' : 'bg-white/20'}`} />
                      {interviewData?.agentName || 'AI Interviewer'}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold">{interviewData?.agentName || 'AI Interviewer'}</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Interviewer</p>
                </div>
              </div>

              {/* Trainee — voice only, no camera */}
              <div className="flex flex-col items-center gap-6">
                <div className="relative">
                  <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${activeInterview.isActive ? 'scale-105 border-emerald-500/40' : ''}`}>
                    <Mic size={64} className="text-emerald-400/80" />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full">
                    <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                      <span className={`w-2 h-2 rounded-full ${activeInterview.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-white/20'}`} />
                      You
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold">You</h2>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Trainee · Voice only</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-3xl">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500" />

                {questions.length > 0 && qIdx < questions.length && (
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-400 mb-2">Current question</p>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-white">
                      &ldquo;{questions[qIdx]}&rdquo;
                    </p>
                  </div>
                )}

                <div className="max-h-64 overflow-y-auto space-y-3">
                  <h3 className="text-sm font-bold text-gray-400 mb-3">Live transcript</h3>
                  {transcript.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Waiting for conversation to start…</p>
                  ) : (
                    transcript.map((item, i) => {
                      const isAI = item.role === 'AI' || item.role === 'assistant' || item.role === 'agent';
                      return (
                        <div key={i} className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-2`}>
                          <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${
                              isAI
                                ? 'bg-purple-900/40 text-purple-100 border border-purple-700/30'
                                : 'bg-emerald-900/40 text-emerald-100 border border-emerald-700/30'
                            }`}
                          >
                            <span className="block text-[10px] opacity-70 font-bold mb-1 uppercase">
                              {isAI ? 'AI' : 'You'}
                            </span>
                            {item.text}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {activeInterview.supportsChat && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle size={14} className="text-purple-400" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                        Text Chat (fallback if voice isn&apos;t working)
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
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 outline-none focus:border-purple-500/50 disabled:opacity-50"
                      />
                      <button
                        onClick={handleSendChat}
                        disabled={!activeInterview.isActive || !chatInput.trim()}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-white/10 disabled:text-white/30 text-white rounded-lg text-sm font-bold flex items-center gap-2"
                      >
                        <Send size={14} /> Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-24 border-t border-white/10 bg-black/50 backdrop-blur-md px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                <Shield size={18} className="text-emerald-500" />
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Practice mode</p>
              </div>
            </div>

            <button
              onClick={endInterview}
              className="px-8 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 shadow-lg shadow-red-500/20"
            >
              End Interview
            </button>
          </div>
        </main>

        {activeInterview.isConnecting && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-white text-lg font-bold">Connecting to AI Interviewer…</p>
              <p className="text-gray-400 text-sm mt-2">Setting up the call</p>
            </div>
          </div>
        )}

        {activeInterview.error && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-red-900/90 border border-red-500 rounded-2xl p-8 max-w-md text-center">
              <X size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-300 mb-2">Interview Error</h3>
              <p className="text-red-200 mb-6">{activeInterview.error}</p>
              <button
                onClick={() => setStep('check')}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Back to Device Check
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showWarning && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            >
              <div className="bg-amber-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-amber-400">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">Stay focused — keep this tab in the foreground.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Should not reach here
  return null;
}
