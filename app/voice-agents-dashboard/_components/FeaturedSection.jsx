// voice-agents-dashboard/_components/FeaturedSection.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link'; // Keep Link if cards will have real navigation
import {
    sectionVariants,
    itemVariants,
    accentTextClasses,
    accentBorderClasses
} from '../_constants/uiConstants'; // Import constants

// Placeholder data for featured agents - replace with real data later
const featuredAgents = [
    { id: 1, name: 'Customer Support Agent', description: 'Automated support interactions.', href: '#' },
    { id: 2, name: 'Sales Assistant Bot', description: 'Qualify leads and book meetings.', href: '#' },
    { id: 3, name: 'Interactive Storyteller', description: 'Create unique narratives with AI.', href: '#' },
    // Add more featured agents
];

function FeaturedSection() {
    return (
        <motion.section
            className="w-full"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <h2 className="text-xl md:text-2xl font-bold mb-6
                           text-gray-800 dark:text-white"> {/* Scheme text colors */}
                Featured Agents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredAgents.map(agent => (
                    <motion.div
                        key={agent.id} // Add a unique key
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700" // Scheme colors, subtle border/shadow
                        variants={itemVariants} // Apply item animation
                    >
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{agent.name}</h3> {/* Scheme text */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{agent.description}</p> {/* Scheme text */}
                        {/* Use <a> for placeholder, Link for real navigation */}
                         <a href={agent.href} className={`text-sm font-semibold ${accentTextClasses} hover:underline`}>Learn More →</a>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}

export default FeaturedSection;