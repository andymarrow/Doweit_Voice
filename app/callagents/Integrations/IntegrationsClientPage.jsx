"use client";
//app/callagents/Integrations/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useSearchParams, useRouter } from 'next/navigation'; // Import new hooks
import { sectionVariants, uiColors } from '../_constants/uiConstants';
import IntegrationGrid from './_components/IntegrationGrid';
import IntegrationSidePanel from './_components/IntegrationSidePanel';

export const dynamic = 'force-dynamic';

// Expanded configuration with new integrations and OAuth connection type
const INTEGRATIONS_CONFIG = [
    {
        id: 'twilio',
        name: 'Twilio',
        logo: '/integrations/twilio.png',
        description: 'Bring your own Twilio phone numbers — your agents can answer inbound calls and place outbound ones from numbers you own.',
        howItWorks: 'Paste your Twilio Account SID and Auth Token below. Then go to the Phone Numbers page, import a number from Twilio, and assign it to any agent from that agent\'s dashboard. Inbound calls to that number ring the agent automatically.',
        docsUrl: '/.claude/guide/twilio.md',
        websiteUrl: 'https://www.twilio.com',
        note: 'Once connected, Doweit pushes your Twilio credentials to Vapi (encrypted on Vapi\'s side) so Vapi can route calls. We do NOT charge you for purchases — you buy numbers on Twilio.',
        fields: [
            { id: 'accountSid', label: 'Account SID', type: 'password', placeholder: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
            { id: 'authToken', label: 'Auth Token', type: 'password', placeholder: 'Your 32-character Auth Token' },
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
        id: 'google',
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
        description: 'Send post-call summaries and extracted actions to a Slack channel — live, formatted, with a one-click "Open call" button.',
        howItWorks: 'Connect your Slack workspace, then go to any agent\'s Integrations sidebar to choose a channel and customise the message. Every call automatically posts a Block Kit message after the AI extracts the action data.',
        docsUrl: '/.claude/guide/slack.md',
        websiteUrl: 'https://slack.com',
        note: 'Once connected, /invite the Doweit bot into the channels you want messages in. Private channels need explicit invites.',
        fields: [
            { id: 'slackConnect', type: 'oauth', provider: 'slack', text: 'Add to Slack' }
        ]
    },
    {
        id: 'telegram',
        name: 'Telegram',
        logo: '/integrations/telegram.png',
        description: 'Send formatted post-call messages to a Telegram chat or group via your own bot.',
        howItWorks: 'Create a bot with @BotFather, paste the token below, then per agent pick the chat ID to message. Works for personal chats, groups, and channels.',
        docsUrl: '/.claude/guide/telegram.md',
        websiteUrl: 'https://telegram.org',
        note: 'You need to start a chat with your bot at least once before it can message you. For groups, add the bot as a member.',
        fields: [
            { id: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
        ]
    },
    {
        id: 'calcom',
        name: 'Cal.com',
        logo: '/integrations/calcom.png',
        description: "Give your agents real-time scheduling powers — they can check availability and create bookings during a live call.",
        howItWorks: 'Paste your Cal.com API key here, then on each agent\'s Integrations page choose an event type, scope (read-only / read+book), and time zone. The agent gets function tools so callers can ask "when are you free?" and book on the spot.',
        docsUrl: '/.claude/guide/calcom.md',
        websiteUrl: 'https://cal.com',
        note: 'Get your API key in Cal.com under Settings → Developer → API Keys. Self-hosted? Use the optional base URL field to point at your instance.',
        fields: [
            { id: 'apiKey', label: 'Cal.com API Key', type: 'password', placeholder: 'cal_live_...' },
            { id: 'baseUrl', label: 'Base URL (optional, for self-hosted)', type: 'text', placeholder: 'https://api.cal.com/v1' },
        ],
    },
    {
        id: 'email',
        name: 'Email (SMTP)',
        logo: '/integrations/email.png',
        description: 'Email beautifully-formatted call summaries to one or more recipients via your own SMTP server (Gmail, Mailgun, etc.).',
        howItWorks: 'Enter SMTP credentials (host, port, user, password). The platform validates them by opening a connection before saving. Per-agent rules then specify the To/Cc/Bcc recipients and template.',
        docsUrl: '/.claude/guide/email.md',
        websiteUrl: 'https://nodemailer.com',
        note: 'For Gmail, use an App Password (not your account password). Settings: smtp.gmail.com, port 465, SSL/secure on.',
        fields: [
            { id: 'host', label: 'SMTP host', type: 'text', placeholder: 'smtp.gmail.com' },
            { id: 'port', label: 'Port', type: 'text', placeholder: '465' },
            { id: 'secure', label: 'Use SSL/TLS (port 465)', type: 'checkbox' },
            { id: 'smtpUser', label: 'SMTP user', type: 'text', placeholder: 'you@gmail.com' },
            { id: 'password', label: 'SMTP password / App password', type: 'password', placeholder: '••••••••••••••••' },
            { id: 'fromName', label: 'From name (optional)', type: 'text', placeholder: 'Doweit Voice' },
            { id: 'fromEmail', label: 'From email (optional)', type: 'text', placeholder: 'agent@example.com' },
        ]
    },
];

export default function IntegrationsPage() {
    // This state will now store a simple Set of connected provider IDs for fast lookups
    const [connectedProviders, setConnectedProviders] = useState(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState(null);


     const searchParams = useSearchParams();
    const router = useRouter();


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
    // Check for success/error parameters in the URL on mount
    useEffect(() => {
        const status = searchParams.get('status');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (status === 'success') {
            const label = provider
                ? provider[0].toUpperCase() + provider.slice(1)
                : 'the integration';
            toast.success(`Successfully connected to ${label}!`);
            router.replace('/callagents/Integrations');
        } else if (error) {
            // Backend prefixes provider-specific errors with the provider name
            // (e.g. "slack_exchange_failed"). Strip that for the toast.
            const friendly = String(error).replace(/_/g, ' ');
            toast.error(`Failed to connect: ${friendly}`);
            console.error("OAuth error code:", error);
            router.replace('/callagents/Integrations');
        }

        // Fetch connections regardless to get the latest status
        fetchConnections();
    }, [searchParams, router]); // Re-run if searchParams change


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
            {/* The root div is now simpler as the layout handles the main structure */}
            <motion.div
                className="flex flex-col space-y-6 w-full"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
            >
                <div>
                    {/* Page-specific title */}
                    <h2 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Third Parties</h2>
                    <p className={`${uiColors.textSecondary} mt-1`}>Connect your favorite tools to extend your agent's capabilities.</p>
                </div>
                <IntegrationGrid
                    integrations={integrationsWithStatus}
                    onCardClick={handleOpenPanel}
                    isLoading={isLoading}
                />
            </motion.div>

            <IntegrationSidePanel
                isOpen={isPanelOpen}
                onClose={handleClosePanel}
                integration={selectedIntegration}
                onSuccess={handleIntegrationSuccess}
                isConnected={connectedProviders.has(selectedIntegration?.id)}
            />
        </>
    );
}
