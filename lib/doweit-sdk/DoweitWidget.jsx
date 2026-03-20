// lib/doweit-sdk/DoweitWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, X, MessageSquare, Loader2, Zap } from 'lucide-react';
import { useDoweitVoice } from './useDoweitVoice';

export function DoweitWidget({ client }) {
    const [isOpen, setIsOpen] = useState(false);
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef(null);

    // Initialize the core voice/logic hook
    const { 
        status, 
        messages, 
        currentAction, 
        connect, 
        disconnect, 
        sendText 
    } = useDoweitVoice(client);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, status, currentAction]);

    const handleToggleVoice = () => {
        if (status === 'idle' || status === 'error') {
            connect();
        } else {
            disconnect();
        }
    };

    const handleSendText = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        sendText(inputText);
        setInputText('');
    };

    // --- UI Helpers for State Visualization ---
    const getStatusDisplay = () => {
        switch (status) {
            case 'connecting': return { text: 'Connecting...', color: 'text-yellow-500', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
            case 'listening': return { text: 'Listening...', color: 'text-emerald-500', icon: <Mic className="w-4 h-4 animate-pulse" /> };
            case 'thinking': return { text: 'Thinking...', color: 'text-blue-500', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
            case 'speaking': return { text: 'Speaking...', color: 'text-purple-500', icon: <div className="flex gap-1"><span className="w-1 h-3 bg-purple-500 animate-pulse"></span><span className="w-1 h-4 bg-purple-500 animate-pulse delay-75"></span><span className="w-1 h-2 bg-purple-500 animate-pulse delay-150"></span></div> };
            case 'executing': return { text: `Executing: ${currentAction}`, color: 'text-orange-500', icon: <Zap className="w-4 h-4 animate-bounce" /> };
            case 'error': return { text: 'Connection Error', color: 'text-red-500', icon: <X className="w-4 h-4" /> };
            default: return { text: 'Ready', color: 'text-gray-400', icon: <MessageSquare className="w-4 h-4" /> };
        }
    };

    const statusDisplay = getStatusDisplay();

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col"
                        style={{ height: '500px', maxHeight: '80vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-4 flex justify-between items-center text-white shrink-0">
                            <div>
                                <h3 className="font-bold text-lg leading-tight">{client?.agentConfig?.agent?.name || 'Doweit Assistant'}</h3>
                                <div className="flex items-center gap-1.5 mt-1 bg-black/20 w-fit px-2 py-0.5 rounded-full">
                                    {statusDisplay.icon}
                                    <span className="text-[10px] font-medium tracking-wide uppercase">{statusDisplay.text}</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Executing Action Banner */}
                        <AnimatePresence>
                            {status === 'executing' && currentAction && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-orange-100 dark:bg-orange-900/30 border-b border-orange-200 dark:border-orange-800/50 p-3 flex items-center gap-3 shrink-0"
                                >
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/30">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-widest">App Action Triggered</p>
                                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Running `{currentAction}`...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                            {messages.length === 0 && status === 'idle' && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 space-y-3 opacity-70">
                                    <MessageSquare className="w-12 h-12" />
                                    <p className="text-sm">Tap the mic or type to start.</p>
                                </div>
                            )}
                            
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                            <form onSubmit={handleSendText} className="flex items-center gap-2">
                                <button 
                                    type="button"
                                    onClick={handleToggleVoice}
                                    className={`p-3 rounded-xl transition-all shadow-sm flex items-center justify-center ${
                                        status !== 'idle' && status !== 'error'
                                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'
                                    }`}
                                >
                                    {status !== 'idle' && status !== 'error' ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                                
                                <input 
                                    type="text" 
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 dark:bg-gray-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-gray-950 focus:ring-0 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-100 outline-none transition-all"
                                />
                                
                                <button 
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white transition-colors shadow-sm disabled:shadow-none"
                                >
                                    <Send className="w-5 h-5 ml-0.5" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Action Button (FAB) */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-colors relative z-50 ${
                    status === 'listening' ? 'bg-emerald-500' :
                    status === 'speaking' ? 'bg-purple-600' :
                    status === 'executing' ? 'bg-orange-500' :
                    'bg-blue-600'
                }`}
            >
                {/* Ping animation behind the button if active */}
                {status !== 'idle' && status !== 'error' && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-current opacity-30 animate-ping" />
                )}
                
                {isOpen ? <X className="w-6 h-6" /> : (
                    status === 'idle' || status === 'error' ? <MessageSquare className="w-6 h-6" /> : statusDisplay.icon
                )}
            </motion.button>
        </div>
    );
}