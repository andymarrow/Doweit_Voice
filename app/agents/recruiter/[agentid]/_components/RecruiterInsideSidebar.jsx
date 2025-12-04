// app/agents/recruiter/[agentid]/_components/RecruiterInsideSidebar.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
    FiGrid, FiUsers, FiSettings, FiFileText, FiShare2, FiChevronLeft, FiChevronRight, FiArrowLeft
} from 'react-icons/fi';
import { useCallAgent } from '@/app/callagents/[agentid]/_context/CallAgentContext';
import { uiColors } from '@/app/callagents/_constants/uiConstants';

const navItems = [
    { name: 'Dashboard', icon: FiGrid, href: '' }, // Root of agent
    { name: 'Candidates', icon: FiUsers, href: '/candidates' },
    { name: 'Configuration', icon: FiSettings, href: '/settings' },
    { name: 'Evaluation Rubric', icon: FiFileText, href: '/rubric' },
    { name: 'Share Link', icon: FiShare2, href: '/share' },
];

export default function RecruiterInsideSidebar({ isCollapsed, toggleCollapse }) {
    const agent = useCallAgent();
    const pathname = usePathname();
    const baseUrl = `/agents/recruiter/${agent.id}`;

    return (
        <div className={`flex flex-col h-full ${uiColors.bgPrimary} p-3`}>
            
            {/* Back to All Interviews */}
            <Link href="/agents/recruiter" legacyBehavior>
                <a className={`flex items-center justify-center p-2 mb-6 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} transition-colors`}>
                    <FiArrowLeft className="w-5 h-5" />
                    {!isCollapsed && <span className="ml-2 text-sm font-medium">All Interviews</span>}
                </a>
            </Link>

            {/* Agent Info */}
            <div className={`flex flex-col items-center mb-8 ${isCollapsed ? 'px-0' : 'px-2'}`}>
                <div className="relative w-12 h-12 mb-3">
                    {agent.avatarUrl ? (
                        <Image 
                            src={agent.avatarUrl} 
                            alt={agent.name} 
                            fill 
                            className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                        />
                    ) : (
                        <div className={`w-full h-full rounded-full flex items-center justify-center text-lg font-bold bg-gradient-to-br from-purple-500 to-pink-500 text-white`}>
                            {agent.name.charAt(0)}
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <div className="text-center">
                        <h3 className={`text-sm font-bold truncate max-w-[180px] ${uiColors.textPrimary}`}>{agent.name}</h3>
                        <span className="text-xs text-green-500 font-medium bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Active
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const fullHref = `${baseUrl}${item.href}`;
                    const isActive = pathname === fullHref;

                    return (
                        <Link key={item.name} href={fullHref} legacyBehavior>
                            <a className={`flex items-center px-3 py-2.5 rounded-lg transition-all
                                ${isActive 
                                    ? `bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium` 
                                    : `${uiColors.textSecondary} hover:${uiColors.bgSecondary}`
                                } ${isCollapsed ? 'justify-center' : ''}`}>
                                
                                <item.icon className={`w-5 h-5 flex-shrink-0`} />
                                
                                {!isCollapsed && (
                                    <span className="ml-3 text-sm">{item.name}</span>
                                )}
                            </a>
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <button 
                onClick={toggleCollapse}
                className={`mt-auto flex items-center justify-center p-2 rounded-lg ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
            >
                {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
        </div>
    );
}