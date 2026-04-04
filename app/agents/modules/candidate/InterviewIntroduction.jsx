import React from 'react';
import {
  Briefcase,
  Clock,
  Video,
  Mic,
  ShieldCheck,
  Wifi,
  Volume2,
  Camera,
  AlertCircle,
  ChevronRight } from
'lucide-react';


import { MOCK_INTERVIEWS } from '../../data/demoData';






export default function InterviewIntroduction({ id, onStart }) {
  const interview = MOCK_INTERVIEWS.find((i) => i.id === id) || {
    title: 'Senior Frontend Engineer',
    department: 'TechFlow Inc.',
    duration: '30 Minutes'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-black p-8 text-white text-center">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Briefcase className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{interview.title}</h1>
            <p className="text-gray-400 mt-1">{interview.department} • AI Voice Interview</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                </div>
                <p className="font-bold">{interview.duration || '30 Minutes'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Video size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Format</span>
                </div>
                <p className="font-bold">AI Voice Agent</p>
              </div>
            </div>

            {/* Permissions Required */}
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

            {/* Instructions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Important Instructions</h3>
              <div className="space-y-3">
                {[
                { icon: Wifi, text: 'Ensure a stable internet connection throughout the session.' },
                { icon: Volume2, text: 'Find a quiet environment with minimal background noise.' },
                { icon: Camera, text: 'Keep your camera enabled for anti-cheat monitoring.' },
                { icon: AlertCircle, text: 'Do not switch browser tabs or minimize the window.' }].
                map((item, idx) =>
                <div key={idx} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1 bg-gray-100 rounded-lg text-gray-500">
                      <item.icon size={14} />
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={onStart}
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
          Powered by <span className="font-bold text-gray-600">RecruitAI</span> • Secure & Private
        </p>
      </div>
    </div>);

}