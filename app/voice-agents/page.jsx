"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Mic, ArrowRight, Star, Globe2, Plus, X, Bot, ShieldCheck,
  Zap, MessageSquare, Wrench, PhoneCall, Check, PlayCircle,
} from 'lucide-react';
import Header from './_components/header';
import Link from 'next/link';
import Footage from './_components/footage';
import Exploreagents from './_components/exploreagents';
import { SplineSceneBasic } from './_components/SplineSceneBasic';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ end, suffix = '', duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start;
    const tick = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - pct, 3);
      setCount(Math.floor(eased * end));
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Shared variants ───────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ── Static data ───────────────────────────────────────────────────────────────
const faqs = [
  { q: "How does a Doweit Voice agent work?", a: "You create an AI agent by defining its role, selecting a voice, and choosing a language model such as OpenAI or Gemini. The agent handles calls, conversations, or tasks in real time using natural, human-like voice interactions." },
  { q: "What makes Doweit Voice different from other AI tools?", a: "Unlike single-purpose tools, Doweit Voice combines multiple capabilities in one platform — call agents, recruitment AI, character AI, and embeddable voice assistants — all with multilingual support in English, Amharic, and Afan Oromo." },
  { q: "How does the recruitment AI interview system work?", a: "Recruiters upload a job description and the system automatically creates an AI interviewer. It generates a public link for candidates who take voice interviews, then the system analyzes responses and provides scores and feedback." },
  { q: "Can I use my own API keys and models?", a: "Yes, Doweit Voice supports a bring-your-own-key system. Integrate your own keys from providers like OpenAI, Gemini, or ElevenLabs and use your preferred models and voice services within the platform." },
  { q: "How are payments and credits handled?", a: "The platform uses a credit-based system where each interaction (calls, interviews, or AI usage) consumes credits. You can securely add credits and manage usage directly from your dashboard." },
];

const testimonials = [
  { name: "Sarah K.", role: "Head of Talent @ Nexus Corp", quote: "Doweit's recruitment AI cut our interview time by 70%. The Amharic support alone was a game-changer for our Ethiopian operations.", rating: 5, avatar: "https://i.pravatar.cc/100?img=5" },
  { name: "Dawit M.", role: "CTO @ Addis Fintech", quote: "We deployed 12 inbound call agents in a weekend. Our support volume tripled but our team size stayed the same.", rating: 5, avatar: "https://i.pravatar.cc/100?img=11" },
  { name: "Yemisi A.", role: "Product Lead @ VoiceFlow", quote: "The embedded SDK is incredibly easy. I had a voice assistant on my SaaS in under 2 hours. The character AI for onboarding is magical.", rating: 5, avatar: "https://i.pravatar.cc/100?img=9" },
];

const steps = [
  { step: "01", title: "Define Your Agent", desc: "Upload a job description, write a system prompt, or pick from templates. Your agent is ready in minutes.", icon: Bot, color: "from-violet-500 to-purple-600" },
  { step: "02", title: "Choose Voice & Language", desc: "Pick from 50+ voices across English, Amharic, and Afan Oromo. Preview in real-time before deploying.", icon: Mic, color: "from-pink-500 to-rose-600" },
  { step: "03", title: "Deploy & Scale", desc: "Go live with one click. Your agent handles unlimited parallel conversations with zero infrastructure.", icon: Zap, color: "from-cyan-500 to-blue-600" },
];

const features = [
  { icon: PhoneCall, title: "AI Call Agents", desc: "A departure from robotic IVRs — natural, human-like voice interactions for customer support and sales.", gradient: "from-violet-500 to-primary" },
  { icon: Globe2, title: "Multilingual Support", desc: "Communicate fluently in English, Amharic, and Afan Oromo with our proprietary neural engines.", gradient: "from-pink-500 to-secondary" },
  { icon: Wrench, title: "Custom Agent Builder", desc: "Build, deploy, and manage custom AI voice agents tailored to your specific business needs.", gradient: "from-cyan-500 to-blue-500", featured: true },
];

