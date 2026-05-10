import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Mic,
  Video,
  Settings,
  Clock,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RotateCcw,
  BarChart3,

  Shield,
  Play,


  Activity,
  HelpCircle,
  Radar as RadarIcon } from
'lucide-react';

import { cn } from '@/lib/utils';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid } from
'recharts';









export const MockEngine = ({ agent, questions, onExit }) => {
  const [state, setState] = useState('setup');
  const [setupConfig, setSetupConfig] = useState({
    duration: '30',
    difficulty: agent.difficulty,
    language: 'English',
    focus: 'Technical'
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [timer, setTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Mock Result Data
  const resultData = {
    overall: 88,
    communication: 82,
    technical: 94,
    confidence: 78,
    radar: [
    { subject: 'Technical', A: 94, fullMark: 100 },
    { subject: 'Communication', A: 82, fullMark: 100 },
    { subject: 'Problem Solving', A: 90, fullMark: 100 },
    { subject: 'Confidence', A: 78, fullMark: 100 },
    { subject: 'Behavioral', A: 85, fullMark: 100 }],

    timeline: [
    { time: '0m', confidence: 70 },
    { time: '5m', confidence: 75 },
    { time: '10m', confidence: 85 },
    { time: '15m', confidence: 80 },
    { time: '20m', confidence: 90 },
    { time: '25m', confidence: 95 }]

  };

  useEffect(() => {
    let interval;
    if (state === 'session' && !isPaused) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state, isPaused]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setState('session');
    setTranscript([{
      speaker: agent.name,
      text: `Hello! I'm ${agent.name}. Let's start the mock interview for the ${agent.role} position. First question: ${questions[0].text}`
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTranscript((prev) => [
      ...prev,
      { speaker: 'You', text: 'I believe the main difference is...' },
      { speaker: agent.name, text: `Good point. Now, let's move on. ${questions[nextIndex].text}` }]
      );
    } else {
      setState('result');
    }
  };

  const renderSetup = () =>
  <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-[2rem] bg-gray-900 text-white flex items-center justify-center mx-auto shadow-xl">
          <Play size={32} fill="currentColor" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Mock Interview Setup</h2>
          <p className="text-sm text-muted-foreground">Configure your session with {agent.name}.</p>
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Duration (mins)</label>
            <select
            value={setupConfig.duration}
            onChange={(e) => setSetupConfig({ ...setupConfig, duration: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="45">45 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Difficulty</label>
            <select
            value={setupConfig.difficulty}
            onChange={(e) => setSetupConfig({ ...setupConfig, difficulty: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Language</label>
            <select
            value={setupConfig.language}
            onChange={(e) => setSetupConfig({ ...setupConfig, language: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Focus Area</label>
            <select
            value={setupConfig.focus}
            onChange={(e) => setSetupConfig({ ...setupConfig, focus: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option>Technical</option>
              <option>Behavioral</option>
              <option>Problem Solving</option>
              <option>Communication</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-black/5 flex gap-3">
          <button
          onClick={onExit}
          className="flex-1 py-3 rounded-2xl border border-black/5 text-xs font-bold hover:bg-gray-50 transition-all">
          
            Cancel
          </button>
          <button
          onClick={handleStart}
          className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
          
            Start Mock Interview
          </button>
        </div>
      </div>
    </div>;


  const renderSession = () =>
  <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
          onClick={() => setState('setup')}
          className="p-2 rounded-xl border border-black/5 hover:bg-gray-100 transition-all">
          
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Live Session</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm font-black font-mono">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress</span>
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }} />
            
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Avatar Panel */}
          <div className="aspect-video rounded-[2.5rem] bg-gray-900 flex items-center justify-center relative overflow-hidden border border-black/5 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />

            <div className="relative z-10 text-center space-y-6">
              <div className="relative inline-block">
                <img src={agent.avatar} className="w-32 h-32 rounded-[2.5rem] mx-auto border-4 border-white/10 shadow-2xl" alt="" />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                  <Zap size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">{agent.name}</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{agent.role}</p>
              </div>
              <div className="flex items-center justify-center gap-8">
                <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-white transition-all duration-500",
                isAnswering ? "bg-emerald-500 scale-110 shadow-[0_0_30px_rgba(16,185,129,0.4)]" : "bg-white/10"
              )}>
                  <Mic size={24} className={cn(isAnswering && "animate-pulse")} />
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-[9px] font-bold text-white uppercase tracking-widest">Anti-Cheat Active</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md">
                  <Video size={18} />
                </button>
                <button
                onClick={() => setIsPaused(!isPaused)}
                className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-md">
                
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Transcript Panel */}
          <div className="p-6 rounded-[2rem] bg-white border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Transcript</h4>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Listening</span>
              </div>
            </div>
            <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar">
              {transcript.map((msg, i) =>
            <div key={i} className={cn(
              "flex gap-4 animate-in slide-in-from-bottom-2 duration-300",
              msg.speaker === 'You' ? "justify-end" : "justify-start"
            )}>
                  {msg.speaker !== 'You' &&
              <div className="w-8 h-8 rounded-xl bg-gray-100 shrink-0 overflow-hidden border border-black/5">
                      <img src={agent.avatar} alt="" />
                    </div>
              }
                  <div className={cn(
                "p-4 rounded-2xl text-xs leading-relaxed max-w-[80%] shadow-sm",
                msg.speaker === 'You' ? "bg-emerald-600 text-white rounded-tr-none" : "bg-gray-50 border border-black/5 rounded-tl-none"
              )}>
                    <p className="font-bold mb-1 text-[9px] uppercase tracking-wider opacity-70">{msg.speaker}</p>
                    <p className="font-medium">{msg.text}</p>
                  </div>
                </div>
            )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Question */}
          <div className="p-8 rounded-[2rem] bg-white border border-black/5 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <HelpCircle size={40} className="text-gray-50 opacity-10" />
            </div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Question</h4>
            <p className="text-lg font-black leading-tight tracking-tight">
              {questions[currentQuestionIndex].text}
            </p>
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest">{questions[currentQuestionIndex].type}</span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest">{questions[currentQuestionIndex].difficulty}</span>
            </div>
          </div>

          {/* Voice Interaction Panel */}
          <div className="p-8 rounded-[2rem] bg-gray-900 border border-white/5 space-y-6 shadow-2xl">
            <button
            onMouseDown={() => setIsAnswering(true)}
            onMouseUp={() => setIsAnswering(false)}
            className={cn(
              "w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-2xl",
              isAnswering ?
              "bg-red-500 text-white scale-95 shadow-red-500/20" :
              "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20"
            )}>
            
              {isAnswering ? <div className="w-3 h-3 bg-white rounded-full animate-ping" /> : <Mic size={20} />}
              {isAnswering ? 'Recording Answer...' : 'Hold to Speak'}
            </button>

            <button
            onClick={handleNextQuestion}
            className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-2">
            
              {currentQuestionIndex === questions.length - 1 ? 'Finish Interview' : 'Next Question'}
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Voice Active</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">AI Thinking</span>
              </div>
            </div>
          </div>

          {/* Real-time Feedback */}
          <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">AI Performance Insight</h4>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                Your explanation of architectural patterns is clear. Try to maintain this confidence level for behavioral questions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>;


  const renderResult = () =>
  <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 py-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/20">
          <Trophy size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Interview Complete!</h2>
          <p className="text-sm text-muted-foreground">Great job! Here is your performance breakdown with {agent.name}.</p>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
      { label: 'Overall Score', value: `${resultData.overall}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Communication', value: `${resultData.communication}%`, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Technical', value: `${resultData.technical}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
      { label: 'Confidence', value: `${resultData.confidence}%`, color: 'text-orange-600', bg: 'bg-orange-50' }].
      map((stat, i) =>
      <div key={i} className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <h4 className={cn("text-3xl font-black", stat.color)}>{stat.value}</h4>
          </div>
      )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <RadarIcon size={18} className="text-emerald-500" />
            Skill Radar
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={resultData.radar}>
                <PolarGrid stroke="#f0f0f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                name="Skills"
                dataKey="A"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.5} />
              
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Timeline */}
        <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm space-y-6">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            Confidence Timeline
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resultData.timeline}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '10px', fontWeight: 700 }} />
              
                <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Feedback Section */}
      <div className="p-8 rounded-[2.5rem] bg-gray-900 text-white space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32" />
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Zap size={18} className="text-yellow-400" />
          Detailed AI Feedback
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Key Strengths</h4>
            <ul className="space-y-3">
              {[
            'Excellent articulation of technical concepts.',
            'Strong problem-solving methodology.',
            'Good eye contact and professional presence.'].
            map((s, i) =>
            <li key={i} className="flex items-start gap-3 text-xs text-gray-300">
                  <CheckCircle2 size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {s}
                </li>
            )}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Areas for Improvement</h4>
            <ul className="space-y-3">
              {[
            'Provide more specific examples in behavioral answers.',
            'Work on reducing filler words during complex explanations.',
            'Improve pacing when discussing system design.'].
            map((s, i) =>
            <li key={i} className="flex items-start gap-3 text-xs text-gray-300">
                  <AlertCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  {s}
                </li>
            )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
        onClick={() => {
          setState('setup');
          setCurrentQuestionIndex(0);
          setTimer(0);
        }}
        className="flex-1 py-4 rounded-2xl border border-black/5 bg-white font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        
          <RotateCcw size={18} />
          Retry Interview
        </button>
        <button
        onClick={onExit}
        className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2">
        
          <BarChart3 size={18} />
          Return to Gym
        </button>
      </div>
    </div>;


  return (
    <div className="min-h-screen">
      {state === 'setup' && renderSetup()}
      {state === 'session' && renderSession()}
      {state === 'result' && renderResult()}
    </div>);

};