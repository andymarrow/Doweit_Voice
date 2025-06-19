// voice-agents-dashboard/_components/sidebar.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image'; // Keep Image if you decide to use a logo image later
import Link from 'next/link';
import {
    FiHome, FiGrid, FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiDollarSign, FiBookOpen, FiPackage, FiMessageCircle, FiUsers, FiBriefcase, FiCpu, FiInstagram, FiLinkedin, FiHelpCircle, FiFileText,
    FiPhoneCall
} from 'react-icons/fi';
import { FaMicrophoneAlt, FaTelegram } from 'react-icons/fa';
import ThemeToggle from '@/components/Themetoggle';


// Animation variants for sidebar elements
const itemVariants = {
    collapsed: { opacity: 0, x: -20 },
    open: { opacity: 1, x: 0 },
};

// Animation variants for dropdown items
const dropdownVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeOut" } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
};


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { theme } = useTheme(); // Only need theme, ThemeToggle handles setTheme
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isRecruitmentDropdownOpen, setIsRecruitmentDropdownOpen] = useState(false);

    // Define sidebar items
    const mainNavItems = [
        { name: 'Home', icon: FiHome, href: '/dashboard' },
        { name: 'Marketplace', icon: FiGrid, href: '/marketplace' },
    ];

    const agentToolItems = [
        {
            name: 'Recruitment Agents',
            icon: FiBriefcase,
            isDropdown: true,
            isOpen: isRecruitmentDropdownOpen,
            toggle: () => setIsRecruitmentDropdownOpen(!isRecruitmentDropdownOpen),
            subItems: [
                { name: 'Recruiter', href: '/agents/recruiter' },
                { name: 'Recruited', href: '/agents/recruited' },
            ],
        },
        { name: 'Audio Bookers', icon: FiBookOpen, href: '/agents/audiobookers' },
        { name: 'Alan AI', icon: FiCpu, href: '/agents/alanai' },
        { name: 'Character AI', icon: FiMessageCircle, href: '/characterai' },
        { name: 'Meeting Leader', icon: FiUsers, href: '/agents/meetingleader' },
        { name: 'Call Agents', icon: FiPhoneCall, href: '/callagents' },
        { name: 'Tutor', icon: FaMicrophoneAlt, href: '/agents/tutor' },
    ];

    const advancedOptionItems = [
        { name: 'Premium Plans', icon: FiDollarSign, href: '/premium' },
        { name: 'API Access', icon: FiPackage, href: '/api-access' },
        { name: 'Docs', icon: FiFileText, href: '/docs' },
        { name: 'FAQ and Help', icon: FiHelpCircle, href: '/help' },
    ];

    const socialLinks = [
        { name: 'Instagram', icon: FiInstagram, href: 'YOUR_INSTAGRAM_LINK' },
        { name: 'Telegram', icon: FaTelegram, href: 'YOUR_TELEGRAM_LINK' },
        { name: 'LinkedIn', icon: FiLinkedin, href: 'YOUR_LINKEDIN_LINK' },
    ];

    return (
        <div className={`h-full flex flex-col p-4 transition-width duration-300 hide-scrollbar overflow-y-auto
                        bg-white text-gray-800
                        dark:bg-gray-950 dark:text-gray-200
                        ${isOpen ? 'w-64' : 'w-16'}`}>

            {/* Logo/Brand Area */}
            {/* Use flex container for logo+text and button, align items */}
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

                {/* Toggle Button - Always present, uses margin-left auto when open */}
                {isOpen ? <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-full transition-colors flex-shrink-0
                                bg-gray-100 hover:bg-gray-200 text-gray-600
                                dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
                                ${isOpen ? 'ml-auto' : 'mx-auto'}`}> {/* Conditional margin for alignment */}
                    {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
                :
                <div>{" "}</div>
                
                }
            
            </div>
                    {isOpen ? <div>{" "}</div>:
                <button
                    onClick={toggleSidebar}
                    className={`p-2 rounded-full transition-colors flex-shrink-0
                                bg-gray-100 hover:bg-gray-200 text-gray-600
                                dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300
                                ${isOpen ? 'ml-auto' : 'ml-2 mx-auto'}`}> {/* Conditional margin for alignment */}
                    {isOpen ? <FiChevronLeft /> : <FiChevronRight />}
                </button>
                }
                

            {/* Profile Area */}
            <div className="relative mb-6 p-2">
                <button
                    className={`flex items-center justify-between w-full text-left rounded-md transition-colors
                               ${isOpen ? 'px-3 py-2' : 'justify-center p-5'}
                               hover:bg-gray-100 dark:hover:bg-gray-800`} // Subtle hover background
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
                                    <a className="block px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"> {/* Subtle hover */}
                                        Settings
                                    </a>
                                </Link>

                                {/* Integrated ThemeToggle */}
                                {/* Ensure ThemeToggle itself doesn't break layout/styles */}
                                <div className="flex items-center px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                     <span className="flex-grow">Theme:</span>
                                     <ThemeToggle />
                                </div>

                                <button onClick={() => {/* handle logout */}} className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"> {/* Subtle hover */}
                                    Logout
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tokens/Upgrade */}
            <div className={`mb-6 p-2 flex items-center ${isOpen ? 'justify-start' : 'justify-center'} text-gray-700 dark:text-gray-300`}> {/* Scheme text colors */}
                <AnimatePresence>
                    {isOpen ? (
                        <motion.div key="tokens-upgrade-open" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="flex items-center justify-between w-full whitespace-nowrap">
                            <span className="text-sm mr-2">⚡️ 150</span>
                            <Link href="/upgrade" legacyBehavior>
                                {/* Upgrade Button - Uses Accent Gradient */}
                                <a className={`bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white text-xs px-3 py-1 rounded-full font-semibold
                                                dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 transition-all`}> {/* Gradient & Colors */}
                                    Upgrade
                                </a>
                            </Link>
                        </motion.div>
                    ) : (
                         <motion.div key="tokens-upgrade-collapsed" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants}>
                            ⚡️ {/* Just show icon when collapsed */}
                         </motion.div>
                     )}
                 </AnimatePresence>
            </div>


            {/* Main Navigation */}
            <nav className="mb-6">
                {mainNavItems.map(item => (
                    <Link key={item.name} href={item.href} legacyBehavior>
                        <a className={`flex items-center p-2 rounded-md transition-colors
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        text-gray-700 hover:text-gray-900
                                        dark:text-gray-300 dark:hover:text-white
                                        ${isOpen ? '' : 'justify-center'}`}> {/* Scheme colors & hover */}
                            {/* Icon color inherits from text color */}
                            <item.icon className={` ${isOpen ? '' : ' text-xl'}`} /> {/* Apply size class to icon */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span key={item.name} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={` ${isOpen ? 'pl-2' : ' '} whitespace-nowrap `}>
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </a>
                    </Link>
                ))}
            </nav>

            {/* Our Agents Section */}
            <AnimatePresence>
                {isOpen && (
                    <motion.h3 key="agents-title" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="text-xs uppercase font-semibold p-2
                                text-gray-500 dark:text-gray-500 mb-3"> {/* Subtle text color */}
                        Our Agents
                    </motion.h3>
                )}
            </AnimatePresence>
            {/* Scrollable area */}
            <div className="mb-6 flex-grow overflow-y-auto hide-scrollbar">
                {agentToolItems.map(item => (
                    <div key={item.name}>
                        {item.isDropdown ? (
                            <> {/* Dropdown toggle */}
                                <button
                                    onClick={item.toggle} // Use the item's toggle function
                                    className={`flex items-center justify-between w-full text-left p-2 rounded-md transition-colors
                                                hover:bg-gray-100 dark:hover:bg-gray-800
                                                text-gray-700 hover:text-gray-900
                                                dark:text-gray-300 dark:hover:text-white
                                                ${isOpen ? '' : 'justify-center'}`}> {/* Scheme colors & hover */}
                                    <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
                                        {/* Icon color inherits */}
                                        <item.icon className={` ${isOpen ? '' : 'text-xl'}`} /> {/* Apply size class to icon */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span key={item.name + '-btn'} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={` ${isOpen ? 'pl-2' : ''} whitespace-nowrap flex-grow`}>
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div key={item.name + '-arrow'} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="text-gray-500"> {/* Subtle arrow color */}
                                                {item.isOpen ? <FiChevronUp /> : <FiChevronDown />}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                                {/* Dropdown content */}
                                <AnimatePresence>
                                    {item.isOpen && isOpen && (
                                        <motion.div
                                            initial="collapsed"
                                            animate="open"
                                            exit="collapsed"
                                            variants={dropdownVariants}
                                            className={`ml-4 border-l border-gray-200 dark:border-gray-700 overflow-hidden ${isOpen ? '' : 'hidden'}`} // Scheme border
                                        >
                                            {item.subItems.map(subItem => (
                                                <Link key={subItem.name} href={subItem.href} legacyBehavior>
                                                    <a className="flex items-center p-2 pl-6 rounded-md transition-colors
                                                                hover:bg-gray-100 dark:hover:bg-gray-800
                                                                text-sm text-gray-700 hover:text-gray-900
                                                                dark:text-gray-300 dark:hover:text-white"> {/* Scheme colors & hover */}
                                                        <AnimatePresence>
                                                            {isOpen && (
                                                                <motion.span key={subItem.name} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="whitespace-nowrap">
                                                                    {subItem.name}
                                                                </motion.span>
                                                            )}
                                                        </AnimatePresence>
                                                    </a>
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        ) : (
                            <> {/* Regular link */}
                                <Link href={item.href} legacyBehavior>
                                    <a className={`flex items-center p-2 rounded-md transition-colors
                                                hover:bg-gray-100 dark:hover:bg-gray-800
                                                text-gray-700 hover:text-gray-900
                                                dark:text-gray-300 dark:hover:text-white
                                                ${isOpen ? '' : 'justify-center'}`}> {/* Scheme colors & hover */}
                                        {/* Icon color inherits */}
                                        <item.icon className={`${isOpen ? '' : 'text-xl'}`} /> {/* Apply size class to icon */}
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span key={item.name} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`${isOpen ? 'pl-2' : ''} whitespace-nowrap`}>
                                                    {item.name}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </a>
                                </Link>
                            </>
                        )}
                    </div>
                ))}
            </div>

            {/* Advanced Options Section */}
            <div className="mb-6">
                <AnimatePresence>
                    {isOpen && (
                        <motion.h3 key="advanced-title" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="text-xs uppercase font-semibold p-2
                                text-gray-500 dark:text-gray-500 mb-3"> {/* Subtle text color */}
                            Advanced Options
                        </motion.h3>
                    )}
                </AnimatePresence>
                {advancedOptionItems.map(item => (
                    <Link key={item.name} href={item.href} legacyBehavior>
                        <a className={`flex items-center p-2 rounded-md transition-colors
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        text-gray-700 hover:text-gray-900
                                        dark:text-gray-300 dark:hover:text-white
                                        ${isOpen ? '' : 'justify-center'}`}> {/* Scheme colors & hover */}
                            {/* Icon color inherits */}
                            <item.icon className={` ${isOpen ? '' : ' text-xl'}`} /> {/* Apply size class to icon */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span key={item.name} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={` ${isOpen ? 'pl-2' : ' '} whitespace-nowrap`}>
                                        {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </a>
                    </Link>
                ))}
            </div>

            {/* Social Links */}
            <div className={`mt-auto pt-4 border-t
                             border-gray-200 dark:border-gray-700
                             flex ${isOpen ? 'justify-center items-center space-x-4' : 'justify-center space-x-0 flex-col items-center space-y-4'}`}> {/* Scheme border and alignment */}
                {socialLinks.map(link => (
                    <Link key={link.name} href={link.href} legacyBehavior>
                        <motion.a
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`transition-colors text-gray-500 hover:text-cyan-600 dark:text-gray-500 dark:hover:text-purple-400`} // Accent hover colors
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            {/* Icon color inherits from text color */}
                            <link.icon className={isOpen ? 'text-xl' : 'text-2xl'} /> {/* Applied size class to icon directly, increased collapsed size */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span key={link.name + '-text'} initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="sr-only">{link.name}</motion.span>
                                )}
                            </AnimatePresence>
                        </motion.a>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;