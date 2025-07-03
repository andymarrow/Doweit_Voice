// app/callagents/workflow/_components/nodes/PromptNode.jsx
import React, { memo } from 'react'; // Use memo for performance
import { Handle, Position } from '@xyflow/react'; // For connection handles - Corrected package
import { FiEdit3 } from 'react-icons/fi';

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Receive data prop from React Flow
function PromptNode({ data }) {
    // data contains { label, config: { prompt, greetingMessage }, onEditClick }

    // Truncate long text for display in the node
    const truncateText = (text, maxLength = 100) => {
        if (!text) return 'Empty';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        // Apply basic node styling (you might want a base node style component)
        <div className={`p-4 rounded-md border ${uiColors.borderPrimary} ${uiColors.bgPrimary} shadow-md w-60`}>
            {/* Source handle (for edges coming FROM this node) - positioned bottom */}
            <Handle
                type="source"
                position={Position.Bottom}
                id="b" // Optional: ID for specific handles
                className={`${uiColors.handleBg}`} // Basic handle styling
            />

            {/* Node Header */}
            <div className={`flex items-center justify-between text-sm font-semibold mb-2 ${uiColors.textPrimary}`}>
                {data.label || 'Prompt'}
                 {/* Edit Button */}
                 {/* Only show edit button if onEditClick handler is provided */}
                 {data.onEditClick && (
                     <button
                         onClick={data.onEditClick} // Call the handler from data
                         className={`p-1 rounded-md ${uiColors.hoverBgSubtle} ${uiColors.textSecondary} text-xs`}
                         title="Edit Prompt"
                     >
                         <FiEdit3 className="w-4 h-4" />
                     </button>
                 )}
            </div>

            {/* Node Content - Summarize Prompt and Greeting */}
             <div className={`text-xs ${uiColors.textSecondary} space-y-1`}>
                 <p>Prompt: <span className={`${uiColors.textPrimary}`}>{truncateText(data.config?.prompt, 80)}</span></p>
                 <p>Greeting: <span className={`${uiColors.textPrimary}`}>{truncateText(data.config?.greetingMessage, 50)}</span></p>
                 {/* Add more info if needed */}
             </div>

            {/* Target handle (for edges coming TO this node) - positioned top */}
             <Handle
                type="target"
                position={Position.Top}
                 id="t" // Optional: ID for specific handles
                 className={`${uiColors.handleBg}`} // Basic handle styling
            />
        </div>
    );
}

export default memo(PromptNode); // Wrap with memo for performance