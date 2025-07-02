// app/callagents/knowledgebase/[knowledgebaseid]/_components/KbContentList.jsx
"use client";

import React from 'react';
import { FiFileText, FiLink, FiFile, FiAlertCircle, FiTrash2, FiEdit3, FiLoader } from 'react-icons/fi'; // Icons for content types, Added Delete, Edit, Loader

// Import constants
import { uiColors } from '../../../_constants/uiConstants'; // Adjust path

// Helper to get icon based on content item type
const getContentIcon = (item) => {
    if (!item || !item.type) return null;

    switch (item.type) {
        case 'text':
            // If type is 'text' but has file metadata, maybe show file icon? Depends on desired UI.
            // Sticking to text icon for 'text' type value.
            return <FiFileText className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'url':
            return <FiLink className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'file':
             // If type is 'file' but value is text (your new case)
             // Or if value is a reference to a file
             return <FiFile className={`w-4 h-4 ${uiColors.textSecondary}`} />;
        case 'unknown':
             return <FiAlertCircle className={`w-4 h-4 text-orange-500`} />;
        default:
            return null;
    }
};

// Helper to display content value (basic)
const displayContentValue = (item) => {
    if (!item || item.value === undefined || item.value === null) return 'No value';

    switch (item.type) {
        case 'text':
        case 'file': // *** Treat 'file' type (with text value) like text for display ***
             // Show a truncated version of the text content
            const text = String(item.value);
            const filename = item.metadata?.filename ? ` (from ${item.metadata.filename})` : ''; // Add filename if exists
             const display = text.length > 300 ? text.substring(0, 300) + '...' : text; // Increased truncation length
             return `${display}${filename}`;
        case 'url':
            // Display the URL, maybe with metadata title or status
            const urlValue = String(item.value);
             const urlStatus = item.status ? ` (${item.status})` : '';
            return item.metadata?.title ? `${item.metadata.title}${urlStatus}` : `${urlValue}${urlStatus}`;
        default:
             // Fallback for other types
             return String(item.value);
    }
};

function KbContentList({ content /* Add handlers for edit/delete content items if needed */ }) {

    if (!content || content.length === 0) {
        return (
            <div className={`text-center py-10 ${uiColors.textSecondary}`}>
                No content added to this knowledge base yet. Use the section below to add some.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Map over the content array */}
            {content.map((item, index) => (
                 // Use item.id as key if available, fallback to index
                 // Use the unique item.id as key if available
                <div key={item.id || `item-${index}`} className={`p-4 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} flex items-start space-x-3`}>
                    {/* Icon based on type */}
                    <div className="flex-shrink-0 mt-1">
                        {getContentIcon(item)} {/* Pass the whole item */}
                    </div>
                    {/* Content value and metadata */}
                     <div className="flex-grow">
                         {/* Type label */}
                          <div className={`text-xs font-medium ${uiColors.textSecondary} uppercase mb-1`}>
                             {item.type || 'unknown'}
                             {/* Optional: Show status for processing/failed items */}
                              {item.status && item.status !== 'ready' && (
                                   <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        item.status === 'processing' ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` :
                                        item.status === 'failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                                         `${uiColors.statusBadgeInfoBg} ${uiColors.statusBadgeInfoText}`
                                    }`}>
                                       {item.status}
                                       {item.status === 'processing' && <FiLoader className="inline-block ml-1 w-3 h-3 animate-spin" />}
                                   </span>
                              )}
                         </div>
                         {/* Display value */}
                         <div className={`text-sm ${uiColors.textPrimary} whitespace-pre-wrap`}>
                             {displayContentValue(item)} {/* Pass the whole item */}
                         </div>
                          {/* Optional: Add timestamp, source, etc. */}
                          {item.addedAt && (
                              <div className={`text-xs ${uiColors.textPlaceholder} mt-1`}>
                                   Added: {new Date(item.addedAt).toLocaleString()}
                               </div>
                          )}
                     </div>
                     {/* Optional: Add Edit/Delete buttons for individual content items if user is owner */}
                     {/* These would call handlers passed down from the page, checking kb.isOwner there */}
                     {/*
                     <div className="flex-shrink-0 flex items-center space-x-2">
                         <button className={`${uiColors.textSecondary} ${uiColors.hoverBgSubtle} p-1 rounded`} title="Edit Content">
                             <FiEdit3 className="w-4 h-4" />
                         </button>
                          <button className={`text-red-600 dark:text-red-400 ${uiColors.hoverBgSubtle} p-1 rounded`} title="Delete Content">
                             <FiTrash2 className="w-4 h-4" />
                         </button>
                     </div>
                     */}
                </div>
            ))}
        </div>
    );
}

export default KbContentList;