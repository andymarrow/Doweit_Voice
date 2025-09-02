// /app/_components/Hero.jsx (or wherever your Hero component is)

"use client"; // Add this directive for framer-motion

import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion'; // Import framer-motion

export default function Hero() {
  // Animation variants for the container and its children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Each child will animate 0.2s after the previous one
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative m-2 overflow-hidden rounded-md bg-slate-900 text-white">
      {/* Aurora Background Effect */}
      <div className="absolute top-0 left-0 -z-10 h-full w-full">
        <div className="absolute top-1/4 left-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/20 blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/20 blur-[120px]"></div>
      </div>

      <div className="mx-auto flex min-h-screen max-w-screen-xl items-center justify-center px-4 py-32">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl"
            variants={itemVariants}
          >
            Unleash Your AI Workforce.
            <span className="sm:block"> Your Marketplace for Intelligent Voice Agents. </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-2xl sm:text-xl/relaxed text-gray-300"
            variants={itemVariants}
          >
            Welcome to the central hub for conversational AI. Whether you need to automate sales calls, conduct intelligent interviews, create engaging AI characters, or build a personal tutor, our marketplace provides the tools and agents to bring your vision to life.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            variants={itemVariants}
          >
            {/* Primary CTA */}
            <Link
              className="block w-full transform rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-12 py-3 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring focus:ring-blue-400 sm:w-auto"
              href={'/voice-agents'}
            >
              Explore the Marketplace
            </Link>

            {/* Secondary CTA */}
            <Link
              className="block w-full transform rounded-md border border-gray-600 px-12 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-white hover:text-white focus:outline-none focus:ring focus:ring-gray-500 sm:w-auto"
              href={'/callagents'} // Link to the agent creation/dashboard
            >
              Build Your First Agent
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}