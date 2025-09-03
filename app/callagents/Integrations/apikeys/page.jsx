//app/callagents/Integrations/apikeys/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiLoader } from 'react-icons/fi';
import { Toaster, toast } from 'react-hot-toast';

// Import Constants
import { uiColors, sectionVariants } from '../../_constants/uiConstants';

// Import Child Components
import ApiKeyTable from './_components/ApiKeyTable';
import CreateApiKeyModal from './_components/CreateApiKeyModal';
import ShowApiKeyModal from './_components/ShowApiKeyModal';
import DeleteApiKeyModal from './_components/DeleteApiKeyModal';

// --- Mock Data and API Functions ---
// In a real app, these would be API calls.
const mockApiKeys = [
    {
        id: 'key_1',
        name: 'token_6035b',
        key: 'sk_live_XXXXXXXXXXXXXXXXP40k',
        createdAt: new Date('2025-05-10T00:00:00Z'),
    },
];

const fetchApiKeys = async () => {
    console.log("Fetching API keys...");
    return new Promise(resolve => setTimeout(() => resolve([...mockApiKeys]), 800));
};

const createApiKey = async (name) => {
    console.log(`Creating API key with name: ${name}`);
    const newKey = `sk_live_${Math.random().toString(36).substring(2)}_${Math.random().toString(36).substring(2)}`;
    const newKeyObject = {
        id: `key_${Date.now()}`,
        name,
        key: newKey,
        createdAt: new Date(),
    };
    return new Promise(resolve => setTimeout(() => resolve(newKeyObject), 1000));
};

const deleteApiKey = async (keyId) => {
    console.log(`Deleting API key with ID: ${keyId}`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 500));
};
// --- End Mock API ---

export default function ApiKeysPage() {
    const [apiKeys, setApiKeys] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isShowKeyModalOpen, setIsShowKeyModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    
    // Data for Modals
    const [newlyCreatedKey, setNewlyCreatedKey] = useState(null);
    const [keyToDelete, setKeyToDelete] = useState(null);

    // Initial data load
    useEffect(() => {
        const loadKeys = async () => {
            setIsLoading(true);
            const keys = await fetchApiKeys();
            setApiKeys(keys);
            setIsLoading(false);
        };
        loadKeys();
    }, []);
    
    // --- Handlers ---
    const handleCreateKey = async (name) => {
        const newKeyData = await createApiKey(name);
        setApiKeys(prevKeys => [newKeyData, ...prevKeys]);
        setNewlyCreatedKey(newKeyData);
        setIsCreateModalOpen(false);
        setIsShowKeyModalOpen(true);
        toast.success("API Key created successfully!");
    };

    const handleDeleteKey = (key) => {
        setKeyToDelete(key);
        setIsDeleteModalOpen(true);
    };
    
    const confirmDeleteKey = async () => {
        if (!keyToDelete) return;
        await deleteApiKey(keyToDelete.id);
        setApiKeys(prevKeys => prevKeys.filter(k => k.id !== keyToDelete.id));
        setIsDeleteModalOpen(false);
        setKeyToDelete(null);
        toast.success("API Key deleted.");
    };

    return (
        <>
            <motion.div
                className="w-full h-full"
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>API Keys</h1>
                        <p className={`mt-1 text-sm ${uiColors.textSecondary}`}>
                            Allows interaction with REST API endpoints, Widgets, and Plugins. <a href="#" className={`font-medium ${uiColors.accentPrimary}`}>Learn more.</a>
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient}`}
                    >
                        <FiPlus className="mr-2 w-4 h-4" /> Create New API Key
                    </button>
                </div>

                {/* Note Box */}
                <div className={`p-4 rounded-md mb-6 ${uiColors.accentSubtleBg} border border-cyan-200 dark:border-purple-700`}>
                    <p className={`text-sm ${uiColors.textSecondary}`}>
                        <span className={`font-semibold ${uiColors.textPrimary}`}>NOTE:</span> Remember to keep your API token secure, as it grants access to your account and the associated resources. If you believe your token has been compromised, you can generate a new one.
                    </p>
                </div>
                
                {/* Content */}
                {isLoading ? (
                    <div className={`flex justify-center items-center h-48 ${uiColors.textSecondary}`}>
                        <FiLoader className="animate-spin w-8 h-8" />
                    </div>
                ) : (
                    <ApiKeyTable keys={apiKeys} onDelete={handleDeleteKey} />
                )}
            </motion.div>
            
            {/* Modals */}
            <CreateApiKeyModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateKey}
            />
            <ShowApiKeyModal
                isOpen={isShowKeyModalOpen}
                onClose={() => setIsShowKeyModalOpen(false)}
                apiKey={newlyCreatedKey}
            />
            <DeleteApiKeyModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteKey}
                keyName={keyToDelete?.name}
            />
        </>
    );
}