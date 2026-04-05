"use client";
import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Clock,
  Shield,
  Video,
  User,

  AlertCircle } from

'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';





export default function AiInterviewSession({ onComplete }) {
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isAiSpeaking, setIsAiSpeaking] = useState(true);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const questions = [
  "Welcome! I'm Alex, your AI interviewer today. To start, could you please introduce yourself and tell me about your background in frontend development?",
  "That's interesting. Can you describe a complex technical challenge you faced with React and how you resolved it?",
  "How do you approach optimizing web performance for large-scale applications?",
  "Tell me about a time you had to collaborate with a difficult stakeholder. What was the outcome?",
  "Finally, where do you see yourself in the next 5 years in terms of technical growth?"];


  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    // Simulate AI speaking then candidate speaking
    const sequence = async () => {
      setIsAiSpeaking(true);
      await new Promise((r) => setTimeout(r, 3000));
      setIsAiSpeaking(false);

      // Wait for candidate to "respond"
      await new Promise((r) => setTimeout(r, 1000));
      setIsCandidateSpeaking(true);
      await new Promise((r) => setTimeout(r, 8000));
      setIsCandidateSpeaking(false);

      // Auto-advance to next question after a short pause
      await new Promise((r) => setTimeout(r, 2000));
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    };

    sequence();

    // Random warning simulation
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
    }, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(warningTimer);
    };
  }, [currentQuestionIndex]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-black/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold">R</div>
          <div className="h-4 w-px bg-white/20"></div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">Interview Session</p>
            <p className="text-sm font-bold">Senior Frontend Engineer</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
            <Clock size={14} className="text-emerald-500" />
            <span className="text-xs font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">REC</span>
            </div>
            <div className="flex items-center gap-2">
              <Video size={14} className="text-white/60" />
              <Mic size={14} className="text-white/60" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Avatars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-12">
            {/* AI Avatar */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${isAiSpeaking ? 'scale-110 border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : ''}`
                }>
                  <User size={80} className="text-white/20" />

                  {/* AI Speaking Animation */}
                  {isAiSpeaking &&
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) =>
                    <motion.div
                      key={i}
                      className="w-1.5 bg-indigo-500 rounded-full"
                      animate={{ height: [15, 60, 30, 70, 20][i - 1] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} />

                    )}
                    </div>
                  }
                </div>

                {/* Status Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                    {isAiSpeaking ?
                    <>
                        <Volume2 size={12} className="text-indigo-500" />
                        Alex Speaking
                      </> :

                    <>
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        Alex Listening
                      </>
                    }
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold">Alex</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Interviewer</p>
              </div>
            </div>

            {/* Candidate Avatar */}
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gray-900 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${isCandidateSpeaking ? 'scale-110 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''}`
                }>
                  <img
                    src="https://picsum.photos/seed/candidate/400/400"
                    alt="Candidate"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isCandidateSpeaking ? 'opacity-80' : 'opacity-40'}`}
                    referrerPolicy="no-referrer" />
                  

                  {/* Candidate Speaking Animation */}
                  {isCandidateSpeaking &&
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/20">
                      {[1, 2, 3, 4, 5].map((i) =>
                    <motion.div
                      key={i}
                      className="w-1.5 bg-emerald-500 rounded-full"
                      animate={{ height: [15, 60, 30, 70, 20][i - 1] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }} />

                    )}
                    </div>
                  }
                </div>

                {/* Status Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                    {isCandidateSpeaking ?
                    <>
                        <Mic size={12} className="text-emerald-500" />
                        You Speaking
                      </> :

                    <>
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        You Listening
                      </>
                    }
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold">You</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Candidate</p>
              </div>
            </div>
          </div>

          {/* Question Display */}
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden">
                
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-center italic">
                  "{questions[currentQuestionIndex]}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Bar for Controls */}
        <div className="h-24 border-t border-white/10 bg-black/50 backdrop-blur-md px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
              <Shield size={18} className="text-emerald-500" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Anti-Cheat Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`
              }>
              
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="text-xs font-bold uppercase tracking-wider">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
              <RotateCcw size={20} />
              <span className="text-xs font-bold uppercase tracking-wider">Repeat</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onComplete}
              className="px-8 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              
              End Interview
            </button>
          </div>
        </div>
      </main>

      {/* Warnings Overlay */}
      <AnimatePresence>
        {showWarning &&
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
        }
      </AnimatePresence>
    </div>);

}
