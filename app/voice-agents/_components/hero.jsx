"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';

// Define the data for your AI agents
// IMPORTANT: Update the imagePath for each agent with your actual public directory paths
const agentData = [
    {
        id: 'alina',
        type: '✦ Recruitment Ai ✦', // Corresponds to the indicator text
        name: 'Alina - Interview Coach',
        description: 'Your personal guide through complex interviews, offering insights and realistic practice sessions. Train with Alina to ace your next job application.',
        imagePath: '/voiceagents/3.jpg', // <--- UPDATE THIS PATH
        link: '/agents/alina',
    },
    {
        id: 'zeke',
        type: '✦ Character Ai ✦',
        name: 'Zeke - Story Weaver',
        description: 'Embark on epic quests or intimate narratives. Zeke adapts to your style, weaving tales tailored just for you.',
        imagePath: '/voiceagents/6.jpg', // <--- UPDATE THIS PATH
        link: '/agents/zeke',
    },
    {
        id: 'callie',
        type: '✦ Caller Ai ✦',
        name: 'Callie - Appointment Setter',
        description: 'Efficiently schedule and manage appointments. Callie handles calls, confirmations, and reminders seamlessly.',
        imagePath: '/voiceagents/5.jpg', // <--- UPDATE THIS PATH
        link: '/agents/callie',
    }
];

