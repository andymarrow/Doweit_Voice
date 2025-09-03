//app/callagents/Integrations/_components/forms/OAuthConnectButton.jsx
"use client";

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import Image from 'next/image';
import { uiColors } from '../../../_constants/uiConstants';

export default function OAuthConnectButton({ field, onSuccess, integrationId }) {
    const [isConnecting, setIsConnecting] = useState(false);

    const getLogo = (provider) => {
        switch(provider) {
            case 'google': return '/integrations/google-logo.svg';
            case 'slack': return '/integrations/slack.png';
            case 'trello': return '/integrations/trello.jpg';
            default: return '';
        }
    };

    const handleConnect = () => {
        setIsConnecting(true);
        // In a real app, this would trigger the redirect to your backend OAuth endpoint
        // window.location.href = `/api/integrations/connect/${field.provider}`;

        // We simulate the flow for the demo
        console.log(`Initiating OAuth flow for ${field.provider}...`);
        setTimeout(() => {
            // After redirecting and coming back, the backend would call a webhook
            // or the frontend would receive a success status. We simulate that here.
            onSuccess(integrationId, { accountId: `user@${field.provider}.com` });
            setIsConnecting(false);
        }, 2000);
    };

    return (
        <div className="pt-4">
            <button
                type="button"
                onClick={handleConnect}
                disabled={isConnecting}
                className={`w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold rounded-md transition-colors border ${uiColors.borderPrimary} ${uiColors.bgPrimary} ${uiColors.textPrimary} hover:${uiColors.bgSecondary} disabled:opacity-70`}
            >
                {isConnecting ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {field.provider && <Image src={getLogo(field.provider)} alt="" width={20} height={20} className="mr-2" />}
                        {field.text}
                    </>
                )}
            </button>
        </div>
    );
}