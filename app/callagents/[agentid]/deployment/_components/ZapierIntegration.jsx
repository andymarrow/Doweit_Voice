// voice-agents-CallAgents/[agentid]/deployment/_components/ZapierIntegration.jsx
"use client";

import React from 'react';

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

function ZapierIntegration({ agentId }) {
     // Receive agentId if needed

     return (
        <div className={`text-center py-10 ${uiColors.textSecondary}`}>
            <h4 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Zapier Integration (Placeholder)</h4>
            <p>Configuration options for Zapier integration will go here for Agent ID: {agentId}.</p>
             <p className="text-sm mt-2">Connect your agent to Zapier to automate workflows.</p>
        </div>
    );
}

export default ZapierIntegration;