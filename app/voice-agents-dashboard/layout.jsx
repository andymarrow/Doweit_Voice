// voice-agents-dashboard/layout.jsx
"use client"; // This is the root layout, make it a client component to manage state and animations

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeProvider } from 'next-themes'; // Assuming you have next-themes setup
import Sidebar from './_components/sidebar'; // Import the Sidebar component

// Import global styles (make sure you have these)
import '../globals.css'; // Or wherever your global styles are


export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar collapse

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Define sidebar width and collapsed width
  const sidebarWidth = 250; // px
  const collapsedWidth = 70; // px

  return (
    <html lang="en">
      {/* Wrap in ThemeProvider if you are using next-themes */}
      <ThemeProvider attribute="class" defaultTheme="dark">
       {/* Apply base background/text color */}
          {/* Main layout container: flex to create side-by-side layout */}
          <div className="flex h-screen overflow-hidden">

            {/* Sidebar */}
            <motion.div
              initial={{ width: sidebarWidth }}
              animate={{ width: isSidebarOpen ? sidebarWidth : collapsedWidth }}
              transition={{ duration: 0.3 }}
              className="flex-shrink-0  overflow-y-auto border-r " // Add border and scroll
            >
              <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </motion.div>

            {/* Main content area */}
            {/* motion.div for smooth transition of margin when sidebar collapses */}
            <motion.main
               transition={{ duration: 0.3 }}
               className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col"   // Add vertical padding and make content scrollable
            >
              {children} {/* This is where your page.jsx content will be rendered */}
            </motion.main>

          </div>
       
      </ThemeProvider>
    </html>
  );
}