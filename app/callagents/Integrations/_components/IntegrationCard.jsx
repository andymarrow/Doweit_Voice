// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/Integrations/_components/IntegrationCard.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi'; // Import the checkmark icon
import { uiColors } from '../../_constants/uiConstants';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// The integration object now contains the isConnected boolean
export default function IntegrationCard({ integration, onCardClick }) {
    const { isConnected } = integration;

    // Conditionally set CSS classes based on connection status
    const borderClass = isConnected 
        ? 'border-green-500/80' 
        : `${uiColors.borderPrimary} hover:border-cyan-500/50 dark:hover:border-purple-500/50`;
    
    const shadowClass = isConnected ? 'shadow-lg shadow-green-500/5' : 'hover:shadow-md';

    return (
        <motion.div
            variants={cardVariants}
            onClick={onCardClick}
            className={`relative flex items-start p-4 rounded-lg border-2 ${borderClass} ${shadowClass} ${uiColors.bgPrimary} transition-all cursor-pointer space-x-4`}
        >
            {/* "Connected" Badge */}
            {isConnected && (
                <div className="absolute top-3 right-3 flex items-center px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                    <FiCheckCircle className="w-3 h-3 mr-1.5" />
                    Connected
                </div>
            )}

            <div className={`relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg border ${uiColors.borderPrimary}`}>
                <Image src={integration.logo} alt={`${integration.name} Logo`} width={24} height={24} objectFit="contain" />
            </div>
            <div className="flex-grow">
                <h3 className={`font-semibold ${uiColors.textPrimary}`}>{integration.name}</h3>
                <p className={`mt-1 text-sm ${uiColors.textSecondary}`}>
                    {integration.description}
                </p>
            </div>
        </motion.div>
    );
}