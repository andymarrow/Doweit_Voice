// voice-agents-CallAgents/[agentid]/deployment/page.jsx
"use client";

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion'; // Assuming framer-motion is used
import { FiPhone, FiLink, FiCheck } from 'react-icons/fi'; // Icons

// Import components
import DeploymentIntegrationTabs from './_components/DeploymentIntegrationTabs';
import GoHighLevelIntegration from './_components/GoHighLevelIntegration';
import ZapierIntegration from './_components/ZapierIntegration';
import RestApiIntegration from './_components/RestApiIntegration';

// Import constants - Adjust path as necessary
import { uiColors } from '../../_constants/uiConstants'; 
import { sectionVariants, itemVariants } from '../../_constants/uiConstants'; // Assuming animation variants


// Define which content component maps to which integration tab key
const integrationComponents = {
    'gohighlevel': GoHighLevelIntegration,
    'zapier': ZapierIntegration,
    'restapi': RestApiIntegration,
};

// Get the keys for validation
const integrationTabKeys = Object.keys(integrationComponents);


export default function DeploymentPage() {
    const params = useParams();
    const agentId = params.agentid;

    // State for Phone Number and Webhook inputs (placeholder)
    const [phoneNumber, setPhoneNumber] = useState(''); // Placeholder for selected phone number display
    const [webhookUrl, setWebhookUrl] = useState('https://example.com/webhook/placeholder'); // Placeholder webhook URL
    const [isInitializingWebhook, setIsInitializingWebhook] = useState(false); // State for webhook initialization

    // State for the active integration tab
    const [activeIntegrationTab, setActiveIntegrationTab] = useState('gohighlevel'); // Default to GoHighLevel


     // Handlers for Phone Number section
     const handleSelectPhoneNumber = () => {
         console.log("Simulating phone number selection modal/process");
         alert("Simulating phone number selection"); // Placeholder
         // In a real app, trigger a modal or navigation to select/assign a number
     };
     const handleChangePhoneNumber = () => {
         console.log("Simulating phone number change/selection");
         alert("Simulating phone number change"); // Placeholder
          // In a real app, trigger a modal or navigation
     };

     // Handlers for Webhook section
     const handleWebhookUrlChange = (e) => {
         setWebhookUrl(e.target.value);
     };

     const handleInitializeWebhook = async () => {
         setIsInitializingWebhook(true);
         console.log(`Initializing webhook: ${webhookUrl} for agent ${agentId}`);
         // --- Simulate API Call ---
         await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
         console.log("Webhook initialized (simulated)");
          // --- End Simulate API Call ---
         setIsInitializingWebhook(false);
         alert(`Webhook initialized for ${webhookUrl}`); // Placeholder confirmation
     };


    // Function to handle integration tab changes
    const handleIntegrationTabChange = (tabKey) => {
         if (integrationTabKeys.includes(tabKey)) { // Basic validation
             setActiveIntegrationTab(tabKey);
         } else {
             console.warn(`Attempted to switch to unknown integration tab key: ${tabKey}`);
             setActiveIntegrationTab('gohighlevel'); // Default on invalid key
         }
    };

    // Get the content component based on the active integration tab
    const CurrentIntegrationComponent = integrationComponents[activeIntegrationTab];


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Important Alert Banner (Keep if needed) */}
            {/* <motion.div ... ></motion.div> */}


            {/* Page Title */}
             <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Deployment</h1>

             {/* Phone Number Section */}
             <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                 variants={sectionVariants} initial="hidden" animate="visible"
             >
                 <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Phone Number</h3>
                 <p className={`text-sm ${uiColors.textSecondary}`}>Select or connect the phone number that will be used for client communication</p>
                 <div className="flex items-center space-x-4 w-full sm:max-w-md">
                     {/* Placeholder for displaying current number or 'Select' text */}
                      <div className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary}`}>
                         {phoneNumber || 'Select a phone number'} {/* Display number or placeholder */}
                      </div>
                     {/* Button to trigger phone number selection/change */}
                     <button
                          onClick={phoneNumber ? handleChangePhoneNumber : handleSelectPhoneNumber} // Change button text/action if number exists
                          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
                     >
                         {phoneNumber ? 'Change' : 'Select'} {/* Button text changes */}
                     </button>
                 </div>
             </motion.div>


             {/* Webhook Section */}
             <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                 variants={sectionVariants} initial="hidden" animate="visible"
             >
                 <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Webhook</h3>
                 <p className={`text-sm ${uiColors.textSecondary}`}>
                     Enter the URL for your Webhook to receive real-time notifications from the agent.
                      {/* Learn More link */}
                     <a href="#" className={`ml-1 ${uiColors.textAccent} ${uiColors.hoverTextAccentContrast}`} target="_blank" rel="noopener noreferrer">
                         Learn more <FiCheck className="inline w-3 h-3 ml-0.5 -mt-0.5" /> {/* Using FiCheck as placeholder external link icon */}
                     </a>
                 </p>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:max-w-xl"> {/* Responsive layout */}
                     {/* Webhook URL Input */}
                     <div className={`flex items-center border rounded-md ${uiColors.borderPrimary} ${uiColors.bgSecondary} flex-grow w-full sm:w-auto`}> {/* Use flex-grow to fill space, w-full for small screens */}
                         <FiLink className={`w-4 h-4 text-gray-400 dark:text-gray-500 ml-3 mr-2`} />
                         <input
                             type="url" // Use type="url"
                              id="webhookUrl" // Added ID for accessibility
                             value={webhookUrl}
                             onChange={handleWebhookUrlChange}
                             className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                             placeholder="https://example.com/webhook/placeholder"
                         />
                     </div>
                     {/* Initialize Button */}
                     <button
                         onClick={handleInitializeWebhook}
                         disabled={isInitializingWebhook || !webhookUrl} // Disable if initializing or URL is empty
                         className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none w-full sm:w-auto ${isInitializingWebhook || !webhookUrl ? 'opacity-50 cursor-not-allowed' : ''}`} // Full width on small
                     >
                         {isInitializingWebhook ? 'Initializing...' : 'Initialize'}
                     </button>
                 </div>
             </motion.div>

             {/* Integrations & Automation Section */}
             <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                 variants={sectionVariants} initial="hidden" animate="visible"
             >
                 <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Integrations & Automation</h3>
                  <p className={`text-sm ${uiColors.textSecondary}`}>Configure integrations to automate your business processes.</p>

                 {/* Integration Tabs */}
                 <DeploymentIntegrationTabs
                     activeTab={activeIntegrationTab}
                     onTabChange={handleIntegrationTabChange}
                 />

                 {/* Integration Content */}
                 <div className="flex-grow"> {/* Container for tab content */}
                     {CurrentIntegrationComponent ? (
                         <CurrentIntegrationComponent agentId={agentId} />
                     ) : (
                          <div className={`text-center ${uiColors.textDanger}`}>
                              Error: Integration component not found for tab '{activeIntegrationTab}'.
                          </div>
                     )}
                 </div>
             </motion.div>


        </div>
    );
}