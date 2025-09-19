// app/callagents/[agentid]/configure/_components/IntegrationsConfig.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useCallAgent } from '../../_context/CallAgentContext';
import { uiColors } from '../../../_constants/uiConstants';
import { FiExternalLink, FiLoader, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export default function IntegrationsConfig() {
    const agent = useCallAgent(); // Get agent data from context
    const [googleConfig, setGoogleConfig] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to check connection status and existing config
    useEffect(() => {
        if (agent) {
            // Set existing config from the agent context
            setGoogleConfig(agent.integrationConfig?.googleSheets || null);

            // We need to check if the user has a global Google connection
            const checkConnection = async () => {
                try {
                    const res = await fetch('/api/integrations/connections');
                    const connectedProviders = await res.json();
                    setIsConnected(connectedProviders.includes('google'));
                } catch (error) {
                    console.error("Failed to check Google connection status", error);
                } finally {
                    setIsLoading(false);
                }
            };
            checkConnection();
        }
    }, [agent]);

    const handleSetup = async () => {
        setIsSettingUp(true);
        toast.loading('Setting up Google Sheet...');
        try {
            const response = await fetch(`/api/callagents/${agent.id}/integrations/google-sheets/setup`, {
                method: 'POST',
            });
            const data = await response.json();
            toast.dismiss();

            if (!response.ok) {
                throw new Error(data.error || "Failed to setup Google Sheet.");
            }
            
            setGoogleConfig(data);
            toast.success("Google Sheet created and linked successfully!");

        } catch (error) {
            toast.dismiss();
            toast.error(error.message);
        } finally {
            setIsSettingUp(false);
        }
    };

    if (isLoading) {
        return <div className="p-4"><FiLoader className="animate-spin" /></div>;
    }

    return (
        <div className={`p-6 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}>
            <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Google Sheets</h3>
            <p className={`text-sm mt-1 ${uiColors.textSecondary}`}>
                Automatically export call logs and extracted action data to a dedicated Google Sheet for this agent.
            </p>

            <div className={`mt-4 p-4 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary}`}>
                {!isConnected ? (
                    <p className={`text-sm ${uiColors.textSecondary}`}>
                        Please connect your Google account on the main <a href="/callagents/Integrations" className="underline font-medium">Integrations page</a> first.
                    </p>
                ) : googleConfig?.spreadsheetId ? (
                    // State when setup is complete
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                           <FiCheckCircle className="w-5 h-5 mr-2 text-green-500" />
                           <div>
                               <p className={`font-semibold ${uiColors.textPrimary}`}>Integration is Active</p>
                               <p className={`text-xs ${uiColors.textSecondary}`}>Analyzed calls will be exported automatically.</p>
                           </div>
                        </div>
                        <a 
                            href={googleConfig.spreadsheetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors text-white bg-green-600 hover:bg-green-700"
                        >
                            View Spreadsheet <FiExternalLink className="ml-2 w-4 h-4" />
                        </a>
                    </div>
                ) : (
                    // State when connected but not yet set up for this agent
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className={`text-sm ${uiColors.textPrimary}`}>Your Google account is connected.</p>
                        <button
                            onClick={handleSetup}
                            disabled={isSettingUp}
                            className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                        >
                            {isSettingUp && <FiLoader className="animate-spin mr-2" />}
                            Create & Link Sheet
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}