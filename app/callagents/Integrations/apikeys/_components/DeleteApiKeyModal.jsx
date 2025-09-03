// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/Integrations/apikeys/_components/DeleteApiKeyModal.jsx
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiLoader } from 'react-icons/fi';
import { uiColors } from '../../../_constants/uiConstants';

export default function DeleteApiKeyModal({ isOpen, onClose, onConfirm, keyName }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        await onConfirm();
        setIsDeleting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <motion.div /* ... */ className={`relative ${uiColors.bgPrimary} rounded-lg shadow-xl p-6 w-full max-w-md`}>
                        <div className="flex items-start">
                             <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <FiAlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="ml-4 text-left">
                                <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Delete API Key</h3>
                                <div className="mt-2">
                                    <p className={`text-sm ${uiColors.textSecondary}`}>
                                        Are you sure you want to delete the key "{keyName}"? This action is irreversible and any applications using this key will no longer be able to access the API.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={`flex justify-end space-x-3 mt-6`}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isDeleting}
                                className={`px-4 py-2 text-sm font-semibold rounded-md border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isDeleting}
                                className="inline-flex justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:bg-red-400"
                            >
                                {isDeleting ? <><FiLoader className="animate-spin mr-2" /> Deleting...</> : 'Delete Key'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}