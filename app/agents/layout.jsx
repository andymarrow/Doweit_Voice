<<<<<<< HEAD
// app/agents/layout.jsx
"use client";

import React, { useState } from 'react';

import { uiColors } from '@/app/callagents/_constants/uiConstants';

export default function AgentsLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`flex h-screen w-full ${uiColors.bgPage} overflow-hidden`}>
            <main className="flex-1 h-full overflow-y-auto hide-scrollbar">
                {children}
            </main>
        </div>
    );
=======
// app/agents/layout.jsx
"use client";

import React, { useState } from 'react';

import { uiColors } from '@/app/callagents/_constants/uiConstants';

export default function AgentsLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className={`flex h-screen w-full ${uiColors.bgPage} overflow-hidden`}>
            <main className="flex-1 h-full overflow-y-auto hide-scrollbar">
                {children}
            </main>
        </div>
    );
>>>>>>> ea7efc43c6b09bd9253d1de22f36a1d24381a17f
}