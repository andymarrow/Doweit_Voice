// app/agents/recruiter/[agentid]/settings/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FiSave, FiVolume2, FiUploadCloud, FiDollarSign, FiGlobe, 
    FiLock, FiFileText, FiCheck, FiLoader, FiEdit3
} from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Context & Constants
import { useCallAgent } from '@/app/callagents/[agentid]/_context/CallAgentContext';
import { uiColors, sectionVariants } from '@/app/callagents/_constants/uiConstants';

// Reusable Components
import VoiceModal from '@/app/characterai/create/_components/VoiceModal'; // Adjust path if moved

export default function InterviewSettingsPage() {
    const agent = useCallAgent(); // Get current agent data
    
    // Local State for Form
    const [formData, setFormData] = useState({
        name: agent.name || '',
        description: agent.recruitmentConfig?.jobDescription || '', // Assuming this structure
        isMarketplaceEnabled: false,
        priceOwner: 50,
        priceTrainee: 10,
        avatarUrl: agent.avatarUrl || null,
        voiceConfig: agent.voiceConfig || { voiceName: 'Default', voiceProvider: 'vapi' }
    });

    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Handlers
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleVoiceSelect = (voice) => {
        console.log("Selected Voice:", voice);
        setFormData(prev => ({
            ...prev,
            voiceConfig: {
                voiceId: voice.voiceId,
                voiceName: voice.name,
                voiceProvider: voice.platform || voice.provider,
                // Add avatar if available from voice object
            }
        }));
        setIsVoiceModalOpen(false);
        toast.success(`Voice changed to ${voice.name}`);
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Simulate API Call
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Settings saved successfully!");
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto pb-10 space-y-8">
            
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Configuration</h1>
                    <p className={`text-sm ${uiColors.textSecondary}`}>Manage how your AI Interviewer behaves and appears.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center px-6 py-2 rounded-lg font-semibold text-white shadow-lg transition-all ${uiColors.accentPrimaryGradient} ${isSaving ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
                >
                    {isSaving ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                    Save Changes
                </button>
            </div>

            {/* --- 1. BASIC IDENTITY --- */}
            <motion.div 
                className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                variants={sectionVariants} initial="hidden" animate="visible"
            >
                <h2 className={`text-lg font-semibold mb-4 flex items-center ${uiColors.textPrimary}`}>
                    <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mr-3 text-sm">1</span>
                    Identity & Persona
                </h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Avatar Upload */}
                    <div className="flex-shrink-0 flex flex-col items-center space-y-3">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center group cursor-pointer hover:border-cyan-500 transition-colors">
                            {formData.avatarUrl ? (
                                <Image src={formData.avatarUrl} alt="Avatar" fill className="object-cover" />
                            ) : (
                                <span className="text-2xl font-bold text-gray-400">{formData.name.charAt(0)}</span>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                                Change
                            </div>
                        </div>
                        <span className={`text-xs ${uiColors.textSecondary}`}>AI Avatar</span>
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Internal Agent Name</label>
                            <input 
                                type="text" 
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className={`w-full p-2.5 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} outline-none focus:ring-2 ring-cyan-500/30 transition-all ${uiColors.textPrimary}`}
                            />
                        </div>
                        
                        {/* Voice Selector */}
                        <div>
                            <label className={`block text-sm font-medium mb-1 ${uiColors.textSecondary}`}>Interviewer Voice</label>
                            <div className={`flex items-center justify-between p-3 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                                <div className="flex items-center">
                                    <div className={`p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 mr-3`}>
                                        <FiVolume2 />
                                    </div>
                                    <div>
                                        <div className={`text-sm font-semibold ${uiColors.textPrimary}`}>{formData.voiceConfig.voiceName}</div>
                                        <div className={`text-xs ${uiColors.textSecondary} uppercase`}>{formData.voiceConfig.voiceProvider}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setIsVoiceModalOpen(true)}
                                    className={`text-xs font-medium text-cyan-600 dark:text-purple-400 hover:underline`}
                                >
                                    Change Voice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* --- 2. JOB CONTEXT (THE BRAIN) --- */}
            <motion.div 
                className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                variants={sectionVariants} initial="hidden" animate="visible"
            >
                <h2 className={`text-lg font-semibold mb-4 flex items-center ${uiColors.textPrimary}`}>
                    <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 flex items-center justify-center mr-3 text-sm">2</span>
                    Job Context (The Brain)
                </h2>

                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className={`block text-sm font-medium ${uiColors.textSecondary}`}>Job Description & Requirements</label>
                            <button className={`text-xs flex items-center text-cyan-600 dark:text-purple-400 hover:underline`}>
                                <FiUploadCloud className="mr-1" /> Update PDF
                            </button>
                        </div>
                        <textarea 
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            rows={6}
                            className={`w-full p-3 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} outline-none focus:ring-2 ring-cyan-500/30 transition-all text-sm ${uiColors.textPrimary} resize-none`}
                            placeholder="Paste the full job description here. The AI will use this to generate questions."
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                            <FiCheck className="mr-1 text-green-500" /> 
                            <span>AI Evaluation Rubric will be auto-generated from this text.</span>
                        
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* --- 3. MARKETPLACE SETTINGS --- */}
            <motion.div 
                className={`p-6 rounded-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm`}
                variants={sectionVariants} initial="hidden" animate="visible"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold flex items-center ${uiColors.textPrimary}`}>
                        <span className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center mr-3 text-sm">3</span>
                        Marketplace Settings
                    </h2>
                    
                    {/* Toggle Switch */}
                    <div className="flex items-center">
                        <span className={`text-sm mr-3 ${uiColors.textSecondary}`}>List for Sale</span>
                        <button 
                            onClick={() => handleChange('isMarketplaceEnabled', !formData.isMarketplaceEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isMarketplaceEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${formData.isMarketplaceEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                {formData.isMarketplaceEnabled && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: 'auto' }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
                    >
                        {/* Owner Credential */}
                        <div className={`p-4 rounded-xl border border-dashed ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-900/50`}>
                            <div className="flex items-center mb-2">
                                <FiLock className="text-orange-500 mr-2" />
                                <span className={`font-semibold ${uiColors.textPrimary}`}>Owner Credential</span>
                            </div>
                            <p className={`text-xs mb-3 ${uiColors.textSecondary}`}>Buyer gets full cloning rights, prompt visibility, and configuration access.</p>
                            <div className="flex items-center">
                                <span className={`text-lg font-bold mr-2 ${uiColors.textPrimary}`}>Tokens:</span>
                                <input 
                                    type="number" 
                                    value={formData.priceOwner}
                                    onChange={(e) => handleChange('priceOwner', e.target.value)}
                                    className={`w-24 p-1.5 rounded border ${uiColors.borderPrimary} ${uiColors.bgPrimary} text-center font-mono`}
                                />
                            </div>
                        </div>

                        {/* Train-Only Credential */}
                        <div className={`p-4 rounded-xl border border-dashed ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-900/50`}>
                            <div className="flex items-center mb-2">
                                <FiGlobe className="text-blue-500 mr-2" />
                                <span className={`font-semibold ${uiColors.textPrimary}`}>Train-Only Credential</span>
                            </div>
                            <p className={`text-xs mb-3 ${uiColors.textSecondary}`}>Buyer can only practice interviews. Logic and Prompts are hidden.</p>
                            <div className="flex items-center">
                                <span className={`text-lg font-bold mr-2 ${uiColors.textPrimary}`}>Tokens:</span>
                                <input 
                                    type="number" 
                                    value={formData.priceTrainee}
                                    onChange={(e) => handleChange('priceTrainee', e.target.value)}
                                    className={`w-24 p-1.5 rounded border ${uiColors.borderPrimary} ${uiColors.bgPrimary} text-center font-mono`}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* --- Voice Selection Modal --- */}
            <VoiceModal 
                isOpen={isVoiceModalOpen} 
                onClose={() => setIsVoiceModalOpen(false)}
                onVoiceSelect={handleVoiceSelect}
                // Optional: Pass agentId if needed for cloning logic inside modal
                agentId={agent.id}
            />

        </div>
    );
}