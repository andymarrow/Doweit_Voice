"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
    Check, 
    X, 
    Zap, 
    Shield, 
    Headset, 
    ArrowLeft,
    Sparkles
} from "lucide-react";

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

export default function PremiumPlansPage() {
    const [isAnnual, setIsAnnual] = useState(true);

    const plans = [
        {
            name: "Starter",
            description: "Perfect for exploring and building your first AI agents.",
            priceMonthly: 0,
            priceAnnual: 0,
            popular: false,
            features: [
                { text: "Up to 2 Active Agents", included: true },
                { text: "1,000 Voice Minutes / mo", included: true },
                { text: "Standard TTS Voices", included: true },
                { text: "Community Support", included: true },
                { text: "Web & Phone Deployment", included: true },
                { text: "Custom Knowledge Bases", included: false },
                { text: "API & Webhook Access", included: false },
            ]
        },
        {
            name: "Professional",
            description: "For growing businesses automating their customer interactions.",
            priceMonthly: 79,
            priceAnnual: 59, // $59/mo billed annually
            popular: true,
            features: [
                { text: "Up to 15 Active Agents", included: true },
                { text: "10,000 Voice Minutes / mo", included: true },
                { text: "Premium & Cloned Voices", included: true },
                { text: "Priority Email Support", included: true },
                { text: "Web & Phone Deployment", included: true },
                { text: "Custom Knowledge Bases", included: true },
                { text: "API & Webhook Access", included: true },
            ]
        },
        {
            name: "Enterprise",
            description: "Unlimited scale and white-glove support for large teams.",
            priceMonthly: "Custom",
            priceAnnual: "Custom",
            popular: false,
            features: [
                { text: "Unlimited Active Agents", included: true },
                { text: "Custom Volume Pricing", included: true },
                { text: "Ultra-Low Latency Routing", included: true },
                { text: "Dedicated Slack Channel", included: true },
                { text: "White-labeled Widgets", included: true },
                { text: "SSO & Advanced Security", included: true },
                { text: "Custom Integration Build", included: true },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-cyan-500/30 font-sans pb-24">
            
            {/* --- NAVIGATION BAR --- */}
            <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
                <Link href="/voice-agents-dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Workspace
                </Link>
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-[10px]">DV</div>
                    Doweit Voice
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <div className="max-w-3xl mx-auto text-center px-6 pt-12 pb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase tracking-widest mb-6 border border-purple-200 dark:border-purple-500/20">
                    <Zap className="w-3.5 h-3.5" />
                    Simple, Transparent Pricing
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                    Scale your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-purple-600">AI Workforce</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                    Start for free. Upgrade when you need more agents, custom voices, and advanced API integrations to supercharge your business.
                </p>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4">
                    <span className={`text-sm font-semibold ${!isAnnual ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>Monthly</span>
                    <button 
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="relative w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-colors p-1"
                    >
                        <motion.div 
                            className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full shadow-md"
                            layout
                            animate={{ x: isAnnual ? 24 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    </button>
                    <span className={`text-sm font-semibold flex items-center gap-2 ${isAnnual ? "text-gray-900 dark:text-white" : "text-gray-500"}`}>
                        Annually <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">SAVE 20%</span>
                    </span>
                </div>
            </div>

            {/* --- PRICING CARDS --- */}
            <motion.div 
                className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {plans.map((plan, index) => (
                    <motion.div 
                        key={plan.name}
                        variants={cardVariants}
                        className={`relative rounded-[2rem] flex flex-col p-8 md:p-10 transition-all duration-300
                            ${plan.popular 
                                ? 'bg-white dark:bg-gray-900 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10 md:-translate-y-4' 
                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg hover:shadow-xl'}
                        `}
                    >
                        {/* Popular Badge */}
                        {plan.popular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Most Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 h-10">{plan.description}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-end gap-1">
                                {typeof plan.priceMonthly === 'number' ? (
                                    <>
                                        <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                            ${isAnnual ? plan.priceAnnual : plan.priceMonthly}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400 font-medium mb-1">/mo</span>
                                    </>
                                ) : (
                                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                        Let's Talk
                                    </span>
                                )}
                            </div>
                            {typeof plan.priceMonthly === 'number' && plan.priceMonthly > 0 && isAnnual && (
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                                    Billed ${plan.priceAnnual * 12} yearly
                                </p>
                            )}
                            {typeof plan.priceMonthly === 'number' && plan.priceMonthly > 0 && !isAnnual && (
                                <p className="text-xs text-gray-400 mt-2">Billed monthly</p>
                            )}
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {plan.features.map((feature, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm">
                                    <div className={`mt-0.5 shrink-0 ${feature.included ? 'text-cyan-500' : 'text-gray-300 dark:text-gray-700'}`}>
                                        {feature.included ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                    </div>
                                    <span className={feature.included ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400 dark:text-gray-600'}>
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <button className={`w-full py-4 rounded-xl font-bold transition-all shadow-md active:scale-95
                            ${plan.popular 
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/25' 
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'}
                        `}>
                            {plan.name === "Enterprise" ? "Contact Sales" : plan.name === "Starter" ? "Current Plan" : "Upgrade to Pro"}
                        </button>
                    </motion.div>
                ))}
            </motion.div>

            {/* --- TRUST FOOTER --- */}
            <div className="max-w-5xl mx-auto mt-24 px-6 grid grid-cols-1 md:grid-cols-2 gap-8 py-10 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Enterprise-grade Security</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Your data is encrypted at rest and in transit. We are GDPR compliant and never use your private data to train public models.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl">
                        <Headset className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-1">Expert Onboarding</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">Need help migrating? Pro and Enterprise plans come with dedicated onboarding support to get your agents live fast.</p>
                    </div>
                </div>
            </div>

        </div>
    );
}