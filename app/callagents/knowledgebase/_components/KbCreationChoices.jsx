// app/callagents/knowledgebase/_components/KbCreationChoices.jsx
"use client";

import React from 'react';
import { FiEdit3 } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path

// Receive handler to select a method
function KbCreationChoices({ onSelectMethod }) {
    return (
        <div className="grid grid-cols-1 gap-6 py-8"> {/* Single-choice grid */}
            {/* Choice Card: Start from Scratch */}
            <button
                onClick={() => onSelectMethod('scratch')} // Call handler with method key
                 className={`flex flex-col items-center justify-center p-6 rounded-lg border ${uiColors.borderPrimary} ${uiColors.bgSecondary} ${uiColors.hoverBgSubtle} transition-colors space-y-3 text-center`}
             >
                 <FiEdit3 className={`w-8 h-8 ${uiColors.textAccent}`} /> {/* Icon */}
                 <span className={`font-semibold ${uiColors.textPrimary}`}>Start from Scratch</span> {/* Label */}
                 <p className={`text-sm ${uiColors.textSecondary}`}>Build a new knowledge base manually.</p> {/* Description */}
            </button>
        </div>
    );
}

export default KbCreationChoices;
