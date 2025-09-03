// voice-agents-dashboard/_components/sidebar.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Image from 'next/image';
import Link from 'next/link';

import ThemeToggle from '@/components/Themetoggle'; // Import your ThemeToggle component
import { FiBookOpen, FiBriefcase, FiChevronDown, FiChevronLeft, FiChevronRight, FiChevronUp, FiExternalLink, FiPhone, FiSettings, FiShare2, FiUsers, FiZap, FiZapOff } from 'react-icons/fi';

// --- Reusable Accent Color Classes ---
// (Ideally, these would be in a shared constants file)
const accentClasses = {
    // Used for active link background (subtle)
    bgSubtle: 'bg-purple-100 dark:bg-purple-800',
    // Used for active link text/icon color
    textBold: 'text-purple-700 dark:text-white',
    // Used for hover background (subtle)
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    // Used for hover text color
    hoverText: 'hover:text-gray-900 dark:hover:text-white',
    // Used for secondary text (e.g., section titles)
    textSubtle: 'text-gray-500 dark:text-gray-500',
    // Used for accent text/icon (e.g., Academy link, Badge)
    textAccent: 'text-purple-600 dark:text-purple-400',
    // Used for badge background
    badgeBg: 'bg-purple-500/20 dark:bg-purple-500/30', // Use opacity variants
    // Used for Upgrade button gradient
    buttonGradient: 'bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 transition-all'
};


// Animation variants for sidebar elements (keep existing)
const itemVariants = {
    collapsed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
};

