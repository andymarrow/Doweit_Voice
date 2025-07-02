// app/callagents/knowledgebase/_components/KnowledgeBaseCard.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiEdit3, FiTrash2, FiEye, FiLock, FiGlobe } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants'; // Adjust path
import { itemVariants } from '../../_constants/uiConstants'; // Assuming variants

// Receive KB data and optional handlers, including onClick for navigation
function KnowledgeBaseCard({ kb, onClick, onView, onEdit, onDelete }) { // *** Added onClick ***

    // Optional: Format date for display
    const formattedDate = kb.updatedAt ? new Date(kb.updatedAt).toLocaleDateString() : 'N/A';

    // Determine if the card itself is clickable (only if an onClick prop is provided)
    const isClickable = typeof onClick === 'function';


    return (
        <motion.div
             variants={itemVariants} // Apply item variants for animation
             // Make the card clickable if onClick is provided
             className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3 flex flex-col ${isClickable ? `${uiColors.hoverBgSubtle} cursor-pointer` : ''}`} // Add hover/cursor styles
             onClick={isClickable ? () => onClick(kb.id) : undefined} // Call onClick with KB ID, only if clickable
        >
            {/* Header: Name & Status/Public Indicator */}
            <div className="flex items-center justify-between">
                 <h3 className={`font-semibold text-base ${uiColors.textPrimary}`}>{kb.name || 'Unnamed Knowledge Base'}</h3>
                 <div className="flex items-center space-x-2 flex-shrink-0"> {/* Prevent shrinking */}
                     {/* Status Badge */}
                      {kb.status && (
                           <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                               kb.status === 'ready' ? `${uiColors.statusBadgeSuccessBg} ${uiColors.statusBadgeSuccessText}` :
                               kb.status === 'processing' ? `${uiColors.statusBadgeWarningBg} ${uiColors.statusBadgeWarningText}` :
                               kb.status === 'failed' ? `${uiColors.statusBadgeDangerBg} ${uiColors.statusBadgeDangerText}` :
                                `${uiColors.statusBadgeInfoBg} ${uiColors.statusBadgeInfoText}` // Default/Other status
                           }`}>
                               {kb.status}
                           </span>
                      )}
                     {/* Public/Private Icon */}
                      {kb.isPublic ? (
                          <FiGlobe className={`w-4 h-4 ${uiColors.textSecondary}`} title="Public" />
                      ) : (
                          <FiLock className={`w-4 h-4 ${uiColors.textSecondary}`} title="Private" />
                      )}
                 </div>
            </div>

            {/* Description */}
             <p className={`text-sm ${uiColors.textSecondary} flex-grow`}> {/* flex-grow pushes buttons to bottom */}
                {kb.description || 'No description provided.'}
            </p>

            {/* Metadata */}
             <div className={`text-xs ${uiColors.textPlaceholder}`}>
                 Updated: {formattedDate}
                 {/* Optional: Add content size, linked agents count, etc. */}
                 {/* <span> | {kb.content?.length || 0} chunks</span> */}
             </div>

            {/* Actions Buttons (Only show if specific handlers are provided, e.g., not on the main list card where the card itself navigates) */}
             {/* If you want actions *in addition* to navigation on the main card, adjust this */}
             {(onView || onEdit || onDelete) && (
                 <div className="flex items-center space-x-2 mt-3">
                      {/* View Button (Placeholder) */}
                     {onView && (
                         <button
                              onClick={(e) => { e.stopPropagation(); onView(kb); }} // Stop propagation to prevent card click
                             className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                             title="View Details"
                         >
                             <FiEye className="w-4 h-4" />
                         </button>
                     )}
                      {/* Edit Button (Placeholder) */}
                     {/* Note: Editing typically happens on the detail page now */}
                     {onEdit && (
                          <button
                              onClick={(e) => { e.stopPropagation(); onEdit(kb); }} // Stop propagation
                             className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                             title="Edit"
                         >
                             <FiEdit3 className="w-4 h-4" />
                         </button>
                     )}
                      {/* Delete Button (Placeholder) */}
                     {onDelete && (
                          <button
                              onClick={(e) => { e.stopPropagation(); onDelete(kb.id); }} // Stop propagation
                             className={`p-1 rounded-md ${uiColors.hoverBgSubtle} text-red-600 dark:text-red-400`}
                             title="Delete"
                         >
                             <FiTrash2 className="w-4 h-4" />
                         </button>
                     )}
                 </div>
             )}
        </motion.div>
    );
}

export default KnowledgeBaseCard;