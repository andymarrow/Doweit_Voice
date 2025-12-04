// app/agents/_components/RecruitmentSidebar.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    FiChevronLeft, FiChevronRight, FiGrid, FiUsers, FiBriefcase, 
    FiActivity, FiSettings, FiShoppingCart, FiChevronDown, FiChevronUp,
    FiPieChart, FiTarget, FiClock, FiLogOut
} from 'react-icons/fi';
import ThemeToggle from '@/components/Themetoggle';

// Reuse your existing UI constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';

// Animation Variants
const sidebarVariants = {
    open: { width: "16rem", transition: { duration: 0.3, ease: "easeInOut" } },
    closed: { width: "5rem", transition: { duration: 0.3, ease: "easeInOut" } }
};

const itemVariants = {
    collapsed: { opacity: 0, x: -10, display: "none" },
    open: { opacity: 1, x: 0, display: "block", transition: { delay: 0.1 } },
};

const dropdownVariants = {
    collapsed: { height: 0, opacity: 0, overflow: "hidden" },
    open: { height: "auto", opacity: 1, transition: { duration: 0.2 } },
};

export default function RecruitmentSidebar({ isOpen, toggleSidebar }) {
    const pathname = usePathname();
    
    // UI States
    const [isRecruiterOpen, setIsRecruiterOpen] = useState(true);
    const [isTraineeOpen, setIsTraineeOpen] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Mock Data (In real app, fetch from Auth/DB)
    const userRole = 'both'; // 'recruiter', 'trainee', 'both'
    const credits = 150; 

    // Navigation Structure
    const recruiterItems = [
        { name: 'My Interviews', icon: FiBriefcase, href: '/agents/recruiter' },
        { name: 'Candidates DB', icon: FiUsers, href: '/agents/recruiter/candidates' },
        { name: 'Analytics', icon: FiPieChart, href: '/agents/recruiter/analytics' },
    ];

    const traineeItems = [
        { name: 'My Gym', icon: FiTarget, href: '/agents/recruited' },
        { name: 'History', icon: FiClock, href: '/agents/recruited/history' },
        { name: 'Analysis', icon: FiActivity, href: '/agents/recruited/analysis' },
    ];

    const renderNavItem = (item) => {
        const isActive = pathname === item.href;
        return (
            <Link key={item.name} href={item.href} legacyBehavior>
                <a className={`flex items-center px-3 py-2.5 mb-1 rounded-lg transition-all duration-200 group
                    ${isActive 
                        ? `${uiColors.bgSecondary} ${uiColors.textPrimary} font-semibold shadow-sm` 
                        : `text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800`
                    } ${isOpen ? '' : 'justify-center'}`}
                    title={!isOpen ? item.name : ''}
                >
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-cyan-600 dark:text-purple-400' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                variants={itemVariants}
                                initial="collapsed" animate="open" exit="collapsed"
                                className="ml-3 text-sm whitespace-nowrap"
                            >
                                {item.name}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </a>
            </Link>
        );
    };

    return (
        <motion.div 
            className={`h-full flex flex-col ${uiColors.bgPrimary} border-r ${uiColors.borderPrimary} relative z-20`}
            variants={sidebarVariants}
            initial={isOpen ? "open" : "closed"}
            animate={isOpen ? "open" : "closed"}
        >
            {/* --- HEADER --- */}
            <div className="flex items-center p-5 mb-2 h-16">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-purple-600 dark:to-indigo-600 shadow-md`}>
                    R
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.span
                            variants={itemVariants}
                            initial="collapsed" animate="open" exit="collapsed"
                            className={`ml-3 text-lg font-bold tracking-tight ${uiColors.textPrimary}`}
                        >
                            Recruiter AI
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* --- SCROLLABLE NAV --- */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-3 space-y-6">
                
                {/* Marketplace (Common) */}
                <div>
                    {renderNavItem({ name: 'Marketplace', icon: FiGrid, href: '/agents/marketplace' })}
                </div>

                {/* Recruiter Section */}
                {(userRole === 'recruiter' || userRole === 'both') && (
                    <div className="space-y-1">
                        {isOpen && (
                            <button 
                                onClick={() => setIsRecruiterOpen(!isRecruiterOpen)}
                                className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${uiColors.textSecondary} hover:text-gray-900 dark:hover:text-white transition-colors`}
                            >
                                <span>Recruiter Zone</span>
                                {isRecruiterOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                        )}
                        {/* Divider for collapsed state */}
                        {!isOpen && <div className={`h-px mx-2 my-2 ${uiColors.borderPrimary}`} />}
                        
                        <AnimatePresence>
                            {(isRecruiterOpen || !isOpen) && (
                                <motion.div 
                                    variants={dropdownVariants}
                                    initial={isOpen ? "collapsed" : "open"} // Always show icons if collapsed
                                    animate="open"
                                    exit="collapsed"
                                    className="overflow-hidden"
                                >
                                    {recruiterItems.map(renderNavItem)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* Trainee Section */}
                {(userRole === 'trainee' || userRole === 'both') && (
                    <div className="space-y-1">
                        {isOpen && (
                            <button 
                                onClick={() => setIsTraineeOpen(!isTraineeOpen)}
                                className={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${uiColors.textSecondary} hover:text-gray-900 dark:hover:text-white transition-colors mt-4`}
                            >
                                <span>Trainee Zone</span>
                                {isTraineeOpen ? <FiChevronUp /> : <FiChevronDown />}
                            </button>
                        )}
                        {!isOpen && <div className={`h-px mx-2 my-2 ${uiColors.borderPrimary}`} />}

                        <AnimatePresence>
                            {(isTraineeOpen || !isOpen) && (
                                <motion.div 
                                    variants={dropdownVariants}
                                    initial="collapsed" animate="open" exit="collapsed"
                                    className="overflow-hidden"
                                >
                                    {traineeItems.map(renderNavItem)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* --- FOOTER (Credits & Profile) --- */}
            <div className={`p-4 border-t ${uiColors.borderPrimary} bg-gray-50/50 dark:bg-gray-900/50`}>
                
                {/* Credits Display */}
                <div className={`flex items-center justify-center mb-4 ${isOpen ? 'bg-white dark:bg-gray-800 border' : ''} ${uiColors.borderPrimary} rounded-xl p-2 shadow-sm`}>
                    <span className="text-xl">⚡</span>
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div 
                                variants={itemVariants} initial="collapsed" animate="open" exit="collapsed"
                                className="ml-3 flex flex-col"
                            >
                                <span className={`text-xs font-medium ${uiColors.textSecondary}`}>Available Tokens</span>
                                <span className={`text-sm font-bold ${uiColors.textPrimary}`}>{credits} Tokens</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Profile Dropdown Trigger */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`flex items-center w-full p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isOpen ? '' : 'justify-center'}`}
                    >
                        <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                            M
                        </div>
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div 
                                    variants={itemVariants} initial="collapsed" animate="open" exit="collapsed"
                                    className="ml-3 flex-1 text-left"
                                >
                                    <p className={`text-sm font-semibold ${uiColors.textPrimary}`}>Miheretab</p>
                                    <p className={`text-xs ${uiColors.textSecondary}`}>Pro Plan</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {isOpen && (isProfileMenuOpen ? <FiChevronUp className={uiColors.textSecondary}/> : <FiChevronDown className={uiColors.textSecondary}/>)}
                    </button>

                    {/* Popup Menu */}
                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className={`absolute bottom-full left-0 mb-2 w-full min-w-[200px] rounded-xl shadow-xl border ${uiColors.borderPrimary} ${uiColors.bgPrimary} overflow-hidden p-2 z-50`}
                            >
                                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                                    <p className={`text-xs font-bold uppercase ${uiColors.textSecondary}`}>Appearance</p>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className={`text-sm ${uiColors.textPrimary}`}>Theme</span>
                                        <ThemeToggle />
                                    </div>
                                </div>
                                <Link href="/agents/settings" className={`flex items-center px-3 py-2 rounded-lg text-sm ${uiColors.textPrimary} hover:bg-gray-100 dark:hover:bg-gray-800`}>
                                    <FiSettings className="mr-2" /> Settings
                                </Link>
                                <button className={`flex w-full items-center px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                                    <FiLogOut className="mr-2" /> Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Collapse Toggle (Absolute) */}
            <button 
                onClick={toggleSidebar}
                className={`absolute -right-3 top-20 bg-white dark:bg-gray-800 border ${uiColors.borderPrimary} p-1 rounded-full shadow-sm text-gray-500 hover:text-cyan-600 transition-colors`}
            >
                {isOpen ? <FiChevronLeft size={14} /> : <FiChevronRight size={14} />}
            </button>
        </motion.div>
    );
}