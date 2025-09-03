// app/callagents/Integrations/_components/forms/DynamicIntegrationForm.jsx
"use client";

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';
import OAuthConnectButton from './OAuthConnectButton';

export default function DynamicIntegrationForm({ integration, onSuccess, isConnected }) {
    // This state is only for key-based auth (like ElevenLabs, Twilio)
    const initialFormState = integration.fields.reduce((acc, field) => {
        if (field.type !== 'info' && field.type !== 'oauth') {
            acc[field.id] = '';
        }
        return acc;
    }, {});

    const [formData, setFormData] = useState(initialFormState);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsConnecting(true);

        // --- THIS IS THE REAL API CALL ---
        try {
            // Dynamically call the correct endpoint based on the integration ID
            const response = await fetch(`/api/integrations/connect/${integration.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData), // Send the form data (e.g., { apiKey: "..." })
            });

            const data = await response.json();

            if (!response.ok) {
                // Use the error message from the backend if available, otherwise a default one.
                throw new Error(data.error || 'Failed to connect. Please check your credentials.');
            }

            // On success, call the parent handler to update the UI state.
            onSuccess(integration.id, { accountId: `Connected via ${integration.name}` });

        } catch (err) {
            // Set the error message to be displayed in the UI.
            setError(err.message);
        } finally {
            // Ensure the loading state is turned off whether it succeeds or fails.
            setIsConnecting(false);
        }
    };

    // Render logic for different field types
    const renderField = (field) => {
        switch (field.type) {
            case 'info':
                return <p key={field.id} className={`text-sm ${uiColors.textSecondary}`}>{field.text}</p>;
            
            case 'oauth':
                return <OAuthConnectButton key={field.id} field={field} onSuccess={onSuccess} integrationId={integration.id} />;

            default: // Renders text, password, etc.
                return (
                    <div key={field.id}>
                        <label htmlFor={field.id} className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                            {field.label}
                        </label>
                        <div className="mt-1">
                            <input
                                type={field.type}
                                name={field.id}
                                id={field.id}
                                value={formData[field.id]}
                                onChange={handleChange}
                                className={`block w-full rounded-md p-2 ring-1 ring-inset ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} ${uiColors.ringAccentShade} focus:ring-2 focus:ring-inset disabled:opacity-50`}
                                placeholder={field.placeholder}
                                disabled={isConnecting || isConnected}
                            />
                        </div>
                    </div>
                );
        }
    };

    // Check if the form is for an integration that uses API keys/tokens (and not just OAuth/info).
    const hasKeyBasedAuth = integration.fields.some(f => f.type !== 'info' && f.type !== 'oauth');

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {integration.fields.map(field => renderField(field))}

            {error && <p className="text-sm text-red-500">{error}</p>}
            
            {/* Only show the 'Connect' button for forms that actually have input fields */}
            {hasKeyBasedAuth && (
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isConnecting || isConnected}
                        className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white
                            ${isConnecting || isConnected
                                ? `${uiColors.bgSecondary} ${uiColors.textPlaceholder} cursor-not-allowed`
                                : `${uiColors.accentPrimaryGradient}`
                            }`
                        }
                    >
                        {isConnecting ? <FiLoader className="w-4 h-4 animate-spin" /> : 'Connect'}
                    </button>
                </div>
            )}
        </form>
    );
}