"use client";
import React, { useState, useEffect } from 'react';
import {
  Mic,
  Camera,
  Wifi,

  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Volume2 } from

'lucide-react';
import { motion } from 'framer-motion';






export default function DeviceCheck({ onNext, onBack }) {
  const [checks, setChecks] = useState({
    microphone: 'pending', // pending, testing, success, error
    camera: 'pending',
    internet: 'pending',
    environment: 'pending'
  });

  const [micLevel, setMicLevel] = useState(0);

  useEffect(() => {
    // Simulate checks
    const runChecks = async () => {
      // Internet Check
      setChecks((prev) => ({ ...prev, internet: 'testing' }));
      await new Promise((r) => setTimeout(r, 1500));
      setChecks((prev) => ({ ...prev, internet: 'success' }));

      // Camera Check
      setChecks((prev) => ({ ...prev, camera: 'testing' }));
      await new Promise((r) => setTimeout(r, 1500));
      setChecks((prev) => ({ ...prev, camera: 'success' }));

      // Microphone Check
      setChecks((prev) => ({ ...prev, microphone: 'testing' }));
      const interval = setInterval(() => {
        setMicLevel(Math.random() * 100);
      }, 100);
      await new Promise((r) => setTimeout(r, 2000));
      clearInterval(interval);
      setMicLevel(0);
      setChecks((prev) => ({ ...prev, microphone: 'success' }));

      // Environment Check
      setChecks((prev) => ({ ...prev, environment: 'testing' }));
      await new Promise((r) => setTimeout(r, 1500));
      setChecks((prev) => ({ ...prev, environment: 'success' }));
    };

    runChecks();
  }, []);

  const allSuccess = Object.values(checks).every((s) => s === 'success');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Device & Environment Check</h1>
              <p className="text-gray-500 text-sm mt-1">Let's make sure your setup is ready for the AI interview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Camera Preview */}
              <div className="space-y-4">
                <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden relative border border-gray-800">
                  {checks.camera === 'success' ?
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <img
                      src="https://picsum.photos/seed/candidate/640/360"
                      alt="Camera Preview"
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer" />
                    
                      <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-full border border-white/10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live Preview</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-lg border border-white/10">
                          <span className="text-[10px] font-bold text-white uppercase tracking-wider">Face Detected</span>
                        </div>
                      </div>
                    </div> :

                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                      <Camera size={48} className={checks.camera === 'testing' ? 'animate-pulse' : ''} />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        {checks.camera === 'testing' ? 'Initializing Camera...' : 'Camera Access Required'}
                      </p>
                    </div>
                  }
                </div>

                {/* Mic Level */}
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
                      transition={{ type: 'spring', bounce: 0, duration: 0.1 }} />
                    
                  </div>
                </div>
              </div>

              {/* Right Column: Check List */}
              <div className="space-y-4">
                {[
                { id: 'internet', label: 'Internet Stability', icon: Wifi, desc: 'Checking connection speed & latency' },
                { id: 'camera', label: 'Camera Availability', icon: Camera, desc: 'Verifying face detection & lighting' },
                { id: 'microphone', label: 'Audio Input', icon: Mic, desc: 'Testing microphone sensitivity' },
                { id: 'environment', label: 'Environment Check', icon: Volume2, desc: 'Analyzing background noise level' }].
                map((item) =>
                <div key={item.id} className={`p-4 rounded-2xl border transition-all ${checks[item.id] === 'success' ?
                'bg-emerald-50 border-emerald-100' :
                'bg-white border-gray-100'}`
                }>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${checks[item.id] === 'success' ?
                      'bg-emerald-500 text-white' :
                      'bg-gray-100 text-gray-400'}`
                      }>
                          <item.icon size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{item.label}</p>
                          <p className="text-[10px] text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {checks[item.id] === 'testing' &&
                      <RefreshCw size={18} className="text-emerald-500 animate-spin" />
                      }
                        {checks[item.id] === 'success' &&
                      <CheckCircle2 size={18} className="text-emerald-500" />
                      }
                        {checks[item.id] === 'pending' &&
                      <div className="w-4 h-4 rounded-full border-2 border-gray-100"></div>
                      }
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-bold">Pro Tip:</span> Ensure you are in a well-lit room and using headphones for the best experience.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-8 flex items-center justify-between gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                
                <ChevronLeft size={20} /> Back
              </button>
              <div className="flex gap-3 flex-1">
                <button
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                  
                  <RefreshCw size={16} /> Retry Check
                </button>
                <button
                  onClick={onNext}
                  disabled={!allSuccess}
                  className="flex-[2] bg-black text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed">
                  
                  Start Interview <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

}
