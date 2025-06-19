// voice-agents-dashboard/_components/CharacterCard.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiMessageCircle, FiHeart, FiShare2, FiUser, FiBook, FiFilm, FiMusic, FiMap, FiHome, FiCpu, FiBookOpen } from 'react-icons/fi';
import { FaFantasyFlightGames } from 'react-icons/fa'; // Specific gaming icon (requires installation)

// Install react-icons/fa if needed: npm install react-icons

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Using the path provided

// Map behavior strings to icons
const behaviorIcons = {
    'Scifi': FiCpu,
    'Wise': FiBook,
    'Movies': FiFilm,
    'Songs': FiMusic,
    'Adventure': FiMap,
    'Gf/Bf': FiHeart,
    'Family': FiHome,
    'Friend': FiUser,
    'Gamer': FaFantasyFlightGames,
};

// Animation variants for cards
const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};


function CharacterCard({ character }) {
    // Determine which description to show based on character type
    const description = character.type === 'real' ? character.realPersonInfo : character.story;

    return (
        <motion.div
            className={`rounded-lg shadow-sm border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-4 flex flex-col h-full`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Top Section: Avatar and Name */}
            <div className="flex items-start mb-3">
                {/* Character Avatar */}
                 <div className="flex-shrink-0 mr-4">
                     <Image
                         src={character.avatar}
                         alt={character.name}
                         width={64}
                         height={64}
                         className="rounded-full"
                     />
                 </div>
                {/* Name and Info */}
                <div className="flex-grow">
                    <h3 className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight mb-1`}>
                        {character.name}
                    </h3>
                    {/* Behavior Tags */}
                    <div className="flex flex-wrap gap-1">
                        {character.behavior?.map((b, index) => {
                             const Icon = behaviorIcons[b] || FiBookOpen; // Default icon if not mapped
                            return (
                                 <span key={index} className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${uiColors.accentBadgeBg} ${uiColors.textAccent}`}>
                                     {Icon && <Icon className="mr-1 w-3 h-3" />} {b}
                                 </span>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Story / Description */}
            <p className={`text-sm ${uiColors.textSecondary} mb-4 flex-grow overflow-hidden text-ellipsis`}>
                {description}
            </p>

            {/* Metrics and Chat Button */}
            <div className={`flex items-center justify-between mt-auto pt-3 border-t ${uiColors.borderPrimary}`}>
                 {/* Engagement Metrics */}
                 <div className={`flex items-center text-xs ${uiColors.textSecondary} space-x-3`}>
                     <div className="flex items-center">
                         <FiHeart className="mr-1" /> {character.likes}
                     </div>
                     <div className="flex items-center">
                         <FiShare2 className="mr-1" /> {character.shares}
                     </div>
                      <div className="flex items-center">
                         <FiMessageCircle className="mr-1" /> {character.chats}
                      </div>
                 </div>
                {/* Chat Button */}
                <Link href={`/characterai/chat/${character.id}`} legacyBehavior>
                     <a className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white`}>
                         {/* WRAP ICON AND TEXT IN A SINGLE SPAN */}
                         <span className="flex items-center">
                             <FiMessageCircle className="mr-1" />
                             Chat
                         </span>
                     </a>
                 </Link>
            </div>

        </motion.div>
    );
}

export default CharacterCard;