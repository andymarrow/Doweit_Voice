"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, 
  Moon, 
  Mic, 
  ArrowRight, 
  Star, 
  Globe2, 
  Users, 
  TrendingUp, 
  Plus, 
  X, 
  Bot, 
  ShieldCheck, 
  Zap, 
  MessageSquare,
  Twitter,
  Linkedin,
  Github,
  Menu,
  Wrench,
  PhoneCall,
  Check,
  User,
  Home
} from 'lucide-react';
import Header from './_components/header';
import Link from 'next/link';
import Footage from './_components/footage';
import Hero from '../_components/Hero';
import Exploreagents from './_components/exploreagents'

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Handle theme switching
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.1 
      }
    }
  };

const faqs = [
  {
    q: "How does a Doweit Voice agent work?",
    a: "You can create an AI agent by defining its role, selecting a voice, and choosing a language model such as OpenAI or Gemini. The agent can then handle calls, conversations, or tasks in real time using natural, human-like voice interactions."
  },
  {
    q: "What makes Doweit Voice different from other AI tools?",
    a: "Unlike single-purpose tools, Doweit Voice combines multiple capabilities in one platform, including call agents, recruitment AI, character AI, and embeddable voice assistants, all with multilingual support in English, Amharic, and Afan Oromo."
  },
  {
    q: "How does the recruitment AI interview system work?",
    a: "Recruiters can upload a job description, and the system automatically creates an AI interviewer. It generates a public link that candidates can use to take voice interviews, after which the system analyzes responses and provides scores and feedback."
  },
  {
    q: "Can I use my own API keys and models?",
    a: "Yes, Doweit Voice supports a bring-your-own-key system. You can integrate your own API keys from providers like OpenAI, Gemini, or ElevenLabs and use your preferred models and voice services داخل the platform."
  },
  {
    q: "How are payments and credits handled?",
    a: "The platform uses a credit-based system where each interaction (calls, interviews, or AI usage) consumes credits. You can securely add credits and manage usage directly from your dashboard."
  }
];

  return (
    <div className="min-h-screen bg-background text-text-main font-sans transition-colors duration-300 selection:bg-primary/30 selection:text-primary">
      
      {/* Top Banner */}
      <div className="bg-primary text-white text-xs py-2 text-center flex items-center justify-center gap-2 font-medium">
        🚀 Session 2026 • Early-bird registration now open <ArrowRight className="w-3 h-3" />
      </div>

      {/* Navbar */}
      <Header />
      <main>

        {/* Hero Section */}
        <section className="py-12 md:py-20 px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Hero Left */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-xl"
            >
              <div className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-6">
                Try it now!
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
                Change the way <br/>
                you build <br/>
                <span className="font-serif italic font-normal text-primary">AI Agents</span>
              </h1>
              <p className="text-lg text-text-secondary mb-10 leading-relaxed max-w-md">
                From your everyday customer support, to planning for your future with automated sales, Doweit Voice helps you get more from your conversations.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <Link href="/voice-agents-dashboard" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-full transition-colors text-center">
                  Get Started Now
                </Link>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="font-bold ml-2 text-sm">5.0</span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    from 120+ <span className="underline decoration-border-color underline-offset-2">reviews</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Hero Right (Bento Grid) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="grid grid-cols-2 gap-4 h-[500px]"
            >
              {/* Column 1 */}
              <div className="flex flex-col gap-4 h-full">
                {/* Phone Mockup Card */}
                <div className="bg-surface-light rounded-3xl p-6 flex-1 border border-border-color relative overflow-hidden flex flex-col items-center justify-center group">
                  <div className="absolute top-6 right-6 flex flex-col gap-2">
                    <div className="w-12 h-2 bg-border-color rounded-full" />
                    <div className="w-8 h-2 bg-border-color rounded-full" />
                  </div>
                  <div className="w-32 h-48 bg-surface rounded-2xl shadow-sm border border-border-color p-4 flex flex-col gap-3 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 ease-out">
                    <div className="w-full h-3 bg-border-color rounded-full" />
                    <div className="w-3/4 h-3 bg-border-color rounded-full" />
                    <div className="mt-auto w-full h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
                {/* Users Active Card */}
                <div className="bg-surface-light rounded-3xl p-6 h-40 border border-border-color flex flex-col justify-between relative overflow-hidden">
                  <div className="flex gap-2">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <div className="text-lg font-medium">Active Agents</div>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-3">
                      <div className="w-8 h-8 rounded-full bg-surface border-2 border-surface-light flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="user" /></div>
                      <div className="w-8 h-8 rounded-full bg-surface border-2 border-surface-light flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=2" alt="user" /></div>
                      <div className="w-8 h-8 rounded-full bg-surface border-2 border-surface-light flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=3" alt="user" /></div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 -rotate-45" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4 h-full">
                {/* Languages Card */}
                <div className="bg-accent rounded-3xl p-6 h-48 rounded-tr-[4rem] border border-border-color flex flex-col justify-between">
                  <div className="text-4xl font-bold text-text-main">5+</div>
                  <div className="text-lg font-medium text-text-main">Languages</div>
                  <div className="self-end mt-auto">
                    <Globe2 className="w-12 h-12 text-primary opacity-50" strokeWidth={1} />
                  </div>
                </div>
                {/* Stats Card */}
                <div className="bg-primary text-white rounded-3xl p-6 flex-1 relative overflow-hidden flex flex-col justify-between">
                  <div>
                    <div className="text-3xl font-bold mb-1">1.8k+</div>
                    <div className="text-sm text-white/80 flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 -rotate-45" /> Calls Handled
                    </div>
                  </div>
                  <div className="mt-auto h-24 relative">
                    {/* Mock Line Chart */}
                    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <path 
                        d="M0,40 L10,35 L20,45 L30,20 L40,25 L50,10 L60,15 L70,5 L80,10 L90,0 L100,5" 
                        fill="none" 
                        stroke="white" 
                        strokeWidth="2"
                        className="drop-shadow-md"
                      />
                      <circle cx="100" cy="5" r="3" fill="white" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="py-12 border-y border-border-color bg-surface/50 overflow-hidden">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between items-center gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500"
          >
            {[
              { icon: <Bot className="w-6 h-6" />, name: "OpenAI" },
              { icon: <Zap className="w-6 h-6" />, name: "Gemini" },
              { icon: <ShieldCheck className="w-6 h-6" />, name: "DeepSeek" },
              { icon: <MessageSquare className="w-6 h-6" />, name: "Grok" },
              { icon: <Mic className="w-6 h-6" />, name: "Vapi" }
            ].map((logo, i) => (
              <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-xl font-bold">
                {logo.icon} {logo.name}
              </motion.div>
            ))}
          </motion.div>
        </section>


        {/* Native Multilingual Support */}
        <section className="py-24 px-6 bg-surface/30 border-y border-border-color">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Left Graphic */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                className="relative flex items-center justify-center h-[400px]"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full w-3/4 h-3/4 m-auto" />
                
                {/* Concentric Circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[300px] h-[300px] rounded-full border border-primary/30 absolute" />
                  <div className="w-[400px] h-[400px] rounded-full border border-primary/20 absolute" />
                  <div className="w-[500px] h-[500px] rounded-full border border-primary/10 absolute" />
                </div>

                {/* Center Icon */}
                <div className="relative z-10 text-primary">
                  <Globe2 className="w-32 h-32" strokeWidth={1.5} />
                </div>

                {/* Language Pills */}
                <div className="absolute top-[15%] right-[15%] bg-primary text-white font-bold px-4 py-2 rounded-full text-sm z-20 shadow-lg">
                  English
                </div>
                <div className="absolute top-[25%] left-[10%] bg-primary text-white font-bold px-4 py-2 rounded-full text-sm z-20 shadow-lg">
                  Afan Oromo
                </div>
                <div className="absolute bottom-[20%] left-[5%] bg-primary text-white font-bold px-4 py-2 rounded-full text-sm z-20 shadow-lg">
                  Amharic
                </div>
              </motion.div>

              {/* Right Content */}
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
				>
                <h2 className="text-5xl font-bold mb-6 text-text-main leading-tight">
                  Native<br/>Multilingual<br/>Support
                </h2>
                <p className="text-text-secondary text-lg mb-8 leading-relaxed">
                  Break language barriers with native support for Ethiopian languages and global dialects. Our neural engines capture the cultural nuances and regional accents perfectly.
                </p>
                <ul className="space-y-4">
                  {[
                    "Full Amharic Speech-to-Speech support",
                    "High-fidelity Afan Oromo voice models",
                    "Real-time code-switching between languages"
				].map((item, i) => (
					<li key={i} className="flex items-center gap-3 text-text-main font-medium">
                      <Check className="w-5 h-5 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Explore Agents */}
		<Exploreagents/>
        

        {/* Values (Features) */}
        <motion.section 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="py-24 px-6 bg-surface/30 border-t border-border-color"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeUp} className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <div className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-4">Values</div>
                <h2 className="text-4xl md:text-5xl font-bold max-w-md leading-tight">Make your conversations, Well-spoken</h2>
              </div>
              <p className="text-text-secondary max-w-sm">
                Manages a diversified group of specialized voice agents with efficient tech-enabled processes.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div variants={fadeUp} className="border border-border-color rounded-3xl p-8 bg-surface hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-border-color flex items-center justify-center mb-6 text-primary">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Call Agents</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  A departure from robotic IVRs, providing natural, human-like voice interactions for customer support and sales.
                </p>
                <button className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="border border-border-color rounded-3xl p-8 bg-surface hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-border-color flex items-center justify-center mb-6 text-primary">
                  <Globe2 className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multilingual Support</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  Our proprietary AI platform helps your business communicate fluently in English, Amharic, and Afan Oromo.
                </p>
                <button className="w-10 h-10 rounded-full border border-border-color flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-surface-light rounded-3xl p-8 rounded-tr-[4rem] border border-border-color hover:border-primary/30 transition-colors group">
                <div className="w-12 h-12 rounded-full border border-border-color flex items-center justify-center mb-6 text-primary bg-surface">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold mb-3">Custom Agent Builder</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-8">
                  We provide access to powerful tools to build, deploy, and manage custom AI voice agents tailored to your specific business needs.
                </p>
                <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors">
                  <ArrowRight className="w-4 h-4 -rotate-45" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Stats Banner */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="py-12 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary text-white rounded-3xl p-12 md:p-20 relative overflow-hidden">
              {/* Abstract Background */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="waves" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                      <path d="M0 50 Q 25 25 50 50 T 100 50" fill="none" stroke="white" strokeWidth="2" />
                      <path d="M0 70 Q 25 45 50 70 T 100 70" fill="none" stroke="white" strokeWidth="2" />
                      <path d="M0 90 Q 25 65 50 90 T 100 90" fill="none" stroke="white" strokeWidth="2" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#waves)" />
                </svg>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />

              <div className="grid md:grid-cols-3 gap-12 relative z-10 items-center">
                <div>
                  <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tight">50+</div>
                  <div className="text-white/80 text-lg">AI Agents deployed</div>
                </div>
                <div>
                  <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tight">5k+</div>
                  <div className="text-white/80 text-lg">Minutes processed</div>
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-widest text-white/60 uppercase mb-4">Numbers</div>
                  <h3 className="text-3xl md:text-4xl font-bold leading-tight">Market and build the solutions</h3>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="py-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-12 gap-12">
              <div className="md:col-span-4">
                <div className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-4">FAQ</div>
                <h2 className="text-4xl font-bold leading-tight">Frequently asked questions</h2>
              </div>
              
              <div className="md:col-span-8 flex flex-col gap-2">
                {faqs.map((faq, i) => (
                  <div 
                    key={i} 
                    className="border-b border-border-color py-4"
                  >
                    <button 
                      className="w-full flex justify-between items-center text-left py-4 hover:text-primary transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-xl font-medium">{faq.q}</span>
                      <span className="text-text-secondary ml-4">
                        {openFaq === i ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-text-secondary leading-relaxed pb-6 pr-12">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <motion.section 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUp}
          className="py-12 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary text-white rounded-3xl p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              
              <div className="max-w-xl relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Change the way you build <span className="font-serif italic font-normal">AI Agents</span>
                </h2>
                <p className="text-white/80 mb-10 text-lg">
                  Join over 10,000 developers who choose Doweit Voice for fast and secure AI automation.
                </p>
                <Link href="/voice-agents-dashboard" className="bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-colors inline-block">
                  Get Started Now
                </Link>
              </div>

              {/* Graphics */}
              <div className="relative z-10 w-full md:w-1/3 flex justify-center">
                <div className="relative w-48 h-48">
                  {/* Abstract Star Shapes */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full rounded-tr-none rounded-bl-none transform rotate-45 opacity-90" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full rounded-tr-none rounded-bl-none transform rotate-45 opacity-90" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-accent rounded-full" />
                </div>
              </div>

            </div>
          </div>
        </motion.section>
      </main>
	  <Footage/>
    </div>
  );
}
