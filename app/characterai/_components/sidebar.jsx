// voice-agents-dashboard/_components/sidebar.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

import ThemeToggle from '@/components/Themetoggle';
import {
    FiPlus, FiCompass, FiFilm, FiSearch, FiExternalLink, // Icons from the image/concept
    FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown, // Chevron icons
    FiBriefcase, FiBookOpen, FiZap, FiShare2, FiUsers, FiPhone, FiSettings, FiZapOff, // Icons for the lower nav items
    FiCpu,
    FiBook,
    FiMusic,
    FiMap,
    FiHeart,
    FiHome,
    FiUser
} from 'react-icons/fi';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants'; // Using the path provided by the user
import { accentClasses } from '../_constants/uiConstants';
import { FaFantasyFlightGames } from 'react-icons/fa';

// Animation variants for sidebar elements
const itemVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    open: { opacity: 1, x: 0, transition: { duration: 0.2 } },
    // Adding variants specifically for text within links
    textCollapsed: { opacity: 0, width: 0, transition: { duration: 0.2 } },
    textOpen: { opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.1 } }, // Delay text animation slightly
};

// Animation variants for dropdown items
const dropdownVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeOut" } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
};

// Define the navigation items based on the image sections
const topNavItems = [
    { name: 'Discover', icon: FiCompass, href: '/discover', active: true }, // Style as active
    { name: 'AvatarFX', icon: FiFilm, href: '/avatar-fx' }, // Example icon
];

const lowerNavItems = [
  { name: 'Scifi', icon: FiCpu, href: '/' },         // CPU = techy/scifi
  { name: 'Wise', icon: FiBook, href: '/' },         // Book = wisdom
  { name: 'Movies', icon: FiFilm, href: '/' },       // Film = movies
  { name: 'Songs', icon: FiMusic, href: '/' },       // Music = songs
  { name: 'Adventure', icon: FiMap, href: '/' },     // Map = adventure
  { name: 'Gf/Bf', icon: FiHeart, href: '/' },       // Heart = relationship
  { name: 'Family', icon: FiHome, href: '/' },       // Home = family
  { name: 'Friend', icon: FiUser, href: '/' },       // User = friend
  { name: 'Gamer', icon: FaFantasyFlightGames, href: '/', badge: '0%' }, // Gamepad = gaming
];

// Placeholder data for recent characters/agents (replace with actual data)
const recentAgents = [
    { id: 'elon', name: 'Elon Musk', avatar: '/voiceagents/1.jpg', time: 'This Week' },
    { id: 'rickmorty', name: 'Rick and Morty', avatar: '/voiceagents/2.jpg', time: 'A While Ago' },
];


