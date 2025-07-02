// app/callagents/[agentid]/_context/RecentChatContext.js
"use client"; // This context will be used by client components

import React, { createContext, useContext, useState } from "react";

// Create the context
const RecentChatContext = createContext({
	refresh: false,
	setRefresh: () => {},
});

// Custom hook to consume the context
export function useRecentChat() {
	const context = useContext(RecentChatContext);
	return context;
}

// Provider component
// It expects the fetched agent data as a prop
export function RecentChatProvider({ children }) {
	const [refresh, setRefresh] = useState(false);
	return (
		<RecentChatContext.Provider value={{ refresh, setRefresh }}>
			{children}
		</RecentChatContext.Provider>
	);
}
