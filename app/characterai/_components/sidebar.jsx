// characterai/_components/sidebar.jsx
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook

import ThemeToggle from '@/components/Themetoggle'; // Assuming this path is correct
import {
    FiPlus, FiCompass, FiFilm, FiSearch, FiExternalLink,
    FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown,
    FiBriefcase, FiBookOpen, FiZap, FiShare2, FiUsers, FiPhone, FiSettings, FiZapOff,
    FiCpu,
    FiBook,
    FiMusic,
    FiMap,
    FiHeart,
    FiHome,
    FiUser // Already exists, used for 'Friend'
} from 'react-icons/fi';

import { FaFantasyFlightGames } from 'react-icons/fa';

// Import constants
import { uiColors } from '@/app/characterai/_constants/uiConstants'; // Adjusted path
import { accentClasses } from '../_constants/uiConstants';

// Animation variants - Keep as is
const itemVariants = {
    collapsed: { opacity: 0, x: -20, transition: { duration: 0.2 } },
    open: { opacity: 1, x: 0, transition: { duration: 0.2, delay: 0.05 } }, // Slight delay for better stagger
    textCollapsed: { opacity: 0, width: 0, transition: { duration: 0.15 } },
    textOpen: { opacity: 1, width: 'auto', transition: { duration: 0.2, delay: 0.1 } },
};

const dropdownVariants = {
    collapsed: { opacity: 0, height: 0, transition: { duration: 0.3, ease: "easeOut" } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: "easeOut" } },
};

// Define the navigation items
const topNavItems = [
    // Link 'Discover' to the main character list page
    { name: 'Discover', icon: FiCompass, href: '/characterai', active: true }, // Link to /characterai
    { name: 'AvatarFX', icon: FiFilm, href: '/avatar-fx' }, // Example, keep as is
];

const lowerNavItems = [
  // Link these to the main character list page with a category query parameter
  { name: 'Scifi', icon: FiCpu, href: '/characterai?category=Scifi' },
  { name: 'Wise', icon: FiBook, href: '/characterai?category=Wise' },
  { name: 'Movies', icon: FiFilm, href: '/characterai?category=Movies' },
  { name: 'Songs', icon: FiMusic, href: '/characterai?category=Songs' },
  { name: 'Adventure', icon: FiMap, href: '/characterai?category=Adventure' },
  { name: 'Gf/Bf', icon: FiHeart, href: '/characterai?category=Gf/Bf' },
  { name: 'Family', icon: FiHome, href: '/characterai?category=Family' },
  { name: 'Friend', icon: FiUser, href: '/characterai?category=Friend' },
  { name: 'Gamer', icon: FaFantasyFlightGames, href: '/characterai?category=Gamer', badge: '0%' },
];

