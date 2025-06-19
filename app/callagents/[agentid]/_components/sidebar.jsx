// voice-agents-CallAgents/[agentid]/_components/sidebar.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import {
    FiLayers, FiEdit3, FiZap, FiCompass, FiPhoneCall, FiFileText, FiUploadCloud, // Example Icons
    FiChevronLeft, FiChevronRight // Icons for collapse
} from 'react-icons/fi';

// Import constants
import { uiColors } from '../../_constants/uiConstants';

const detailSidebarNavItems = [
    { name: 'Dashboard', icon: FiLayers, hrefSegment: '' }, // This will correctly resolve to /[agentid]
    { name: 'Configure', icon: FiEdit3, hrefSegment: 'configure' }, // This will correctly resolve to /[agentid]/configure
    { name: 'Prompt', icon: FiFileText, hrefSegment: 'prompt' },
    { name: 'Actions', icon: FiZap, hrefSegment: 'actions' },
    { name: 'Deployment', icon: FiUploadCloud, hrefSegment: 'deployment' },
    { name: 'Calls', icon: FiPhoneCall, hrefSegment: 'calls' },
    { name: 'Template', icon: FiFileText, hrefSegment: 'template' },
];

const hireExpertData = {
    badge: '0%',
    title: 'Hire an Expert',
    description: 'Hire a certified Synthflow expert to help you build your AI project with Synthflow. Submit your project below to be matched with our top experts.',
    buttonText: 'Hire Now',
    buttonLink: '#hire-expert'
};


// Receive isCollapsed, toggleCollapse, and onTestButtonClick props
function DetailAgentSidebar({ agentId, isCollapsed, toggleCollapse, onTestButtonClick }) {
     const pathname = usePathname();

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


            {/* Agent Info (Avatar, Name, Type, Status) - Adjust based on collapsed state */}
             <div className={`flex flex-col ${isCollapsed ? 'items-center text-center' : ''} pb-4 border-b ${uiColors.borderPrimary} ${isCollapsed ? '' : 'mb-4'}`}>
                 <div className={`flex items-center justify-center ${isCollapsed ? 'mb-0' : 'mb-2'}`}>
                     <Image src="/voiceagents/1.jpg" alt="Emma from AutoTrust" width={isCollapsed ? 32 : 48} height={isCollapsed ? 32 : 48} className="rounded-full" />
                 </div>
                 {!isCollapsed && (
                     <>
                         <div className={`font-semibold text-lg ${uiColors.textPrimary}`}>Emma from AutoTrust</div>
                         <div className={`text-sm ${uiColors.textSecondary}`}>Inbound - ID: ...887</div>
                         <div className={`text-xs ${uiColors.textPlaceholder}`}>V2</div>
                     </>
                 )}
            </div>


            {/* Test Agent Button - Adjust based on collapsed state */}
             <button
                 onClick={onTestButtonClick}
                 className={`w-full text-center ${isCollapsed ? 'px-0 py-2' : 'px-4 py-2'} rounded-md font-semibold transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
            >
                 {isCollapsed ? <FiPhoneCall className="w-5 h-5 mx-auto" /> : 'Test Agent'}
             </button>


            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto hide-scrollbar mt-4">
                {detailSidebarNavItems.map(item => {
                     // CORRECTED href construction here:
                     const href = `/callagents/${agentId}${item.hrefSegment ? '/' + item.hrefSegment : ''}`;
                     const isActive = pathname === href || (pathname === `/callagents/${agentId}` && item.hrefSegment === ''); // Ensure base path /[[agentid]] matches Dashboard when hrefSegment is ''

                    return (
                        <Link key={item.name} href={href} legacyBehavior>
                            <a className={`flex items-center rounded-md transition-colors mb-1 text-sm font-medium
                                           ${isCollapsed ? 'justify-center p-2' : 'p-2'}
                                           ${isActive
                                                ? `${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`
                                                : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle} ${uiColors.hoverText}`
                                            }`}>
                                 <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5 mr-3'}`} />
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