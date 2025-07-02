// voice-agents-CallAgents/[agentid]/_components/sidebar.jsx
"use client";

import React, { useState, useEffect } from 'react'; // Added useState, useEffect
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import {
    FiLayers, FiEdit3, FiZap, FiCompass, FiPhoneCall, FiFileText, FiUploadCloud, // Example Icons
    FiChevronLeft, FiChevronRight,
    FiCopy, FiCheck // Added Copy and Check icons
} from 'react-icons/fi';

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path!

// Import the custom hook to get agent data from context
import { useCallAgent } from '../_context/CallAgentContext'; // Adjust path!


const detailSidebarNavItems = [
    { name: 'Dashboard', icon: FiLayers, hrefSegment: '' },
    { name: 'Configure', icon: FiEdit3, hrefSegment: 'configure' },
    { name: 'Prompt', icon: FiFileText, hrefSegment: 'prompt' },
    { name: 'Actions', icon: FiZap, hrefSegment: 'actions' },
    { name: 'Deployment', icon: FiUploadCloud, hrefSegment: 'deployment' },
    { name: 'Calls', icon: FiPhoneCall, hrefSegment: 'calls' },
    { name: 'Template', icon: FiFileText, hrefSegment: 'template' }, // Assuming a Template page exists
];

const hireExpertData = {
    badge: '0%',
    title: 'Hire an Expert',
    description: 'Hire a certified Doweit voice expert to help you build your AI project with Doweit voice. Submit your project below to be matched with our top experts.',
    buttonText: 'Hire Now',
    buttonLink: '#hire-expert'
};


