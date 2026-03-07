"use client";
//app/callagents/Integrations/_components/forms/OAuthConnectButton.jsx
"use client";

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';
import IntegrationLogo from '../IntegrationLogo';

export default function OAuthConnectButton({ field, onSuccess, integrationId }) {
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnect = () => {
        setIsConnecting(true);
        window.location.href = `/api/integrations/connect/${field.provider}`;
    };

    // Pass a synthetic integration object to IntegrationLogo so the fallback
    // renders the right colored letter when a logo PNG is missing.
    const logoIntegration = {
        id: field.provider,
        name: field.provider || "Integration",
        logo: field.logo || null,
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
                        {field.provider && (
                            <span className="mr-2">
                                <IntegrationLogo integration={logoIntegration} size={20} />
                            </span>
                        )}
                        {field.text}
                    </>
                )}
            </button>
        </div>
    );
}
