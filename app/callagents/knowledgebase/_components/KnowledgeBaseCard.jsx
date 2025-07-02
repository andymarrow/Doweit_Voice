// app/callagents/knowledgebase/_components/KnowledgeBaseCard.jsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiEdit3, FiTrash2, FiEye, FiLock, FiGlobe } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants';
import { itemVariants } from '../../_constants/uiConstants'; // Assuming variants

function KnowledgeBaseCard({ kb, onView, onEdit, onDelete }) { // Receive KB data and optional handlers

    // Optional: Format date for display
    const formattedDate = kb.updatedAt ? new Date(kb.updatedAt).toLocaleDateString() : 'N/A';

    return (
        <motion.div
             variants={itemVariants} // Apply item variants for animation
             className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-4 space-y-3 flex flex-col`} // flex-col for bottom alignment
        >
            {/* Header: Name & Status/Public Indicator */}
            <div className="flex items-center justify-between">
                 <h3 className={`font-semibold text-base ${uiColors.textPrimary}`}>{kb.name || 'Unnamed Knowledge Base'}</h3>
                 <div className="flex items-center space-x-2">
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

            {/* Actions Buttons */}
             <div className="flex items-center space-x-2 mt-3">
                  {/* View Button (Placeholder) */}
                 {onView && (
                     <button
                          onClick={() => onView(kb)} // Pass the KB object to view handler
                         className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                         title="View Details"
                     >
                         <FiEye className="w-4 h-4" />
                     </button>
                 )}
                  {/* Edit Button (Placeholder) */}
                 {onEdit && (
                      <button
                          onClick={() => onEdit(kb)} // Pass the KB object to edit handler
                         className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary}`}
                         title="Edit"
                     >
                         <FiEdit3 className="w-4 h-4" />
                     </button>
                 )}
                  {/* Delete Button (Placeholder) */}
                 {onDelete && (
                      <button
                          onClick={() => onDelete(kb.id)} // Pass the KB ID to delete handler
                         className={`p-1 rounded-md ${uiColors.hoverBgSubtle} text-red-600 dark:text-red-400`}
                         title="Delete"
                     >
                         <FiTrash2 className="w-4 h-4" />
                     </button>
                 )}
             </div>
        </motion.div>
    );
}

export default KnowledgeBaseCard;