// app/callagents/[agentid]/_context/CallAgentContext.js
"use client"; // This context will be used by client components

import React, { createContext, useContext } from 'react';

// Create the context
const CallAgentContext = createContext(undefined);

// Custom hook to consume the context
export function useCallAgent() {
    const context = useContext(CallAgentContext);
    if (context === undefined) {
        // This hook must be used within a CallAgentProvider
        throw new Error('useCallAgent must be used within a CallAgentProvider');
    }
    return context;
}

// Provider component
// It expects the fetched agent data as a prop
export function CallAgentProvider({ agent, children }) {
    return (
        <CallAgentContext.Provider value={agent}>
            {children}
        </CallAgentContext.Provider>
    );
}