// voice-agents-dashboard/_components/CommunityCreation.jsx
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

// Placeholder data for community creations - replace with real data later
const communityCreations = [
    { id: 1, title: 'Personalized Voice Bot', description: 'Created using the API.', href: '#' },
    { id: 2, title: 'AI Debate Simulator', description: 'Fun project shared by user.', href: '#' },
    // Add more community creations
];

function CommunityCreation() {
    return (
        <motion.section
            className="w-full"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
        >
            <h2 className="text-xl md:text-2xl font-bold mb-6
                           text-gray-800 dark:text-white"> {/* Scheme text colors */}
                Community Creations
            </h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityCreations.map(creation => (
                    <motion.div
                        key={creation.id} // Add a unique key
                        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700" // Scheme colors, subtle border/shadow
                        variants={itemVariants} // Apply item animation
                    >
                        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{creation.title}</h3> {/* Scheme text */}
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{creation.description}</p> {/* Scheme text */}
                        {/* Use <a> for placeholder, Link for real navigation */}
                        <a href={creation.href} className={`text-sm font-semibold ${accentTextClasses} hover:underline`}>View Project →</a>
                    </motion.div>
                ))}
             </div>
        </motion.section>
    );
}

export default CommunityCreation;