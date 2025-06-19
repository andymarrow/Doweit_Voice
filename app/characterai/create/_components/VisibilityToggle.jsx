// characterai/create/_components/VisibilityToggle.jsx
"use client";

import React from 'react';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path

function VisibilityToggle({ visibility, onVisibilityChange }) {
    return (
        <div className="space-y-2">
             <label className={`block text-md font-medium ${uiColors.textSecondary}`}> {/* Adjusted font size */}
                 Visibility
            </label>
             <p className={`text-sm ${uiColors.textPlaceholder}`}> {/* Adjusted font size */}
                Choose whether your character is public or private.
            </p>
            <div className={`flex rounded-md border ${uiColors.borderPrimary} overflow-hidden w-fit text-sm font-medium`}> {/* Added font size */}
                <button
                     type="button" // Added type="button"
                    className={`px-4 py-2 transition-colors ${
                        visibility === 'public'
                            ? `${uiColors.accentPrimaryGradient} text-white`
                            : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                    }`}
                    onClick={() => onVisibilityChange('public')}
                >
                    Public
                </button>
                <button
                     type="button" // Added type="button"
                    className={`px-4 py-2 transition-colors ${
                        visibility === 'private'
                            ? `${uiColors.accentPrimaryGradient} text-white`
                            : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                    }`}
                    onClick={() => onVisibilityChange('private')}
                >
                    Private
                </button>
            </div>
        </div>
    );
}

export default VisibilityToggle;