const logos = [
  { Icon: Bot,          name: "OpenAI",   color: "text-violet-500",  bg: "bg-violet-500/10"  },
  { Icon: Zap,          name: "Gemini",   color: "text-yellow-400",  bg: "bg-yellow-400/10"  },
  { Icon: ShieldCheck,  name: "DeepSeek", color: "text-cyan-400",    bg: "bg-cyan-400/10"    },
  { Icon: MessageSquare,name: "Grok",     color: "text-rose-500",    bg: "bg-rose-500/10"    },
  { Icon: Mic,          name: "Vapi",     color: "text-purple-500",  bg: "bg-purple-500/10"  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [openFaq, setOpenFaq] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setActiveIdx(prev => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const goTo = (idx) => {
    setDirection(idx > activeIdx ? 1 : -1);
    setActiveIdx(idx);
  };

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-primary/30 selection:text-primary">
      <Header />

      <main>

        {/* ── 3D Robot ─────────────────────────── KEEP ── */}
        <section id="hero" className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <SplineSceneBasic />
          </div>
        </section>

        {/* ── Native Multilingual ───────────────── KEEP ── */}
        <section id="features" className="py-24 px-6 bg-surface/30 border-y border-border-color">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">

              {/* Left — animated globe */}
              <motion.div
                initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
                className="relative flex items-center justify-center h-[400px]"
              >
                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full w-3/4 h-3/4 m-auto" />

                {/* Concentric rings — each rotates at own speed */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    className="w-[300px] h-[300px] rounded-full border border-primary/40 absolute" />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
                    className="w-[400px] h-[400px] rounded-full border border-primary/25 absolute" />
                  <div className="w-[500px] h-[500px] rounded-full border border-primary/10 absolute" />
                </div>

                {/* Globe — gentle pulse */}
                <motion.div
                  className="relative z-10 text-primary"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Globe2 className="w-32 h-32" strokeWidth={1.5} />
                </motion.div>

                {/* Language pills — circular orbit */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                >
                  {[
                    { label: 'English', angle: 0 },
                    { label: 'Afan Oromo', angle: 120 },
                    { label: 'Amharic', angle: 240 },
                  ].map(({ label, angle }) => {
                    const rad = (angle - 90) * (Math.PI / 180);
                    const r = 170;
                    return (
                      <motion.div
                        key={label}
                        className="absolute"
                        style={{ x: Math.cos(rad) * r, y: Math.sin(rad) * r }}
                        animate={{ rotate: -360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                      >
                        <div className="bg-primary text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg whitespace-nowrap ring-2 ring-primary/20">
                          {label}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>

              {/* Right — content */}
              <motion.div
                initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: "-50px" }} variants={stagger}
              >
                <motion.h2 variants={fadeUp} className="text-5xl font-bold mb-6 text-text-main leading-tight">
                  Native<br />Multilingual<br />Support
                </motion.h2>
                <motion.p variants={fadeUp} className="text-text-secondary text-lg mb-8 leading-relaxed">
                  Break language barriers with native support for Ethiopian languages and global dialects.
                  Our neural engines capture cultural nuances and regional accents perfectly.
                </motion.p>
                <ul className="space-y-4">
                  {["Full Amharic Speech-to-Speech support", "High-fidelity Afan Oromo voice models", "Real-time code-switching between languages"].map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeUp}
                      className="flex items-center gap-3 text-text-main font-medium"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </div>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Explore Agents ────────────────────────────── */}
        <Exploreagents />

        {/* ── How It Works ──────────────────────────────── */}
        <motion.section
          id="how-it-works"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} variants={stagger}
          className="py-24 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <div className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-4">Process</div>
              <h2 className="text-4xl md:text-5xl font-bold">Up and running in minutes</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-14 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-border-color to-transparent z-0" />

              {steps.map((s, i) => (
                <motion.div
                  key={i} variants={fadeUp}
                  whileHover={{ y: -8, boxShadow: '0 24px 60px -10px rgba(135,91,249,0.18)' }}
                  className="relative z-10 flex flex-col items-center text-center p-8 rounded-3xl border border-border-color bg-surface hover:border-primary/40 transition-all duration-300 group"
                >
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-6 shadow-lg`}
                    whileHover={{ rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <s.icon className="w-9 h-9 text-white" />
                  </motion.div>
                  <div className="text-xs font-black tracking-widest text-primary/50 uppercase mb-3">{s.step}</div>
                  <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Testimonials — single-card carousel ───────── */}
        <motion.section
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
          className="py-24 px-6"
        >
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <div className="text-xs font-semibold tracking-widest text-text-secondary uppercase mb-4">Social Proof</div>
              <h2 className="text-4xl md:text-5xl font-bold">Trusted by builders</h2>
            </div>

            {/* Card area */}
            <div className="relative overflow-hidden min-h-[280px] flex items-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={activeIdx}
                  custom={direction}
                  variants={{
                    enter:  (d) => ({ opacity: 0, x: d * 80 }),
                    center: { opacity: 1, x: 0 },
                    exit:   (d) => ({ opacity: 0, x: d * -80 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full bg-surface border border-border-color rounded-3xl p-10 flex flex-col gap-6"
                >
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: testimonials[activeIdx].rating }).map((_, j) => (
                      <motion.div
                        key={j}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.07 }}
                      >
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-text-main text-lg leading-relaxed">
                    "{testimonials[activeIdx].quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border-color">
                    <img
                      src={testimonials[activeIdx].avatar}
                      alt={testimonials[activeIdx].name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
                    />
                    <div>
                      <div className="font-bold">{testimonials[activeIdx].name}</div>
                      <div className="text-sm text-text-secondary">{testimonials[activeIdx].role}</div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Dot navigation */}
            <div className="flex items-center justify-center gap-3 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="focus:outline-none"
                  aria-label={`Go to testimonial ${i + 1}`}
                >
                  <motion.div
                    animate={{
                      width: i === activeIdx ? 28 : 8,
                      backgroundColor: i === activeIdx ? '#875bf9' : '#d1d5db',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ── Stats Banner ──────────────────────────────── */}
        <motion.section
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
          className="py-12 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary text-white rounded-3xl p-12 md:p-20 relative overflow-hidden">
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
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
              />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />

              <div className="grid md:grid-cols-3 gap-12 relative z-10 items-center">
                <div>
                  <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tight">
                    <AnimatedCounter end={50} suffix="+" />
                  </div>
                  <div className="text-white/80 text-lg">AI Agents deployed</div>
                </div>
                <div>
                  <div className="text-5xl md:text-7xl font-bold mb-2 tracking-tight">
                    <AnimatedCounter end={5} suffix="k+" duration={2.5} />
                  </div>
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

        {/* ── Logos Marquee ─────────────────────────────── */}
        <section
          className="py-14 border-y border-border-color bg-surface/50 overflow-hidden"
          style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <p className="text-center text-xs font-semibold tracking-widest text-text-secondary uppercase mb-8">
            Powered by the best in AI
          </p>
          <div
            className="flex items-center gap-6 animate-marquee"
            style={{ width: 'max-content', paddingRight: '1.5rem' }}
          >
            {[...logos, ...logos, ...logos].map((logo, i) => (
              <div
                key={i}
                className={`flex items-center gap-2.5 whitespace-nowrap shrink-0 px-5 py-2.5 rounded-full border border-border-color ${logo.bg} hover:border-primary/30 transition-all duration-300 group`}
              >
                <logo.Icon className={`w-5 h-5 ${logo.color}`} />
                <span className="text-sm font-semibold text-text-main">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────── */}
        <motion.section
          id="faq"
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="border-b border-border-color py-4"
                  >
                    <button
                      className="w-full flex justify-between items-center text-left py-4 hover:text-primary transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-xl font-medium">{faq.q}</span>
                      <motion.span
                        animate={{ rotate: openFaq === i ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-text-secondary ml-4 shrink-0"
                      >
                        <Plus className="w-5 h-5" />
                      </motion.span>
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="text-text-secondary leading-relaxed pb-6 pr-12">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Final CTA ─────────────────────────────────── */}
        <motion.section
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: "-50px" }} variants={fadeUp}
          className="py-12 px-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="bg-primary text-white rounded-3xl p-12 md:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
              />
              <motion.div
                className="absolute top-8 right-32 w-24 h-24 bg-secondary/30 rounded-full blur-xl"
                animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute bottom-8 right-16 w-16 h-16 bg-white/10 rounded-full blur-xl"
                animate={{ y: [0, 20, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              />

              <div className="max-w-xl relative z-10">
                <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                  Change the way you build{' '}
                  <span className="font-serif italic font-normal">AI Agents</span>
                </h2>
                <p className="text-white/80 mb-10 text-lg">
                  Join over 10,000 developers who choose Doweit Voice for fast and secure AI automation.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/voice-agents-dashboard"
                    className="bg-white text-primary px-8 py-4 rounded-full font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                  >
                    Get Started Now <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button className="border border-white/30 text-white px-8 py-4 rounded-full font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" /> Watch Demo
                  </button>
                </div>
              </div>

              <div className="relative z-10 w-full md:w-1/3 flex justify-center">
                <div className="relative w-48 h-48">
                  <motion.div
                    className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full rounded-tr-none rounded-bl-none transform rotate-45 opacity-90"
                    animate={{ rotate: [45, 90, 45] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full rounded-tr-none rounded-bl-none transform rotate-45 opacity-90"
                    animate={{ rotate: [45, 0, 45] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-secondary rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      <Footage />
    </div>
  );
}
