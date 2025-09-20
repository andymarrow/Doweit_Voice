"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast or similar
import { FiSave, FiLoader } from 'react-icons/fi'; // Add Save and Loader icons

// Import context hook
import { useCallAgent } from '../_context/CallAgentContext';

// Import configuration components
import AgentConfigTabs from './_components/AgentConfigTabs';
import GeneralConfig from './_components/GeneralConfig';
import VoiceConfig from './_components/VoiceConfig';
import CallConfig from './_components/CallConfig';
import IntegrationsConfig from './_components/IntegrationsConfig'; 

// Import constants
import { uiColors } from '../../_constants/uiConstants';

// Helper function to make the API call for saving
// Moved this helper inside the page component or a separate file
const updateAgentConfig = async (agentId, configData) => {
    const response = await fetch(`/api/callagents/${agentId}/config`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update agent configuration');
    }

    return response.json(); // Returns the updated agent object
};


// Define which content component maps to which tab key
const configComponents = {
    'general': GeneralConfig,
    'voice': VoiceConfig,
    'call-configuration': CallConfig,
    'Integrations': IntegrationsConfig,
};

// Get the keys for validation
const configTabKeys = Object.keys(configComponents);

export default function AgentConfigurePage() { // Renamed to avoid confusion with the layout
    // Get initial agent data from context provided by the layout
    const initialAgent = useCallAgent(); // This gives us the agent object fetched by the layout

    // State to control which tab content is displayed
    const [activeTab, setActiveTab] = useState('general');

    // State to hold the *editable* configuration data for all tabs
    // Initialize as an empty object, will be populated in useEffect
    const [configData, setConfigData] = useState({});

    // State for saving process and dirty state
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isDirty, setIsDirty] = useState(false); // Track if changes have been made

    // Get agentId from the initialAgent object
    const agentId = initialAgent?.id;


    // Effect to initialize configData state when the initialAgent object is available
    // and whenever initialAgent might theoretically change (e.g., after a successful save if we re-fetch/update context)
    useEffect(() => {
        if (initialAgent) {
            // Extract relevant fields for configuration from the initial agent data
            // Deep copy JSONB objects to ensure state updates don't mutate initialAgent directly
            setConfigData({
                name: initialAgent.name,
                avatarUrl: initialAgent.avatarUrl,
                voiceEngine: initialAgent.voiceEngine,
                aiModel: initialAgent.aiModel,
                timezone: initialAgent.timezone,
                customVocabulary: initialAgent.customVocabulary ? [...initialAgent.customVocabulary] : [], // Ensure array and copy
                useFillerWords: initialAgent.useFillerWords,
                prompt: initialAgent.prompt, // Prompt is configured here too
                greetingMessage: initialAgent.greetingMessage, // Greeting is configured here too
                knowledgeBaseId: initialAgent.knowledgeBaseId,
                status: initialAgent.status,
                voiceConfig: initialAgent.voiceConfig ? { ...initialAgent.voiceConfig } : {}, // Ensure object and copy
                callConfig: initialAgent.callConfig ? { ...initialAgent.callConfig } : {},   // Ensure object and copy
            });
            setIsDirty(false); // Reset dirty state when initializing
            setSaveError(null); // Clear any previous errors
        }
    }, [initialAgent]); // Dependency: Re-run if the initialAgent object changes

    // Handler for changes in any config field
    // This function will be passed down to child components
    const handleConfigChange = (field, value) => {
        setConfigData(prevConfig => {
            // Handle nested updates for voiceConfig and callConfig
            if (field.startsWith('voiceConfig.')) {
                const nestedField = field.split('.')[1];
                return {
                    ...prevConfig,
                    voiceConfig: {
                        ...prevConfig.voiceConfig,
                        [nestedField]: value
                    }
                };
            }
             if (field.startsWith('callConfig.')) {
                const nestedField = field.split('.')[1];
                return {
                    ...prevConfig,
                    callConfig: {
                        ...prevConfig.callConfig,
                        [nestedField]: value
                    }
                };
            }
            // Handle top-level fields
            return {
                ...prevConfig,
                [field]: value
            };
        });
        setIsDirty(true); // Mark form as dirty on any change
    };

    // Handler for saving the configuration
    const handleSave = async () => {
        if (!isDirty || isSaving || !agentId) {
            // Don't save if no changes, already saving, or agentId is missing
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            // Send the current configData state to the backend
            // The backend API /api/callagents/[agentid]/config filters for allowed fields
            const dataToSave = { ...configData }; // Send the entire state object

            console.log("[Configure Page] Saving config:", dataToSave);

            const updatedAgent = await updateAgentConfig(agentId, dataToSave);

            // Success: Mark as clean, show toast
            setIsDirty(false);
            toast.success('Configuration saved successfully!');
            console.log("[Configure Page] Config saved:", updatedAgent);

            // Optional: If the context needs to be updated immediately on save
            // you could add a function to the context provider, or trigger a re-fetch
            // of the agent in the layout. For simplicity here, we just update dirty state.

        } catch (err) {
            console.error('[Configure Page] Error saving agent config:', err);
            setSaveError(err.message);
            toast.error(`Save failed: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Function to handle tab changes - updates local state only
    const handleTabChange = (tabKey) => {
        // Basic validation
        if (configTabKeys.includes(tabKey)) {
             // You could add logic here like prompting for unsaved changes
             // if (isDirty && !confirm("You have unsaved changes. Discard?")) {
             //     return; // Stop the tab change
             // }
             setActiveTab(tabKey);
        } else {
            console.warn(`[Configure Page] Attempted to switch to unknown tab key: ${tabKey}`);
            setActiveTab('general'); // Default to general on invalid key
        }
    };

     // Get the component to render based on the active tab
     const CurrentConfigComponent = configComponents[activeTab];

    // Show loading state if initial agent data or configData is not yet ready
    // The layout should handle the primary loading for the agent,
    // but this page needs configData initialized from it.
     if (!initialAgent || Object.keys(configData).length === 0) {
         return (
             <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                 <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" />
                 Loading configuration...
             </div>
         );
     }

    return (
        <motion.div
             className="flex flex-col space-y-6 w-full h-full" // Container takes full width/height
             initial="hidden"
             animate="visible"
             variants={{ visible: { transition: { staggerChildren: 0.05 } } }} // Stagger children animation
        >
             {/* Header and Save Button */}
             <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
             >
                 <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Configure Agent: {initialAgent.name}</h1>

                 {/* Save Button */}
                  <button
                      onClick={handleSave}
                      disabled={!isDirty || isSaving} // Disable if no changes or saving
                       className={`inline-flex items-center px-6 py-2 text-lg font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                     {isSaving ? (
                         <FiLoader className="animate-spin mr-2" />
                     ) : (
                          <FiSave className="mr-2" />
                      )}
                      Save
                  </button>
             </motion.div>

            {/* Render the tabs */}
             <motion.div
                 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                 className={`flex-shrink-0`} // Prevent tabs from shrinking
            >
                <AgentConfigTabs
                     activeTab={activeTab}
                     onTabChange={handleTabChange} // Pass the local state updater
                 />
             </motion.div>


            {/* Render the content based on the active tab */}
            {/* Pass down the configuration state and the change handler */}
             <motion.div
                 variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                 className="flex-grow overflow-y-auto p-4 md:p-0" // Allow content to scroll, remove padding if already in layout
             >
                 {saveError && ( // Display save error message
                      <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                         Error saving configuration: {saveError}
                      </div>
                 )}
                 {CurrentConfigComponent ? (
                     <CurrentConfigComponent
                         config={configData} // Pass the relevant portion or the whole configData
                         onConfigChange={handleConfigChange} // Pass the handler
                         agentId={agentId} // Still pass agentId if needed for sub-component actions (like delete in GeneralConfig)
                     />
                 ) : (
                      <div className={`text-center py-10 ${uiColors.textDanger}`}>
                          Error: Configuration component not found for tab '{activeTab}'.
                      </div>
                 )}
            </motion.div>

        </motion.div>
    );
}