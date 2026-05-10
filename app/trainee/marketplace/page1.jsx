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
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_INTERVIEWS = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'TechFlow Inc.',
    duration: '30 Minutes'
  }
];

export default function CandidateInterviewPage() {
  const [step, setStep] = useState('intro');
  const [file, setFile] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isAiSpeaking, setIsAiSpeaking] = useState(true);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [checks, setChecks] = useState({
    microphone: 'pending',
    camera: 'pending',
    internet: 'pending',
    environment: 'pending'
  });
  const [micLevel, setMicLevel] = useState(0);

  const questions = [
    "Welcome! I'm Alex, your AI interviewer today. To start, could you please introduce yourself and tell me about your background in frontend development?",
    "That's interesting. Can you describe a complex technical challenge you faced with React and how you resolved it?",
    "How do you approach optimizing web performance for large-scale applications?",
    "Tell me about a time you had to collaborate with a difficult stakeholder. What was the outcome?",
    "Finally, where do you see yourself in the next 5 years in terms of technical growth?"
  ];

  const interview = MOCK_INTERVIEWS[0];

  useEffect(() => {
    if (step === 'session') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
      }, 1000);

      const sequence = async () => {
        setIsAiSpeaking(true);
        await new Promise((r) => setTimeout(r, 3000));
        setIsAiSpeaking(false);

        await new Promise((r) => setTimeout(r, 1000));
        setIsCandidateSpeaking(true);
        await new Promise((r) => setTimeout(r, 8000));
        setIsCandidateSpeaking(false);

        await new Promise((r) => setTimeout(r, 2000));
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      };

      sequence();

      const warningTimer = setTimeout(() => {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      }, 15000);

      return () => {
        clearInterval(timer);
        clearTimeout(warningTimer);
      };
    }
  }, [currentQuestionIndex, step]);

  useEffect(() => {
    if (step === 'check') {
      const runChecks = async () => {
        setChecks((prev) => ({ ...prev, internet: 'testing' }));
        await new Promise((r) => setTimeout(r, 1500));
        setChecks((prev) => ({ ...prev, internet: 'success' }));

        setChecks((prev) => ({ ...prev, camera: 'testing' }));
        await new Promise((r) => setTimeout(r, 1500));
        setChecks((prev) => ({ ...prev, camera: 'success' }));

        setChecks((prev) => ({ ...prev, microphone: 'testing' }));
        const interval = setInterval(() => {
          setMicLevel(Math.random() * 100);
        }, 100);
        await new Promise((r) => setTimeout(r, 2000));
        clearInterval(interval);
        setMicLevel(0);
        setChecks((prev) => ({ ...prev, microphone: 'success' }));

        setChecks((prev) => ({ ...prev, environment: 'testing' }));
        await new Promise((r) => setTimeout(r, 1500));
        setChecks((prev) => ({ ...prev, environment: 'success' }));
      };

      runChecks();
    }
  }, [step]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

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

  const allSuccess = Object.values(checks).every((s) => s === 'success');

  // Interview Introduction Component
  const renderIntro = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="bg-black p-8 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{interview.title}</h1>
            <p className="text-gray-400 mt-1">{interview.department} · AI Voice Interview</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                </div>
                <p className="font-bold">{interview.duration}</p>
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

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep('form')}
                className="flex-1 bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                Start Application <ChevronRight size={20} />
              </button>
              <button className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all">
                Cancel
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

  // Candidate Info Form Component
  const renderForm = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Personal Information</h1>
              <p className="text-gray-500 text-sm mt-1">Please provide your details to begin the interview process.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep('check'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required type="text" placeholder="John Doe" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required type="email" placeholder="john@example.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required type="tel" placeholder="+1 (555) 000-0000" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input required type="text" placeholder="United States" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Years of Experience</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <select required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 appearance-none">
                      <option value="">Select Experience</option>
                      <option value="0-1">0-1 Years</option>
                      <option value="1-3">1-3 Years</option>
                      <option value="3-5">3-5 Years</option>
                      <option value="5-10">5-10 Years</option>
                      <option value="10+">10+ Years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Resume (PDF/DOCX)</label>
                {!file ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm font-bold text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-400">PDF or DOCX (Max 10MB)</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileChange} />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg text-emerald-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-900 truncate max-w-[200px]">{file.name}</p>
                        <p className="text-xs text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="p-2 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Portfolio Link (Optional)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="url" placeholder="https://portfolio.com" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">LinkedIn Profile (Optional)</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="url" placeholder="https://linkedin.com/in/username" className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setStep('intro')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                  <ChevronLeft size={20} /> Back
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-black text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
                  Continue to Device Check <ChevronRight size={20} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  // Device Check Component
  const renderDeviceCheck = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Device & Environment Check</h1>
              <p className="text-gray-500 text-sm mt-1">Let's make sure your setup is ready for the AI interview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-800">
                  {checks.camera === 'success' ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <img
                        src="https://picsum.photos/seed/candidate/640/360"
                        alt="Camera Preview"
                        className="w-full h-full object-cover opacity-80"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Preview</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Face Detected</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                      <Camera size={48} className={checks.camera === 'testing' ? 'animate-pulse' : ''} />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        {checks.camera === 'testing' ? 'Initializing Camera...' : 'Camera Access Required'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mic size={16} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Microphone Level</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Testing...</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500"
                      animate={{ width: `${micLevel}%` }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'internet', label: 'Internet Stability', icon: Wifi, desc: 'Checking connection speed & latency' },
                  { id: 'camera', label: 'Camera Availability', icon: Camera, desc: 'Verifying face detection & lighting' },
                  { id: 'microphone', label: 'Audio Input', icon: Mic, desc: 'Testing microphone sensitivity' },
                  { id: 'environment', label: 'Environment Check', icon: Volume2, desc: 'Analyzing background noise level' }
                ].map((item) => (
                  <div key={item.id} className={`p-4 rounded-2xl border transition-all ${checks[item.id] === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${checks[item.id] === 'success' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {checks[item.id] === 'testing' && <RefreshCw size={18} className="text-emerald-500 animate-spin" />}
                        {checks[item.id] === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
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
                onClick={() => setStep('form')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                <ChevronLeft size={20} /> Back
              </button>
              <div className="flex gap-3 flex-1">
                <button
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  <RefreshCw size={16} /> Retry Check
                </button>
                <button
                  onClick={() => setStep('session')}
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

  // AI Interview Session Component
  const renderSession = () => (
    <div className="min-h-screen bg-black text-white flex flex-col">
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

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 mb-12">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${isAiSpeaking ? 'scale-110 border-indigo-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]' : ''}`}>
                  <User size={80} className="text-white/20" />

                  {isAiSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) =>
                        <motion.div
                          key={i}
                          className="w-1.5 bg-indigo-500 rounded-full"
                          animate={{ height: [15, 60, 30, 70, 20][i - 1] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                    {isAiSpeaking ? (
                      <>
                        <Volume2 size={12} className="text-indigo-500" />
                        Alex Speaking
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        Alex Listening
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold">Alex</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">AI Interviewer</p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-40 h-40 md:w-56 md:h-56 rounded-full bg-gray-900 border-2 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-500 ${isCandidateSpeaking ? 'scale-110 border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]' : ''}`}>
                  <img
                    src="https://picsum.photos/seed/candidate/400/400"
                    alt="Candidate"
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isCandidateSpeaking ? 'opacity-80' : 'opacity-40'}`}
                    referrerPolicy="no-referrer"
                  />

                  {isCandidateSpeaking && (
                    <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/20">
                      {[1, 2, 3, 4, 5].map((i) =>
                        <motion.div
                          key={i}
                          className="w-1.5 bg-emerald-500 rounded-full"
                          animate={{ height: [15, 60, 30, 70, 20][i - 1] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
                  <p className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                    {isCandidateSpeaking ? (
                      <>
                        <Mic size={12} className="text-emerald-500" />
                        You Speaking
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-white/20 rounded-full"></div>
                        You Listening
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-bold">You</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Candidate</p>
              </div>
            </div>
          </div>

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
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all ${isMuted ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
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
              onClick={() => setStep('complete')}
              className="px-8 py-3 rounded-2xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-500/20">
              End Interview
            </button>
          </div>
        </div>
      </main>

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

  // Complete Component
  const renderComplete = () => (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-12 shadow-xl shadow-black/5 text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Interview Completed!</h2>
          <p className="text-muted-foreground">Thank you for your time. Your responses are being analyzed by our AI engine.</p>
        </div>
        
        <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 text-left space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Next Steps</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">1</div>
              AI generates evaluation report
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">2</div>
              Recruiter reviews your performance
            </li>
            <li className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">3</div>
              You'll receive an update via email
            </li>
          </ul>
        </div>

        <button
          onClick={() => setStep('intro')}
          className="w-full py-4 rounded-2xl bg-gray-900 text-white font-bold hover:bg-black transition-all">
          Close Window
        </button>
      </div>
    </div>
  );

  // Render current step
  switch (step) {
    case 'intro':
      return renderIntro();
    case 'form':
      return renderForm();
    case 'check':
      return renderDeviceCheck();
    case 'session':
      return renderSession();
    case 'complete':
      return renderComplete();
    default:
      return renderIntro();
  }
}
