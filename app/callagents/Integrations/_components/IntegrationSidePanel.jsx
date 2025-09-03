//app/callagents/Integrations/_components/IntegrationSidePanel.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiInfo, FiBookOpen, FiGlobe, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { uiColors } from '../../_constants/uiConstants';
import DynamicIntegrationForm from './forms/DynamicIntegrationForm';
import Link from 'next/link';

const panelVariants = {
    hidden: { x: "100%" },
    visible: { x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { x: "100%", transition: { duration: 0.3, ease: "easeIn" } },
};

export default function IntegrationSidePanel({ isOpen, onClose, integration, onSuccess, connectionStatus }) {
    if (!integration) return null;

    const isConnected = connectionStatus?.connected || false;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black bg-opacity-50"
                    />
                    {/* Panel */}
                    <motion.div
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 flex flex-col border-l ${uiColors.borderPrimary} ${uiColors.bgPrimary}`}
                    >
                        {/* Header */}
                        <div className={`flex items-center justify-between p-4 border-b ${uiColors.borderPrimary}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`relative w-8 h-8 flex items-center justify-center rounded-md border ${uiColors.borderPrimary}`}>
                                    <Image src={integration.logo} alt={`${integration.name} Logo`} width={20} height={20} objectFit="contain" />
                                </div>
                                <h2 className={`text-lg font-semibold ${uiColors.textPrimary}`}>{integration.name}</h2>
                            </div>
                            <button onClick={onClose} className={`p-1 rounded-md ${uiColors.hoverBgSubtle}`}><FiX className={`w-5 h-5 ${uiColors.textSecondary}`} /></button>
                        </div>

                        {/* Content */}
                        <div className="flex-grow p-6 overflow-y-auto space-y-6">
                            <section>
                                <h3 className={`font-semibold ${uiColors.textPrimary}`}>How it works</h3>
                                <p className={`mt-2 text-sm ${uiColors.textSecondary}`}>{integration.howItWorks}</p>
                                <div className="flex items-center space-x-4 mt-4">
                                    <Link href={integration.docsUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center text-sm font-medium ${uiColors.textSecondary} hover:text-cyan-600 dark:hover:text-purple-400`}><FiBookOpen className="mr-1.5" /> Docs</Link>
                                    <Link href={integration.websiteUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center text-sm font-medium ${uiColors.textSecondary} hover:text-cyan-600 dark:hover:text-purple-400`}><FiGlobe className="mr-1.5" /> Website</Link>
                                </div>
                            </section>

                            {integration.note && (
                                <div className={`p-4 rounded-lg flex items-start space-x-3 ${uiColors.accentSubtleBg}`}>
                                    <FiInfo className={`w-5 h-5 mt-0.5 flex-shrink-0 ${uiColors.accentPrimary}`} />
                                    <div>
                                        <h4 className={`text-sm font-semibold ${uiColors.textPrimary}`}>Note</h4>
                                        <p className={`mt-1 text-sm ${uiColors.textSecondary}`}>{integration.note}</p>
                                    </div>
                                </div>
                            )}

                            <div className={`border-t ${uiColors.borderPrimary}`} />

                            <section>
                                <div className="flex items-center justify-between">
                                    <h3 className={`font-semibold ${uiColors.textPrimary}`}>Configuration</h3>
                                    <div className={`flex items-center text-sm font-medium ${isConnected ? 'text-green-600' : uiColors.textPlaceholder}`}>
                                        {isConnected ? <FiCheckCircle className="mr-1.5" /> : <FiCircle className="mr-1.5" />}
                                        {isConnected ? 'Connected' : 'Not Connected'}
                                    </div>
                                </div>
                                <DynamicIntegrationForm
                                    integration={integration}
                                    onSuccess={onSuccess}
                                    isConnected={isConnected}
                                />
                            </section>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}