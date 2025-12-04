// app/agents/recruiter/[agentid]/rubric/page.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTrash2, FiSave, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { uiColors, itemVariants } from '@/app/callagents/_constants/uiConstants';
import { toast } from 'react-hot-toast';

export default function RubricPage() {
    const [criteria, setCriteria] = useState([
        { id: 1, name: "React Proficiency", description: "Assess understanding of Hooks, Context API, and Re-rendering cycles.", weight: "High", type: "Score 1-10" },
        { id: 2, name: "Communication Style", description: "Check if the candidate answers concisely using the STAR method.", weight: "Medium", type: "Pass/Fail" },
        { id: 3, name: "System Design", description: "Ability to design scalable components.", weight: "High", type: "Score 1-10" },
    ]);

    const addCriteria = () => {
        const newId = Date.now();
        setCriteria([
            ...criteria, 
            { id: newId, name: "", description: "", weight: "Medium", type: "Score 1-10" }
        ]);
        // Scroll to bottom logic could go here
    };

    const removeCriteria = (id) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const updateCriteria = (id, field, value) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const handleSave = () => {
        toast.success("Rubric saved successfully!");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Evaluation Rubric</h1>
                    <p className={`${uiColors.textSecondary} mt-1`}>
                        Define the criteria the AI uses to score candidates. Be specific in descriptions.
                    </p>
                </div>
                <button 
                    onClick={handleSave}
                    className={`flex items-center px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-transform active:scale-95 ${uiColors.accentPrimaryGradient}`}
                >
                    <FiSave className="mr-2" /> Save Changes
                </button>
            </div>

            {/* --- CRITERIA LIST --- */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {criteria.map((item, index) => (
                        <RubricCard 
                            key={item.id} 
                            item={item} 
                            index={index} 
                            onUpdate={updateCriteria} 
                            onRemove={removeCriteria} 
                        />
                    ))}
                </AnimatePresence>
                
                {criteria.length === 0 && (
                    <div className="p-10 text-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <p className={uiColors.textSecondary}>No criteria defined yet.</p>
                    </div>
                )}
            </div>

            {/* --- ADD BUTTON --- */}
            <motion.button 
                layout
                onClick={addCriteria} 
                className={`w-full py-4 border-2 border-dashed ${uiColors.borderPrimary} rounded-2xl text-gray-500 hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/10 transition-all flex items-center justify-center font-bold text-lg`}
            >
                <FiPlus className="mr-2" /> Add New Criteria
            </motion.button>
        </div>
    );
}

// --- SUB-COMPONENT: RUBRIC CARD ---
function RubricCard({ item, index, onUpdate, onRemove }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`group relative p-6 rounded-2xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-sm hover:shadow-md transition-shadow`}
        >
            {/* Number Badge (Absolute Left) */}
            <div className="absolute top-6 left-4 hidden sm:flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500`}>
                    #{index + 1}
                </div>
            </div>

            <div className="sm:pl-10 space-y-5">
                
                {/* Row 1: Name & Settings */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Criteria Name */}
                    <div className="md:col-span-5">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${uiColors.textSecondary}`}>Criteria Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Technical Skills" 
                            value={item.name}
                            onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
                            className={`w-full p-2.5 rounded-lg border ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-900/50 outline-none focus:ring-2 ring-cyan-500/30 transition-all ${uiColors.textPrimary} font-medium`}
                        />
                    </div>

                    {/* Scoring Type */}
                    <div className="md:col-span-3">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${uiColors.textSecondary}`}>Scoring Method</label>
                        <div className="relative">
                            <select 
                                value={item.type}
                                onChange={(e) => onUpdate(item.id, 'type', e.target.value)}
                                className={`w-full p-2.5 rounded-lg border ${uiColors.borderPrimary} bg-white dark:bg-gray-800 outline-none focus:ring-2 ring-cyan-500/30 appearance-none cursor-pointer ${uiColors.textPrimary}`}
                            >
                                <option>Score 1-10</option>
                                <option>Pass/Fail</option>
                                <option>Boolean (Yes/No)</option>
                            </select>
                            {/* Custom Arrow */}
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="md:col-span-3">
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${uiColors.textSecondary}`}>Importance</label>
                        <div className="flex items-center space-x-2">
                            <select 
                                value={item.weight}
                                onChange={(e) => onUpdate(item.id, 'weight', e.target.value)}
                                className={`w-full p-2.5 rounded-lg border ${uiColors.borderPrimary} bg-white dark:bg-gray-800 outline-none focus:ring-2 ring-cyan-500/30 appearance-none cursor-pointer ${uiColors.textPrimary}`}
                            >
                                <option value="High">High Priority</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                            <WeightIndicator weight={item.weight} />
                        </div>
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-1 flex items-end justify-end">
                        <button 
                            onClick={() => onRemove(item.id)}
                            className="p-2.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove Criteria"
                        >
                            <FiTrash2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Row 2: Description */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${uiColors.textSecondary}`}>
                            AI Instructions <span className="normal-case font-normal opacity-60">(How should the AI evaluate this?)</span>
                        </label>
                    </div>
                    <textarea 
                        rows={2}
                        placeholder="Describe what constitutes a good answer. E.g. 'Look for mention of State Management and Lifecycle methods.'"
                        value={item.description}
                        onChange={(e) => onUpdate(item.id, 'description', e.target.value)}
                        className={`w-full p-3 rounded-lg border ${uiColors.borderPrimary} bg-gray-50 dark:bg-gray-900/50 outline-none focus:ring-2 ring-cyan-500/30 transition-all ${uiColors.textPrimary} resize-none`}
                    />
                </div>

            </div>
        </motion.div>
    );
}

// Helper Visual for Weight
function WeightIndicator({ weight }) {
    const color = weight === 'High' ? 'bg-red-500' : weight === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div className={`w-3 h-3 rounded-full ${color} shrink-0`} title={`${weight} Priority`} />
    );
}