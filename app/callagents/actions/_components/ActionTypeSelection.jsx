// /app/callagents/actions/_components/ActionTypeSelection.jsx
import React from 'react';
import { FiType, FiCheckCircle, FiList } from 'react-icons/fi'; // Icons for Text, Boolean, Choice

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants';

// Define the types the user can *configure* in this modal
const configTypes = [
    {
        key: 'Text',
        name: 'Text / Open Question',
        description: 'Capture any text response or open-ended information.',
        icon: FiType,
    },
    {
        key: 'Boolean',
        name: 'Boolean (Yes/No)',
        description: 'Capture a simple true/false or yes/no response.',
        icon: FiCheckCircle,
    },
    {
        key: 'Choice',
        name: 'Multiple Choice',
        description: 'Capture a response from a predefined list of options.',
        icon: FiList,
    },
    // Add other configuration types if needed, e.g., Number, Date, Currency
    // Note: This is the configuration type, not the broad 'Information Extractor' or 'Action Type'
];


function ActionTypeSelection({ onSelectType }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {configTypes.map(type => (
                <button
                    key={type.key}
                    onClick={() => onSelectType(type.key)} // Pass the selected key back
                    className={`flex flex-col items-start text-left p-5 rounded-lg border-2 transition-colors
                               ${uiColors.bgSecondary} ${uiColors.borderPrimary} ${uiColors.hoverBorderAccentPrimary} ${uiColors.hoverBgSubtle}`}
                >
                     <type.icon className={`w-8 h-8 mb-3 ${uiColors.accentPrimaryText}`} /> {/* Use accent color for icon */}
                    <h4 className={`text-base font-semibold mb-1 ${uiColors.textPrimary}`}>{type.name}</h4>
                    <p className={`text-sm ${uiColors.textSecondary}`}>{type.description}</p>
                </button>
            ))}
        </div>
    );
}

export default ActionTypeSelection;