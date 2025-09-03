//app/callagents/Integrations/_components/IntegrationGrid.jsx
"use client";

import React from 'react';
import IntegrationCard from './IntegrationCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLoader } from 'react-icons/fi';
import { uiColors } from '../../_constants/uiConstants';

export default function IntegrationGrid({ integrations, connections, onCardClick, isLoading }) {
    if (isLoading) {
        return (
            <div className={`flex items-center justify-center h-64 ${uiColors.textSecondary}`}>
                <FiLoader className="animate-spin w-8 h-8" />
            </div>
        );
    }

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            initial="hidden"
            animate="visible"
            variants={{
                visible: { transition: { staggerChildren: 0.05 } }
            }}
        >
            {integrations.map(integration => (
                <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    isConnected={connections[integration.id]?.connected || false}
                    onCardClick={() => onCardClick(integration)}
                />
            ))}
        </motion.div>
    );
}