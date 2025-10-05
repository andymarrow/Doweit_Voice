// callagents/_components/MobileHeader.jsx
"use client";

import React from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MobileHeader = ({ isMobileMenuOpen, toggleMobileMenu }) => {
    return (
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            {/* Logo/Brand Area */}
            <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                                 bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-purple-600 dark:to-purple-800">
                     DV
                 </div>
                <span className="text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white">
                    Doweit Voice
                </span>
            </div>

            {/* Hamburger Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle Menu"
            >
                <motion.div
                    animate={isMobileMenuOpen ? "open" : "closed"}
                    variants={{
                        open: { rotate: 90 },
                        closed: { rotate: 0 }
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </motion.div>
            </button>
        </header>
    );
};

export default MobileHeader;