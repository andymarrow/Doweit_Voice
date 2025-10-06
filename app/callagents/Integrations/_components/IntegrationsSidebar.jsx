// app/callagents/Integrations/_components/IntegrationsSidebar.jsx
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { uiColors } from '../../_constants/uiConstants';

const navItems = [
    { name: 'Third Parties', href: '/callagents/Integrations' },
    { name: 'API Keys', href: '/callagents/Integrations/apikeys' },
];

export default function IntegrationsSidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* --- A. DESKTOP SIDEBAR (Visible on medium screens and up) --- */}
            <aside className={`hidden md:flex w-64 flex-shrink-0 flex-col p-4 border-r ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
                <h2 className={`text-xl font-bold mb-6 ${uiColors.textPrimary}`}>Integrations</h2>
                <nav className="flex flex-col space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                href={item.href}
                                key={item.name}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors
                                    ${isActive
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textPrimary} font-semibold`
                                        : `${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                                    }`
                                }
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* --- B. MOBILE TAB BAR (Visible on small screens) --- */}
            <div className={`md:hidden border-b ${uiColors.borderPrimary} mb-6`}>
                <nav className="flex space-x-2 overflow-x-auto whitespace-nowrap hide-scrollbar p-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                href={item.href}
                                key={item.name}
                                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors
                                    ${isActive
                                        ? `${uiColors.accentSubtleBg} ${uiColors.textPrimary} font-semibold`
                                        : `${uiColors.textSecondary}`
                                    }`
                                }
                            >
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
}