// characterai/create/_components/TagsInput.jsx
"use client";

import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

// Import constants - Adjusted path as necessary
import { uiColors } from '../../_constants/uiConstants'; // Corrected path

function TagsInput({ tags, onAddTag, onRemoveTag }) {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const tag = inputValue.trim();
            if (tag && !tags.includes(tag)) {
                onAddTag(tag);
                setInputValue('');
            }
        }
    };

    const handlePaste = (e) => {
         e.preventDefault();
         const paste = e.clipboardData.getData('text');
         const tagsToAdd = paste.split(',').map(tag => tag.trim()).filter(tag => tag && !tags.includes(tag));
         if (tagsToAdd.length > 0) {
             tagsToAdd.forEach(tag => onAddTag(tag));
             setInputValue('');
         }
    };

    return (
        <div className="space-y-2">
            <label className={`block text-md font-medium ${uiColors.textSecondary}`}> {/* Adjusted font size */}
                Tags
            </label>
             <p className={`text-sm ${uiColors.textPlaceholder}`}> {/* Adjusted font size */}
                Add keywords to help users find your character. Press Enter or comma to add.
            </p>
            {/* Display Existing Tags */}
            {tags.length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-2">
                     {tags.map((tag, index) => (
                          <span key={index} className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded ${uiColors.accentSubtleBg} ${uiColors.textAccent}`}> {/* Adjusted text color class */}
                              {tag}
                              <button
                                  type="button" // Added type="button" to prevent accidental form submission
                                  onClick={() => onRemoveTag(tag)}
                                  className={`ml-1.5 -mr-0.5 h-3 w-3 flex-shrink-0 text-${uiColors.accentPrimaryText} opacity-70 hover:opacity-100 transition-opacity`} // Adjusted color and hover
                                  title={`Remove tag: ${tag}`}
                              >
                                   <FiX className="h-3 w-3" />
                               </button>
                          </span>
                     ))}
                 </div>
             )}
             {/* Input for New Tags */}
             <input
                 type="text"
                 value={inputValue}
                 onChange={handleInputChange}
                 onKeyDown={handleInputKeyDown}
                 onPaste={handlePaste}
                 className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`} // Adjusted font size/padding
                 placeholder="Search tags or add new ones"
             />
        </div>
    );
}

export default TagsInput;