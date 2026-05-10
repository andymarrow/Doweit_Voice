"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Clock, CheckCircle2, XCircle, Trophy, ArrowLeft, Zap,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const QUESTION_TIME = 30;

// Quiz player. The list/start UI was removed when the standalone Quizzes
// section was deprecated — quizzes are now launched per-interview from
// MySessions. Render this with:
//   <QuizPlayer
//     title={interview.title}
//     interviewId={interview.id}   // optional, persisted on submit
//     questions={[ {question, options[], answer, explanation?} ]}
//     onExit={() => router.back()}
//     onSubmitted={(row) => router.push(...)}
//   />
export function QuizPlayer({ title, interviewId, questions, onExit, onSubmitted }) {
  const [phase, setPhase] = useState('intro');
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [answers, setAnswers] = useState([]);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savedAttemptId, setSavedAttemptId] = useState(null);

  useEffect(() => {
    if (phase !== 'question' || confirmed) return;
    if (timeLeft <= 0) {
      setTimedOut(true);
      setConfirmed(true);
      setAnswers((p) => [...p, { questionIdx: current, selectedIdx: null, correct: false }]);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, timeLeft, confirmed, current]);

  const start = () => { setPhase('question'); setTimeLeft(QUESTION_TIME); };
  const select = (i) => { if (!confirmed) setSelected(i); };
  const confirm = () => {
    if (selected === null || confirmed) return;
    const correct = selected === questions[current].answer;
    setConfirmed(true);
    setTimedOut(false);
    setAnswers((p) => [...p, { questionIdx: current, selectedIdx: selected, correct }]);
  };

  const submitAttempt = useCallback(async (finalAnswers) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/trainee/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          interviewId,
          questions,
          answers: finalAnswers,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'save failed');
      if (json.data?.id) setSavedAttemptId(json.data.id);
      return json.data;
    } catch (e) {
      toast.error('Failed to save quiz attempt');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [title, interviewId, questions]);

  const next = async () => {
    if (current + 1 >= questions.length) {
      setPhase('result');
      // Use the just-built answers list, since state may not have flushed.
      await submitAttempt(answers);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setConfirmed(false);
      setTimedOut(false);
      setTimeLeft(QUESTION_TIME);
    }
  };

  const correctCount = answers.filter((a) => a.correct).length;
  const score = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  if (phase === 'intro') {
    return (
      <Shell>
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-900">
            <BookOpen size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-gray-400 text-sm mt-1">{questions.length} questions · {QUESTION_TIME}s each</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={start}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-sm hover:from-purple-700 hover:to-blue-700 shadow-xl shadow-purple-900"
            >
              Start Quiz
            </button>
            <button
              onClick={onExit}
              className="w-full py-2 text-gray-500 hover:text-gray-300 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={13} /> Back
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (phase === 'result') {
    const grade =
      score >= 85 ? { label: 'Excellent!', color: 'text-blue-400' }
      : score >= 70 ? { label: 'Good Job!', color: 'text-purple-400' }
      : { label: 'Keep Going!', color: 'text-gray-400' };

    return (
      <Shell>
        <div className="w-full max-w-lg space-y-5">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-purple-900">
              <Trophy size={32} className="text-white" />
            </div>
            <div>
              <p className={cn('text-3xl font-black', grade.color)}>{score}%</p>
              <p className="text-white text-lg font-black mt-0.5">{grade.label}</p>
              <p className="text-gray-400 text-xs mt-1">
                {correctCount} / {questions.length} correct {submitting && '(saving…)'}
              </p>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Breakdown</p>
            </div>
            <div className="divide-y divide-gray-800 max-h-64 overflow-y-auto">
              {questions.map((q, i) => {
                const ans = answers[i];
                const correct = ans?.correct;
                return (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <div className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      correct ? 'bg-blue-900 text-blue-400' : 'bg-gray-800 text-gray-600'
                    )}>
                      {correct ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-300 font-medium leading-snug">{q.question}</p>
                      <p className="text-[10px] text-blue-400 mt-0.5">✓ {q.options[q.answer]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onExit}
              className="py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-xs font-black flex items-center justify-center gap-1.5 border border-gray-700"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <button
              onClick={() => onSubmitted?.(savedAttemptId)}
              disabled={submitting}
              className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black hover:from-purple-700 hover:to-blue-700 flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50"
            >
              <Zap size={13} /> Done
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const q = questions[current];
  const timerPct = (timeLeft / QUESTION_TIME) * 100;
  const timerColor = timeLeft > 15 ? 'bg-blue-500' : timeLeft > 7 ? 'bg-purple-500' : 'bg-red-500';

  return (
    <Shell>
      <div className="w-full max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white">
            <X size={16} />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">
                Question {current + 1} / {questions.length}
              </span>
              <div className={cn(
                'flex items-center gap-1.5 text-xs font-black px-2 py-1 rounded-lg',
                timeLeft > 15 ? 'bg-blue-900/40 text-blue-400'
                  : timeLeft > 7 ? 'bg-purple-900/40 text-purple-400'
                  : 'bg-red-900/40 text-red-400 animate-pulse'
              )}>
                <Clock size={11} /> {timeLeft}s
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className={cn('h-1.5 rounded-full transition-all duration-1000', timerColor)} style={{ width: `${timerPct}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5 shadow-2xl">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0 mt-0.5">
              {current + 1}
            </div>
            <p className="text-white font-bold text-sm leading-relaxed">{q.question}</p>
          </div>
        </div>

        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.answer;
            let style = 'bg-gray-900 border-gray-700 text-gray-300 hover:border-purple-500 hover:text-white';
            if (confirmed) {
              if (isCorrect) style = 'bg-blue-900/40 border-blue-500 text-blue-200';
              else if (isSelected) style = 'bg-red-900/30 border-red-600 text-red-300';
              else style = 'bg-gray-900 border-gray-800 text-gray-600';
            } else if (isSelected) {
              style = 'bg-purple-900/40 border-purple-500 text-purple-200';
            }
            return (
              <button
                key={i}
                onClick={() => select(i)}
                disabled={confirmed}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all',
                  style,
                  !confirmed && 'cursor-pointer active:scale-[0.98]'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-lg bg-gray-800 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {confirmed && isCorrect && <CheckCircle2 size={14} className="text-blue-400 flex-shrink-0" />}
                  {confirmed && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>

        {timedOut && (
          <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl px-4 py-2.5 text-xs text-yellow-400 font-bold">
            Time&apos;s up. Correct answer is highlighted above.
          </div>
        )}

        {confirmed && q.explanation && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400 leading-relaxed">
            <span className="font-black text-gray-300">Explanation: </span>{q.explanation}
          </div>
        )}

        <div className="flex gap-3">
          {!confirmed ? (
            <button
              onClick={confirm}
              disabled={selected === null}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-sm disabled:opacity-40 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-900"
            >
              Confirm Answer
            </button>
          ) : (
            <button
              onClick={next}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black text-sm hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-900"
            >
              {current + 1 < questions.length ? 'Next Question' : 'Finish'}
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

const Shell = ({ children }) => (
  <div className="fixed inset-0 z-50 bg-gray-950 flex items-center justify-center p-4">
    {children}
  </div>
);

// Default export retained as a no-op so old imports don't crash.
// The standalone Quizzes section has been removed; render <QuizPlayer/> directly.
export const QuizEngine = QuizPlayer;
