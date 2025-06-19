// create/_components/CharacterFormSection.jsx
"use client";

import React from 'react';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Using your provided path

function CharacterFormSection({
    label,
    placeholder,
    value,
    onChange,
    maxLength,
    isTextArea = false, // Optional prop to render a textarea
    description, // Optional descriptive text below label
    id // Required for accessibility
}) {
    const InputElement = isTextArea ? 'textarea' : 'input';

    return (
        <div>
            <label htmlFor={id} className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                {label}
            </label>
            {description && (
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>{description}</p>
            )}
             <InputElement
                id={id}
                type={isTextArea ? undefined : "text"} // Only apply type="text" for input
                value={value}
                onChange={onChange}
                maxLength={maxLength}
                placeholder={placeholder}
                 className={`block w-full p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors ${isTextArea ? 'h-32 resize-y' : ''}`} // Add height/resize for textarea
            />
            <p className={`text-md text-right mt-1 ${uiColors.textPlaceholder}`}>
                {value.length}/{maxLength}
            </p>
        </div>
    );
}

export default CharacterFormSection;