const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { theme } = useTheme();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

     const handleProfileClick = () => {
         if (isOpen) {
             setIsProfileDropdownOpen(!isProfileDropdownOpen);
         } else {
             console.log("Profile clicked when sidebar is collapsed");
         }
    };

    return (
        <div className={`h-full flex flex-col p-4 transition-width duration-300 hide-scrollbar overflow-y-auto
                        ${uiColors.bgPrimary} ${uiColors.textPrimary}
                        ${isOpen ? 'w-64' : 'w-16'}`}>

{/* Logo/Brand Area */}
            <div className="flex items-center mb-6 p-1 space-x-3">
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
                                    dark:bg-black dark:hover:bg-gray-700 dark:text-gray-300
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
                                            dark:bg-black dark:hover:bg-gray-700 dark:text-gray-300
                                             mx-auto mb-4`}> {/* Centered and spaced when collapsed */}
                                 <FiChevronRight />
                             </button>
                         )}
           

           

            {/* Create Button */}
             {/* Removed the outer motion.div wrapper */}
             <div className={`mb-4 ${isOpen ? '' : 'flex justify-center'}`}>
                 <Link href="/create" legacyBehavior>
                     {/* The 'a' tag is the single child of Link */}
                     <a className={`inline-flex items-center rounded-full font-semibold transition-colors shadow-sm whitespace-nowrap
                                  ${isOpen ? 'px-6 py-3 w-full justify-center' : 'p-3'}
                                   ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}>
                          <FiPlus className={`${isOpen ? 'mr-2 w-5 h-5' : 'w-6 h-6'}`} />
                         {/* AnimatePresence wraps the conditionally rendered text */}
                         <AnimatePresence initial={false}>
                             {isOpen && ( // Only render text when sidebar is open
                                  <motion.span key="create-text" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="whitespace-nowrap"> {/* Added whitespace */}
                                     Create
                                  </motion.span>
                              )}
                         </AnimatePresence>
                      </a>
                 </Link>
             </div>


            {/* Top Navigation (Discover, AvatarFX) */}
             <nav className="mb-6">
                 {topNavItems.map(item => (
                     <Link key={item.name} href={item.href} legacyBehavior>
                         <a className={`flex items-center rounded-md transition-colors mb-1
                                       ${isOpen ? 'p-2' : 'justify-center p-2'}
                                       ${item.active
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textAccent}`
                                        : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`
                                       }
                                       font-medium text-sm`}>

                              <item.icon className={`${isOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}`} />

                             <AnimatePresence initial={false}>
                               {isOpen && (
                                    <motion.span
                                        key={`${item.name}-text`}
                                        initial="collapsed"
                                        animate="open"
                                        exit="collapsed"
                                        variants={itemVariants} // Use itemVariants for fade/slide animation
                                        className="whitespace-nowrap flex-grow"
                                    >
                                         {item.name}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                         </a>
                     </Link>
                 ))}
            </nav>

            {/* Search Input */}
             <div key="search-input-outer" className={`mb-6 ${isOpen ? '' : 'flex justify-center'}`}>
                 <AnimatePresence initial={false}>
                     {isOpen ? (
                          <motion.div key="search-input-open" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} w-full transition-colors focus-within:border-${uiColors.accentPrimaryText} focus-within:ring-1 ${uiColors.ringAccentShade}`}>
                              <FiSearch className={`w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 mr-2 flex-shrink-0`} />
                              <input
                                  type="text"
                                  placeholder="Search"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                              />
                          </motion.div>
                      ) : (
                          <motion.button key="search-button-collapsed" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`p-2 rounded-md ${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}>
                               <FiSearch className="w-6 h-6" />
                           </motion.button>
                      )}
                 </AnimatePresence>
             </div>


             {/* Recent Characters/Agents Section */}
             <AnimatePresence>
                  {isOpen && (
                       <motion.div
                           key="recent-agents"
                           initial="collapsed"
                           animate="open"
                           exit="collapsed"
                           variants={itemVariants}
                           className="mb-6"
                       >
                           <h3 className={`text-xs font-semibold uppercase mb-3 ${uiColors.textSecondary}`}>
                               Recent
                           </h3>
                           {recentAgents.map(agent => (
                                <Link key={agent.id} href={`/callagents/${agent.id}`} legacyBehavior>
                                    <a className={`flex items-center p-2 rounded-md transition-colors mb-1 ${uiColors.hoverBgSubtle} ${uiColors.hoverText} text-sm font-medium ${uiColors.textPrimary}`}>
                                         <Image
                                             src={agent.avatar}
                                             alt={agent.name}
                                             width={32}
                                             height={32}
                                             className="rounded-full mr-3 flex-shrink-0"
                                         />
                                         <span className="whitespace-nowrap flex-grow overflow-hidden text-ellipsis">{agent.name}</span>
                                    </a>
                                 </Link>
                            ))}
                       </motion.div>
                   )}
               </AnimatePresence>

             {/* Divider */}
             <AnimatePresence>{isOpen && <motion.div key="divider-1" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`h-px ${uiColors.borderPrimary} mb-6`}></motion.div>}</AnimatePresence>

 <h3 className={`text-xs font-semibold uppercase mb-3 ${uiColors.textSecondary}`}>
                               Famous categories
                           </h3>
            {/* Lower Navigation (Agents, Knowledge Base, etc.) */}
             <nav className="mb-6 flex-grow overflow-y-auto hide-scrollbar">
                
                 {lowerNavItems.map(item => (
                    <Link key={item.name} href={item.href} legacyBehavior>
                        <a className={`flex items-center rounded-md transition-colors mb-1
                                       ${isOpen ? 'p-2' : 'justify-center p-2'}
                                       ${item.active
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textAccent}`
                                        : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`
                                       }
                                       font-medium text-sm`}>

                             <item.icon className={`${isOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}`} />

                           <AnimatePresence initial={false}>
                               {isOpen && (
                                <>
                                
                          
                                   <motion.div
                                        key={`${item.name}-content`}
                                       initial="collapsed"
                                       animate="open"
                                       exit="collapsed"
                                       variants={itemVariants}
                                       className="flex items-center flex-grow min-w-0"
                                   >
                                        <span className="whitespace-nowrap flex-grow overflow-hidden text-ellipsis">
                                            {item.name}
                                        </span>

                                        {item.badge && (
                                             <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${uiColors.accentBadgeBg} ${uiColors.textAccent} whitespace-nowrap`}>
                                                 {item.badge}
                                             </span>
                                         )}
                                    </motion.div>
                                </>
                               )}
                            </AnimatePresence>
                        </a>
                    </Link>
                ))}
            </nav>


            {/* Footer Links (Privacy, Terms) */}
             <AnimatePresence>
                  {isOpen && (
                       <motion.div
                           key="footer-links"
                           initial="collapsed"
                           animate="open"
                           exit="collapsed"
                           variants={itemVariants}
                           className={`text-xs mb-6 ${uiColors.textSecondary} flex items-center justify-center flex-wrap space-x-2`}
                       >
                           <Link href="/privacy" legacyBehavior><a className={`${uiColors.hoverTextAccentContrast}`}>Privacy Policy</a></Link>
                           <span>•</span>
                           <Link href="/terms" legacyBehavior><a className={`${uiColors.hoverTextAccentContrast}`}>Terms of Service</a></Link>
                       </motion.div>
                   )}
               </AnimatePresence>


            {/* Upgrade Button */}
             {/* Removed the outer motion.div wrapper */}
             <div key="upgrade-button-outer" className={`w-full ${isOpen ? 'mb-6' : ''}`}>
                 <AnimatePresence initial={false}> {/* AnimatePresence wraps the conditional Link or Button */}
                     {isOpen ? ( // Render Link when open
                           <motion.div key="upgrade-button-open" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants}>
                               <Link href="/upgrade" legacyBehavior>
                                    <a className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-md transition-all shadow whitespace-nowrap
                                                    ${uiColors.accentPrimaryGradient}`}>
                                        ✨ Upgrade
                                    </a>
                                </Link>
                            </motion.div>
                       ) : ( // Render button when collapsed
                           <motion.button key="upgrade-button-collapsed" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`block mx-auto p-3 rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textAccent} ${uiColors.hoverBgSubtle}`}>
                               ✨
                           </motion.button>
                       )}
                 </AnimatePresence>
               </div>


            {/* User Profile Area */}
             <div className={`relative ${isOpen ? '' : 'flex justify-center'} mt-auto pt-4 border-t ${uiColors.borderPrimary}`}>
                 <button
                     className={`flex items-center w-full text-left rounded-md transition-colors
                                ${isOpen ? 'px-3 py-2 justify-between' : 'justify-center p-2'}
                                 ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}
                     onClick={handleProfileClick}
                     disabled={!isOpen && isProfileDropdownOpen}
                 >
                     {/* User Avatar */}
                     <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0 ${uiColors.accentPrimaryGradient}`}>
                             {/* Placeholder for Image or Initials */}
                             A
                         </div>
                         <AnimatePresence initial={false}>
                             {isOpen && (
                                 <motion.span key="profile-name-bottom" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`font-semibold whitespace-nowrap flex-grow ${uiColors.textPrimary}`}>
                                     andymarrow
                                 </motion.span>
                             )}
                         </AnimatePresence>
                     </div>
                     <AnimatePresence initial={false}>
                         {isOpen && (
                             <motion.div key="dropdown-arrow-bottom" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`${uiColors.textSecondary}`}>
                                 {isProfileDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                             </motion.div>
                         )}
                     </AnimatePresence>
                 </button>
                 <AnimatePresence initial={false}>
                     {isProfileDropdownOpen && isOpen && (
                         <motion.div
                             initial="collapsed"
                             animate="open"
                             exit="collapsed"
                             variants={dropdownVariants}
                             className={`absolute bottom-full left-0 mb-2 w-full rounded-md shadow-lg z-10 overflow-hidden
                                        ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary}`}
                         >
                             <div className="p-2 text-sm">
                                 <Link href="/settings" legacyBehavior>
                                     <a className={`block px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                         Settings
                                     </a>
                                 </Link>

                                    <div className={`flex items-center px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                        <span className="flex-grow">Theme:</span>
                                        <ThemeToggle />
                                    </div>

                                 <button onClick={() => {/* handle logout */}} className={`w-full text-left px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                     Logout
                                 </button>
                             </div>
                         </motion.div>
                     )}
                 </AnimatePresence>
            </div>


        </div>
    );
};

export default Sidebar;