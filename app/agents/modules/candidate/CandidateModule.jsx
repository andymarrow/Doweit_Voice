"use client";
import React, { useState } from 'react';
import {
  CheckCircle2 } from
'lucide-react';
import InterviewIntroduction from './InterviewIntroduction';
import CandidateInfoForm from './CandidateInfoForm';
import DeviceCheck from './DeviceCheck';
import AiInterviewSession from './AiInterviewSession';



export const CandidateModule = () => {
  const [step, setStep] = useState('intro');

  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'intro' &&
      <InterviewIntroduction onStart={() => setStep('form')} />
      }

      {step === 'form' &&
      <CandidateInfoForm
        onNext={() => setStep('check')}
        onBack={() => setStep('intro')} />

      }

      {step === 'check' &&
      <DeviceCheck
        onNext={() => setStep('session')}
        onBack={() => setStep('form')} />

      }

      {step === 'session' &&
      <AiInterviewSession onComplete={() => setStep('complete')} />
      }

      {step === 'complete' &&
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
      }
    </div>);

};
