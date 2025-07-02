// voice-agents-dashboard/_components/SelectionCard.jsx
"use client";

import React from 'react';
import { uiAccentClasses } from '../_constants/uiConstants'; // Assuming uiAccentClasses contains useful styles

function SelectionCard({ id, title, description, icon: Icon, onClick, isSelected }) {
    // Determine border and background classes based on selection state and theme
    const cardClasses = `
        border rounded-lg p-5 cursor-pointer transition-all duration-200
        ${uiAccentClasses.bgPrimary}
        ${isSelected
            ? `border-2 ${uiAccentClasses.ringAccentShade} ring-1 shadow-md` // Distinct border/ring when selected
            : `${uiAccentClasses.borderColor} hover:${uiAccentClasses.hoverBgSubtle} hover:shadow-sm`
        }
        flex flex-col items-center text-center
    `;

    const iconClasses = `
        text-4xl mb-3
        ${isSelected ? uiAccentClasses.textAccent : uiAccentClasses.textSecondary}
    `;

    const titleClasses = `
        text-lg font-semibold mb-2
        ${uiAccentClasses.textPrimary}
    `;

    const descriptionClasses = `
        text-sm
        ${uiAccentClasses.textSecondary}
    `;

    return (
        <div
            className={cardClasses}
            onClick={() => onClick(id)} // Pass the card's ID back to the parent
        >
            {Icon && <Icon className={iconClasses} />}
            <h3 className={titleClasses}>{title}</h3>
            {description && <p className={descriptionClasses}>{description}</p>}
        </div>
    );
}

export default SelectionCard;