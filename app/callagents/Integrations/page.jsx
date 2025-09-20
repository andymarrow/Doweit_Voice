//app/callagents/Integrations/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { sectionVariants, uiColors } from '../_constants/uiConstants';
import IntegrationGrid from './_components/IntegrationGrid';
import IntegrationSidePanel from './_components/IntegrationSidePanel';

// Expanded configuration with new integrations and OAuth connection type
const INTEGRATIONS_CONFIG = [
    {
        id: 'twilio',
        name: 'Twilio',
        logo: '/integrations/twilio.png',
        description: 'Connect your Twilio account and use directly your phone numbers with your assistants here on the platform.',
        howItWorks: 'Integrate your Twilio account to purchase and manage phone numbers directly within our platform, enhancing your agents with powerful voice and SMS capabilities.',
        docsUrl: '#',
        websiteUrl: 'https://www.twilio.com',
        note: 'Linking your Twilio account will make your purchased phone numbers manageable only through our platform.',
        fields: [
            { id: 'accountSid', label: 'Account SID', type: 'password', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
            { id: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Your 32 character Auth Token' },
        ]
    },
    {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        logo: '/integrations/elevenlabs.png',
        description: 'Research lab exploring new frontiers of Voice AI.',
        howItWorks: 'Connect your ElevenLabs account to access your full library of custom and pre-made voices, including any voices you have cloned.',
        docsUrl: '#',
        websiteUrl: 'https://elevenlabs.io',
        note: 'Ensure your API key has sufficient permissions to access your voice library.',
        fields: [
            { id: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Enter your ElevenLabs API Key' },
        ]
    },
    {
        id: 'zapier',
        name: 'Zapier',
        logo: '/integrations/zapier.png',
        description: 'Automate tasks and workflows across multiple apps with Zapier.',
        howItWorks: 'Connect to Zapier to trigger actions in over 5,000+ apps whenever a call is completed on our platform. Send call summaries, contact info, and more to any tool in your stack.',
        docsUrl: '#',
        websiteUrl: 'https://zapier.com',
        note: 'Connecting will provide you with a unique API key and webhook URL to use when building your Zaps.',
        fields: [
            { id: 'showInfo', type: 'info', text: 'Connect to generate your unique Webhook URL for Zapier.' }
        ]
    },
    {
        id: 'google-sheets',
        name: 'Google Sheets',
        logo: '/integrations/googlesheets.jpg',
        description: 'Send call data and action values directly to a Google Sheet after each call.',
        howItWorks: 'Connect your Google account to authorize access. After connecting, you can configure agents to send data to specific spreadsheets and tabs, creating a live log of your call outcomes.',
        docsUrl: '#',
        websiteUrl: 'https://www.google.com/sheets/about/',
        fields: [
            { id: 'googleConnect', type: 'oauth', provider: 'google', text: 'Connect with Google' }
        ]
    },
    {
        id: 'slack',
        name: 'Slack',
        logo: '/integrations/slack.png',
        description: 'Get real-time notifications in your Slack channels for important events.',
        howItWorks: 'Connect your Slack workspace to send automated messages to specific channels. You can configure alerts for new leads, completed calls, or specific actions taken by your agents.',
        docsUrl: '#',
        websiteUrl: 'https://slack.com',
        fields: [
            { id: 'slackConnect', type: 'oauth', provider: 'slack', text: 'Add to Slack' }
        ]
    },
    {
        id: 'trello',
        name: 'Trello',
        logo: '/integrations/trello.jpg',
        description: 'Create new Trello cards from call data for easy task management.',
        howItWorks: 'Connect your Trello account to automatically create new cards on a specified board and list. This is perfect for turning conversations into actionable support tickets or sales follow-ups.',
        docsUrl: '#',
        websiteUrl: 'https://trello.com',
        fields: [
            { id: 'trelloConnect', type: 'oauth', provider: 'trello', text: 'Connect with Trello' }
        ]
    },
];

export default function IntegrationsPage() {
    // This state will now store a simple Set of connected provider IDs for fast lookups
    const [connectedProviders, setConnectedProviders] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    // Function to fetch and update connection statuses
    const fetchConnections = async () => {
        setIsLoading(true);
        try {
            // Your real API endpoint for getting connection statuses
            const response = await fetch('/api/integrations/connections');
            if (!response.ok) {
                throw new Error('Failed to fetch connections.');
            }
            const providers = await response.json(); // Expects an array like ['elevenlabs', 'twilio']
            setConnectedProviders(new Set(providers));
        } catch (error) {
            toast.error(error.message);
            console.error("Failed to load connection statuses:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Fetch connections on initial component mount
    useEffect(() => {
        fetchConnections();
    }, []);

    const handleOpenPanel = (integration) => {
        setSelectedIntegration(integration);
        setIsPanelOpen(true);
    };

    const handleClosePanel = () => {
        setIsPanelOpen(false);
    };

    const handleIntegrationSuccess = (integrationId) => {
        toast.success(`Successfully connected to ${selectedIntegration.name}!`);
        // After a successful connection, re-fetch the list to update the UI
        fetchConnections();
        handleClosePanel();
    };

    // We now dynamically calculate the integrations list with their status
    const integrationsWithStatus = INTEGRATIONS_CONFIG.map(integration => ({
        ...integration,
        isConnected: connectedProviders.has(integration.id)
    }));

    return (
        <>
            <motion.div
                className="flex flex-col space-y-6 w-full h-full"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
            >
                <div>
                    <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Third Parties</h2>
                </div>
                <IntegrationGrid
                    integrations={integrationsWithStatus} // Pass the dynamically calculated list
                    onCardClick={handleOpenPanel}
                    isLoading={isLoading}
                />
            </motion.div>

            <IntegrationSidePanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                integration={selectedIntegration}
                onSuccess={handleIntegrationSuccess}
                // Check connection status directly from our Set
                isConnected={connectedProviders.has(selectedIntegration?.id)}
            />
        </>
    );
}