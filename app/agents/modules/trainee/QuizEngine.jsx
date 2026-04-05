"use client";
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  HelpCircle,



  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  BarChart3,

  X,

  Timer,
  Check,
  ChevronRight,
  Info } from
'lucide-react';

import { cn } from '../../lib/utils';









export const QuizEngine = ({ agent, questions, onExit }) => {
  const [state, setState] = useState('setup');
  const [setupConfig, setSetupConfig] = useState({
    numQuestions: '10',
    difficulty: agent.difficulty,
    category: 'Technical Knowledge'
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [results, setResults] = useState([]);

  useEffect(() => {
    let interval;
    if (state === 'session' && timer > 0 && !isAnswered) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !isAnswered) {
      handleAnswer(-1); // Time out
    }
    return () => clearInterval(interval);
  }, [state, timer, isAnswered]);

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = optionIndex === 0; // In demo data, first option is usually correct

    if (isCorrect) setScore((prev) => prev + 1);

    setResults((prev) => [...prev, {
      question: currentQuestion.text,
      correct: isCorrect,
      userAnswer: optionIndex === -1 ? 'Timed Out' : `Option ${optionIndex + 1}`,
      correctAnswer: 'Option 1',
      explanation: 'This is the correct approach because it follows industry standard best practices for system scalability and maintainability.'
    }]);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimer(30);
    } else {
      setState('result');
    }
  };

  const renderSetup = () =>
  <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-[2rem] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xl">
          <HelpCircle size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Quiz Mode Setup</h2>
          <p className="text-sm text-muted-foreground">Test your knowledge with {agent.name}.</p>
        </div>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Number of Questions</label>
            <select
            value={setupConfig.numQuestions}
            onChange={(e) => setSetupConfig({ ...setupConfig, numQuestions: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Difficulty</label>
            <select
            value={setupConfig.difficulty}
            onChange={(e) => setSetupConfig({ ...setupConfig, difficulty: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Expert</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Category</label>
            <select
            value={setupConfig.category}
            onChange={(e) => setSetupConfig({ ...setupConfig, category: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-0 text-xs font-bold">
            
              <option>Technical Knowledge</option>
              <option>System Design</option>
              <option>Behavioral</option>
              <option>Logic & Reasoning</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-black/5 flex gap-3">
          <button
          onClick={onExit}
          className="flex-1 py-3 rounded-2xl border border-black/5 text-xs font-bold hover:bg-gray-50 transition-all">
          
            Cancel
          </button>
          <button
          onClick={() => setState('session')}
          className="flex-1 py-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
          
            Start Quiz
          </button>
        </div>
      </div>
    </div>;


  const renderSession = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const options = ['Option 1 (Correct)', 'Option 2', 'Option 3', 'Option 4'];

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 py-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setState('setup')}
              className="p-2 rounded-xl border border-black/5 hover:bg-gray-100 transition-all">
              
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question</span>
              <span className="text-sm font-black">{currentQuestionIndex + 1} / {questions.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-colors",
              timer < 10 ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-900"
            )}>
              <Timer size={14} />
              <span className="text-sm font-black font-mono">{timer}s</span>
            </div>
            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(currentQuestionIndex + 1) / questions.length * 100}%` }} />
              
            </div>
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-white border border-black/5 shadow-sm space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6">
            <HelpCircle size={48} className="text-gray-50 opacity-10" />
          </div>

          <div className="space-y-4">
            <div className="flex gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-bold uppercase tracking-widest">{currentQuestion.type}</span>
              <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[9px] font-bold uppercase tracking-widest">{currentQuestion.difficulty}</span>
            </div>
            <h3 className="text-2xl font-black leading-tight tracking-tight text-gray-900">
              {currentQuestion.text}
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {options.map((option, i) =>
            <button
              key={i}
              disabled={isAnswered}
              onClick={() => handleAnswer(i)}
              className={cn(
                "p-5 rounded-2xl text-left text-sm font-bold transition-all border-2 flex items-center justify-between group",
                isAnswered ?
                i === 0 ?
                "bg-emerald-50 border-emerald-500 text-emerald-700" :
                selectedOption === i ?
                "bg-red-50 border-red-500 text-red-700" :
                "bg-gray-50 border-transparent text-gray-400" :
                "bg-gray-50 border-transparent hover:border-emerald-500 hover:bg-white text-gray-700"
              )}>
              
                <div className="flex items-center gap-4">
                  <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors",
                  isAnswered ?
                  i === 0 ? "bg-emerald-500 text-white" : selectedOption === i ? "bg-red-500 text-white" : "bg-gray-200 text-gray-400" :
                  "bg-white text-gray-400 group-hover:bg-emerald-500 group-hover:text-white shadow-sm"
                )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  {option}
                </div>
                {isAnswered && i === 0 && <CheckCircle2 size={20} className="text-emerald-500" />}
                {isAnswered && selectedOption === i && i !== 0 && <XCircle size={20} className="text-red-500" />}
              </button>
            )}
          </div>

          {isAnswered &&
          <div className="p-6 rounded-2xl bg-gray-50 border border-black/5 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white text-blue-600 shadow-sm">
                  <Info size={16} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Explanation</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    This is the correct approach because it follows industry standard best practices for system scalability and maintainability. It ensures that the system can handle increased load without compromising performance.
                  </p>
                </div>
              </div>
            </div>
          }
        </div>

        <div className="flex justify-end">
          <button
            disabled={!isAnswered}
            onClick={handleNext}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-xl",
              isAnswered ?
              "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20" :
              "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}>
            
            {currentQuestionIndex === questions.length - 1 ? 'View Results' : 'Next Question'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>);

  };

  const renderResult = () =>
  <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in-95 duration-500 py-10">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-[2rem] bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-100/20">
          <Trophy size={40} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">Quiz Complete!</h2>
          <p className="text-sm text-muted-foreground">You've earned 150 XP and improved your technical mastery.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
      { label: 'Total Score', value: `${Math.round(score / questions.length * 100)}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Correct', value: `${score} / ${questions.length}`, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'XP Earned', value: '+150', color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Duration', value: '12:45', color: 'text-purple-600', bg: 'bg-purple-50' }].
      map((stat, i) =>
      <div key={i} className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
            <h4 className={cn("text-3xl font-black", stat.color)}>{stat.value}</h4>
          </div>
      )}
      </div>

      {/* Answer Review Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <CheckCircle2 size={18} className="text-emerald-500" />
          Detailed Answer Review
        </h3>
        <div className="space-y-4">
          {results.map((res, i) =>
        <div key={i} className="p-6 rounded-3xl bg-white border border-black/5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-gray-400">Q{i + 1}</span>
                    {res.correct ?
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">Correct</span> :

                <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-widest">Incorrect</span>
                }
                  </div>
                  <p className="text-sm font-bold text-gray-900">{res.question}</p>
                </div>
                <div className={cn(
              "p-2 rounded-xl shrink-0",
              res.correct ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
                  {res.correct ? <Check size={18} /> : <X size={18} />}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-black/5 space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Your Answer</p>
                  <p className={cn("text-xs font-bold", res.correct ? "text-emerald-600" : "text-red-600")}>{res.userAnswer}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1">
                  <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest">Correct Answer</p>
                  <p className="text-xs font-bold text-emerald-700">{res.correctAnswer}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 space-y-1">
                <p className="text-[9px] font-bold text-blue-700 uppercase tracking-widest">AI Explanation</p>
                <p className="text-xs text-blue-800 leading-relaxed font-medium">{res.explanation}</p>
              </div>
            </div>
        )}
        </div>
      </div>

      <div className="flex gap-4">
        <button
        onClick={() => {
          setState('setup');
          setCurrentQuestionIndex(0);
          setScore(0);
          setResults([]);
        }}
        className="flex-1 py-4 rounded-2xl border border-black/5 bg-white font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        
          <RotateCcw size={18} />
          Retry Quiz
        </button>
        <button
        onClick={onExit}
        className="flex-1 py-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2">
        
          <BarChart3 size={18} />
          Return to Gym
        </button>
      </div>
    </div>;


  return (
    <div className="min-h-screen">
      {state === 'setup' && renderSetup()}
      {state === 'session' && renderSession()}
      {state === 'result' && renderResult()}
    </div>);

};