// Animation variants for dropdown items (keep existing for profile)
const dropdownVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeOut" } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
};


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Define the FLAT list of navigation items based on the image
    const sidebarNavItems = [
        { name: 'Agents', icon: FiBriefcase, href: '/callagents', active: true }, // Active item based on image
        { name: 'Knowledge Base', icon: FiBookOpen, href: '/callagents/knowledgebase' },
        { name: 'Actions', icon: FiZap, href: '/callagents/actions' },
        { name: 'Workflows', icon: FiShare2, href: '/callagents/workflow' },
        { name: 'Contacts', icon: FiUsers, href: '/contacts' },
        { name: 'Phone Numbers', icon: FiPhone, href: '/phone-numbers' },
        { name: 'Integrations', icon: FiSettings, href: '/callagents/Integrations' },
        { name: 'Agency', icon: FiBriefcase, href: '/agency' },
        { name: 'Getting Started', icon: FiZapOff, href: '/getting-started', badge: '0%' }, // Item with badge
    ];

    // Removed old nav item definitions (mainNavItems, agentToolItems, advancedOptionItems, socialLinks)


    return (
        // Apply base background/text colors from the scheme
        <div className={`h-full flex flex-col p-4 transition-width duration-300 hide-scrollbar overflow-y-auto
                        bg-white text-gray-800
                        dark:bg-gray-950 dark:text-gray-200
                        ${isOpen ? 'w-64' : 'w-16'}`}>

            {/* === Start: KEEP THIS EXACT BLOCK AS REQUESTED === */}
            {/* Logo/Brand Area */}
            <div className="flex items-center mb-6 p-2 space-x-3">
                 {/* Logo Circle with Initials - Uses Accent Gradient */}
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                                 bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-purple-600 dark:to-purple-800"> {/* Gradient Backgrounds */}
                     DV
                 </div>
                {/* Brand Name (Animated) */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            key="logo-text"
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={itemVariants}
                            transition={{ duration: 0.2 }}
                            className="text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white flex-grow" // Text color aligned with scheme
                        >
                            Doweit Voice
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Toggle Button - Logic kept as requested */}
                {isOpen ? (
                     <button
                         onClick={toggleSidebar}
                         className={`p-2 rounded-full transition-colors flex-shrink-0
                                    bg-gray-100 hover:bg-gray-200 text-gray-600
                                    dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
                                    ml-auto`}> {/* Conditional margin for alignment */}
                         <FiChevronLeft />
                     </button>
                ) : (
                     <div>{" "}</div> // Placeholder when collapsed inside this flex container
                )}
            </div>
            {/* Second Toggle Button - Logic kept as requested (appears when collapsed) */}
            {!isOpen && (
                 <button
                     onClick={toggleSidebar}
                     className={`p-2 rounded-full transition-colors flex-shrink-0
                                bg-gray-100 hover:bg-gray-200 text-gray-600
                                dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
                                 mx-auto mb-4`}> {/* Centered and spaced when collapsed */}
                     <FiChevronRight />
                 </button>
             )}


            {/* Profile Area */}
            <div className="relative mb-6 p-2"> {/* Container padding/margin */}
                <button
                    className={`flex items-center justify-between w-full text-left rounded-md transition-colors
                               ${isOpen ? 'px-3 py-2' : 'justify-center pl-2'} {/* Adjusted padding for collapsed state */}
                               ${accentClasses.hoverBg} ${accentClasses.hoverText} `} // Subtle hover background/text
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                >
                    {/* User Avatar (Placeholder) - Uses Accent Fill */}
                    <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
                        {/* Avatar color uses solid accent */}
                        <div className="w-8 h-8 bg-cyan-500 dark:bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0">
                            P
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.span key="profile-name" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="font-semibold whitespace-nowrap flex-grow text-gray-900 dark:text-white">
                                    Miheretab sam
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div key="dropdown-arrow" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="text-gray-500"> {/* Subtle arrow color */}
                                {isProfileDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </button>
                <AnimatePresence>
                    {isProfileDropdownOpen && isOpen && (
                        <motion.div
                            initial="collapsed"
                            animate="open"
                            exit="collapsed"
                            variants={dropdownVariants}
                            className="absolute left-0 mt-2 w-full rounded-md shadow-lg z-10 overflow-hidden
                                       bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200" // Scheme colors
                        >
                            <div className="p-2 text-sm">
                                <Link href="/settings" legacyBehavior>
                                    <a className={`block px-3 py-2 rounded transition-colors ${accentClasses.hoverBg}`}> {/* Subtle hover */}
                                        Settings
                                    </a>
                                </Link>

                                {/* Integrated ThemeToggle */}
                                   <div className={`flex items-center px-3 py-2 rounded transition-colors ${accentClasses.hoverBg}`}>
                                       <span className="flex-grow">Theme:</span>
                                       <ThemeToggle />
                                   </div>

                                <button onClick={() => {/* handle logout */}} className={`w-full text-left px-3 py-2 rounded transition-colors ${accentClasses.hoverBg}`}> {/* Subtle hover */}
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* === End: KEEP THIS EXACT BLOCK AS REQUESTED === */}


            {/* Main Navigation */}
            <nav className="mb-6 flex-grow overflow-y-auto hide-scrollbar"> {/* Added flex-grow and overflow for scrollable nav */}
                {sidebarNavItems.map(item => (
                    <Link key={item.name} href={item.href} legacyBehavior>
                        {/* motion.a handles the overall row, hover, active state, and layout */}
                        <motion.a
                            // Removed animation variants from motion.a itself
                             className={`flex items-center p-2 rounded-md transition-colors mb-1 // Added margin-bottom
                                       ${accentClasses.hoverBg}
                                       ${item.active
                                        ? `${accentClasses.bgSubtle} ${accentClasses.textBold}` // Active style
                                        : `text-gray-700 ${accentClasses.hoverText} dark:text-gray-300` // Default + Hover style
                                       }
                                       ${isOpen ? '' : 'justify-center'}`}> {/* Apply theme colors and hover */}

                            {/* Icon - Always rendered */}
                            {/* Apply size class directly. The image shows slightly larger icons when collapsed. */}
                             <item.icon className={`${isOpen ? 'text-xl' : 'text-2xl'} flex-shrink-0`} /> {/* Adjusted size, added shrink */}

                            {/* Item Name and Badge - Animated in/out */}
                            <AnimatePresence initial={false}> {/* initial={false} prevents initial animation on mount */}
                               {isOpen && ( // Only render these children when sidebar is open
                                    <motion.div
                                        key={`${item.name}-content`} // Unique key for the animated div
                                        initial="collapsed"
                                        animate="open"
                                        exit="collapsed"
                                        variants={itemVariants} // Apply the fade/slide animation here
                                        className="flex items-center flex-grow min-w-0" // Use flex to contain text and badge, allow text to shrink if needed, min-w-0 prevents overflow issues in flex
                                    >
                                         <span className="pl-2 whitespace-nowrap flex-grow overflow-hidden text-ellipsis"> {/* Added overflow/ellipsis for long names */}
                                             {item.name}
                                         </span>

                                         {item.badge && (
                                              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${accentClasses.badgeBg} ${accentClasses.textAccent} whitespace-nowrap`}>
                                                  {item.badge}
                                              </span>
                                          )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.a>
                    </Link>
                ))}
            </nav>

            {/* Academy Card */}
            <AnimatePresence>
                {isOpen && (
                     <motion.div
                         key="academy-card"
                         initial="collapsed"
                         animate="open"
                         exit="collapsed"
                         variants={itemVariants} // Use itemVariants for fade/slide animation
                         className={`relative bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300`} // Scheme colors, border, added relative for link
                     >
                         <h4 className="text-sm font-semibold mb-1 text-gray-900 dark:text-white">Join our Academy <FiExternalLink className="inline-block ml-1" /></h4> {/* Scheme text, icon inline */}
                         <p className="text-xs mb-3 text-gray-600 dark:text-gray-400">
                             Join our courses and webinars to master AI and automation with expert guidance.
                         </p>
                         {/* Make the entire card area clickable with a transparent overlay link */}
                         <div href="/join" legacyBehavior>
                              <div className={` rounded-lg cursor-pointer ${accentClasses.hoverBg}`}>
                                   {/* Screen reader text for accessibility */}
                                  <span className="sr-only">Join our Academy</span>
                              </div>
                         </div>
                         <Link href="/join" legacyBehavior>
                                <a className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-md transition-all shadow
                                               ${accentClasses.buttonGradient}`}> {/* Full width, center text, applied gradient */}
                                    Join 
                                </a>
                           </Link>
                     </motion.div>
                 )}
             </AnimatePresence>


            {/* Usage Status (Free / Minutes) */}
            <AnimatePresence>
                 {isOpen && (
                      <motion.div
                          key="usage-status"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                         variants={itemVariants} // Use itemVariants for fade/slide animation
                         className={`flex items-center mb-6 p-2 text-gray-700 dark:text-gray-300`} // Scheme text
                      >
                          {/* Circular 0% Element */}
                           <div className="w-8 h-8 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-xs font-semibold mr-3 text-gray-600 dark:text-gray-400"> {/* Scheme colors */}
                              0%
                           </div>
                          {/* Status Text */}
                           <div className="flex flex-col text-sm">
                               <span className="font-semibold text-gray-900 dark:text-white">Free</span> {/* Scheme text */}
                               <span className="text-xs text-gray-600 dark:text-gray-400">0 / 0 MIN</span> {/* Scheme text */}
                           </div>
                       </motion.div>
                   )}
               </AnimatePresence>


            {/* Upgrade Button */}
             <AnimatePresence>
                  {isOpen && (
                       <motion.div
                           key="upgrade-button"
                           initial="collapsed"
                           animate="open"
                           exit="collapsed"
                           variants={itemVariants} // Use itemVariants for fade/slide animation
                           className="w-full mb-6" // Added margin-bottom
                       >
                           <Link href="/upgrade" legacyBehavior>
                                <a className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-md transition-all shadow
                                               ${accentClasses.buttonGradient}`}> {/* Full width, center text, applied gradient */}
                                    ✨ Upgrade {/* Sparkle icon and text */}
                                </a>
                           </Link>
                       </motion.div>
                   )}
               </AnimatePresence>


            {/* Social Links - REMOVED */}

        </div>
    );
};

export default Sidebar;