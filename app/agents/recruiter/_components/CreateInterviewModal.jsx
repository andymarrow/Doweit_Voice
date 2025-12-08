// app/agents/recruiter/_components/CreateInterviewModal.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiX, FiUploadCloud, FiFileText, FiArrowRight, FiCheck, FiLoader, 
    FiCpu, FiClock, FiActivity, FiVolume2, FiImage, FiArrowLeft, FiCode
} from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Constants & Components
import { uiColors, uiAccentClasses } from '../../../callagents/_constants/uiConstants';
import VoiceModal from '@/app/characterai/create/_components/VoiceModal';

// Animation Variants
const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
};

export default function CreateInterviewModal({ isOpen, onClose, mode = 'recruiter' }) {
    const router = useRouter();

    // --- STATE ---
    const [step, setStep] = useState(1); // 1: Brain, 2: Behavior, 3: Persona
    const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        jobTitle: '',
        inputType: 'pdf', // 'pdf' | 'text'
        fileName: null,
        pdfFile: null, // Store actual file object
        textDescription: '',
        systemPrompt: '',
        duration: 15, // minutes
        difficulty: 'Medium', // Casual, Medium, Strict
        selectedVoice: null,
        avatarFile: null,
        avatarPreview: null
    });

    // --- HANDLERS ---

    const handleNext = async () => {
        // STEP 1: CONTEXT -> AI GENERATION
        if (step === 1) {
            // Validation
            if (!formData.jobTitle) return toast.error("Please enter a Job Title");
            if (formData.inputType === 'text' && !formData.textDescription) return toast.error("Please paste the Job Description");
            if (formData.inputType === 'pdf' && !formData.fileName) return toast.error("Please upload a PDF");

            setIsGeneratingPrompt(true);

            try {
                // Call the Ingestion API
                let response;
                
                if (formData.inputType === 'pdf') {
                    const uploadData = new FormData();
                    uploadData.append('file', formData.pdfFile);
                    uploadData.append('jobTitle', formData.jobTitle);

                    response = await fetch('/api/callagents/ingest', {
                        method: 'POST',
                        body: uploadData,
                    });
                } else {
                    response = await fetch('/api/callagents/ingest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jobTitle: formData.jobTitle,
                            textDescription: formData.textDescription
                        })
                    });
                }

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || "AI Generation failed");
                }

                const data = await response.json();
                
                // Update State with AI Prompt
                setFormData(prev => ({ 
                    ...prev, 
                    systemPrompt: data.systemPrompt,
                    // Note: 'data.rubric' is also returned here if you want to store it for later
                }));
                
                toast.success("AI Analysis Complete!");
                setStep(2);

            } catch (error) {
                console.error(error);
                toast.error(error.message || "Failed to analyze Job Description");
            } finally {
                setIsGeneratingPrompt(false);
            }
        } 
        
        // STEP 2: BEHAVIOR -> PERSONA
        else if (step === 2) {
            setStep(3);
        } 
        
        // STEP 3: PERSONA -> SUBMIT
        else if (step === 3) {
            handleSubmit();
        }
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!formData.selectedVoice) return toast.error("Please select a voice");
        
        setIsGeneratingPrompt(true); // Re-use loading state

        try {
            // Construct the final payload for the Creation API
            const payload = {
                name: formData.jobTitle,
                type: mode === 'trainee' ? 'trainee_clone' : 'recruiter',
                
                // Map wizard data to schema JSONB fields
                recruitmentConfig: {
                    jobDescription: formData.inputType === 'text' ? formData.textDescription : "PDF Uploaded",
                    systemPrompt: formData.systemPrompt,
                    difficulty: formData.difficulty,
                    duration: formData.duration
                },
                
                systemPrompt: formData.systemPrompt, // Also save to top-level prompt field

                // Voice Data
                voiceConfig: {
                    voiceId: formData.selectedVoice.voiceId,
                    voiceName: formData.selectedVoice.name,
                    voiceProvider: formData.selectedVoice.provider || formData.selectedVoice.platform,
                    language: formData.selectedVoice.language || 'en'
                },

                // Note: Avatar upload should ideally happen here to Firebase, getting a URL.
                // For this implementation, we are passing the URL if available, or null.
                // (Client-side file upload logic omitted for brevity, usually handled by a separate utility)
            };

            const response = await fetch('/api/callagents/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Creation failed");
            }
            
            const newAgent = await response.json();

            toast.success(mode === 'trainee' ? "Training Agent Ready!" : "Interview Agent Published!");
            onClose();
            
            // Redirect based on mode
            if (mode === 'trainee') {
                router.push(`/agents/recruited/${newAgent.id}`);
            } else {
                router.push(`/agents/recruiter/${newAgent.id}/settings`);
            }

        } catch (error) {
            console.error(error);
            toast.error(error.message);
        } finally {
            setIsGeneratingPrompt(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ 
                ...prev, 
                fileName: file.name,
                pdfFile: file // Store the actual file object for FormData
            }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, avatarFile: file, avatarPreview: preview }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onClose}>
            <motion.div 
                className={`relative w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden ${uiColors.bgPrimary} flex flex-col`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- HEADER --- */}
                <div className={`flex flex-col border-b ${uiColors.borderPrimary} bg-white/50 dark:bg-black/20 backdrop-blur-md sticky top-0 z-10`}>
                    <div className="flex items-center justify-between p-6">
                        <div>
                            <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>
                                {mode === 'trainee' ? 'Create Practice Partner' : 'New Interview Agent'}
                            </h2>
                            <p className={`${uiColors.textSecondary} text-sm mt-1`}>
                                Step {step} of 3: {step === 1 ? 'Context' : step === 2 ? 'Behavior' : 'Persona'}
                            </p>
                        </div>
                        <button onClick={onClose} className={`p-2 rounded-xl ${uiColors.hoverBgSubtle} transition-colors`}>
                            <FiX className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600"
                            initial={{ width: '33%' }}
                            animate={{ width: `${step * 33.33}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* --- CONTENT BODY --- */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        
                        {/* STEP 1: CONTEXT */}
                        {step === 1 && (
                            <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8 max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-2`}>What are we hiring for?</h3>
                                    <p className={`${uiColors.textSecondary}`}>Provide the role details to generate the AI brain.</p>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${uiColors.textSecondary}`}>Position Title</label>
                                        <div className="relative">
                                            <FiCpu className="absolute top-3.5 left-4 text-gray-400 w-5 h-5" />
                                            <input 
                                                type="text" 
                                                placeholder="e.g. Senior Product Manager" 
                                                value={formData.jobTitle}
                                                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                                                className={`w-full pl-12 p-3.5 rounded-xl border ${uiColors.borderPrimary} bg-transparent outline-none focus:ring-2 ring-cyan-500/50 transition-all ${uiColors.textPrimary} text-lg`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-bold uppercase tracking-wider mb-4 ${uiColors.textSecondary}`}>Job Knowledge</label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* PDF Option */}
                                            <div 
                                                onClick={() => setFormData({...formData, inputType: 'pdf'})}
                                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.inputType === 'pdf' ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/10' : `${uiColors.borderPrimary} hover:border-gray-400`}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-3 rounded-full ${formData.inputType === 'pdf' ? 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                                        <FiUploadCloud className="w-6 h-6" />
                                                    </div>
                                                    {formData.inputType === 'pdf' && <FiCheck className="text-cyan-500 w-6 h-6" />}
                                                </div>
                                                <h4 className={`font-bold ${uiColors.textPrimary}`}>Upload PDF</h4>
                                                <p className="text-xs text-gray-500 mt-1">Parse JD directly from file.</p>
                                            </div>

                                            {/* Text Option */}
                                            <div 
                                                onClick={() => setFormData({...formData, inputType: 'text'})}
                                                className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.inputType === 'text' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : `${uiColors.borderPrimary} hover:border-gray-400`}`}
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className={`p-3 rounded-full ${formData.inputType === 'text' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                                        <FiFileText className="w-6 h-6" />
                                                    </div>
                                                    {formData.inputType === 'text' && <FiCheck className="text-purple-500 w-6 h-6" />}
                                                </div>
                                                <h4 className={`font-bold ${uiColors.textPrimary}`}>Paste Text</h4>
                                                <p className="text-xs text-gray-500 mt-1">Copy-paste requirements manually.</p>
                                            </div>
                                        </div>

                                        {/* Input Area */}
                                        <div className="mt-4">
                                            {formData.inputType === 'pdf' ? (
                                                <div className={`relative h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center transition-colors ${formData.fileName ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : `${uiColors.borderPrimary} hover:bg-gray-50 dark:hover:bg-gray-800/50`}`}>
                                                    {formData.fileName ? (
                                                        <div className="flex flex-col items-center text-green-600 z-10">
                                                            <FiCheck className="w-10 h-10 mb-2" />
                                                            <span className="font-semibold text-lg">{formData.fileName}</span>
                                                            <button onClick={(e) => {e.stopPropagation(); setFormData({...formData, fileName: null, pdfFile: null})}} className="text-sm underline mt-2 hover:text-green-700">Remove File</button>
                                                        </div>
                                                    ) : (
                                                        <div className="z-10 pointer-events-none">
                                                            <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium">Browse Files</span>
                                                            <p className={`text-sm mt-4 ${uiColors.textSecondary}`}>or drag and drop PDF here</p>
                                                        </div>
                                                    )}
                                                    <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleFileChange} disabled={!!formData.fileName} />
                                                </div>
                                            ) : (
                                                <textarea 
                                                    placeholder="Paste the full job description here..."
                                                    value={formData.textDescription}
                                                    onChange={(e) => setFormData({...formData, textDescription: e.target.value})}
                                                    className={`w-full h-48 p-4 rounded-2xl border ${uiColors.borderPrimary} bg-transparent outline-none resize-none focus:ring-2 ring-purple-500/50 text-sm ${uiColors.textPrimary}`}
                                                ></textarea>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: BEHAVIOR */}
                        {step === 2 && (
                            <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8 max-w-3xl mx-auto">
                                <div className="text-center mb-6">
                                    <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-2`}>Configure Behavior</h3>
                                    <p className={`${uiColors.textSecondary}`}>Fine-tune how the AI conducts the interview.</p>
                                </div>

                                {/* Prompt Editor */}
                                <div className={`p-1 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600`}>
                                    <div className={`bg-white dark:bg-gray-900 rounded-xl p-6`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <label className={`text-sm font-bold uppercase tracking-wider flex items-center ${uiColors.textPrimary}`}>
                                                <FiCode className="mr-2 text-blue-500" /> System Prompt
                                            </label>
                                            <span className="text-xs font-mono text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">Auto-Generated</span>
                                        </div>
                                        <textarea 
                                            value={formData.systemPrompt}
                                            onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                                            rows={10}
                                            className={`w-full p-4 rounded-xl border ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-950 outline-none focus:ring-2 ring-blue-500/50 text-sm font-mono leading-relaxed ${uiColors.textPrimary}`}
                                        />
                                    </div>
                                </div>

                                {/* Settings Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className={`p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                                        <label className={`block text-sm font-medium mb-3 ${uiColors.textSecondary}`}><FiClock className="inline mr-2"/>Interview Duration</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="5" max="60" step="5"
                                                value={formData.duration}
                                                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
                                            />
                                            <span className={`text-lg font-bold w-16 text-right ${uiColors.textPrimary}`}>{formData.duration}m</span>
                                        </div>
                                    </div>
                                    <div className={`p-5 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                                        <label className={`block text-sm font-medium mb-3 ${uiColors.textSecondary}`}><FiActivity className="inline mr-2"/>Strictness Level</label>
                                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                                            {['Casual', 'Medium', 'Strict'].map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setFormData({...formData, difficulty: level})}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${formData.difficulty === level ? 'bg-white dark:bg-gray-700 shadow text-cyan-600' : 'text-gray-500'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: PERSONA */}
                        {step === 3 && (
                            <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-8 max-w-3xl mx-auto">
                                <div className="text-center mb-8">
                                    <h3 className={`text-xl font-bold ${uiColors.textPrimary} mb-2`}>Design Persona</h3>
                                    <p className={`${uiColors.textSecondary}`}>Give your agent a face and a voice.</p>
                                </div>

                                <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className={`relative w-40 h-40 rounded-full border-4 border-dashed ${uiColors.borderPrimary} flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 hover:border-cyan-500 transition-colors group cursor-pointer`}>
                                            {formData.avatarPreview ? (
                                                <Image src={formData.avatarPreview} alt="Preview" fill className="object-cover" />
                                            ) : (
                                                <div className="text-center text-gray-400 group-hover:text-cyan-500">
                                                    <FiImage className="w-10 h-10 mx-auto mb-2" />
                                                    <span className="text-xs font-bold">Upload Photo</span>
                                                </div>
                                            )}
                                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    </div>

                                    {/* Voice Card */}
                                    <div 
                                        onClick={() => setIsVoiceModalOpen(true)}
                                        className={`w-full md:w-80 p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.selectedVoice ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : `${uiColors.borderPrimary} hover:border-gray-400 bg-white dark:bg-gray-900`}`}
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 rounded-full ${formData.selectedVoice ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <FiVolume2 className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold uppercase text-gray-400">Voice Engine</span>
                                        </div>
                                        
                                        {formData.selectedVoice ? (
                                            <div>
                                                <h4 className={`text-lg font-bold ${uiColors.textPrimary}`}>{formData.selectedVoice.name}</h4>
                                                <p className="text-sm text-purple-600 mt-1 font-medium">{formData.selectedVoice.provider}</p>
                                                <div className="mt-4 flex gap-2">
                                                    <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded border border-purple-200 dark:border-purple-800">{formData.selectedVoice.language || 'English'}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <h4 className={`text-lg font-bold ${uiColors.textPrimary}`}>Select Voice</h4>
                                                <p className={`${uiColors.textSecondary} text-sm mt-1`}>Choose from Vapi, ElevenLabs, or Google.</p>
                                            </div>
                                        )}
                                        
                                        <button className={`mt-6 w-full py-2 rounded-lg font-bold text-sm ${formData.selectedVoice ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            Browse Library
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

                {/* --- FOOTER: ACTIONS --- */}
                <div className={`p-6 border-t ${uiColors.borderPrimary} bg-white dark:bg-gray-950 flex justify-between items-center z-10`}>
                    {isGeneratingPrompt ? (
                        <div className="flex items-center text-cyan-600 animate-pulse font-medium">
                            <FiLoader className="animate-spin mr-3 w-5 h-5" /> Analyzing Job Description...
                        </div>
                    ) : (
                        <>
                            {step > 1 ? (
                                <button onClick={handleBack} className={`flex items-center px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}>
                                    <FiArrowLeft className="mr-2" /> Back
                                </button>
                            ) : <div></div>}

                            <button 
                                onClick={handleNext} 
                                className={`flex items-center px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-transform ${uiColors.accentPrimaryGradient}`}
                            >
                                {step === 3 ? (mode === 'trainee' ? 'Launch Training' : 'Publish Agent') : 'Continue'} 
                                <FiArrowRight className="ml-2" />
                            </button>
                        </>
                    )}
                </div>

            </motion.div>

            {/* Reuse Existing Voice Modal */}
            <VoiceModal 
                isOpen={isVoiceModalOpen} 
                onClose={() => setIsVoiceModalOpen(false)}
                onVoiceSelect={(voice) => setFormData(prev => ({ ...prev, selectedVoice: voice }))}
            />
        </div>
    );
}