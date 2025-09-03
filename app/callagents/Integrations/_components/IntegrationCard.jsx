// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/callagents/Integrations/_components/IntegrationCard.jsx
"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { uiColors } from '../../_constants/uiConstants';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function IntegrationCard({ integration, isConnected, onCardClick }) {
    return (
        <motion.div
            variants={cardVariants}
            onClick={onCardClick}
            className={`flex items-start p-4 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgPrimary} transition-all hover:border-cyan-500/50 dark:hover:border-purple-500/50 hover:shadow-md cursor-pointer space-x-4`}
        >
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