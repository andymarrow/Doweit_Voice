// callagents/_components/MobileSidebar.jsx
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    FiBriefcase,
    FiBookOpen,
    FiZap,
    FiShare2,
    FiUsers,
    FiPhone,
    FiSettings,
    FiZapOff,
    FiLogOut
} from 'react-icons/fi';
import ThemeToggle from '@/components/Themetoggle'; // Assuming path is correct

// --- New, Grouped Navigation Structure ---
// This adds logical separation and allows for section titles.
const navGroups = [
    {
        title: 'Agent Tools',
        items: [
            { name: 'Agents', icon: FiBriefcase, href: '/callagents', active: true },
            { name: 'Knowledge Base', icon: FiBookOpen, href: '/callagents/knowledgebase' },
            { name: 'Actions', icon: FiZap, href: '/callagents/actions' },
            { name: 'Workflows', icon: FiShare2, href: '/callagents/workflow' },
            { name: 'Integrations', icon: FiSettings, href: '/callagents/Integrations' },
        ],
    },
    {
        title: 'Management',
        items: [
            { name: 'Contacts', icon: FiUsers, href: '/contacts' },
            { name: 'Phone Numbers', icon: FiPhone, href: '/phone-numbers' },
            { name: 'Agency', icon: FiBriefcase, href: '/agency' },
        ],
    },
    {
        title: 'Account',
        items: [
            { name: 'Getting Started', icon: FiZapOff, href: '/getting-started', badge: '0%' },
        ]
    }
];

// --- Refined Accent Classes for a Bolder Look ---
const accentClasses = {
    // A more vibrant active state with a subtle glow
    active: 'bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 font-semibold shadow-inner',
    // Subtle hover for non-active items
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    // Styling for group titles
    groupTitle: 'px-3 pt-4 pb-2 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider',
    // Styling for badges
    badgeBg: 'bg-purple-500/20 dark:bg-purple-500/30',
    badgeText: 'text-purple-600 dark:text-purple-400',
};

// --- Framer Motion Animation Variants ---
const backdropVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
};

const sidebarVariants = {
    open: {
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.05 }
    },
    closed: {
        y: "-100%",
        transition: { type: "spring", stiffness: 300, damping: 30 }
    },
};

const itemVariants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: -20 },
};


const MobileSidebar = ({ isOpen, onClose }) => {

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop with Blur */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={backdropVariants}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                        aria-hidden="true"
                    />

                    {/* --- Revamped Mobile Sidebar Panel --- */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants} // This now staggers the children
                        // Adjusted height and added rounded bottom corners
                        className="fixed top-0 left-0 right-0 h-auto max-h-[85vh] bg-white dark:bg-gray-950 shadow-2xl z-50 md:hidden flex flex-col rounded-b-2xl"
                    >
                        {/* 1. Sidebar Header with Brand */}
                        <motion.div variants={itemVariants} className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-purple-600 dark:to-purple-800">
                                DV
                            </div>
                            <span className="text-lg font-bold ml-3 text-gray-900 dark:text-white">
                                Doweit Voice
                            </span>
                        </motion.div>

                        {/* 2. Main Navigation Area (Scrollable) */}
                        <nav className="flex-grow overflow-y-auto p-2">
                            {/* Render each group */}
                            {navGroups.map(group => (
                                <div key={group.title}>
                                    <motion.h3 variants={itemVariants} className={accentClasses.groupTitle}>
                                        {group.title}
                                    </motion.h3>
                                    <ul>
                                        {group.items.map(item => (
                                            <motion.li key={item.name} variants={itemVariants}>
                                                <Link href={item.href} legacyBehavior>
                                                    <a
                                                        onClick={onClose}
                                                        className={`flex items-center justify-between p-3 text-md rounded-lg transition-colors mb-1
                                                            ${item.active ? accentClasses.active : `text-gray-700 dark:text-gray-300 ${accentClasses.hover}`}`
                                                        }
                                                    >
                                                        <div className="flex items-center">
                                                            <item.icon className="mr-4 text-xl flex-shrink-0 text-gray-500" />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        {item.badge && (
                                                            <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${accentClasses.badgeBg} ${accentClasses.badgeText}`}>
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </a>
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>

                        {/* 3. Sidebar Footer */}
                        <motion.div variants={itemVariants} className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
                             {/* Theme Toggle */}
                            <div className={`flex items-center justify-between p-3 text-md rounded-lg transition-colors ${accentClasses.hover}`}>
                                <span className="text-gray-700 dark:text-gray-300">Theme</span>
                                <ThemeToggle />
                            </div>
                            {/* Logout Button */}
                            <button className={`w-full flex items-center p-3 text-md rounded-lg transition-colors text-red-500 dark:text-red-400 ${accentClasses.hover}`}>
                                <FiLogOut className="mr-4 text-xl flex-shrink-0" />
                                <span>Logout</span>
                            </button>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileSidebar;