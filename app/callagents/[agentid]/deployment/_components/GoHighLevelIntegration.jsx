// voice-agents-CallAgents/[agentid]/deployment/_components/GoHighLevelIntegration.jsx
"use client";

import React from 'react';
import { FiDownload, FiBookOpen } from 'react-icons/fi'; // Icons

// Import constants - Adjust path as necessary
import { uiColors } from '@/app/callagents/_constants/uiConstants'; 

function GoHighLevelIntegration({ agentId }) {
    // Receive agentId if needed for specific links or data fetching

    return (
        <div className="space-y-6"> {/* Vertical spacing for sections */}

            {/* Prerequisites Section */}
            <div>
                 <h4 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Prerequisites</h4>

                 <div className="space-y-4">
                     {/* Step 1 */}
                     <div className={`flex items-start space-x-3 ${uiColors.textSecondary}`}>
                         <div className="flex-shrink-0 mt-0.5">1</div> {/* Step number */}
                         <div>
                             <div className={`font-medium ${uiColors.textPrimary}`}>Install the Doweit voice app</div>
                             <p className="text-sm">
                                 Install the Doweit voice app on your agency or chosen subaccount via the
                                  <a href="#" className={`ml-1 ${uiColors.textAccent} ${uiColors.hoverTextAccentContrast}`} target="_blank" rel="noopener noreferrer">marketplace</a>.
                             </p>
                         </div>
                     </div>

                      {/* Step 2 (Documentation & Video Guide) */}
                     <div className={`flex items-start space-x-3 ${uiColors.textSecondary}`}>
                         <div className="flex-shrink-0 mt-0.5">2</div> {/* Step number */}
                         <div>
                             <div className={`font-medium ${uiColors.textPrimary}`}>Documentation & Video Guide</div>
                             <p className="text-sm">
                                  <a href="#" className={`inline-flex items-center mr-4 ${uiColors.textAccent} ${uiColors.hoverTextAccentContrast}`} target="_blank" rel="noopener noreferrer">
                                      <FiBookOpen className="mr-1 w-4 h-4" /> Learn how to install Doweit voice in your GHL app
                                  </a>
                                  <a href="#" className={`inline-flex items-center ${uiColors.textAccent} ${uiColors.hoverTextAccentContrast}`} target="_blank" rel="noopener noreferrer">
                                      <FiBookOpen className="mr-1 w-4 h-4" /> Watch the video guide
                                  </a>
                             </p>
                         </div>
                     </div>

                      {/* Add more prerequisites steps as needed */}

                 </div>
            </div>

            {/* Add other GoHighLevel specific configuration sections here */}
             {/* Example: API Key Input */}
             {/* <div>
                 <h4 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>API Key</h4>
                 <input type="text" className="..." placeholder="Enter GHL API Key" />
             </div> */}

        </div>
    );
}

export default GoHighLevelIntegration;