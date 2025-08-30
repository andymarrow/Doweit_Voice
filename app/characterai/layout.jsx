// characterai/layout.jsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './_components/sidebar'; // Import the Sidebar component

// Import global styles (make sure you have these)
import '../globals.css'; // Or wherever your global styles are
import { uiAccentClasses } from './_constants/uiConstants';
import { FiHelpCircle } from 'react-icons/fi';

// Assuming ClerkProvider is wrapping your application somewhere higher up,
// enabling the use of useUser() in client components below this.

export default function CharacterAiLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar collapse

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define sidebar width and collapsed width
  const sidebarWidth = 250; // px
  const collapsedWidth = 70; // px

  return (
   <>
      {/* Wrap in ThemeProvider if you are using next-themes */}
      {/* Make sure your root layout or a parent component includes ClerkProvider */}
      {/* <ClerkProvider> */}
     {/* Main layout container: flex to create side-by-side layout */}
          <div className="flex h-screen overflow-hidden">

            {/* Sidebar */}
            <motion.div
              initial={{ width: sidebarWidth }}
              animate={{ width: isSidebarOpen ? sidebarWidth : collapsedWidth }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0  overflow-y-auto border-r " // Add border and scroll
            >
              {/* Pass isOpen and toggleSidebar to the Sidebar component */}
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </motion.div>

            {/* Main content area */}
            <motion.main
               transition={{ duration: 0.3 }}
               className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col"   // Add vertical padding and make content scrollable
            >
              {children} {/* This is where your page.jsx content will be rendered */}
            </motion.main>

          </div>
           {/* Floating Help Button - UI element, no backend changes needed here */}
            <button className={`fixed bottom-6 right-6 flex items-center text-white text-sm font-semibold px-4 py-3 rounded-full shadow-lg transition-all z-50
                               ${uiAccentClasses.helpButtonGradient}
                               ${uiAccentClasses.hoverBgSubtle}
                               `}>
                 <FiHelpCircle className="mr-2 text-lg" />
                 Help
            </button>
      {/* </ClerkProvider> */} {/* Close ClerkProvider if added here */}
  </>
  );
}