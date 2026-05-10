"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  PhoneCall,
  MessageSquare,
  Code2,
  Briefcase,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// --- Framer Motion Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// --- Portal Data ---
const portals = [
  {
    id: "callagents",
    title: "Call Agents",
    tagline: "Telephony & Operations",
    description:
      "Deploy autonomous voice agents to handle inbound customer support, outbound sales, and live appointment booking 24/7.",
    icon: PhoneCall,
    href: "/callagents",
    // Unsplash: Abstract soundwaves/tech
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    color: "from-blue-600/90 to-cyan-600/90",
    hoverColor: "group-hover:border-cyan-500/50 group-hover:shadow-cyan-500/20",
  },
  {
    id: "embedded",
    title: "Web Assistants",
    tagline: "Embedded SDK",
    description:
      "Wrap your website with our SDK. Expose your JavaScript functions and let our AI execute them based on user voice commands.",
    icon: Code2,
    href: "/callagents/embedded",
    // Unsplash: Glowing code/laptop
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop",
    color: "from-purple-600/90 to-pink-600/90",
    hoverColor:
      "group-hover:border-purple-500/50 group-hover:shadow-purple-500/20",
  },
  {
    id: "recruitment",
    title: "Recruitment AI",
    tagline: "Automated Hiring",
    description:
      "Generate AI interviewers from Job Descriptions. Send candidates a magic link and get detailed scorecards and anti-cheat reports.",
    icon: Briefcase,
    href: "/recruiter",
    // Unsplash: Professional office/interview abstract
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop",
    color: "from-emerald-600/90 to-teal-600/90",
    hoverColor:
      "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20",
  },
  {
    id: "Trainee",
    title: "Trainee AI",
    tagline: "candidate training",
    description:
      "Generate AI interviewees for training purposes. the trainee module allows you to create AI candidates based on real job descriptions, enabling recruiters and hiring managers to practice their interviewing skills and refine their evaluation criteria in a risk-free environment.",
    icon: Briefcase,
    href: "/trainee",
    // Unsplash: Professional office/interview abstract
    image:
      "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop",
    color: "from-emerald-600/90 to-teal-600/90",
    hoverColor:
      "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20",
  },
  {
    id: "character",
    title: "Character AI",
    tagline: "Entertainment & Chat",
    description:
      "Create and chat with highly customized, persona-driven AI characters. Choose their voice, backstory, and share them with the community.",
    icon: MessageSquare,
    href: "/characterai",
    // Unsplash: Creative neon abstract
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop",
    color: "from-orange-600/90 to-rose-600/90",
    hoverColor:
      "group-hover:border-orange-500/50 group-hover:shadow-orange-500/20",
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-full flex flex-col p-4 md:p-6 lg:p-8 xl:max-w-7xl xl:mx-auto w-full">
      {/* --- 1. HERO / WELCOME SECTION --- */}
      <motion.div
        className="relative w-full rounded-[2rem] overflow-hidden p-8 md:p-12 mb-8 border border-gray-200 dark:border-gray-800 shadow-sm"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-0"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-400/20 dark:bg-cyan-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
        <div
          className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4 border border-cyan-100 dark:border-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Workspace Overview
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
              What are we building today?
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Select a module below to manage your AI workforce. From autonomous
              call agents to embedded web assistants and interactive characters.
            </p>
          </div>
        </div>
      </motion.div>

      {/* --- 2. MAIN PORTAL GRID --- */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {portals.map((portal) => (
          <motion.div
            key={portal.id}
            variants={itemVariants}
            className="h-full"
          >
            <Link href={portal.href} className="block h-full">
              <div
                className={`group relative h-full rounded-[2rem] overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 ${portal.hoverColor}`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${portal.image})` }}
                ></div>

                {/* Gradient Overlay (Ensures text readability) */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${portal.color} opacity-90 dark:opacity-85 z-10`}
                ></div>

                {/* Card Content */}
                <div className="relative z-20 p-8 flex flex-col h-full text-white">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                      <portal.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">
                      {portal.tagline}
                    </p>
                    <h2 className="text-3xl font-extrabold tracking-tight mb-3">
                      {portal.title}
                    </h2>
                    <p className="text-white/80 text-sm leading-relaxed max-w-[90%]">
                      {portal.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
