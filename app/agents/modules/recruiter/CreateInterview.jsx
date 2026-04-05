"use client";
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Upload,
  FileText,
  Sparkles,

  User,

  Link as LinkIcon,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Target,
  Zap,
  HelpCircle,
  Trash2,

  Edit,
  Globe,


  Loader2,
  Copy,
  ExternalLink } from

'lucide-react';
import { cn } from '../../lib/utils';

const steps = [
{ id: 1, label: 'Job Info', icon: FileText },
{ id: 2, label: 'Description', icon: Upload },
{ id: 3, label: 'AI Generation', icon: Sparkles },
{ id: 4, label: 'Agent Config', icon: User },
{ id: 5, label: 'Marketplace', icon: ShoppingBag },
{ id: 6, label: 'Finalize', icon: LinkIcon }];


export const CreateInterview = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    jobTitle: '',
    department: 'Engineering',
    seniority: 'Senior',
    duration: 30,
    description: '',
    agentName: 'Viktor',
    voiceModel: 'Professional Male (US)',
    tone: 'Formal',
    language: 'English (Universal)',
    price: 50,
    accessType: 'Public (Anyone)'
  });

  const searchParams = useSearchParams();

  // Handle Template Injection
  useEffect(() => {
    const templateId = searchParams.get('templateId');

    if (templateId) {
      // In a real app, fetch template by ID. Here we simulate it.
      const templates = [
      { id: 'tpl_react_sr', title: 'Senior React Engineer', category: 'Technical', duration: 45, difficulty: 'Senior' },
      { id: 'tpl_pm_lead', title: 'Lead Product Manager', category: 'Leadership', duration: 60, difficulty: 'Lead / Manager' },
      { id: 'tpl_sys_design', title: 'System Design Fundamentals', category: 'Technical', duration: 40, difficulty: 'Mid-level' }];


      const template = templates.find((t) => t.id === templateId);
      if (template) {
        setFormData((prev) => ({
          ...prev,
          jobTitle: template.title,
          department: template.category === 'Technical' ? 'Engineering' : 'Product',
          seniority: template.difficulty,
          duration: template.duration
        }));
        // If it's a template, we might skip step 2 or pre-fill analysis
        setAnalysisComplete(true);
      }
    }
  }, []);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      nextStep();
    }, 2500);
  };

  const renderStep1 = () =>
  <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-base font-bold">Basic Information</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 1 of 6</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Job Title</label>
          <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => setFormData((prev) => ({ ...prev, jobTitle: e.target.value }))}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full px-3 py-2 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-xs transition-all" />
        
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Department</label>
          <select
          value={formData.department}
          onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-xs transition-all">
          
            <option>Engineering</option>
            <option>Product</option>
            <option>Design</option>
            <option>Marketing</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Seniority Level</label>
          <select
          value={formData.seniority}
          onChange={(e) => setFormData((prev) => ({ ...prev, seniority: e.target.value }))}
          className="w-full px-3 py-2 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-xs transition-all">
          
            <option>Junior</option>
            <option>Mid-level</option>
            <option>Senior</option>
            <option>Lead / Manager</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Interview Duration</label>
          <div className="relative">
            <input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) }))}
            placeholder="30"
            className="w-full px-3 py-2 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-xs transition-all" />
          
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">MINS</span>
          </div>
        </div>
      </div>
    </div>;


  const renderStep2 = () =>
  <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-base font-bold">Job Description Analysis</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 2 of 6</p>
      </div>
      <div className="space-y-4">
        <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-emerald-500/30 hover:bg-emerald-50/20 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-emerald-500 group-hover:bg-emerald-50 transition-all">
            <Upload size={24} />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold">Upload Job Description</p>
            <p className="text-[10px] text-muted-foreground">PDF, DOCX or TXT (Max 5MB)</p>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-[9px] uppercase">
            <span className="bg-white px-2 text-muted-foreground font-bold tracking-widest">Or Paste Text</span>
          </div>
        </div>
        <textarea
        value={formData.description}
        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
        placeholder="Paste the job description here..."
        className="w-full h-32 px-3 py-2 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 resize-none text-xs transition-all" />
      
        <button
        onClick={simulateAnalysis}
        disabled={isAnalyzing}
        className="w-full py-3 rounded-xl bg-gray-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
        
          {isAnalyzing ?
        <>
              <Loader2 size={16} className="animate-spin" />
              AI is analyzing job context...
            </> :

        <>
              <Sparkles size={16} />
              Analyze & Generate Criteria
            </>
        }
        </button>
      </div>
    </div>;


  const renderStep3 = () =>
  <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-bold">AI Generated Criteria</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 3 of 6</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={12} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Analysis Complete</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-4">
          <h4 className="text-xs font-bold flex items-center gap-2">
            <Target size={14} className="text-emerald-600" />
            Evaluation Rubric
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
          { name: 'React Proficiency', weight: 40 },
          { name: 'System Design', weight: 30 },
          { name: 'Communication', weight: 20 },
          { name: 'Team Fit', weight: 10 }].
          map((item, i) =>
          <div key={i} className="p-3 rounded-xl bg-white border border-black/5 flex items-center justify-between">
                <span className="text-xs font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-emerald-600">{item.weight}%</span>
                  <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-400"><Edit size={12} /></button>
                </div>
              </div>
          )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-4">
          <h4 className="text-xs font-bold flex items-center gap-2">
            <HelpCircle size={14} className="text-blue-600" />
            Initial Question Set
          </h4>
          <div className="space-y-2">
            {[
          'Can you explain how you handle state management in large React apps?',
          'Describe a complex technical challenge you solved recently.',
          'How do you approach testing in your development workflow?'].
          map((q, i) =>
          <div key={i} className="p-3 rounded-xl bg-white border border-black/5 flex items-start justify-between group">
                <p className="text-xs leading-relaxed pr-4">{q}</p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded-lg hover:bg-gray-50 text-gray-400"><Edit size={12} /></button>
                  <button className="p-1 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={12} /></button>
                </div>
              </div>
          )}
            <button className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 hover:border-emerald-500 hover:text-emerald-600 transition-all">
              + Add Custom Question
            </button>
          </div>
        </div>
      </div>
    </div>;


  const renderStep4 = () =>
  <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-base font-bold">Agent Configuration</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 4 of 6</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Agent Persona</label>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-black/5">
              <div className="w-16 h-16 rounded-2xl bg-white border border-black/5 overflow-hidden">
                <img src="https://picsum.photos/seed/agent-v/200/200" alt="" />
              </div>
              <div className="flex-1">
                <input
                type="text"
                value={formData.agentName}
                onChange={(e) => setFormData((prev) => ({ ...prev, agentName: e.target.value }))}
                className="w-full px-2 py-1 rounded-lg bg-transparent border-b border-gray-200 focus:border-emerald-500 focus:ring-0 text-xs font-bold" />
              
                <p className="text-[10px] text-muted-foreground mt-1">AI Interviewer</p>
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Voice Model</label>
            <select
            value={formData.voiceModel}
            onChange={(e) => setFormData((prev) => ({ ...prev, voiceModel: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-black/5 bg-gray-50 text-xs">
            
              <option>Professional Male (US)</option>
              <option>Friendly Female (UK)</option>
              <option>Formal Male (India)</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Personality Tone</label>
            <div className="grid grid-cols-3 gap-2">
              {['Formal', 'Friendly', 'Strict'].map((tone) =>
            <button
              key={tone}
              onClick={() => setFormData((prev) => ({ ...prev, tone }))}
              className={cn(
                "py-2 rounded-xl border text-[10px] font-bold transition-all",
                formData.tone === tone ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white border-black/5 text-gray-500 hover:bg-gray-50"
              )}>
              
                  {tone}
                </button>
            )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Interview Language</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-black/5 text-xs font-bold">
              <Globe size={14} className="text-blue-600" />
              English (Universal)
            </div>
          </div>
        </div>
      </div>
    </div>;


  const renderStep5 = () =>
  <div className="space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h3 className="text-base font-bold">Marketplace & Token Settings</h3>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 5 of 6</p>
      </div>
      <div className="p-6 rounded-2xl bg-white border border-black/5 shadow-sm space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-900">Publish to Marketplace</p>
              <p className="text-[10px] text-emerald-700">Earn tokens when others use your agent</p>
            </div>
          </div>
          <button className="w-12 h-6 rounded-full bg-emerald-600 relative">
            <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Token Price per Interview</label>
            <div className="relative">
              <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData((prev) => ({ ...prev, price: parseInt(e.target.value) }))}
              className="w-full pl-3 pr-12 py-2.5 rounded-xl border border-black/5 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 text-xs font-bold transition-all" />
            
              <Zap size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500" />
            </div>
            <p className="text-[9px] text-muted-foreground italic">Recommended: 30-70 tokens</p>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-700 uppercase tracking-wider">Access Type</label>
            <select
            value={formData.accessType}
            onChange={(e) => setFormData((prev) => ({ ...prev, accessType: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-xl border border-black/5 bg-gray-50 text-xs font-bold">
            
              <option>Public (Anyone)</option>
              <option>Invite Only</option>
              <option>Paid License</option>
            </select>
          </div>
        </div>
      </div>
    </div>;


  const renderStep6 = () =>
  <div className="space-y-8 animate-in fade-in duration-500 text-center py-4">
      <div className="relative w-24 h-24 mx-auto">
        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
        <div className="relative w-24 h-24 bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-600/30">
          <CheckCircle2 size={48} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-2xl font-black tracking-tight">Interview Live!</h3>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Your AI Interview Agent "Viktor" is now active and ready to screen candidates.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-gray-50 border border-black/5 space-y-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Candidate Magic Link</p>
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 text-[8px] font-bold uppercase tracking-wider">Active</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-2xl bg-white border border-black/5 font-mono text-[11px] text-left overflow-hidden whitespace-nowrap shadow-sm">
            hireai.com/i/vkt-902-x
          </div>
          <button className="px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-2">
            <Copy size={14} />
            Copy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-black/5 bg-white text-xs font-bold hover:bg-gray-50 transition-all">
          <ExternalLink size={14} />
          View Dashboard
        </button>
        <button className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
          <ShoppingBag size={14} />
          Marketplace
        </button>
      </div>
    </div>;


  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black tracking-tight">Create AI Interview</h2>
        <p className="text-xs text-muted-foreground">Configure your autonomous recruiting agent in minutes.</p>
      </div>

      {/* Stepper */}
      <div className="relative flex justify-between items-center px-8">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10" />
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-700 ease-in-out"
          style={{ width: `${(currentStep - 1) / (steps.length - 1) * 100}%` }} />
        
        {steps.map((step) =>
        <div key={step.id} className="flex flex-col items-center gap-2">
            <div className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm",
            currentStep === step.id ? "bg-emerald-600 border-emerald-600 text-white scale-110 shadow-emerald-600/20" :
            currentStep > step.id ? "bg-emerald-50 border-emerald-500 text-emerald-500" :
            "bg-white border-gray-100 text-gray-400"
          )}>
              {currentStep > step.id ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
            </div>
            <span className={cn(
            "text-[9px] font-bold uppercase tracking-widest hidden md:block",
            currentStep === step.id ? "text-emerald-600" : "text-gray-400"
          )}>
              {step.label}
            </span>
          </div>
        )}
      </div>

      {/* Step Content */}
      <div className="p-8 rounded-3xl bg-white border border-black/5 shadow-xl shadow-black/5 min-h-[450px] relative overflow-hidden">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}
        {currentStep === 6 && renderStep6()}
      </div>

      {/* Navigation */}
      {currentStep < 6 &&
      <div className="flex items-center justify-between">
          <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-xs text-gray-500 hover:bg-white border border-transparent hover:border-black/5 disabled:opacity-0 transition-all">
          
            <ChevronLeft size={18} />
            Previous Step
          </button>
          <button
          onClick={nextStep}
          disabled={currentStep === 2 && !analysisComplete}
          className={cn(
            "flex items-center gap-2 px-8 py-2.5 rounded-2xl text-white text-xs font-bold transition-all shadow-lg",
            currentStep === 2 && !analysisComplete ? "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed" : "bg-gray-900 hover:bg-black shadow-black/20"
          )}>
          
            {currentStep === steps.length - 1 ? 'Finalize Interview' : 'Continue'}
            <ChevronRight size={18} />
          </button>
        </div>
      }
    </div>);

};