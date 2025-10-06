"use client";

import React, { useState, useEffect } from 'react'; // Keep useEffect if initial setup is needed
import Image from 'next/image';
import { FiCheck, FiChevronRight, FiLoader, FiTrash2, FiX } from 'react-icons/fi'; // Include FiX for vocab remove

import { toast } from 'react-hot-toast';

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Correct import path
import { useRouter } from 'next/navigation';
import SelectKnowledgeBaseModal from './SelectKnowledgeBaseModal'; // Adjust path



// Receive config data and the change handler from the parent page
// The agentId prop is still useful for the Delete Agent action
function GeneralConfig({ config, onConfigChange, agentId }) {

    const [isSettingUpSheet, setIsSettingUpSheet] = useState(false);

    // State for the Select KB Modal visibility
     const [isSelectKbModalOpen, setIsSelectKbModalOpen] = useState(false);
     // No need for state to store the selected KB ID locally, it's in `config.knowledgeBaseId`

const [isDeleting, setIsDeleting] = useState(false); // State to handle deletion loading

    // No longer need individual useState for each form field like agentName, voiceEngine, etc.
    // Their values come from the 'config' prop.
    // Only need state for temporary input like 'newVocabTerm'.
     const [newVocabTerm, setNewVocabTerm] = useState('');
    
     const router=useRouter();
     
    // Placeholder function for image handling (more complex in reality)
    // This would ideally trigger an API call to remove/update the avatarUrl
    const handleRemoveImage = () => {
        // In a real app, you'd call an API here, then update the state via onConfigChange
        console.log(`[GeneralConfig] Removing image for agent ${agentId} (simulated)`);
        onConfigChange('avatarUrl', null); // Update parent state to null
    };

     const handleSetupSheet = async () => {
        setIsSettingUpSheet(true);
        toast.loading("Setting up Google Sheet...");

        try {
            const response = await fetch(`/api/callagents/${agentId}/integrations/google-sheets/setup`, {
                method: 'POST',
            });

            const result = await response.json();
            toast.dismiss();

            if (!response.ok) {
                throw new Error(result.error || "Failed to set up Google Sheet.");
            }

            // The API returns the new sheet data { spreadsheetId, spreadsheetUrl }
            // We need to update the parent component's state to reflect this change immediately.
            onConfigChange('integrationConfig', {
                ...config.integrationConfig,
                googleSheets: result,
            });

            toast.success("Google Sheet configured successfully!");

        } catch (error) {
            toast.dismiss();
            toast.error(error.message);
            console.error("Error setting up Google Sheet:", error);
        } finally {
            setIsSettingUpSheet(false);
        }
    };

    // Handler for adding vocabulary
    const handleAddVocab = (e) => {
        e.preventDefault();
        const term = newVocabTerm.trim();
        // Check if term is not empty and not already in the vocabulary list
        if (term && !config.customVocabulary.includes(term)) {
             // Create a new array and pass it to the parent handler
            onConfigChange('customVocabulary', [...config.customVocabulary, term]);
            setNewVocabTerm(''); // Clear the input field
        }
    };

    // Handler for removing vocabulary
    const handleRemoveVocab = (termToRemove) => {
        // Filter the current vocabulary list from the config prop
        const updatedVocabulary = config.customVocabulary.filter(term => term !== termToRemove);
        // Pass the new array to the parent handler
        onConfigChange('customVocabulary', updatedVocabulary);
    };
    

    // Placeholder function for deleting agent
     const handleDeleteAgent = async () => {
        if (confirm('Are you sure you want to delete this agent? This will permanently erase all associated data, including call logs. This action cannot be undone.')) {
            setIsDeleting(true);
            try {
                const response = await fetch(`/api/callagents/${agentId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to delete the agent.');
                }

                 // Redirect to the main agents page after successful deletion
                router.push('/callagents');
                router.refresh(); // Force a refresh to update the agent list

            } catch (error) {
                console.error('[GeneralConfig] Error deleting agent:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

     // --- Handlers for the Select KB Modal ---
     const handleOpenSelectKbModal = () => {
         setIsSelectKbModalOpen(true);
     };

     const handleCloseSelectKbModal = () => {
         setIsSelectKbModalOpen(false);
     };

     // Handler for when a KB is selected in the modal
     // Receives the selected KB object OR null (if "No KB" is selected)
     const handleKnowledgeBaseSelected = (selectedKb) => {
         console.log("[GeneralConfig] Knowledge Base selected in modal:", selectedKb);
         // Update the parent's state using onConfigChange
          // Set the knowledgeBaseId field to the selected KB's ID or null
         onConfigChange('knowledgeBaseId', selectedKb ? selectedKb.id : null);
         // The modal is closed by its own handler after selection
     };

     // --- Fetch the name of the currently linked KB ---
     // We need to display the *name* of the linked KB, not just the ID.
     // This requires fetching the KB details based on config.knowledgeBaseId.
     // This is a common pattern: fetch related data based on a foreign key.
     const [linkedKbName, setLinkedKbName] = useState(null);
     const [isLoadingLinkedKb, setIsLoadingLinkedKb] = useState(false);
     const [linkedKbError, setLinkedKbError] = useState(null);

     useEffect(() => {
        // Fetch linked KB details only if knowledgeBaseId is set in config
        if (config?.knowledgeBaseId) {
             const loadLinkedKb = async () => {
                 setIsLoadingLinkedKb(true);
                 setLinkedKbError(null);
                 setLinkedKbName(null); // Clear previous name while loading

                 try {
                      // *** Call the GET /api/knowledgebases/[kbid] API to get KB details ***
                      // Pass config.knowledgeBaseId to the API
                      const response = await fetch(`/api/knowledgebases/${config.knowledgeBaseId}`);
                      if (!response.ok) {
                          // If the linked KB doesn't exist or is private and not owned, this will return 404/403
                           console.error(`[GeneralConfig] Failed to fetch linked KB ${config.knowledgeBaseId}:`, response.status);
                           // Set error and name to indicate it's not found/accessible
                           setLinkedKbError('Linked Knowledge Base not found or inaccessible.');
                           setLinkedKbName('Error loading KB details'); // Indicate error in UI
                           // Decide if you want to auto-unlink it in this case
                           // if (response.status === 404 || response.status === 403) {
                           //     onConfigChange('knowledgeBaseId', null);
                           //     toast.error('Linked Knowledge Base not found or inaccessible, link removed.');
                           // }
                      } else {
                          const linkedKb = await response.json();
                          console.log("[GeneralConfig] Fetched linked KB details:", linkedKb);
                          // Set the name from the fetched data
                          setLinkedKbName(linkedKb.name || 'Unnamed Knowledge Base');
                      }
                 } catch (err) {
                     console.error('[GeneralConfig] Error fetching linked KB details:', err);
                     setLinkedKbError('Error loading linked KB details.');
                     setLinkedKbName('Error loading KB details');
                 } finally {
                     setIsLoadingLinkedKb(false);
                 }
             };

             loadLinkedKb();

        } else {
             // If knowledgeBaseId is null, set the linked KB name state to indicate nothing is linked
            setLinkedKbName(null);
             setIsLoadingLinkedKb(false); // Not loading
             setLinkedKbError(null); // No error
        }
        // Dependency array: Re-run this effect whenever config.knowledgeBaseId changes
    }, [config?.knowledgeBaseId]);



    // Guard clause: If config is not yet loaded, render nothing or a loader
     if (!config) {
         // This shouldn't happen if parent page waits for config, but is good practice
         return null;
     }


    return (
        <div className="space-y-8">

            {/* Agent Name */}
            <div>
                <label htmlFor="agentName" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                    Agent Name
                </label>
                <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                    What name will your agent go by.
                </p>
                 <input
                     type="text"
                     id="agentName"
                     value={config.name || ''} // Use value from config, handle potential null/undefined
                     onChange={(e) => onConfigChange('name', e.target.value)} // Call parent handler
                     className={`block w-full sm:max-w-md p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     placeholder="Enter agent name"
                 />
            </div>

            {/* Image */}
            <div>
                <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                    Image
                </label>
                <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                    An optional image that will be displayed in your agents list.
                </p>
                <div className="flex items-center space-x-4">
                     {/* Use avatarUrl from config */}
                     {config.avatarUrl && (
                         <div className="flex-shrink-0">
                             <Image
                                 src={config.avatarUrl}
                                 alt="Agent Avatar"
                                 width={64}
                                 height={64}
                                 className="rounded-md object-cover" // Added object-cover
                             />
                         </div>
                     )}
                    <div className="flex flex-col items-start">
                         <p className={`text-md ${uiColors.textPlaceholder} mb-2`}>
                             Recommended size: 250px x 250px
                         </p>
                         {/* Placeholder for file upload button */}
                         {/* You'd replace this with actual file input logic */}
                         {/* <button className={`px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}>
                             Upload Image
                         </button> */}
                         {/* Show remove button only if an image exists */}
                         {config.avatarUrl && (
                              <button
                                  onClick={handleRemoveImage} // Use the handler
                                  className={`inline-flex items-center px-3 py-1.5 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textSecondary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}
                              >
                                  <FiTrash2 className="mr-1 w-4 h-4" /> Remove
                              </button>
                         )}
                    </div>
                </div>
            </div>

            {/* Voice Engine */}
            <div>
                <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                    Voice Engine
                </label>
                <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                    The system that orchestrates your agent's speaking, listening, and reasoning capabilities
                     <a href="#" target="_blank" rel="noopener noreferrer" className={`ml-1 ${uiColors.textAccent} ${uiColors.hoverTextAccentContrast}`}>
                         Learn more <FiCheck className="inline w-3 h-3 ml-0.5 -mt-0.5" /> {/* FiCheck seems odd here, maybe FiExternalLink? */}
                     </a>
                </p>
                <div className="flex rounded-md border ${uiColors.borderPrimary} overflow-hidden w-fit">
                    <button
                        className={`px-4 py-2 text-lg font-medium transition-colors ${
                            config.voiceEngine === 'v1'
                                ? `${uiColors.accentPrimaryGradient} text-white`
                                : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                        onClick={() => onConfigChange('voiceEngine', 'v1')} // Call parent handler
                    >
                        Version 1.0
                    </button>
                    <button
                        className={`px-4 py-2 text-lg font-medium transition-colors ${
                            config.voiceEngine === 'v2'
                                ? `${uiColors.accentPrimaryGradient} text-white`
                                : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                        onClick={() => onConfigChange('voiceEngine', 'v2')} // Call parent handler
                    >
                        Version 2.0
                    </button>
                </div>
            </div>

             {/* AI Model */}
             <div>
                 <label htmlFor="aiModel" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     AI Model
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Opt for speed or depth to suit your agent's role
                 </p>
                 <div className="flex items-center space-x-4">
                     {/* Display the current AI Model name from config */}
                     <div className={`flex items-center p-2 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}>
                         <div className={`w-5 h-5 mr-2 flex items-center justify-center rounded-full ${uiColors.accentBadgeBg} ${uiColors.accentBadgeText}`}>AI</div>
                         <span className={`${uiColors.textPrimary} text-lg font-medium`}>{config.aiModel || 'Not Selected'}</span> {/* Display current model */}
                     </div>
                      <select
                         id="aiModel"
                         value={config.aiModel || ''} // Use value from config
                         onChange={(e) => onConfigChange('aiModel', e.target.value)} // Call parent handler
                         className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         {/* Add available options. Hardcoded for now, but could be fetched */}
                         <option value="">Select Model</option>
                         <option value="gpt-4o">GPT-4o</option>
                         <option value="gpt-4-turbo">GPT-4 Turbo</option>
                         <option value="claude-3-opus">Claude 3 Opus</option>
                         {/* Add more options based on your backend */}
                     </select>
                 </div>
            </div>

            {/* Timezone */}
             <div>
                 <label htmlFor="timezone" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Timezone
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The region in which your agent will be.
                 </p>
                 <select
                     id="timezone"
                     value={config.timezone || ''} // Use value from config
                     onChange={(e) => onConfigChange('timezone', e.target.value)} // Call parent handler
                     className={`form-select block p-2 w-fit text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     {/* Add available options. Hardcoded for now, but could be fetched */}
                     <option value="">Select Timezone</option>
                     <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                     <option value="America/New_York">America/New_York</option>
                     <option value="Europe/London">Europe/London</option>
                     <option value="Asia/Tokyo">Asia/Tokyo</option>
                     {/* Add more options */}
                 </select>
            </div>

            {/* Knowledge Base */}
             <div>
                 <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Knowledge Base
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Fine-tune the agent by linking a knowledge base.
                 </p>
                 <div className={`p-3 rounded-md border ${uiColors.borderPrimary} w-full sm:max-w-md flex items-center justify-between ${uiColors.bgSecondary} cursor-pointer ${uiColors.hoverBgSubtle}`}
                      onClick={handleOpenSelectKbModal} // *** Open modal on click ***
                 >
                    {isLoadingLinkedKb ? (
                         <span className={`text-sm ${uiColors.textSecondary} flex items-center`}>
                              <FiLoader className="animate-spin mr-2" /> Loading linked KB...
                         </span>
                    ) : linkedKbError ? (
                         <span className={`text-sm ${uiColors.textDanger}`}>{linkedKbError}</span>
                    ) : config.knowledgeBaseId ? (
                         // Display the fetched linked KB name and ID
                         <span className={`text-sm ${uiColors.textPrimary}`}>
                              Linked: <strong className="font-medium">{linkedKbName || 'Loading...'}</strong> (ID: {config.knowledgeBaseId})
                         </span>
                    ) : (
                         // Display 'No Knowledge Base linked' when ID is null
                         <span className={`text-sm ${uiColors.textSecondary}`}>No Knowledge Base linked</span>
                    )}
                     {/* Icon indicating clickable */}
                     <FiChevronRight className={`w-5 h-5 ${uiColors.textSecondary}`} />
                 </div>
                  {/* Optional: Link to view the linked KB on the KB detail page (if exists and isOwner or public) */}
                   {config.knowledgeBaseId && !isLoadingLinkedKb && !linkedKbError && (
                       <div className="mt-2 text-sm">
                           {/* You need to determine if the linked KB is accessible/owned to show this link */}
                           {/* A more complex implementation might require fetching the KB's isOwner/isPublic status here */}
                           {/* For now, assuming you can link, you can view if accessible */}
                            {/* <a href={`/callagents/knowledgebase/${config.knowledgeBaseId}`} target="_blank" rel="noopener noreferrer" className={uiColors.textAccent}>
                                View Knowledge Base <FiCheck className="inline w-3 h-3 ml-0.5 -mt-0.5" />
                            </a> */}
                       </div>
                   )}
             </div>


            {/* Custom Vocabulary */}
             <div>
                 <label htmlFor="newVocabTerm" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Custom Vocabulary
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Add business terms to improve accuracy and recognition.
                 </p>
                <form onSubmit={handleAddVocab} className="flex space-x-2 w-full sm:max-w-md">
                     <input
                         type="text"
                         id="newVocabTerm"
                         value={newVocabTerm}
                         onChange={(e) => setNewVocabTerm(e.target.value)} // newVocabTerm uses local state
                         className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                         placeholder="Start typing to add"
                     />
                     <button
                         type="submit"
                         disabled={!newVocabTerm.trim()}
                         className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            !newVocabTerm.trim() ? 'opacity-50 cursor-not-allowed' : `${uiColors.accentPrimaryGradient}`
                         }`}
                     >
                         Add
                     </button>
                 </form>
                 {/* Use customVocabulary from config */}
                 {config.customVocabulary && config.customVocabulary.length > 0 && (
                     <div className="mt-3 flex flex-wrap gap-2">
                         {config.customVocabulary.map((term, index) => (
                              <span key={term + index} className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                  {term}
                                  <button
                                      onClick={() => handleRemoveVocab(term)} // Use the handler
                                      className={`ml-1.5 -mr-0.5 h-3 w-3 flex-shrink-0 ${uiColors.accentBadgeText} ${uiColors.hoverTextSecondary}`}
                                  >
                                       <FiX className="h-3 w-3" />
                                  </button>
                              </span>
                         ))}
                     </div>
                 )}
            </div>

            {/* Use Realistic Filler Words Toggle */}
             <div className="flex items-center justify-between w-full sm:max-w-md">
                 <div>
                     <label htmlFor="fillerWordsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Use Realistic Filler Words
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          If enabled, the agent will include natural filler words like 'uh' and 'um'.
                     </p>
                 </div>
                 {/* Toggle button */}
                 <button
                      id="fillerWordsToggle"
                      // Use value from config, pass new boolean to handler
                     onClick={() => onConfigChange('useFillerWords', !config.useFillerWords)}
                     className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                 ${config.useFillerWords ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                 >
                     <span className={`sr-only`}>Use realistic filler words</span>
                      <span
                         aria-hidden="true"
                         className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                     ${config.useFillerWords ? 'translate-x-5' : 'translate-x-0'}`}
                     ></span>
                 </button>
            </div>

             {/* Agent Status (Optional field to configure here) */}
             <div>
                 <label htmlFor="agentStatus" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Agent Status
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Control whether your agent is active or paused.
                 </p>
                 <select
                     id="agentStatus"
                     value={config.status || ''} // Use value from config
                     onChange={(e) => onConfigChange('status', e.target.value)} // Call parent handler
                     className={`form-select block p-2 w-fit text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     {/* Add available status options */}
                     <option value="draft">Draft</option>
                     <option value="active">Active</option>
                     <option value="paused">Paused</option>
                     <option value="archived">Archived</option>
                 </select>
            </div>


{/* --- NEW SECTION: Google Sheets Integration --- */}
            <div>
                <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                    Google Sheets Export
                </label>
                <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                    Automatically create and link a Google Sheet to this agent for call data exports.
                </p>
                {config.integrationConfig?.googleSheets?.spreadsheetUrl ? (
                    // State 1: Already configured
                    <div className={`p-3 rounded-md border ${uiColors.borderPrimary} w-full sm:max-w-md flex items-center justify-between ${uiColors.bgSecondary}`}>
                        <div className="flex items-center text-sm">
                            <FiCheck className={`w-5 h-5 mr-2 text-green-500`} />
                            <span className={`${uiColors.textPrimary}`}>Export is configured.</span>
                        </div>
                        <a 
                            href={config.integrationConfig.googleSheets.spreadsheetUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient}`}
                        >
                            View Sheet <FiExternalLink className="ml-1.5 w-3 h-3" />
                        </a>
                    </div>
                ) : (
                    // State 2: Not configured, show setup button
                    <button
                        onClick={handleSetupSheet}
                        disabled={isSettingUpSheet}
                        className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors text-white ${uiColors.accentPrimaryGradient} disabled:opacity-50`}
                    >
                        {isSettingUpSheet ? (
                            <FiLoader className="animate-spin mr-2" />
                        ) : (
                            <FiCheck className="mr-2" />
                        )}
                        {isSettingUpSheet ? 'Setting Up...' : 'Setup Google Sheets Export'}
                    </button>
                )}
                 <p className={`text-xs mt-2 ${uiColors.textPlaceholder}`}>
                    Note: You must have your Google account connected in the main Integrations tab first.
                 </p>
            </div>

            {/* Delete Agent */}
            {/* This button doesn't update config state, it performs a separate action */}
            <div className={`p-4 rounded-md border ${uiColors.alertDangerBorder} ${uiColors.alertDangerBg} w-full sm:max-w-md`}>
                <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                    Delete Agent
                </label>
                <p className={`text-xs mb-4 ${uiColors.textPlaceholder}`}>
                    Deleting agents will mean erasing personalized data, voice profiles, and integrations.
                </p>
                <button
                    onClick={handleDeleteAgent}
                    disabled={isDeleting} // Disable button while deleting
                    className={`inline-flex items-center px-4 py-2 text-lg font-semibold rounded-md transition-colors text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed`}
                >
                    {isDeleting ? (
                        <>
                            <FiLoader className="animate-spin mr-2" /> Deleting...
                        </>
                    ) : (
                        <>
                           <FiTrash2 className="mr-2" /> Delete Agent
                        </>
                    )}
                </button>
            </div>

            {/* *** Render the Select KB Modal *** */}
             <SelectKnowledgeBaseModal
                 isOpen={isSelectKbModalOpen}
                 onClose={handleCloseSelectKbModal}
                 onSelectKb={handleKnowledgeBaseSelected} // Pass the selection handler
                  selectedKbId={config.knowledgeBaseId} // Pass the currently selected KB ID for highlighting
             />


        </div>
    );
}

export default GeneralConfig;