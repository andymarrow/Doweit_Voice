// app/agents/recruiter/[agentid]/share/page.jsx
"use client";

import React, { useState } from 'react';
import { FiCopy, FiCheck, FiLinkedin, FiTwitter, FiFacebook } from 'react-icons/fi';
import { uiColors } from '@/app/callagents/_constants/uiConstants';
import { useCallAgent } from '@/app/callagents/[agentid]/_context/CallAgentContext';

export default function SharePage() {
    const agent = useCallAgent();
    const link = `https://doweit.ai/interview/${agent.id}`; // Demo link
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto text-center space-y-8 pt-10">
            <h1 className={`text-3xl font-bold ${uiColors.textPrimary}`}>Share Interview</h1>
            <p className={`${uiColors.textSecondary}`}>Send this link to candidates to start the automated assessment.</p>

            <div className={`p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-lg`}>
                <div className="flex items-center space-x-2 p-2 rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                    <input 
                        type="text" readOnly value={link}
                        className="flex-1 bg-transparent border-none outline-none p-2 text-gray-600 dark:text-gray-300 font-mono text-sm"
                    />
                    <button 
                        onClick={handleCopy}
                        className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${copied ? 'bg-green-500' : 'bg-cyan-600 hover:bg-cyan-700'}`}
                    >
                        {copied ? <span className="flex items-center"><FiCheck className="mr-2"/> Copied</span> : <span className="flex items-center"><FiCopy className="mr-2"/> Copy</span>}
                    </button>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <SocialButton icon={FiLinkedin} label="LinkedIn" color="text-blue-700 bg-blue-100 hover:bg-blue-200" />
                <SocialButton icon={FiTwitter} label="Twitter" color="text-sky-500 bg-sky-100 hover:bg-sky-200" />
                <SocialButton icon={FiFacebook} label="Facebook" color="text-blue-800 bg-blue-100 hover:bg-blue-200" />
            </div>
        </div>
    );
}

function SocialButton({ icon: Icon, label, color }) {
    return (
        <button className={`flex items-center px-6 py-3 rounded-xl font-medium transition-colors ${color}`}>
            <Icon className="mr-2 text-xl" /> {label}
        </button>
    );
}