function DetailAgentSidebar({ isCollapsed, toggleCollapse, onTestButtonClick }) {
     const pathname = usePathname();
     const agent = useCallAgent(); // Get the agent data from context

     // State to manage the "Copied!" feedback
     const [isCopied, setIsCopied] = useState(false);

     // --- Copy ID Logic ---
     const handleCopyClick = async () => {
         if (!agent || !agent.id) return; // Can't copy if no agent or ID

         try {
             // Use the modern Clipboard API
             await navigator.clipboard.writeText(String(agent.id));
             setIsCopied(true); // Set copied state to true

             // Reset copied state after a few seconds
             setTimeout(() => {
                 setIsCopied(false);
             }, 2000); // Show "Copied!" for 2 seconds

         } catch (err) {
             console.error('Failed to copy agent ID:', err);
             // Optionally show an error message to the user
             // alert('Failed to copy ID.');
         }
     };
     // --- End Copy ID Logic ---


     // Agent data is guaranteed to be available here because the layout handles the notFound case.
     // You can destructure properties directly:
     const { id: agentId, name: agentName, type: agentType, avatarUrl: agentAvatarUrl, voiceEngine: agentVoiceEngine } = agent;


     return (
        <div className={`flex flex-col h-full ${isCollapsed ? 'items-center' : 'space-y-6'}`}>

            {/* Header with Collapse Button */}
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full pb-4 mb-4 border-b ${uiColors.borderPrimary}`}>
                 {!isCollapsed && (
                     <div className={`font-semibold text-lg ${uiColors.textPrimary}`}>Agent Details</div>
                 )}
                 <button
                      onClick={toggleCollapse}
                      className={`p-1 rounded-md ${uiColors.hoverBgSubtle} transition-colors ${isCollapsed ? '' : 'ml-auto'}`}
                      title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                 >
                     {isCollapsed ? (
                         <FiChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                     ) : (
                         <FiChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                     )}
                 </button>
            </div>


            {/* Agent Info (Avatar, Name, Type, Status) - Use data from the 'agent' object */}
             <div className={`flex flex-col ${isCollapsed ? 'items-center text-center' : ''} pb-4 border-b ${uiColors.borderPrimary} ${isCollapsed ? '' : 'mb-4'}`}>
                 <div className={`flex items-center justify-center ${isCollapsed ? 'mb-0' : 'mb-2'}`}>
                     {/* Use agentAvatarUrl */}
                     {agentAvatarUrl ? (
                          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} rounded-full overflow-hidden flex-shrink-0 relative`}>
                             {/* Use Next/Image with fill and sizes */}
                             <Image src={agentAvatarUrl} alt={`${agentName || 'Agent'}'s avatar`} fill style={{objectFit:"cover"}} sizes={isCollapsed ? "32px" : "48px"} priority /> {/* Added priority */}
                          </div>
                     ) : (
                          <div className={`${isCollapsed ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 text-xs font-semibold text-gray-700 dark:text-gray-300`}>
                             {/* Use first letter of agent name */}
                             {agentName ? agentName.charAt(0).toUpperCase() : ''}
                          </div>
                     )}
                 </div>
                 {!isCollapsed && (
                     <>
                         {/* Use agentName */}
                         <div className={`font-semibold text-lg ${uiColors.textPrimary} truncate`}>{agentName || 'Unnamed Agent'}</div>
                         {/* Use agentType and agentId, add Copy button */}
                          <div className={`text-sm ${uiColors.textSecondary} flex items-center justify-center`}> {/* Added flex and justify-center */}
                             <span>{agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) : 'Unknown Type'} - ID: ...{agentId ? String(agentId).slice(-3) : 'N/A'}</span> {/* Display truncated ID */}
                             {/* Add Copy Button next to the ID */}
                             {agentId && ( // Only show copy button if agentId exists
                                 <button
                                     onClick={handleCopyClick} // Call the copy handler
                                     className={`p-0.5 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} ${uiColors.hoverText} transition-colors ml-1 flex items-center`} // Added ml-1, flex items-center
                                     title={isCopied ? 'Copied!' : 'Copy Agent ID'} // Tooltip feedback
                                 >
                                     {isCopied ? <FiCheck className="w-3 h-3 text-green-500 dark:text-green-400" /> : <FiCopy className="w-3 h-3" />} {/* Icon changes */}
                                      {/* Optional text feedback */}
                                      <span className={`text-xs ml-1 transition-opacity ${isCopied ? 'opacity-100' : 'opacity-0'} ${uiColors.textSecondary}`}>
                                          {isCopied ? 'Copied!' : ''}
                                      </span>
                                 </button>
                             )}
                         </div>
                          {/* Use agentVoiceEngine */}
                         <div className={`text-xs ${uiColors.textPlaceholder}`}>{agentVoiceEngine || 'N/A'}</div>
                     </>
                 )}
            </div>


            {/* Test Agent Button - Adjust based on collapsed state */}
             <button
                 onClick={onTestButtonClick} // This handler is passed from the parent Client Layout
                 className={`w-full text-center ${isCollapsed ? 'px-0 py-2' : 'px-4 py-2'} rounded-md font-semibold transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
            >
                 {isCollapsed ? <FiPhoneCall className="w-5 h-5 mx-auto" /> : 'Test Agent'}
             </button>


            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto hide-scrollbar mt-4">
                {detailSidebarNavItems.map(item => {
                     // Construct href using the real agentId from context
                     const href = `/callagents/${agentId}${item.hrefSegment ? '/' + item.hrefSegment : ''}`;
                     // Check if the current pathname starts with the item's href
                     const isActive = pathname === href || (item.hrefSegment !== '' && pathname.startsWith(`${href}/`)) || (pathname === `/callagents/${agentId}` && item.hrefSegment === '');

                    return (
                        <Link key={item.name} href={href} legacyBehavior>
                            <a className={`flex items-center rounded-md transition-colors mb-1 text-sm font-medium
                                           ${isCollapsed ? 'justify-center p-2' : 'p-2'}
                                           ${isActive
                                                ? `${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`
                                                : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`
                                            }`}>
                                 {/* Apply dynamic icon size based on collapse state */}
                                 <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'} flex-shrink-0`} />
                                 {!isCollapsed && item.name}
                            </a>
                        </Link>
                    );
                })}
            </nav>

            {/* Hire an Expert Card - Hide when collapsed */}
             {!isCollapsed && (
                 <div className={`mt-auto ${uiColors.bgSecondary} rounded-lg p-4 text-center border ${uiColors.borderPrimary}`}>
                     <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2 ${uiColors.accentBadgeBg} ${uiColors.accentBadgeText}`}>
                          {hireExpertData.badge}
                     </span>
                     <h4 className={`text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>{hireExpertData.title}</h4>
                     <p className={`text-xs mb-4 ${uiColors.textSecondary}`}>{hireExpertData.description}</p>
                     <Link href={hireExpertData.buttonLink} legacyBehavior>
                          <a className={`inline-block text-sm font-semibold px-4 py-2 rounded-md transition-colors ${uiColors.accentPrimaryGradient}`}>
                             {hireExpertData.buttonText}
                          </a>
                      </Link>
                 </div>
             )}

        </div>
    );
}

export default DetailAgentSidebar;