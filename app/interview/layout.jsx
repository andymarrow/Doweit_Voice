// app/interview/layout.jsx
import React from 'react';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

export const metadata = {
  title: 'Doweit Interview Room',
  description: 'AI-Powered Technical Interview',
};

export default function InterviewLayout({ children }) {
  return (
    <div className={`w-full ${uiColors.bgPage} text-gray-900 dark:text-white overflow-hidden`}>
      {/* Simple Header */}
      <header className={`h-16 flex items-center px-6 border-b ${uiColors.borderPrimary} bg-white dark:bg-gray-950 z-10 relative`}>
        <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold`}>
                D
            </div>
            <span className="font-semibold text-lg tracking-tight">Doweit Interview</span>
        </div>
      </header>
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
}