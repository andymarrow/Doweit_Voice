// voice-agents-dashboard/layout.jsx
"use client";

import { useState } from "react";
import Sidebar from "./_components/sidebar"; // Make sure this path is correct

export default function DashboardLayout({ children }) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(true);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		// 1. This is the main container for this specific layout.
		// 2. ADD THEME-AWARE BACKGROUNDS HERE.
		<div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
			{/* Sidebar - It inherits its background color from its own component,
          but we should make its border theme-aware. */}
			<div className="flex-shrink-0 border-r border-gray-200 dark:border-gray-800">
				<Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
			</div>

			{/* Main content area */}
			<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
				{children} {/* This is where your page.jsx content will be rendered */}
			</main>
		</div>
	);
}