// Placeholder data for recent characters/agents (Will fetch from backend)
// const recentAgents = [...]; // Removed hardcoded data

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { user, isLoading: isUserLoading } = useUser(); // Get user info from Clerk

  
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // Not used for API search from sidebar directly, but can be kept for local filtering if needed

    // State for recent characters fetched from backend
    const [recentCharacters, setRecentCharacters] = useState([]);
    const [isLoadingRecent, setIsLoadingRecent] = useState(true);
    const [recentError, setRecentError] = useState(null);

    // Fetch recent characters when user loads or sidebar state changes (optional, maybe just once)
    useEffect(() => {
         if (user?.id) { // Fetch only if user is logged in
            const fetchRecentCharacters = async () => {
                setIsLoadingRecent(true);
                setRecentError(null);
                try {
                    // Call a backend API endpoint to get recent characters for this user
                     const response = await fetch(`/api/users/${user.id}/recent-characters`); // Example endpoint
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                     // Assume data.recentCharacters is an array of character objects { id, name, avatarUrl }
                    setRecentCharacters(data.recentCharacters || []);
                } catch (err) {
                    console.error("Failed to fetch recent characters:", err);
                    setRecentError("Could not load recent.");
                    setRecentCharacters([]);
                } finally {
                    setIsLoadingRecent(false);
                }
            };
            fetchRecentCharacters();
         } else {
             // Clear recent characters if user logs out
              setRecentCharacters([]);
              setIsLoadingRecent(false);
              setRecentError(null);
         }
    }, [user?.id]); // Refetch if user changes

     const handleProfileClick = () => {
         if (isOpen && !isUserLoading) { // Only toggle if open and user data is loaded
             setIsProfileDropdownOpen(!isProfileDropdownOpen);
         } else {
             console.log("Profile click ignored: sidebar collapsed or user loading");
         }
    };

    return (
        <div className={`h-full flex flex-col p-4 transition-width duration-300 hide-scrollbar overflow-y-auto
                        ${uiColors.bgPrimary} ${uiColors.textPrimary}
                        ${isOpen ? 'w-64' : 'w-[70px]'}`}> {/* Explicit width in px for collapsed */}

            {/* Logo/Brand Area */}
            <div className="flex items-center mb-6 p-1 space-x-3">
                 {/* Logo Circle with Initials - Uses Accent Gradient */}
                 <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0
                                 bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-purple-600 dark:to-purple-800">
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
                            className="text-xl font-bold whitespace-nowrap text-gray-900 dark:text-white flex-grow"
                        >
                            Doweit Voice
                        </motion.span>
                    )}
                </AnimatePresence>

                {/* Toggle Button - Logic kept as requested */}
                {isOpen && ( // Only show when open
                     <button
                         onClick={toggleSidebar}
                         className={`p-2 rounded-full transition-colors flex-shrink-0
                                    bg-gray-100 hover:bg-gray-200 text-gray-600
                                    dark:bg-black dark:hover:bg-gray-700 dark:text-gray-300
                                    ml-auto`}>
                         <FiChevronLeft />
                     </button>
                )}
            </div>
            {/* Second Toggle Button - Appears when collapsed, handles expanding */}
            {!isOpen && (
                 <button
                     onClick={toggleSidebar}
                     className={`p-2 rounded-full transition-colors flex-shrink-0
                                bg-gray-100 hover:bg-gray-200 text-gray-600
                                dark:bg-black dark:hover:bg-gray-700 dark:text-gray-300
                                 mx-auto mb-4`}>
                     <FiChevronRight />
                 </button>
             )}


            {/* Create Button - Link to the create page */}
             <div className={`mb-4 ${isOpen ? '' : 'flex justify-center'}`}>
                 {/* Link to the character create page */}
                 <Link href="/characterai/create" legacyBehavior>
                     <a className={`inline-flex items-center rounded-full font-semibold transition-colors shadow-sm whitespace-nowrap
                                  ${isOpen ? 'px-6 py-3 w-full justify-center' : 'p-3'}
                                   ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}>
                          <FiPlus className={`${isOpen ? 'mr-2 w-5 h-5' : 'w-6 h-6'}`} />
                         <AnimatePresence initial={false}>
                             {isOpen && (
                                  <motion.span key="create-text" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className="whitespace-nowrap">
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
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textAccent}` // Active style
                                        : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}` // Inactive style
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
                                        variants={itemVariants}
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

            {/* Search Input - Search is handled on the main page now */}
             <div key="search-input-outer" className={`mb-6 ${isOpen ? '' : 'flex justify-center'}`}>
                 <AnimatePresence initial={false}>
                     {isOpen ? (
                          // Keep the input if search is intended *within* the sidebar
                          <motion.div key="search-input-open" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} w-full transition-colors focus-within:border-${uiColors.accentPrimaryText} focus-within:ring-1 ${uiColors.ringAccentShade}`}>
                              <FiSearch className={`w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 mr-2 flex-shrink-0`} />
                               {/* The input here could potentially update the search term state on the main page */}
                               {/* For simplicity now, the main page handles search input */}
                              <input
                                  type="text"
                                  placeholder="Search sidebar..." // Changed placeholder
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)} // This only updates sidebar state
                                  className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                              />
                          </motion.div>
                      ) : (
                           // Keep button if collapsed search is desired (e.g., expands search or redirects)
                          <motion.button key="search-button-collapsed" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`p-2 rounded-md ${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}>
                               <FiSearch className="w-6 h-6" />
                           </motion.button>
                      )}
                 </AnimatePresence>
             </div>


             {/* Recent Characters Section - Fetching from backend */}
             <AnimatePresence>
                  {isOpen && (
                       <motion.div
                           key="recent-characters-section"
                           initial="collapsed"
                           animate="open"
                           exit="collapsed"
                           variants={itemVariants}
                           className="mb-6"
                       >
                           <h3 className={`text-xs font-semibold uppercase mb-3 ${uiColors.textSecondary}`}>
                               Recent
                           </h3>
                            {isLoadingRecent ? (
                                <div className={`text-xs ${uiColors.textSecondary}`}>Loading...</div>
                            ) : recentError ? (
                                <div className={`text-xs text-red-500`}>{recentError}</div>
                            ) : recentCharacters.length === 0 ? (
                                <div className={`text-xs ${uiColors.textSecondary}`}>No recent characters.</div>
                            ) : (
                                recentCharacters.map(character => (
                                     // Link to the chat page of the recent character
                                     <Link key={character.id} href={`/characterai/chat/${character.id}`} legacyBehavior>
                                         <a className={`flex items-center p-2 rounded-md transition-colors mb-1 ${uiColors.hoverBgSubtle} ${uiColors.hoverText} text-sm font-medium ${uiColors.textPrimary}`}>
                                              {character.avatarUrl ? ( // Use avatarUrl from backend
                                                 <Image
                                                     src={character.avatarUrl}
                                                     alt={character.name}
                                                     width={32}
                                                     height={32}
                                                     className="rounded-full mr-3 flex-shrink-0 object-cover" // Added object-cover
                                                 />
                                             ) : (
                                                 // Fallback for recent characters without avatars
                                                  <div className={`w-8 h-8 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-sm font-semibold text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary} mr-3 flex-shrink-0`}>
                                                      {character.name?.charAt(0).toUpperCase() || '?'}
                                                   </div>
                                             )}
                                             <span className="whitespace-nowrap flex-grow overflow-hidden text-ellipsis">{character.name}</span>
                                             {/* Removed the 'time' display as it's not crucial for MVP */}
                                             {/* <span className="ml-auto text-xs text-gray-400">{agent.time}</span> */}
                                         </a>
                                      </Link>
                                 ))
                             )}
                       </motion.div>
                   )}
               </AnimatePresence>

             {/* Divider */}
             <AnimatePresence>{isOpen && <motion.div key="divider-1" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`h-px ${uiColors.borderPrimary} mb-6`}></motion.div>}</AnimatePresence>

            {/* "Famous categories" Title */}
             <AnimatePresence>
                 {isOpen && (
                      <motion.h3
                          key="categories-title"
                          initial="collapsed"
                          animate="open"
                          exit="collapsed"
                          variants={itemVariants}
                          className={`text-xs font-semibold uppercase mb-3 ${uiColors.textSecondary}`}
                      >
                          Famous categories
                      </motion.h3>
                  )}
              </AnimatePresence>

            {/* Lower Navigation (Categories) */}
             <nav className="mb-6 flex-grow overflow-y-auto hide-scrollbar">
                 {lowerNavItems.map(item => (
                    <Link key={item.name} href={item.href} legacyBehavior>
                        <a className={`flex items-center rounded-md transition-colors mb-1
                                       ${isOpen ? 'p-2' : 'justify-center p-2'}
                                       ${item.active // Active state handling if needed later (e.g. highlight category if on category page)
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textAccent}`
                                        : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`
                                       }
                                       font-medium text-sm`}>

                             <item.icon className={`${isOpen ? 'w-5 h-5 mr-3' : 'w-6 h-6'}`} />

                           <AnimatePresence initial={false}>
                               {isOpen && (
                                   <motion.div
                                        key={`${item.name}-content`}
                                       initial="collapsed"
                                       animate="open"
                                       exit="collapsed"
                                       variants={itemVariants}
                                       className="flex items-center flex-grow min-w-0" // Added min-w-0 to prevent overflow
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
                           {/* Update paths if needed */}
                           <Link href="/privacy" legacyBehavior><a className={`${uiColors.hoverTextAccentContrast}`}>Privacy Policy</a></Link>
                           <span>•</span>
                           <Link href="/terms" legacyBehavior><a className={`${uiColors.hoverTextAccentContrast}`}>Terms of Service</a></Link>
                       </motion.div>
                   )}
               </AnimatePresence>


            {/* Upgrade Button - Link to upgrade page */}
             <div key="upgrade-button-outer" className={`w-full ${isOpen ? 'mb-6' : ''}`}>
                 <AnimatePresence initial={false}>
                     {isOpen ? (
                           <motion.div key="upgrade-button-open" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants}>
                               {/* Update path if needed */}
                               <Link href="/upgrade" legacyBehavior>
                                    <a className={`block text-center text-sm font-semibold px-4 py-2.5 rounded-md transition-all shadow whitespace-nowrap
                                                    ${uiColors.accentPrimaryGradient}`}>
                                        ✨ Upgrade
                                    </a>
                                </Link>
                            </motion.div>
                       ) : (
                           <motion.button key="upgrade-button-collapsed" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`block mx-auto p-3 rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textAccent} ${uiColors.hoverBgSubtle}`}>
                               ✨
                           </motion.button>
                       )}
                 </AnimatePresence>
               </div>


            {/* User Profile Area - Displaying Clerk User Info */}
             {/* Conditional rendering based on user loading/loaded state */}
             {!isUserLoading && user ? ( // Only render if user is loaded and exists
                 <div className={`relative ${isOpen ? '' : 'flex justify-center'} mt-auto pt-4 border-t ${uiColors.borderPrimary}`}>
                     <button
                         className={`flex items-center w-full text-left rounded-md transition-colors
                                    ${isOpen ? 'px-3 py-2 justify-between' : 'justify-center p-2'}
                                     ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`}
                         onClick={handleProfileClick}
                         disabled={!isOpen} // Disable button if collapsed
                     >
                         {/* User Avatar - Use Clerk's user.imageUrl */}
                         <div className={`flex items-center ${isOpen ? '' : 'justify-center w-full'}`}>
                              {user.imageUrl ? (
                                   <Image
                                       src={user.imageUrl} // Use Clerk user image URL
                                       alt={user.firstName || user.username || 'User'}
                                       width={32}
                                       height={32}
                                       className="rounded-full mr-2 flex-shrink-0 object-cover"
                                    />
                              ) : (
                                  // Fallback div if no image
                                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-2 flex-shrink-0 ${uiColors.accentPrimaryGradient}`}>
                                      {user.firstName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                                   </div>
                              )}
                             <AnimatePresence initial={false}>
                                 {isOpen && (
                                     <motion.span key="profile-name-bottom" initial="collapsed" animate="open" exit="collapsed" variants={itemVariants} className={`font-semibold whitespace-nowrap flex-grow ${uiColors.textPrimary} overflow-hidden text-ellipsis`}>
                                         {user.firstName || user.username || 'User'} {/* Display user's name */}
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
                     {/* Profile Dropdown */}
                     <AnimatePresence initial={false}>
                         {isProfileDropdownOpen && isOpen && ( // Ensure sidebar is open for dropdown
                             <motion.div
                                 initial="collapsed"
                                 animate="open"
                                 exit="collapsed"
                                 variants={dropdownVariants}
                                 className={`absolute bottom-full left-0 mb-2 w-full rounded-md shadow-lg z-10 overflow-hidden
                                            ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary}`}
                             >
                                 <div className="p-2 text-sm">
                                     {/* Update path if needed */}
                                     <Link href="/settings" legacyBehavior>
                                         <a className={`block px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                             Settings
                                         </a>
                                     </Link>

                                        <div className={`flex items-center px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                            <span className="flex-grow">Theme:</span>
                                            <ThemeToggle />
                                        </div>

                                      {/* Link to Clerk's Sign Out */}
                                       {/* <Link href="/sign-out" legacyBehavior> 
                                          <a className={`w-full text-left px-3 py-2 rounded transition-colors ${uiColors.hoverBgSubtle}`}>
                                               Logout
                                          </a>
                                       </Link> */}
                                 </div>
                             </motion.div>
                         )}
                     </AnimatePresence>
                </div>
             ) : (
                  // Optional: Show loading state or prompt login if user is not loaded/logged in
                   <AnimatePresence>
                       {isOpen && ( // Only show loading state when open
                            <motion.div
                                key="user-loading-state"
                                initial="collapsed"
                                animate="open"
                                exit="collapsed"
                                variants={itemVariants}
                                className={`mt-auto pt-4 border-t ${uiColors.borderPrimary} text-center text-xs ${uiColors.textSecondary}`}
                            >
                                {isUserLoading ? 'Loading user...' : <Link href="/sign-in" legacyBehavior><a className={`${uiColors.hoverTextAccentContrast}`}>Sign In</a></Link>}
                            </motion.div>
                        )}
                       {!isOpen && ( // Show placeholder when collapsed
                           <div className={`mt-auto pt-4 border-t ${uiColors.borderPrimary} flex justify-center`}>
                                <div className={`w-8 h-8 rounded-full ${uiColors.accentPrimaryGradient} flex items-center justify-center text-white text-sm font-semibold`}>
                                    U
                                </div>
                            </div>
                       )}
                   </AnimatePresence>
             )}


        </div>
    );
};

export default Sidebar;