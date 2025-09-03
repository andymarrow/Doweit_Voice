//app/callagents/Integrations/_components/forms/DynamicIntegrationForm.jsx
"use client";

import React, { useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';
import OAuthConnectButton from './OAuthConnectButton'; // Import the new component

export default function DynamicIntegrationForm({ integration, onSuccess, isConnected }) {
    // This state is now only for key-based auth
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
        
        setTimeout(() => {
            const hasEmptyField = integration.fields.some(field => field.type !== 'info' && field.type !== 'oauth' && !formData[field.id].trim());
            if (hasEmptyField) {
                setError('All fields are required.');
                setIsConnecting(false);
                return;
            }
            onSuccess(integration.id, { accountId: `Connected via ${integration.name}` });
            setIsConnecting(false);
        }, 1500);
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