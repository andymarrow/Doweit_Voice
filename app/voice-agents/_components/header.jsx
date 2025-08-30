"use client";
import React, { useState } from 'react'; // Import useState
import Link from 'next/link';
import { motion } from 'framer-motion';
import ThemeToggle from '@/components/Themetoggle'; // Assuming this path is correct
import { Settings, Search, Menu, X } from 'lucide-react'; // Import Menu and X icons
import { UserButton } from '@clerk/nextjs';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage mobile menu visibility

  const navItems = [
    { name: 'Agents Marketplace', href: '/agents-marketplace' }, // Replace with your actual paths
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'My Agents', href: '/my-agents' }, // Replace with your actual paths
    { name: 'Bookings', href: '/bookings' }, // Replace with your actual paths
    { name: 'Docs', href: '/docs' }, // Replace with your actual paths
  ];

  // Toggle the menu state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 p-4" // Fixed header for persistence
    >
      {/* Main Header Row (Logo, Desktop Nav/Actions, Mobile Toggle/Theme) */}
      <div className="container mx-auto flex items-center justify-between backdrop-filter backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 rounded-full px-6 py-3 border border-opacity-30 dark:border-opacity-30 transition-colors duration-300 ease-in-out
                  bg-white dark:bg-purple-900 border-gray-200 dark:border-purple-700">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-lg font-bold text-gray-800 dark:text-white transition-colors duration-300 ease-in-out">
          {/* Placeholder for your AI Services Icon */}
          <div className="w-8 h-8 bg-purple-500 dark:bg-cyan-400 rounded-full flex items-center justify-center text-white text-xs">
            <div>
              DV
            </div>
          </div>
          <span>Doweit Voice</span>
        </Link>

        {/* Desktop Navigation (Hidden on small devices) */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-gray-700 dark:text-white hover:text-purple-700 dark:hover:text-cyan-400 transition-colors duration-200 ease-in-out text-sm"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions (Search, Settings, Theme Toggle - Hidden on small devices) */}
        {/* Combined Search, Settings, and Theme Toggle into a single div for desktop */}
        <div className="hidden lg:flex items-center space-x-4">
           {/* Search Input and Icon */}
           <div className="flex items-center bg-gray-100 dark:bg-purple-800 rounded-full px-3 py-1 lg:px-5 lg:py-3 transition-colors duration-300 ease-in-out"> {/* Adjusted padding slightly for height */}
             <Search size={18} className="text-gray-600 dark:text-gray-300 mr-2" />
             <input
               type="text"
               placeholder="Search..."
               className="bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white text-sm w-32"
             />
           </div>

          

           {/* Theme Toggle */}
           <ThemeToggle />
           <UserButton />
        </div>


        {/* Mobile Menu Toggle & Theme Toggle (Visible on small devices) */}
        <div className="lg:hidden flex items-center space-x-3">
            <ThemeToggle /> {/* Keep theme toggle visible on mobile */}
            <UserButton />
            
            <button onClick={toggleMenu} className="text-gray-700 dark:text-white">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />} {/* Show X icon when menu is open */}
            </button>
        </div>

      </div>

      {/* Mobile Menu Container (Slides down below the header row) */}
      {/* Use max-h and opacity for a smooth transition effect */}
      <div className={`lg:hidden absolute top-full left-0 right-0 backdrop-filter backdrop-blur-lg bg-opacity-70 dark:bg-opacity-70 shadow-lg overflow-hidden transition-all duration-300 ease-in-out
                  bg-white dark:bg-purple-900 border-b border-gray-200 dark:border-purple-700
                  ${isMenuOpen ? 'max-h-screen opacity-100 py-4' : 'max-h-0 opacity-0'}`}> {/* Added py-4 when open */}

          {/* Mobile Navigation (Stacked Vertically) */}
          <nav className="flex flex-col space-y-2 px-4"> {/* Added px-4 */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)} // Close menu on link click
                className="block text-gray-700 dark:text-white hover:text-purple-700 dark:hover:text-cyan-400 transition-colors duration-200 ease-in-out text-base p-2" // Increased text size slightly for mobile, added padding
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Separator */}
           <hr className="w-full border-gray-200 dark:border-gray-700 my-4 px-4" /> {/* Added margin and px */}


          {/* Mobile Actions (Search, Settings - Stacked Vertically) */}
          <div className="flex flex-col space-y-4 px-4 items-start"> {/* Added px-4 and items-start */}
              {/* Search Input and Icon */}
              {/* Use w-full so it takes the full width in the mobile menu */}
              <div className="flex items-center bg-gray-100 dark:bg-purple-800 rounded-full px-3 py-2 transition-colors duration-300 ease-in-out w-full"> {/* Adjusted padding/py */}
                <Search size={18} className="text-gray-600 dark:text-gray-300 mr-2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent outline-none text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-white text-sm flex-grow" // Use flex-grow
                />
              </div>

             
          </div>
      </div>

    </motion.header>
  );
}

export default Header;