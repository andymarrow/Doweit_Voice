// app/agents/recruited/[agentid]/_components/QuizGame.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheck, FiArrowRight, FiRefreshCw, FiLoader, FiZap, FiTarget } from 'react-icons/fi';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// --- MOCK QUESTIONS GENERATOR ---
// In real app, this comes from Gemini based on user's requested count
const GENERATE_MOCK_QUESTIONS = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i, 
        type: i % 2 === 0 ? 'choice' : 'true_false', 
        question: i % 2 === 0 ? `Question ${i + 1}: What is the best pattern for scalable React apps?` : `Question ${i + 1}: Next.js App Router uses Client Components by default.`, 
        options: ['Monolith', 'Micro-frontends', 'Atomic Design', 'MVC'], 
        answer: i % 2 === 0 ? 2 : false, 
        explanation: i % 2 === 0 ? "Atomic Design breaks down UIs into fundamental building blocks." : "False. Server Components are the default."
    }));
};

export default function QuizGame({ agentId, onExit }) {
    // --- STATE ---
    const [gameState, setGameState] = useState('setup'); // setup, loading, playing, results
    const [questionCount, setQuestionCount] = useState(10); // User preference
    const [questions, setQuestions] = useState([]);
    
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [xpEarned, setXpEarned] = useState(0);
    
    const [isAnswered, setIsAnswered] = useState(false);
    const [userSelection, setUserSelection] = useState(null); // <--- FIXED: Added missing state
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'

    // --- LOGIC ---

    const startGame = () => {
        setGameState('loading');
        // Simulate API call to Gemini with the requested count
        setTimeout(() => {
            const newQuestions = GENERATE_MOCK_QUESTIONS(questionCount);
            setQuestions(newQuestions);
            
            // Reset Game State
            setCurrentIndex(0);
            setScore(0);
            setIsAnswered(false);
            setUserSelection(null);
            setFeedback(null);
            
            setGameState('playing');
        }, 1500);
    };

    const handleAnswer = (userChoice) => {
        if (isAnswered) return;
        
        setIsAnswered(true);
        setUserSelection(userChoice); // Store selection for UI highlighting

        const q = questions[currentIndex];
        let isCorrect = false;

        // Logic check
        if (q.type === 'choice' || q.type === 'true_false') {
            if (userChoice === q.answer) isCorrect = true;
        } else {
            if (userChoice === 'got_it') isCorrect = true; // Flashcard logic
        }

        if (isCorrect) {
            setScore(s => s + 1);
            setFeedback('correct');
        } else {
            setFeedback('wrong');
        }
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsAnswered(false);
            setUserSelection(null);
            setFeedback(null);
        } else {
            finishGame();
        }
    };

    const finishGame = () => {
        // Calculate XP: 10 XP per correct answer + 50 XP bonus for completion
        const xp = (score * 10) + 50;
        setXpEarned(xp);
        setGameState('results');
        // In real app: call API to save score and update user XP here
    };

    // --- RENDERERS ---

    // 1. SETUP SCREEN (User selects Question Count)
    if (gameState === 'setup') {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-white dark:bg-gray-900 relative p-6">
                <button onClick={onExit} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <FiX className="w-6 h-6 text-gray-500" />
                </button>
                
                <div className="text-center max-w-md w-full">
                    <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                        <FiZap className="w-12 h-12" />
                    </div>
                    
                    <h2 className={`text-3xl font-extrabold mb-2 ${uiColors.textPrimary}`}>Training Drill</h2>
                    <p className={`${uiColors.textSecondary} mb-8`}>Configure your session intensity.</p>
                    
                    {/* Question Count Slider */}
                    <div className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <span className={`text-sm font-bold uppercase tracking-wider ${uiColors.textSecondary}`}>Questions</span>
                            <span className={`text-2xl font-black ${uiColors.textPrimary}`}>{questionCount}</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" max="50" step="5" 
                            value={questionCount} 
                            onChange={(e) => setQuestionCount(Number(e.target.value))}
                            className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono">
                            <span>5</span>
                            <span>25</span>
                            <span>50</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={startGame} 
                        className={`w-full py-4 rounded-2xl font-bold text-white text-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all ${uiColors.accentPrimaryGradient}`}
                    >
                        Start Session
                    </button>
                </div>
            </div>
        );
    }

    // 2. LOADING SCREEN
    if (gameState === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
                </div>
                <p className={`mt-6 font-medium ${uiColors.textSecondary} animate-pulse`}>
                    AI is generating {questionCount} questions...
                </p>
            </div>
        );
    }

    // 3. RESULTS SCREEN (Performance Summary)
    if (gameState === 'results') {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-900 p-6">
                <div className="text-center max-w-sm w-full">
                    <div className="text-6xl mb-6 animate-bounce">🎉</div>
                    <h2 className={`text-3xl font-extrabold mb-2 ${uiColors.textPrimary}`}>Session Complete!</h2>
                    
                    {/* Score Card */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-6 shadow-inner">
                        <div className="flex justify-between items-center mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
                            <span className={uiColors.textSecondary}>Accuracy</span>
                            <span className={`text-xl font-black ${percentage > 70 ? 'text-green-500' : 'text-yellow-500'}`}>{percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className={`flex items-center ${uiColors.textSecondary}`}><FiZap className="mr-2 text-yellow-500"/> XP Earned</span>
                            <span className="text-xl font-black text-purple-500">+{xpEarned}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{score}</div>
                            <div className="text-xs uppercase font-bold text-green-700/60 dark:text-green-400/60">Correct</div>
                        </div>
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{questions.length - score}</div>
                            <div className="text-xs uppercase font-bold text-red-700/60 dark:text-red-400/60">Mistakes</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button onClick={() => setGameState('setup')} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg ${uiColors.accentPrimaryGradient}`}>
                            Train Again
                        </button>
                        <button onClick={onExit} className={`w-full py-3 rounded-xl font-bold border ${uiColors.borderPrimary} ${uiColors.textSecondary} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 4. GAMEPLAY UI
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Top Bar */}
            <div className="h-16 px-6 flex items-center justify-between bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
                <button onClick={onExit} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <FiX className={`w-6 h-6 ${uiColors.textSecondary}`} />
                </button>
                
                {/* Progress Bar */}
                <div className="flex-1 mx-8 h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        className="h-full bg-green-500 rounded-full"
                    />
                </div>

                <div className="font-bold text-green-500 flex items-center bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-lg">
                    <span className="mr-1">{score}</span>
                    <FiCheck className="w-4 h-4" />
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <h2 className={`text-2xl md:text-3xl font-bold text-center leading-relaxed ${uiColors.textPrimary}`}>
                                {q.question}
                            </h2>

                            <div className="space-y-3">
                                {/* Choices */}
                                {q.type === 'choice' && q.options.map((opt, idx) => (
                                    <ChoiceButton 
                                        key={idx} 
                                        label={opt} 
                                        // This line was causing the error. Now userSelection is defined.
                                        status={isAnswered ? (idx === q.answer ? 'correct' : (userSelection === idx ? 'wrong' : 'default')) : 'default'}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={isAnswered}
                                    />
                                ))}
                                
                                {/* True/False */}
                                {q.type === 'true_false' && (
                                    <>
                                        <ChoiceButton label="True" onClick={() => handleAnswer(true)} disabled={isAnswered} status={isAnswered ? (q.answer === true ? 'correct' : (userSelection === true ? 'wrong' : 'default')) : 'default'} />
                                        <ChoiceButton label="False" onClick={() => handleAnswer(false)} disabled={isAnswered} status={isAnswered ? (q.answer === false ? 'correct' : (userSelection === false ? 'wrong' : 'default')) : 'default'} />
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Bottom Sheet (Feedback) */}
            <AnimatePresence>
                {isAnswered && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className={`border-t-2 p-6 pb-8 ${feedback === 'correct' 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900'}`}
                    >
                        <div className="max-w-2xl mx-auto flex items-center justify-between">
                            <div>
                                <div className={`font-bold text-lg mb-1 flex items-center ${feedback === 'correct' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                                    {feedback === 'correct' ? <><FiCheck className="mr-2"/> Correct!</> : <><FiX className="mr-2"/> Incorrect</>}
                                </div>
                                <p className={`text-sm ${feedback === 'correct' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {q.explanation}
                                </p>
                            </div>
                            <button 
                                onClick={nextQuestion}
                                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105 ${feedback === 'correct' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Button Component
function ChoiceButton({ label, status, onClick, disabled }) {
    let styles = "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800";
    if (status === 'correct') styles = "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    if (status === 'wrong') styles = "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    if (status === 'default' && disabled) styles = "border-gray-200 dark:border-gray-700 opacity-50";

    return (
        <button 
            onClick={onClick}
            disabled={disabled}
            className={`w-full p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all ${styles} ${uiColors.textPrimary}`}
        >
            {label}
        </button>
    );
}