"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPlusCircle } from 'react-icons/fi'; // Icons

// Import components
import CharacterCard from './_components/CharacterCard'; // Import the CharacterCard component

// Import constants - Adjust path as necessary
import { uiColors } from './_constants/uiConstants'; // Using the path provided
import { sectionVariants, itemVariants } from './_constants/uiConstants';  // Assuming animation variants
import Link from 'next/link';

// Placeholder Character Data (Replace with actual fetched data)
const allCharacters = [
    {
        id: 'emma-autotrust',
        type: 'fictional',
        name: 'Emma from AutoTrust',
        avatar: '/voiceagents/1.jpg', // Use the image from your sidebar/configure
        story: 'Emma is an AI Receptionist designed to assist with car buying and selling inquiries at AutoTrust Cars. She is friendly, efficient, and focuses on qualifying leads.',
        behavior: ['Friendly', 'Efficient'], // Example behaviors
        likes: '1.2K',
        shares: '500',
        chats: '10K',
    },
     {
         id: 'elon-musk',
         type: 'real', // Mark as real person
         name: 'Elon Musk',
         avatar: '/voiceagents/5.jpg', // Placeholder avatar path
         realPersonInfo: 'Entrepreneur, investor, and business magnate. Founder of SpaceX, co-founder of Tesla, Inc., Neuralink, and The Boring Company.', // Real person description
         behavior: ['Wise', 'Scifi'], // Example behaviors
         likes: '5M',
         shares: '2M',
         chats: '50M',
     },
     {
         id: 'rick-morty',
         type: 'fictional',
         name: 'Rick Sanchez',
         avatar: '/voiceagents/5.jpg', // Placeholder avatar path
         story: 'A super-intelligent, eccentric, and alcoholic mad scientist who drags his inherently timid grandson Morty on dangerous, darkly comedic adventures across the multiverse.',
         behavior: ['Wise', 'Scifi', 'Adventure'], // Example behaviors
         likes: '3M',
         shares: '1.5M',
         chats: '30M',
     },
     {
         id: 'captain-kirk',
         type: 'fictional',
         name: 'Captain Kirk',
         avatar: '/voiceagents/5.jpg', // Placeholder avatar
         story: 'Captain of the starship USS Enterprise. Known for his bravery, charisma, and ability to face unusual challenges and moral dilemmas.',
         behavior: ['Adventure', 'Scifi'],
         likes: '800K',
         shares: '300K',
         chats: '8M',
     },
     {
         id: 'frodo-baggins',
         type: 'fictional',
         name: 'Frodo Baggins',
         avatar: '/voiceagents/5.jpg', // Placeholder avatar
         story: 'A hobbit from the Shire who inherits the One Ring from his uncle Bilbo and undertakes the quest to destroy it in the fires of Mount Doom.',
         behavior: ['Adventure', 'Wise'],
         likes: '600K',
         shares: '250K',
         chats: '6M',
     },
      {
         id: 'dolly-parton',
         type: 'real', // Mark as real person
         name: 'Dolly Parton',
         avatar: '/voiceagents/5.jpg', // Placeholder avatar
         realPersonInfo: "Iconic American singer, songwriter, multi-instrumentalist, record producer, actress, author, businesswoman, and humanitarian. Known for her work in country music.", // Real person description
         behavior: ['Wise', 'Songs', 'Friendly'], // Example behaviors
         likes: '2M',
         shares: '1M',
         chats: '20M',
     },
     // Add more characters...
];


export default function CharacterAiPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [characters, setCharacters] = useState([]); // State to hold the fetched characters
    const [isLoading, setIsLoading] = useState(true); // Loading state

    // Simulate fetching characters on component mount
    useEffect(() => {
        const fetchCharacters = async () => {
            setIsLoading(true);
            // --- Simulate API Call ---
             await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
             setCharacters(allCharacters); // Use the placeholder data
            setIsLoading(false);
            // --- End Simulate API Call ---
        };

        fetchCharacters();
    }, []); // Empty dependency array means this runs once on mount


    // Filter characters based on search term (memoized for performance)
    const filteredCharacters = useMemo(() => {
        if (!searchTerm) {
            return characters; // Return all if search is empty
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return characters.filter(character =>
            character.name.toLowerCase().includes(lowerSearchTerm) ||
             character.story?.toLowerCase().includes(lowerSearchTerm) || // Search story
             character.realPersonInfo?.toLowerCase().includes(lowerSearchTerm) || // Search real person info
            character.behavior?.some(b => b.toLowerCase().includes(lowerSearchTerm)) // Search behaviors
        );
    }, [characters, searchTerm]); // Recalculate when characters or search term changes


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Header: Welcome and Search */}
            <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                 {/* Welcome Message */}
                 <div className="flex-grow">
                     <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>Welcome back, Andy</h2> {/* Placeholder Name */}
                 </div>

                {/* Search Input */}
                 <div className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} w-full sm:w-64 transition-colors focus-within:border-${uiColors.accentPrimaryText} focus-within:ring-1 ${uiColors.ringAccentShade}`}>
                     <FiSearch className={`w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 mr-2 flex-shrink-0`} />
                     <input
                         type="text"
                         placeholder="Search"
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
                     />
                 </div>
            </motion.div>


            {/* Character Cards Grid */}
            <div className="flex-grow overflow-y-auto p-4 -m-4 hide-scrollbar"> {/* Added padding and negative margin to offset parent p-4/p-6 etc. and make grid fill width better */}
                 {isLoading ? (
                     <div className={`text-center py-20 ${uiColors.textSecondary}`}>Loading characters...</div>
                 ) : filteredCharacters.length === 0 ? (
                     <div className={`text-center py-20 ${uiColors.textSecondary}`}>No characters found matching your search.</div>
                 ) : (
                      <motion.div
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" // Responsive grid
                         variants={sectionVariants} initial="hidden" animate="visible" // Animation for the grid container
                     >
                         {filteredCharacters.map(character => (
                             // CharacterCard component handles its own motion variants (itemVariants/cardVariants)
                              <CharacterCard key={character.id} character={character} />
                         ))}
                      </motion.div>
                 )}
             </div>


            {/* "Didn't find a character?" Section */}
            {/* Only show this section if search is NOT active and NOT loading */}
             {!searchTerm && !isLoading && (
                 <motion.div
                     variants={sectionVariants} initial="hidden" animate="visible"
                     className={`text-center py-10 border-t ${uiColors.borderPrimary} mt-6`} // Top border and padding
                 >
                     <h3 className={`text-lg font-semibold mb-2 ${uiColors.textPrimary}`}>Didn't find a character that matches your vibe?</h3>
                     <p className={`text-sm mb-6 ${uiColors.textSecondary}`}>Create your own</p>
                     {/* Create Button - Centered */}
                     <Link href="/create" legacyBehavior>
                          <a className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-md transition-colors shadow-sm
                                         ${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}>
                               {/* WRAP ICON AND TEXT IN A SINGLE SPAN */}
                               <span>
                                    ✨ Create Your Own
                               </span>
                           </a>
                       </Link>
                 </motion.div>
             )}

             {/* Modals or Floating Buttons like Help can still be rendered by the layout */}

        </div>
    );
}