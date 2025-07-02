"use client";

import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation'; // No longer strictly needed, but can keep if you use it elsewhere
import { motion } from 'framer-motion';
import {
    FiSave, FiEdit3, FiFileText, FiCpu, FiCheck, FiBookOpen, FiLoader // Icons
} from 'react-icons/fi'; // Import necessary icons, including FiLoader
import { toast } from 'react-hot-toast'; // Assuming you use react-hot-toast or similar

// Import context hook
import { useCallAgent } from '../_context/CallAgentContext';

// Import components
import UseTemplateModal from './_component/UseTemplateModal'; // Use _components path
import AskDoweitChatModal from './_component/AskDoweitChatModal'; // Use _components path

// Import constants
import { uiColors } from '../../_constants/uiConstants';    // Adjust path as necessary
import { sectionVariants, itemVariants } from '../../_constants/uiConstants'; // Assuming these are still used for animation

// Helper function to make the API call for saving (can be shared or duplicated)
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


export default function PromptPage() {
    // Get initial agent data from context provided by the layout
    const initialAgent = useCallAgent();

    // State for editable prompt content - Initialize with values from initialAgent in useEffect
    const [greetingMessage, setGreetingMessage] = useState('');
    const [promptText, setPromptText] = useState('');

    // Note: knowledgeBaseId is linked in General Config.
    // The "Knowledge Base" section here might display its content if fetched,
    // but we won't manage the *content* state directly for saving via the config API.
    // The modal handler `onAddKnowledgeBase` will simply append to `promptText` for now,
    // as per the simplification discussed in thought process.
    const [linkedKnowledgeBaseId, setLinkedKnowledgeBaseId] = useState(null); // To display the linked KB ID

    // State for UI control
    const [isEditing, setIsEditing] = useState(false); // Controls if prompt textarea is editable
    const [isFlowDesignerEnabled, setIsFlowDesignerEnabled] = useState(false); // Controls Prompt/Flow Designer toggle
    const [showTemplateModal, setShowTemplateModal] = useState(false); // Controls Use Template modal
    const [showDoweitChatModal, setShowDoweitChatModal] = useState(false); // Controls Ask DoweitChat modal

    // State to track loading/saving status and dirty state
    const [isLoading, setIsLoading] = useState(true); // Loading initial data from context
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [isDirty, setIsDirty] = useState(false); // Track if changes have been made

    // Get agentId from the initialAgent object
    const agentId = initialAgent?.id;

    // Effect to initialize prompt state when the initialAgent object is available
    useEffect(() => {
        if (initialAgent) {
            // Populate state from initial agent data
            setGreetingMessage(initialAgent.greetingMessage || ''); // Use empty string for null/undefined
            setPromptText(initialAgent.prompt || ''); // Use empty string for null/undefined
            setLinkedKnowledgeBaseId(initialAgent.knowledgeBaseId); // Set linked KB ID for display
            setIsLoading(false); // Data is loaded from context

            // Reset dirty state and error when initialized
            setIsDirty(false);
            setSaveError(null);
        } else {
             // This case should ideally not happen if layout works correctly,
             // but handle it just in case or show loading/error
             setIsLoading(true); // Stay loading or show error if initialAgent is null
             // Optionally redirect or show error if initialAgent remains null after some time
        }
    }, [initialAgent]); // Dependency on initialAgent


    // Handlers for Modals
    const openTemplateModal = () => setShowTemplateModal(true);
    const closeTemplateModal = () => setShowTemplateModal(false);
    const openDoweitChatModal = () => setShowDoweitChatModal(true);
    const closeDoweitChatModal = () => setShowDoweitChatModal(false);

    // Handler for Edit Prompt Button
    const handleEditToggle = () => {
        // If exiting edit mode and dirty, ask user if they want to discard
        if (isEditing && isDirty) {
            if (!confirm("You have unsaved changes. Discard changes?")) {
                return; // Stop the toggle if user cancels
            }
            // If discarding, reset state to initialAgent data
            if (initialAgent) {
                 setGreetingMessage(initialAgent.greetingMessage || '');
                 setPromptText(initialAgent.prompt || '');
                 setIsDirty(false); // Reset dirty state
            }
        }
        setIsEditing(!isEditing);
    };

    // Handler for Save Button
    const handleSave = async () => {
        if (!isDirty || isSaving || isLoading || !agentId) {
            // Don't save if no changes, already saving, loading, or agentId is missing
            return;
        }

        setIsSaving(true);
        setSaveError(null);

        try {
            console.log(`[Prompt Page] Saving prompt for agent ${agentId}:`);
            const dataToSave = {
                greetingMessage: greetingMessage,
                prompt: promptText,
                 // We are not saving knowledgeBaseContent directly via this API.
                 // knowledgeBaseId is handled in General Config.
                 // If the modal involved *selecting* a KB, we'd update knowledgeBaseId here.
            };
             console.log("Data to send to API:", dataToSave);

            const updatedAgent = await updateAgentConfig(agentId, dataToSave);

            // Success: Mark as clean, show toast
            setIsDirty(false);
            toast.success('Prompt saved successfully!');
            console.log("[Prompt Page] Prompt saved:", updatedAgent);

            // Optional: If you want the `initialAgent` context to update immediately,
            // you'd need a mechanism in CallAgentProvider or layout to refresh,
            // or manually update the initialAgent state if it was managed here (not recommended).
            // For now, relying on the page re-initializing from initialAgent on next load is fine.


        } catch (err) {
            console.error('[Prompt Page] Error saving prompt config:', err);
            setSaveError(err.message);
            toast.error(`Save failed: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for changes in Greeting Message input
    const handleGreetingChange = (e) => {
        setGreetingMessage(e.target.value);
        setIsDirty(true); // Mark as dirty
    };

     // Handler for changes in Prompt Textarea
    const handlePromptChange = (e) => {
        setPromptText(e.target.value);
        setIsDirty(true); // Mark as dirty
    };


    // Toggle for Prompt/Flow Designer
    const handleFlowDesignerToggle = () => {
         // Optional: Check for unsaved changes before switching
         if (!isFlowDesignerEnabled && isDirty) {
             if (!confirm("You have unsaved changes. Switching to Flow Designer will discard them. Continue?")) {
                 return; // Stop the toggle
             }
             // Discard changes if confirmed
              if (initialAgent) {
                  setGreetingMessage(initialAgent.greetingMessage || '');
                  setPromptText(initialAgent.prompt || '');
                  setIsDirty(false);
              }
         }
         setIsFlowDesignerEnabled(!isFlowDesignerEnabled);
          // If switching to Flow Designer, exit editing mode
         if (!isFlowDesignerEnabled) {
             setIsEditing(false);
         }
    };

    // Handler for using a template from the modal
    // This replaces the current prompt text
    const handleUseTemplate = (templatePrompt) => {
        console.log("[Prompt Page] Using template:", templatePrompt);
        setPromptText(templatePrompt); // Replace the main prompt text
        setIsDirty(true); // Mark as dirty
        setIsEditing(true); // Automatically enter editing mode if using a template
        closeTemplateModal(); // Close the modal
         toast.success('Template applied! Remember to Save.');
    };

    // Handler for adding knowledge base content from the modal
    // For simplicity, this appends to the main prompt text.
    // A more complex implementation would save to a separate KB entry.
    const handleAddKnowledgeBase = (kbContent) => {
         console.log("[Prompt Page] Adding KB content:", kbContent);
         setPromptText(prevPrompt => {
             // Append the new content, maybe with a separator if existing content exists
             const separator = prevPrompt.trim() ? "\n\n---\n\nKnowledge Base Content:\n\n" : "Knowledge Base Content:\n\n"; // Add a clear separator
             return prevPrompt.trim() + separator + kbContent.trim();
        });
        setIsDirty(true); // Mark as dirty
         setIsEditing(true); // Automatically enter editing mode if adding KB content
        closeTemplateModal(); // Close the modal
         toast.success('Knowledge Base content added to prompt! Remember to Save.');
    };


    // Show loading state if initial agent data is not yet ready
     if (isLoading || !initialAgent) {
         return (
             <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                 <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" />
                 Loading prompt configuration...
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

            {/* Prompt Header/Controls */}
            <motion.div
                 className={`flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
            >
                {/* Left: Title and Toggle */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>Prompt & Knowledge</h2>
                     {/* Flow Designer Toggle */}
                     <div className="flex items-center">
                         <button
                              onClick={handleFlowDesignerToggle}
                             className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary} mr-2
                                         ${isFlowDesignerEnabled ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                             id="flowDesignerToggle"
                         >
                             <span className={`sr-only`}>Enable Flow Designer</span>
                              <span
                                 aria-hidden="true"
                                 className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                             ${isFlowDesignerEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                             ></span>
                         </button>
                          <label htmlFor="flowDesignerToggle" className={`text-sm font-medium ${uiColors.textSecondary} cursor-pointer`}>Flow Designer</label>
                     </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap w-full sm:w-auto sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-end"> {/* Added justify-end */}
                    <button
                         onClick={openTemplateModal}
                         className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none w-full sm:w-auto`}
                     >
                         <FiFileText className="mr-2 w-4 h-4" /> Use a template
                     </button>
                     <button
                         onClick={openDoweitChatModal}
                         className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none w-full sm:w-auto`}
                     >
                         <FiCpu className="mr-2 w-4 h-4" /> Ask DoweitChat
                     </button>
                     {/* Edit/Done Editing Button */}
                     <button
                         onClick={handleEditToggle}
                          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isEditing ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`} ${uiColors.ringAccentShade} focus:ring-1 outline-none w-full sm:w-auto`}
                     >
                          <FiEdit3 className="mr-2 w-4 h-4" /> {isEditing ? 'Done Editing' : 'Edit Prompt'}
                     </button>
                </div>
            </motion.div>

             {saveError && ( // Display save error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error saving configuration: {saveError}
                  </div>
             )}


            {/* Conditional Rendering: Prompt Text Area or Flow Designer Placeholder */}
             {!isFlowDesignerEnabled ? ( // Show text area if Flow Designer is NOT enabled
                 <>
                     {/* Greeting Message */}
                     <motion.div
                          className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                         variants={sectionVariants}
                         // Ensure correct animation state based on overall page animation
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: 0.1 }}
                     >
                          <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Greeting message</h3>
                          <input
                             type="text"
                             value={greetingMessage}
                             onChange={handleGreetingChange} // Use the handler
                             id="greetingMessageInput"
                              className={`block w-full p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}`}
                              disabled={!isEditing} // Disable if not editing
                         />
                     </motion.div>

                     {/* Prompt */}
                      <motion.div
                           className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                          variants={sectionVariants}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: 0.15 }}
                      >
                          <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Prompt</h3>
                           <textarea
                               value={promptText}
                               onChange={handlePromptChange} // Use the handler
                               id="promptTextInput"
                                className={`block w-full h-96 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y
                                            ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}`}
                                disabled={!isEditing} // Disable if not editing
                                placeholder="Enter your agent prompt here..."
                           >
                           </textarea>
                      </motion.div>

                     {/* Linked Knowledge Base Info (Display Only) */}
                     {/* Show info about the linked KB if one exists */}
                     <motion.div
                          className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                          variants={sectionVariants}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ duration: 0.3, delay: 0.2 }}
                     >
                         <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Linked Knowledge Base</h3>
                         {linkedKnowledgeBaseId ? (
                              <div className={`flex items-center p-3 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} ${uiColors.textPrimary}`}>
                                   <FiBookOpen className="mr-3 w-5 h-5" />
                                   <span>Knowledge Base linked (ID: {linkedKnowledgeBaseId}). Configure content in General Settings or a dedicated KB page.</span>
                                   {/* Link to KB config page could go here */}
                              </div>
                         ) : (
                              <div className={`${uiColors.textPlaceholder} text-sm`}>
                                  No Knowledge Base is currently linked to this agent. You can link one in the <span className={`${uiColors.textAccent}`}>General Settings</span> tab.
                              </div>
                         )}
                     </motion.div>


                     {/* Save Button - Only visible when editing AND dirty */}
                     {isEditing && isDirty && (
                          <motion.div
                             variants={itemVariants}
                             initial="hidden"
                             animate="visible"
                             className="flex justify-end"
                             transition={{ duration: 0.3, delay: 0.25 }} // Add animation delay
                          >
                             <button
                                  onClick={handleSave}
                                  disabled={isSaving || isLoading || !isDirty} // Disable if saving, loading, or not dirty
                                   className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                             >
                                  {isSaving ? <FiLoader className="animate-spin mr-2 w-5 h-5" /> : <FiSave className="mr-2 w-5 h-5" />}
                                  {isSaving ? 'Saving...' : 'Save Changes'}
                             </button>
                          </motion.div>
                     )}
                 </>
             ) : (
                 // Placeholder for Flow Designer UI
                 <motion.div
                      className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 text-center ${uiColors.textSecondary}`}
                      variants={sectionVariants}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ duration: 0.3, delay: 0.1 }}
                 >
                      <h3 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Flow Designer (Placeholder)</h3>
                      <p>Flow Designer UI would be rendered here. It would likely use the prompt text as a starting point or alternative view.</p>
                      <p className="text-sm mt-2">Switch the toggle off to see the text prompt editor.</p>
                 </motion.div>
             )}


            {/* Render Modals */}
             <UseTemplateModal
                isOpen={showTemplateModal}
                onClose={closeTemplateModal}
                onUseTemplate={handleUseTemplate} // Pass handler for using a template
                 // Pass the simplified handler for adding KB content (appends to prompt)
                onAddKnowledgeBase={handleAddKnowledgeBase}
             />
             <AskDoweitChatModal
                isOpen={showDoweitChatModal}
                onClose={closeDoweitChatModal}
                agentId={agentId} // Pass agentId
                 agent={initialAgent} // Pass the whole agent object for context
             />

        </motion.div>
    );
}