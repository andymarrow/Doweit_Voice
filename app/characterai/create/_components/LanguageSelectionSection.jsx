// characterai/create/_components/LanguageSelectionSection.jsx
"use client";

import React from 'react';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants';

// Define the list of supported languages and their codes
const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'ga', name: 'Irish' }, // Gaelic
    { code: 'ar', name: 'Arabic' },
    { code: 'zh', name: 'Chinese' }, // Simplified Chinese, or specify locale like 'zh-CN' if needed
    { code: 'am', name: 'Amharic' },
    // Add more languages as needed
];

function LanguageSelectionSection({ selectedLanguage, onLanguageChange }) {
    return (
        <div className="w-full sm:max-w-md">
            <label htmlFor="characterLanguage" className={`block text-md font-medium mb-2 ${uiColors.textSecondary}`}>
                Character Language
            </label>
            <p className={`text-sm mb-3 ${uiColors.textPlaceholder}`}>
                Select the primary language for your character.
            </p>
            <select
                id="characterLanguage"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm ${uiColors.bgSecondary} ${uiColors.borderPrimary} ${uiColors.textPrimary} focus:outline-none focus:ring-${uiColors.accentPrimaryText} focus:border-${uiColors.accentPrimaryText} sm:text-sm`}
            >
                 {/* Optional: Add a disabled default option */}
                 {/* <option value="" disabled>Select language</option> */}
                {supportedLanguages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default LanguageSelectionSection;