function Hero() {
    const { theme } = useTheme();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    // --- Dynamic Colors based on Theme ---
    const gradientFrom = theme === 'dark' ? 'from-purple-950' : 'from-cyan-100';
    const gradientTo = theme === 'dark' ? 'to-black' : 'to-white';
    const accentColor = theme === 'dark' ? 'bg-cyan-500' : 'bg-purple-600'; // Accent for buttons/elements
    const secondaryAccentColor = theme === 'dark' ? 'bg-purple-600' : 'bg-cyan-500'; // Secondary accent
    const primaryTextColor = theme === 'dark' ? 'text-white' : 'text-gray-900';
    const secondaryTextColor = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    // Note: cardBgColor/BorderColor/IndicatorColor are now often handled within the card rendering loop below
    const cardBorderColor = theme === 'dark' ? 'border-cyan-400/50' : 'border-purple-600/50'; // Card border (subtle)
    const cardIndicatorColor = theme === 'dark' ? 'text-cyan-400' : 'text-purple-600'; // Indicator text color


    // --- Animation Variants (Framer Motion) ---
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 80,
                damping: 12,
            },
        },
    };

    // Variants for the Sci-Fi Cards container (this container holds the 3 cards)
    const cardsContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
             opacity: 1,
             transition: {
                 staggerChildren: 0.2, // Stagger the appearance of individual cards
                 delayChildren: 0.8 // Delay the start of card animations after text
             }
        }
    };

    // Variants for individual Sci-Fi Cards based on their position
    const getCardVariants = (index) => {
        const base = {
            initial: { opacity: 0, scale: 0.8, y: 50 },
            visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                    type: 'spring',
                    stiffness: 50,
                    damping: 10,
                },
            },
             hover: {
                scale: 1.05, // Slightly larger on hover
                // Themed shadow on hover
                boxShadow: theme === 'dark'
                   ? '0 10px 30px rgba(74, 222, 212, 0.4)' // Cyan shadow for dark mode
                   : '0 10px 30px rgba(139, 92, 246, 0.4)', // Purple shadow for light mode
                transition: { duration: 0.2 }
            }
        };

        // Add specific transformations based on index for the visible state
        if (index === 0) { // Left card
            base.visible.rotate = -8; // Tilt left
            base.visible.y = 20; // Slightly lower position
            base.visible.x = -10; // Slightly left
             base.visible.zIndex = 10; // Ensure correct stacking below middle
             base.hover.rotate = 0; // Straighten on hover
             base.hover.y = 0; // Center vertically on hover
             base.hover.zIndex = 40; // Bring to front on hover
        } else if (index === 1) { // Middle card
            base.visible.rotate = 0; // No tilt
            base.visible.y = -30; // Higher position to overlap
            base.visible.scale = 1.1; // Slightly larger
             base.visible.zIndex = 20; // Higher z-index
             base.hover.scale = 1.15; // Make middle even larger on hover
             base.hover.y = -40; // Move even higher on hover
             base.hover.zIndex = 40; // Bring to front on hover (redundant but safe)
        } else if (index === 2) { // Right card
            base.visible.rotate = 8; // Tilt right
            base.visible.y = 20; // Slightly lower position (same as left)
            base.visible.x = 10; // Slightly right
             base.visible.zIndex = 10; // Ensure correct stacking below middle
             base.hover.rotate = 0; // Straighten on hover
             base.hover.y = 0; // Center vertically on hover
             base.hover.zIndex = 40; // Bring to front on hover
        }

        return base;
    };


    // Placeholder for waveform bars (kept as is)
    const numBars = 100;
    const waveformBars = Array.from({ length: numBars }).map((_, index) => (
        <motion.div
            key={index}
             initial={{ scaleY: 0.3, opacity: 0.5 }}
             animate={{
                 scaleY: [0.3, Math.random() * 1.0 + 0.5, 0.3], // Adjusted scale range slightly
                 opacity: [0.5, 0.8, 0.5] // Adjusted opacity range
             }}
             transition={{
                 duration: 2,
                 repeat: Infinity,
                 repeatType: "loop",
                 ease: "easeInOut",
                 delay: index * 0.04 // Slightly reduced stagger delay
             }}
            className={`w-2 md:w-1 lg:w-2 h-full rounded-t-full ${secondaryAccentColor} mx-px md:mx-1 lg:mx-2`} // Using secondary accent, thinner bars w-0.5
        ></motion.div>
    ));


     // Prevent rendering until mounted to avoid theme mismatch on initial render
     if (!isMounted) {
        return null;
     }


  return (
    <section className={`relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b ${gradientFrom} ${gradientTo} p-4 md:p-6`}>
      {/* Content wrapper for spacing */}
      <div className='relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12'>

          {/* Main Content (Headline, Sub-headlines) - Left side on lg screens */}
          <motion.div
              className="text-center lg:text-left lg:w-1/2 px-4" // lg:w-1/2 and lg:text-left
              variants={containerVariants}
              initial="hidden"
              animate="visible"
          >
              <motion.h1
                className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight ${primaryTextColor}`}
                variants={itemVariants}
              >
                Multi - AI Voice Agents <br className="sm:hidden lg:block"/> Marketplace
              </motion.h1>
              <motion.p
                className={`text-lg md:text-xl mb-8 ${secondaryTextColor}`} // Increased bottom margin
                variants={itemVariants}
              >
                Discover, Customize, and Deploy intelligent AI voice agents for <br className="hidden md:block lg:hidden"/> business, education, entertainment, and more.
              </motion.p>

              {/* Call-to-Action buttons */}
              <motion.div
                className="flex flex-col sm:flex-row justify-center lg:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-6"
                variants={containerVariants}
              >
                <motion.div variants={itemVariants}> {/* Wrap Link/Button in motion div */}
                    <Link href="/voice-agents-dashboard" legacyBehavior>
                       <a className={`inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${secondaryAccentColor} hover:${accentColor} transition-colors duration-300`}>
                           Explore Agents
                       </a>
                    </Link>
                </motion.div>
                 <motion.div variants={itemVariants}> {/* Wrap Link/Button in motion div */}
                    <Link href="/create-agent" legacyBehavior>
                       <a className={`inline-block px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm ${primaryTextColor} border ${secondaryAccentColor.replace('bg-', 'border-')} hover:${accentColor.replace('bg-', 'border-')} transition-colors duration-300`}>
                           Build Your Own →
                       </a>
                    </Link>
                 </motion.div>
              </motion.div>

          </motion.div>

           {/* Sci-Fi Character AI Cards Container (Replaces the single card) */}
           {/* This container will only be displayed on large screens and arranges cards horizontally */}
           <motion.div
               className="hidden lg:flex lg:flex-row items-center justify-center w-full  px-4 relative h-[400px] lg:h-[500px]" // Added height to prevent layout shift when cards appear, relative needed for positioning
               variants={cardsContainerVariants}
               initial="hidden"
               animate="visible"
           >
              {agentData.map((agent, index) => (
                  <motion.div
                      key={agent.id}
                      className={`w-64 p-5 rounded-xl border-2 ${cardBorderColor} shadow-2xl backdrop-filter backdrop-blur-lg bg-white/10 dark:bg-black/10 absolute lg:static`} // Use absolute for positioning within the container, static on lg to work with flex gap
                      variants={getCardVariants(index)} // Apply variants based on index
                       // Note: z-index and transforms are handled by Framer Motion variants in getCardVariants
                      whileHover="hover" // Apply hover variants
                  >
                      {/* Indicator */}
                      <div className={`text-xs font-mono uppercase mb-3 text-center ${cardIndicatorColor}`}>
                          {agent.type}
                      </div>

                      {/* Avatar Image */}
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-400 dark:border-gray-600 shadow-md mb-3">
                          <Image
                             src={agent.imagePath}
                             alt={`${agent.name} Avatar`}
                             width={96} // Must match div size (24 * 4 = 96)
                             height={96}
                             objectFit="cover"
                             className="filter grayscale hover:grayscale-0 transition-all duration-300"
                          />
                      </div>

                      {/* Character Name */}
                      <h3 className={`text-lg font-bold text-center mb-2 ${primaryTextColor}`}>
                          {agent.name}
                      </h3>

                      {/* Description */}
                      <p className={`text-xs text-center mb-5 ${secondaryTextColor}`}>
                          {agent.description}
                      </p>

                      {/* Call-to-Action Button */}
                      <Link href={agent.link} legacyBehavior>
                           <motion.button
                               as="a"
                               className={`w-full py-2 text-base font-semibold rounded-md transition-colors duration-300 ease-in-out text-white
                                          ${secondaryAccentColor} hover:${accentColor} focus:outline-none focus:ring-2 focus:ring-offset-2
                                          ${theme === 'dark' ? 'focus:ring-cyan-500 focus:ring-offset-purple-950' : 'focus:ring-purple-600 focus:ring-offset-white'}`}
                               whileHover={{ scale: 1.02 }} // Keep simple button hover
                               whileTap={{ scale: 0.98 }}
                           >
                               Talk to {agent.name.split(' - ')[0]} {/* Use just the first name */}
                           </motion.button>
                       </Link>

                  </motion.div>
              ))}

           </motion.div>

      </div> {/* End main content wrapper */}


      {/* Background Waveform (Kept as is) */}
      <div className="absolute inset-x-0 top-50 h-1/3 flex items-end justify-center z-10 opacity-50"> {/* Changed top-50 to bottom-0 */}
          {waveformBars}
      </div>

      {/* Background Shapes/Particles (Kept as is) */}
      <div className={`absolute top-10 left-20 w-24 h-24 rounded-full ${secondaryAccentColor} opacity-20 z-0 blur-xl`}></div>
      <div className={`absolute bottom-20 right-10 w-32 h-32 rounded-full ${accentColor} opacity-15 z-0 blur-xl`}></div>
      <div className={`absolute top-1/4 right-1/4 w-16 h-16 rounded-full ${secondaryAccentColor} opacity-25 z-0 blur-xl`}></div>
      <div className={`absolute bottom-1/4 left-1/4 w-12 h-12 rounded-full ${accentColor} opacity-30 z-0 blur-xl`}></div>
          {[...Array(40)].map((_, i) => ( // Increased particle count
              <div
                  key={i}
                  className={`absolute rounded-full ${secondaryAccentColor} opacity-50`} // Particles use secondary accent
                  style={{
                      width: `${Math.random() * 3 + 1}px`, // Smaller particles
                      height: `${Math.random() * 3 + 1}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      zIndex: 0,
                  }}
              ></div>
          ))}

       {/* Subtle network/grid pattern overlay (Kept as is) */}
         <div className="absolute inset-0 z-10 opacity-10 pointer-events-none">
             <div className="absolute inset-0" style={{
                 backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(74, 222, 212, 0.1)' : 'rgba(139, 92, 246, 0.1)'} 1px, transparent 1px)`,
                 backgroundSize: '20px 20px'
             }}></div>
         </div>
    </section>
  );
}

export default Hero;