// voice-agents-CallAgents/layout.jsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './_components/sidebar';
import MobileHeader from './_components/MobileHeader';
import MobileSidebar from './_components/MobileSidebar';
import { useMediaQuery } from '@/hooks/use-media-query';

import '../globals.css';
import { uiAccentClasses } from './_constants/uiConstants';
import { FiHelpCircle } from 'react-icons/fi';


export default function CallAgentsLayout({ children }) {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Media Query hook to check for screen size.
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const sidebarWidth = 256;
  const collapsedWidth = 64;

  return (
    <>
      {/* The main container for the entire screen */}
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">

        {/* --- DESKTOP SIDEBAR --- */}
        {/* This remains the same. It is only visible on screens `md` and larger */}
        <motion.div
          animate={{ width: isDesktopSidebarOpen ? sidebarWidth : collapsedWidth }}
          transition={{ duration: 0.3 }}
          className="hidden md:block flex-shrink-0 border-r border-gray-200 dark:border-gray-800"
        >
          {/* We ensure the sidebar content is not scrollable at this level, the component itself handles it */}
          <Sidebar isOpen={isDesktopSidebarOpen} toggleSidebar={toggleDesktopSidebar} />
        </motion.div>

        {/* --- MOBILE-ONLY SLIDE-DOWN SIDEBAR --- */}
        {/* This component is positioned `fixed`, so its location in the DOM doesn't affect layout flow. */}
        <MobileSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        {/* --- KEY CHANGE: Main Content Wrapper --- */}
        {/* This new div will now contain BOTH the mobile header and the page content.
            `flex-col` ensures the header stacks vertically on top of the main content. */}
        <div className="flex flex-1 flex-col overflow-hidden">

            {/* --- MOBILE-ONLY HEADER --- */}
            {/* It's now correctly placed here. It will be the first item in the vertical stack. */}
            <MobileHeader isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />

            {/* --- SCROLLABLE MAIN CONTENT AREA --- */}
            {/* `flex-1` makes this area take up all remaining vertical space.
                `overflow-y-auto` makes only this section scrollable, leaving the mobile header fixed at the top. */}
            <main className="flex-1 overflow-y-auto px-2 sm:px-3 lg:px-4 py-5">
                {children}
            </main>
        </div>

      </div>

      {/* Floating Help Button (No changes) */}
      {/* <button className={`fixed bottom-6 right-6 flex items-center text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-all z-50
                          ${uiAccentClasses.helpButtonGradient}
                          ${uiAccentClasses.hoverBgSubtle}
                          `}>
            <FiHelpCircle className="mr-2 text-lg" />
            Help
      </button> */}
    </>
  );
}