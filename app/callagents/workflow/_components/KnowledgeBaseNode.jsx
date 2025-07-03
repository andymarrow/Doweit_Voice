// app/callagents/workflow/_components/nodes/KnowledgeBaseNode.jsx
import React, { memo } from 'react'; // Use memo for performance
import { Handle, Position } from '@xyflow/react'; // For connection handles - Corrected package
import { FiEdit3, FiBookOpen, FiLock, FiGlobe } from 'react-icons/fi'; // Icons

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Helper to get icon based on public/private status
const getKbIcon = (isPublic) => {
    return isPublic ? (
        <FiGlobe className={`w-4 h-4 ${uiColors.textSecondary}`} title="Public" />
    ) : (
        <FiLock className={`w-4 h-4 ${uiColors.textSecondary}`} title="Private" />
    );
};


// Receive data prop from React Flow
function KnowledgeBaseNode({ data }) {
    // data contains { label, config: { knowledgeBaseId, linkedKbName, isOwner }, onSelectClick }

    // Determine display name for the linked KB
    const kbDisplayName = data.config?.knowledgeBaseId ? (data.config.linkedKbName || `KB ID ${data.config.knowledgeBaseId}`) : 'No KB Linked';


    return (
         // Apply basic node styling
        <div className={`p-4 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-md w-60`}>
            {/* Target handle (top) */}
             <Handle
                type="target"
                position={Position.Top}
                 id="t"
                 className={`${uiColors.handleBg}`}
            />
            {/* Source handle (bottom) */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="b"
                className={`${uiColors.handleBg}`}
            />


            {/* Node Header */}
            <div className={`flex items-center justify-between text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>
                {data.label || 'Knowledge Base'}
                 {/* Edit/Select Button (Show only if owner) */}
                 {data.config?.isOwner && data.onSelectClick && (
                     <button
                         onClick={data.onSelectClick} // Call the handler from data
                         className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} text-xs`}
                         title="Select Knowledge Base"
                     >
                         <FiEdit3 className="w-4 h-4" />
                     </button>
                 )}
            </div>

            {/* Node Content - Display Linked KB Name/Status */}
             <div className={`text-xs ${uiColors.textSecondary} space-y-1`}>
                 <p>Linked KB: <span className={`${uiColors.textPrimary}`}>{kbDisplayName}</span></p>
                  {/* Optional: Show Public/Private icon here based on KB details if available */}
                  {/* data.config?.knowledgeBaseId && data.config?.isPublic !== undefined && (
                       <p>Status: {getKbIcon(data.config.isPublic)} {data.config.isPublic ? 'Public' : 'Private'}</p>
                  )*/}
             </div>

        </div>
    );
}

export default memo(KnowledgeBaseNode); // Wrap with memo for performance