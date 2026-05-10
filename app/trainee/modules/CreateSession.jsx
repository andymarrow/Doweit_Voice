"use client";
import React, { useState, useEffect } from 'react';
import {
  ChevronRight, ChevronLeft, Check, Loader2, Sparkles, Zap,
  Settings2, FileText, Brain, Mic, Rocket, Plus, Trash2,
  RefreshCw, Target, MessageSquareText, Lock, Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import VoiceModal from '@/app/characterai/create/_components/VoiceModal';

const LANGUAGES = ['English', 'Amharic', 'Arabic', 'French', 'Spanish', 'Portuguese'];
const LEVELS = ['entry', 'junior', 'mid', 'senior', 'expert'];

const inputCls =
  'w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 text-xs font-medium transition-all';
const labelCls = 'block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1';

const Field = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

// Step order per spec:
//   0 Setup → 1 Description → 2 AI Prepare → 3 Evaluation (AI built from
//   prompt+questions, count = questionCount + 2) → 4 Voice → 5 Launch
const STEPS = [
  { id: 0, label: 'Setup',       icon: Settings2 },
  { id: 1, label: 'Description', icon: FileText },
  { id: 2, label: 'AI Prepare',  icon: Brain },
  { id: 3, label: 'Evaluation',  icon: Target },
  { id: 4, label: 'Voice',       icon: Mic },
  { id: 5, label: 'Launch',      icon: Rocket },
];

export const CreateSession = ({ onNavigate }) => {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [generated, setGenerated] = useState(false);
  const [criteriaGeneratedOnce, setCriteriaGeneratedOnce] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [form, setForm] = useState({
    // Step 0
    title: '',
    duration: 30,
    questionCount: 8,
    department: '',
    language: 'English',
    experienceLevel: 'mid',
    // Step 1
    description: '',
    // Step 2 (hidden, AI-prepared)
    systemPrompt: '',
    aiQuestions: [],
    recommendation: '',
    // Step 4 (Voice — mirrors recruiter)
    voiceProvider: 'vapi',
    voiceId: '',
    voiceName: '',
    agentName: 'Viktor',
    tone: 'Friendly',
    antiCheatEnabled: true,
    interviewer: 'vapi',
  });

  // Mirrors recruiter handleVoiceSelected. VoiceModal returns
  // { name, voiceId, platform | provider } — we normalise the platform key.
  const handleVoiceSelected = (voice) => {
    const platform = (voice.platform || voice.provider || 'vapi').toLowerCase();
    setForm((p) => ({
      ...p,
      voiceProvider: platform,
      voiceId: voice.voiceId,
      voiceName: voice.name,
    }));
    setIsVoiceModalOpen(false);
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // Step 2: combined AI generate (prompt + questions). Hidden — never rendered
  // back to the trainee. Recommendation feeds into both generations on regen.
  const generate = async () => {
    if (!form.title || !form.description) {
      toast.error('Title and description are required');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/trainee/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          department: form.department,
          description: form.description,
          experienceLevel: form.experienceLevel,
          language: form.language,
          duration: Number(form.duration) || 30,
          questionCount: Number(form.questionCount) || 8,
          recommendation: form.recommendation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');
      set('systemPrompt', data.systemPrompt || '');
      set('aiQuestions', data.questions || []);
      setGenerated(true);
      // Reset criteria so step 3 will regenerate from the new prompt/questions.
      setCriteriaGeneratedOnce(false);
      setCriteria([]);
      toast.success(generated ? 'Regenerated with your recommendation' : 'AI prepared your interview');
    } catch (e) {
      toast.error(e.message || 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 3: AI builds criteria from prompt + questions; count = questionCount + 2.
  const generateCriteria = async () => {
    setIsGeneratingCriteria(true);
    try {
      const res = await fetch('/api/trainee/generate-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          systemPrompt: form.systemPrompt,
          aiQuestions: form.aiQuestions,
          questionCount: Number(form.questionCount) || 8,
          language: form.language,
          experienceLevel: form.experienceLevel,
          recommendation: form.recommendation,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCriteria(Array.isArray(data.criteria) ? data.criteria : []);
      setCriteriaGeneratedOnce(true);
      toast.success(`AI built ${data.criteria?.length ?? 0} criteria`);
    } catch (e) {
      toast.error(e.message || 'Failed to generate criteria');
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  // Auto-generate criteria the first time the user lands on the Evaluation step.
  useEffect(() => {
    if (step === 3 && generated && !criteriaGeneratedOnce && !isGeneratingCriteria) {
      generateCriteria();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const updateCriterion = (idx, patch) =>
    setCriteria((p) => p.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  const removeCriterion = (idx) => setCriteria((p) => p.filter((_, i) => i !== idx));
  const addCriterion = () =>
    setCriteria((p) => [...p, { name: '', weight: 0, method: 'AI Semantic Analysis', range: '0-100' }]);

  const totalWeight = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/trainee/createInterview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          questionCount: Number(form.questionCount) || 8,
          duration: Number(form.duration) || 30,
          evaluationCriteria: criteria,
          status: 'active',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setCreatedId(data.data.id);
      toast.success('Interview ready to take');
      setStep(5);
    } catch (e) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step gates
  const canNext = (() => {
    if (step === 0) return form.title.trim() && Number(form.duration) > 0 && Number(form.questionCount) > 0;
    if (step === 1) return form.description.trim().length > 20;
    if (step === 2) return generated;
    if (step === 3) return criteria.length > 0 && totalWeight === 100;
    if (step === 4) return form.voiceId;
    return true;
  })();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all',
                    active && 'bg-gradient-to-br from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-200',
                    done && 'bg-purple-100 text-purple-700',
                    !active && !done && 'bg-gray-100 text-gray-400'
                  )}
                >
                  {done ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                <span className={cn('text-[9px] font-black uppercase tracking-wider',
                  active ? 'text-purple-700' : done ? 'text-gray-600' : 'text-gray-400')}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-0.5 mx-2', done ? 'bg-purple-300' : 'bg-gray-100')} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
        {/* Step 0 — Setup */}
        {step === 0 && (
          <div className="space-y-5">
            <Header icon={Settings2} title="Setup your interview" sub="Just the essentials." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Title">
                <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Senior Frontend Practice" />
              </Field>
              <Field label="Department">
                <input className={inputCls} value={form.department} onChange={(e) => set('department', e.target.value)} placeholder="Engineering" />
              </Field>
              <Field label="Duration (minutes)">
                <input type="number" min={5} max={180} className={inputCls} value={form.duration} onChange={(e) => set('duration', e.target.value)} />
              </Field>
              <Field label="Number of questions">
                <input type="number" min={3} max={20} className={inputCls} value={form.questionCount} onChange={(e) => set('questionCount', e.target.value)} />
              </Field>
              <Field label="Language">
                <select className={inputCls} value={form.language} onChange={(e) => set('language', e.target.value)}>
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Experience Level">
                <select className={inputCls} value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
                  {LEVELS.map((l) => <option key={l} value={l}>{l[0].toUpperCase() + l.slice(1)}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* Step 1 — Description */}
        {step === 1 && (
          <div className="space-y-5">
            <Header icon={FileText} title="Describe the role / topic" sub="The AI uses this to tailor questions and scoring." />
            <Field label="Description / Role context">
              <textarea
                rows={10}
                className={cn(inputCls, 'resize-none font-normal')}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Paste a job description, study topic, or skills you want to be drilled on…"
              />
            </Field>
            <p className="text-[10px] text-gray-400">Min 20 characters. Used to generate the AI prompt and questions.</p>
          </div>
        )}

        {/* Step 2 — AI Prepare (hidden) */}
        {step === 2 && (
          <div className="space-y-5">
            <Header icon={Brain} title="AI prepare" sub="The AI builds your interviewer prompt and question set." />

            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-200 flex-shrink-0">
                  <Sparkles size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-gray-800">Hidden by design</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    To keep your practice realistic, the AI prompt and the generated questions
                    are kept private. They&apos;ll be used live during your interview. You can
                    still steer the AI by leaving a recommendation below and regenerating.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Pill icon={Lock} text="Prompt hidden" />
                <Pill icon={Lock} text={`${form.aiQuestions.length || form.questionCount} questions hidden`} />
                {generated && <Pill icon={Check} text="Ready" tone="green" />}
              </div>
            </div>

            <Field label="Recommendation (optional)">
              <textarea
                rows={4}
                className={cn(inputCls, 'resize-none font-normal')}
                placeholder="e.g. Make questions more behavioral, focus on system design tradeoffs, keep tone friendlier…"
                value={form.recommendation}
                onChange={(e) => set('recommendation', e.target.value)}
              />
            </Field>

            <div className="flex items-center gap-3">
              <button
                onClick={generate}
                disabled={isGenerating}
                className={cn(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white shadow-lg shadow-purple-200 transition-all',
                  'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700',
                  isGenerating && 'opacity-60 cursor-not-allowed'
                )}
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : generated ? <RefreshCw size={14} /> : <Sparkles size={14} />}
                {isGenerating ? 'Preparing…' : generated ? 'Regenerate with recommendation' : 'Generate'}
              </button>
              {generated && (
                <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                  <Check size={12} /> AI prepared
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Evaluation (AI generated, count = questionCount + 2) */}
        {step === 3 && (
          <div className="space-y-5">
            <Header
              icon={Target}
              title="Evaluation rubric"
              sub={`AI built ${(Number(form.questionCount) || 0) + 2} criteria from your prompt and questions. Edit weights to total 100%.`}
            />

            {isGeneratingCriteria ? (
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center text-xs text-gray-500">
                <Loader2 size={18} className="animate-spin mx-auto mb-2 text-purple-500" />
                Building rubric from your prompt and questions…
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-gray-50 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5">Criterion</div>
                    <div className="col-span-4">Method</div>
                    <div className="col-span-2">Weight</div>
                    <div className="col-span-1" />
                  </div>
                  <div className="divide-y divide-gray-50">
                    {criteria.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[11px] text-gray-400">
                        No criteria yet — click Regenerate.
                      </div>
                    ) : (
                      criteria.map((c, i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                          <input
                            className="col-span-5 px-2 py-1.5 rounded-lg bg-white border border-gray-100 text-xs"
                            value={c.name}
                            onChange={(e) => updateCriterion(i, { name: e.target.value })}
                            placeholder="Criterion name"
                          />
                          <input
                            className="col-span-4 px-2 py-1.5 rounded-lg bg-white border border-gray-100 text-xs"
                            value={c.method}
                            onChange={(e) => updateCriterion(i, { method: e.target.value })}
                            placeholder="Scoring method"
                          />
                          <input
                            type="number"
                            className="col-span-2 px-2 py-1.5 rounded-lg bg-white border border-gray-100 text-xs"
                            value={c.weight}
                            onChange={(e) => updateCriterion(i, { weight: Number(e.target.value) || 0 })}
                          />
                          <button
                            onClick={() => removeCriterion(i)}
                            className="col-span-1 justify-self-end p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={addCriterion}
                      className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase tracking-wider hover:text-purple-700"
                    >
                      <Plus size={12} /> Add criterion
                    </button>
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-wider',
                      totalWeight === 100 ? 'text-green-600' : 'text-red-500'
                    )}>
                      Total: {totalWeight}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={generateCriteria}
                    disabled={isGeneratingCriteria}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
                      isGeneratingCriteria && 'opacity-60 cursor-not-allowed'
                    )}
                  >
                    <RefreshCw size={13} /> Regenerate from AI
                  </button>
                  <p className="text-[10px] text-gray-400">
                    {criteria.length} criteria · expected {(Number(form.questionCount) || 0) + 2}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4 — Voice (mirrors recruiter Agent step) */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div>
              <h3 className="text-sm font-black text-gray-900">Agent &amp; Voice Settings</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Configure voice, tone, and anti-cheat</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 max-w-xl">
              <h4 className="text-xs font-bold text-gray-900">Agent Voice</h4>

              <Field label="Agent Name">
                <input
                  className={inputCls}
                  value={form.agentName}
                  onChange={(e) => set('agentName', e.target.value)}
                />
              </Field>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <Volume2 size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  {form.voiceId ? (
                    <>
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {form.voiceName || form.voiceId}
                      </p>
                      <p className="text-[10px] text-gray-500 capitalize">
                        {form.voiceProvider === 'google' || form.voiceProvider === 'gemini'
                          ? 'Gemini Live'
                          : form.voiceProvider === '11labs' || form.voiceProvider === 'elevenlabs'
                          ? 'ElevenLabs'
                          : 'Vapi'}{' '}· {form.voiceId}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No voice selected</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="w-full px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
              >
                {form.voiceId ? 'Change Voice' : 'Choose a Voice'}
              </button>

              <Field label="Personality Tone">
                <div className="grid grid-cols-3 gap-2">
                  {['Formal', 'Friendly', 'Strict'].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => set('tone', tone)}
                      className={cn(
                        'py-2 rounded-lg border text-[10px] font-bold transition-all',
                        form.tone === tone
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                      )}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-900">Anti-Cheat</p>
                  <p className="text-[9px] text-gray-400">Monitors focus &amp; tab switching</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('antiCheatEnabled', !form.antiCheatEnabled)}
                  className={cn(
                    'relative w-10 h-5 rounded-full transition-colors',
                    form.antiCheatEnabled ? 'bg-purple-600' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all',
                      form.antiCheatEnabled ? 'right-0.5' : 'left-0.5'
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Launch */}
        {step === 5 && (
          <div className="text-center py-8 space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Rocket size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Your interview is ready</h3>
              <p className="text-xs text-gray-500 mt-1">Take it as many times as you want — every attempt is scored separately.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {createdId && (
                <a
                  href={`/trainee/interview/${createdId}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-blue-700"
                >
                  <Zap size={14} /> Start interview
                </a>
              )}
              <button
                onClick={() => onNavigate?.('sessions')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50"
              >
                <MessageSquareText size={14} /> View my interviews
              </button>
            </div>
          </div>
        )}

        {/* Footer nav */}
        {step !== 5 && (
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white transition-all',
                  canNext
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200'
                    : 'bg-gray-200 cursor-not-allowed'
                )}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canNext || isSubmitting}
                className={cn(
                  'flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black text-white transition-all',
                  canNext && !isSubmitting
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200'
                    : 'bg-gray-200 cursor-not-allowed'
                )}
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                {isSubmitting ? 'Launching…' : 'Launch'}
              </button>
            )}
          </div>
        )}
      </div>

      <VoiceModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onVoiceSelect={handleVoiceSelected}
      />
    </div>
  );
};

const Header = ({ icon: Icon, title, sub }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-purple-200 flex-shrink-0">
      <Icon size={15} />
    </div>
    <div>
      <h3 className="text-sm font-black tracking-tight">{title}</h3>
      <p className="text-[11px] text-gray-500">{sub}</p>
    </div>
  </div>
);

const Pill = ({ icon: Icon, text, tone = 'gray' }) => (
  <span className={cn(
    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
    tone === 'green' ? 'bg-green-100 text-green-700' : 'bg-white text-gray-500 border border-gray-200'
  )}>
    <Icon size={11} />{text}
  </span>
);
