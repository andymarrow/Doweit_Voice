// voice-agents-dashboard/page.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FiBookOpen, FiBriefcase, FiCpu, FiMessageCircle, FiPhone, FiPhoneCall, FiUsers } from 'react-icons/fi';
import { FaMicrophoneAlt } from 'react-icons/fa';

// Import the new components
import FeaturedSection from './_components/FeaturedSection';
import CommunityCreation from './_components/CommunityCreation';

// Import constants
import {
     sectionVariants,
     itemVariants as bannerItemVariants,
     toolItemVariants,
     accentButtonClasses,
     accentTextClasses,
     accentBorderClasses
} from './_constants/uiConstants';


// Data for the tool icons/links (remains here as it's specific to this part of the page)
const agentTools = [
    { name: 'Alan AI', icon: FiCpu, href: '/agents/alanai' },
    { name: 'Recruitment Agent', icon: FiBriefcase, href: '/agents/recruitment' },
    { name: 'Audio Booker', icon: FiBookOpen, href: '/agents/audiobooker' },
    { name: 'Call Agents', icon: FiPhoneCall, href: '/callagents' }, // Note: Duplicate href with Meeting Leader
    { name: 'Tutor', icon: FaMicrophoneAlt, href: '/agents/tutor' },
    { name: 'Character AI', icon: FiMessageCircle, href: '/characterai' },
    { name: 'Meeting Leader', icon: FiUsers, href: '/agents/meetingleader' }, // Note: Duplicate href with Call Agents
    // Add more tools as needed
];


export default function DashboardPage() {
    return (
        // Main content area wrapper. Added pb-8 for padding at the bottom.
        <div className="flex flex-col space-y-8 p-2 md:p-3 lg:p-4 pb-8 
                         text-gray-800
                         dark:text-gray-200
                           hide-scrollbar"> {/* Added base background, overflow, and hide-scrollbar here */}

            {/* Banner Section */}
            <motion.section
                className="relative w-full rounded-xl overflow-hidden flex flex-col justify-center p-8 md:p-12 lg:p-16 min-h-[350px] md:min-h-[400px]" // Increased min height
                variants={sectionVariants} // Using sectionVariants from constants
                initial="hidden"
                animate="visible"
            >
                {/* Background Image */}
                 <Image
                     src="/AppCategory/mobileApplication.jpg" // Use your image path
                     alt="AI Voice Agents Banner"
                     layout="fill"
                     objectFit="cover"
                     priority={true}
                     className="z-0"
                 />

                {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 dark:bg-black/60 z-10"></div>

                {/* Banner Content */}
                <div className="relative z-20 max-w-4xl mx-auto text-center text-white">
                    <motion.h1
                        className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 drop-shadow-md"
                        variants={bannerItemVariants} // Using renamed itemVariants
                    >
                        Discover Our Cutting-Edge AI Voice Agents
                    </motion.h1>
                    <motion.p
                        className="text-base md:text-lg mb-8 opacity-90 drop-shadow-sm"
                        variants={bannerItemVariants} // Using renamed itemVariants
                    >
                        Seamlessly integrate powerful AI into your workflow. Explore our diverse range of agents, connect with the community, and unleash your potential.
                    </motion.p>
                    {/* Main Call to Action Button */}
                    <motion.div variants={bannerItemVariants}>
                        <Link href="/marketplace" legacyBehavior>
                            <motion.a
                                className={`inline-block text-lg font-semibold px-8 py-3 rounded-full transition-transform duration-200 shadow-lg ${accentButtonClasses}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Explore Agents
                            </motion.a>
                        </Link>
                    </motion.div>
                </div>
            </motion.section>

            {/* Agent Tools/Categories Section */}
            {/* Note: This section still lives in page.jsx */}
            <motion.section
                className="w-full"
                variants={sectionVariants} // Using sectionVariants from constants
                initial="hidden"
                animate="visible"
            >
                <h2 className="text-xl text-center md:text-2xl font-bold mb-6
                               text-gray-800 dark:text-white">
                    Agent Tools
                </h2>

                {/* Horizontal Scrolling Container - REMOVED justify-center */}
                <div className="flex overflow-x-auto justify-center space-x-6 pb-4 py-2 hide-scrollbar -mx-4 px-4 md:-mx-8 md:px-8 lg:-mx-12 lg:px-12">
                    {agentTools.map(tool => (
                         // Using tool.name as key assumes unique names. If names can be same, add a unique ID to data.
                        <Link key={tool.name} href={tool.href} legacyBehavior>
                            <motion.a
                                className="group flex flex-col items-center space-y-2 flex-shrink-0 w-24 md:w-28 cursor-pointer text-center"
                                // variants={toolItemVariants} // Still uses toolItemVariants defined in constants
                                whileHover="hover"
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Icon Container - Uses subtle background and accent border on hover */}
                                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out
                                               bg-gray-100 dark:bg-gray-800
                                               text-gray-600 dark:text-gray-300
                                               border-2 border-transparent
                                               group-hover:${accentBorderClasses} group-hover:${accentTextClasses}
                                               group-hover:shadow-md dark:group-hover:shadow-lg`}>
                                    <tool.icon className="w-7 h-7 md:w-8 md:h-8" />
                                </div>
                                {/* Tool Name - Changes color on hover */}
                                <span className="text-xs md:text-sm whitespace-normal transition-colors duration-200
                                               text-gray-600 dark:text-gray-300
                                               group-hover:${accentTextClasses}">
                                    {tool.name}
                                </span>
                            </motion.a>
                        </Link>
                    ))}
                </div>
            </motion.section>

            {/* Featured Agents Section - Render the component */}
            <FeaturedSection />

            {/* Community Creations Section - Render the component */}
            <CommunityCreation />

             {/* Add other sections here as needed */}
                
        </div>
    );
}