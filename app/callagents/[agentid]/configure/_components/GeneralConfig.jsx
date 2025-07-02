"use client";

import React, { useState, useEffect } from 'react'; // Keep useEffect if initial setup is needed
import Image from 'next/image';
import { FiCheck, FiTrash2, FiX } from 'react-icons/fi'; // Include FiX for vocab remove

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Correct import path

// Receive config data and the change handler from the parent page
// The agentId prop is still useful for the Delete Agent action
function GeneralConfig({ config, onConfigChange, agentId }) {

    // No longer need individual useState for each form field like agentName, voiceEngine, etc.
    // Their values come from the 'config' prop.
    // Only need state for temporary input like 'newVocabTerm'.
     const [newVocabTerm, setNewVocabTerm] = useState('');

    // Placeholder function for image handling (more complex in reality)
    // This would ideally trigger an API call to remove/update the avatarUrl
    const handleRemoveImage = () => {
        // In a real app, you'd call an API here, then update the state via onConfigChange
        console.log(`[GeneralConfig] Removing image for agent ${agentId} (simulated)`);
        onConfigChange('avatarUrl', null); // Update parent state to null
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
    const handleDeleteAgent = () => {
        if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
            console.log(`[GeneralConfig] Deleting agent ${agentId}`);
            // Implement actual deletion logic (API call, redirect)
            // This would be a separate API call (DELETE /api/callagents/[agentid])
            alert(`Agent ${agentId} deleted (simulated)`);
            // After successful deletion, you'd redirect the user, likely to the main /callagents page
            // router.push('/callagents');
        }
    };

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
                 <label htmlFor="knowledgeBase" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Knowledge Base
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Fine-tune the agent to your needs.
                 </p>
                 {/* This UI element needs to correctly update config.knowledgeBaseId (integer or null) */}
                 {/* This will likely involve fetching a list of available KBs and letting the user select one */}
                 {/* For now, it remains a placeholder showing the current KB ID if available */}
                 <div className={`p-3 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} w-full sm:max-w-md ${uiColors.textPlaceholder} text-sm flex items-center justify-between`}>
                    <span>
                        {config.knowledgeBaseId ? `Linked KB ID: ${config.knowledgeBaseId}` : 'No Knowledge Base linked'}
                    </span>
                     {/* Add buttons to link/unlink KB here, which would call onConfigChange('knowledgeBaseId', newKbId or null) */}
                    {/* <button>Link KB</button> {config.knowledgeBaseId && <button>Unlink KB</button>} */}
                 </div>
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
                     onClick={handleDeleteAgent} // Use the delete handler
                      className={`px-4 py-2 text-lg font-semibold rounded-md transition-colors ${uiColors.alertDangerButtonBg} ${uiColors.alertDangerButtonText} ${uiColors.alertDangerButtonHoverBg}`}
                 >
                     Delete Agent
                 </button>
            </div>


        </div>
    );
}

export default GeneralConfig;