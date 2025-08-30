// // voice-agents-dashboard/layout.jsx
// "use client"; // This is the root layout, make it a client component to manage state and animations

// import { useState } from 'react';
// import { motion } from 'framer-motion';
// import Sidebar from './_components/sidebar'; // Import the Sidebar component



// export default function DashboardLayout({ children }) {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to manage sidebar collapse

//   const toggleSidebar = () => {
//     setIsSidebarOpen(!isSidebarOpen);
//   };

//   // Define sidebar width and collapsed width
//   const sidebarWidth = 250; // px
//   const collapsedWidth = 70; // px

//   return (
//     <html lang="en">
//       {/* Wrap in ThemeProvider if you are using next-themes */}
//         {/* Main layout container: flex to create side-by-side layout */}
//           <div className="flex h-screen overflow-hidden">

//             {/* Sidebar */}
//             <motion.div
//               initial={{ width: sidebarWidth }}
//               animate={{ width: isSidebarOpen ? sidebarWidth : collapsedWidth }}
//               transition={{ duration: 0.3 }}
//               className="flex-shrink-0  overflow-y-auto border-r " // Add border and scroll
//             >
//               <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
//             </motion.div>

//             {/* Main content area */}
//             {/* motion.div for smooth transition of margin when sidebar collapses */}
//             <motion.main
//                transition={{ duration: 0.3 }}
//                className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col"   // Add vertical padding and make content scrollable
//             >
//               {children} {/* This is where your page.jsx content will be rendered */}
//             </motion.main>

//           </div>
       
//     </html>
//   );
// }

// voice-agents-dashboard/layout.jsx
"use client";

import { useState } from 'react';
import Sidebar from './_components/sidebar'; // Make sure this path is correct

// This layout component should ONLY return the JSX for this specific section.
// NO <html>, <body>, or <head> tags here.

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    // 1. This is the main container for this specific layout.
    // 2. ADD THEME-AWARE BACKGROUNDS HERE.
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">

      {/* Sidebar - It inherits its background color from its own component,
          but we should make its border theme-aware. */}
      <div className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {children} {/* This is where your page.jsx content will be rendered */}
      </main>

    </div>
  );
}