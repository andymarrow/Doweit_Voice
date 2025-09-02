"use client";

import React, { useState } from 'react';
import { FiPlay, FiEdit3, FiVolume2 } from 'react-icons/fi';

// Import the reusable Voice Modal component
import VoiceModal from '@/app/characterai/create/_components/VoiceModal'; // Adjust path based on actual location

// Import constants - Adjust path as necessary
import { uiColors } from '../../../_constants/uiConstants'; // Using the path provided


// Receive config data (specifically the voiceConfig part is most relevant) and the change handler
function VoiceConfig({ config, onConfigChange, agentId }) {
     // We still need local state for the modal visibility
     const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    // Use the voiceConfig object from the parent's config prop
    const voiceConfig = config?.voiceConfig || {}; // Use empty object if voiceConfig is null/undefined

    // Handlers for Modals
    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);

    // Handler to receive the selected voice from the modal
    // This will update the 'voiceConfig' field in the parent state
    const handleVoiceSelected = (voice) => {
        console.log("[VoiceConfig] Voice selected from modal:", voice);
        // Update the voiceConfig in the parent state with the new voice details
        onConfigChange('voiceConfig', {
            ...voiceConfig, // Keep existing voiceConfig properties
            voiceId: voice.voiceId,
            voiceName: voice.name,
            voiceProvider: voice.platform, // Map platform to provider
            // You might want to store other voice details here too
            // e.g., voiceAvatarUrl: voice.avatar,
            // gender: voice.gender, accent: voice.accent
        });
        // Close the modal
        closeVoiceModal();
    };

    // Helper to update a nested field within voiceConfig
    const handleVoiceConfigChange = (field, value) => {
        // Call the parent handler with the updated voiceConfig object
        onConfigChange('voiceConfig', {
            ...voiceConfig,
            [field]: value
        });
    };


    // Placeholder functions (using the current voiceConfig state)
    const handleListenVoice = () => {
        if (voiceConfig.voiceId) {
            console.log(`[VoiceConfig] Listening to voice ID: ${voiceConfig.voiceId} (simulated)`);
            alert(`Simulating playing voice: ${voiceConfig.voiceName || voiceConfig.voiceId}`); // Placeholder
            // Implement actual audio playback using voiceConfig.voiceId or audio file
        } else {
            alert("No voice selected to listen to.");
        }
    };

    const handleEditVoice = () => {
         if (voiceConfig.voiceId) {
             console.log(`[VoiceConfig] Editing voice ID: ${voiceConfig.voiceId} (simulated)`);
             alert(`Simulating editing voice: ${voiceConfig.voiceName || voiceConfig.voiceId}`); // Placeholder - could open a modal/page
             // Implement navigation or modal for editing the voice settings if your voice provider allows
         } else {
             alert("No voice selected to edit.");
         }
    };

    // Guard clause: If config or voiceConfig is not yet loaded, render nothing or a loader
     if (!config) {
         return null;
     }


    return (
        <div className="space-y-8">

            {/* Language - Assuming this is a top-level field, not in voiceConfig JSONB */}
             <div>
                 <label htmlFor="language" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Language
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     The language your agent understands. Should be the same language as the agent speaks.
                 </p>
                 <select
                     id="language"
                     value={config.language || ''} // Use value from parent config state
                     onChange={(e) => onConfigChange('language', e.target.value)} // Call parent handler for top-level field
                     className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     {/* Add available options */}
                     <option value="english">English</option>
                     {/* Add other language options */}
                 </select>
            </div>


            {/* Voice Selection and Display */}
             <div>
                 <label className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Voice
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Choose the language and voice of the agent or clone your own.
                 </p>
                {/* Display Selected Voice or Placeholder */}
                 <div className={`flex items-center space-x-4 p-3 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} w-full sm:max-w-md`}>
                     {voiceConfig.voiceId ? (
                         <>
                             {/* Voice Avatar - Use a placeholder or actual avatar URL if stored */}
                             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                  {/* Use voiceConfig.voiceAvatarUrl if you stored it, otherwise a placeholder */}
                                 <img src={voiceConfig.voiceAvatarUrl || '/placeholder-avatar.jpg'} alt="Voice Avatar" width={40} height={40} className="rounded-full object-cover" />
                             </div>
                             {/* Voice Details */}
                              <div className="flex-grow">
                                   {/* Use name and provider from voiceConfig */}
                                  <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>{voiceConfig.voiceName || 'Unnamed Voice'}</div>
                                   {/* Add other details if stored, e.g., gender, accent */}
                                   <div className={`text-xs ${uiColors.textSecondary}`}>
                                       {voiceConfig.voiceProvider || 'Unknown Provider'}
                                  </div>
                                   <div className={`text-xs ${uiColors.textPlaceholder}`}>
                                       ID: {voiceConfig.voiceId}
                                  </div>
                              </div>
                              {/* Actions */}
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                  <button onClick={handleListenVoice} className={`p-1.5 rounded-md ${uiColors.hoverBgSubtle}`} title="Listen">
                                       <FiVolume2 className={`w-4 h-4 ${uiColors.textSecondary}`} />
                                  </button>
                                  {/* Edit button - if editing voice details is supported */}
                                  <button onClick={handleEditVoice} className={`p-1.5 rounded-md ${uiColors.hoverBgSubtle}`} title="Edit Voice Settings">
                                       <FiEdit3 className={`w-4 h-4 ${uiColors.textSecondary}`} />
                                  </button>
                              </div>
                         </>
                     ) : (
                         <span className={`${uiColors.textPlaceholder} text-sm`}>No voice selected</span>
                     )}
                 </div>

                 {/* Choose Voice Button - Opens Modal */}
                  <button
                      onClick={openVoiceModal} // Call handler to open the modal
                      className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle} ${uiColors.ringAccentShade} focus:ring-1 outline-none`}
                  >
                      Choose a Voice
                  </button>
            </div>

            {/* Patience Level */}
             <div>
                 <label htmlFor="patienceLevel" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Patience Level
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Adjust the response speed. Low for rapid exchanges, high for more focused turns with less crosstalk.
                 </p>
                 <div className="flex items-center space-x-4 w-full sm:max-w-md">
                     <select
                         id="patienceLevel"
                          // Use value from voiceConfig
                         value={voiceConfig.patienceLevel || ''} // Handle potential undefined/null
                         onChange={(e) => handleVoiceConfigChange('patienceLevel', e.target.value)} // Update voiceConfig
                         className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         {/* Add available options */}
                         <option value="">Select Level</option>
                         <option value="low">Low (~1 sec.)</option>
                         <option value="medium">Medium (~3 sec.)</option>
                         <option value="high">High (~5 sec.)</option>
                     </select>
                 </div>
            </div>

            {/* Stability */}
             <div>
                 {/* Use value from voiceConfig in label */}
                 <label htmlFor="stability" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Stability ({voiceConfig.stability !== undefined ? voiceConfig.stability.toFixed(2) : 'N/A'})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Lower settings may make the voice sound more expressive but less predictable, while higher settings make it sound steadier but less emotional.
                 </p>
                 <div className="flex justify-between text-xs ${uiColors.textPlaceholder} mb-2 w-full sm:max-w-md">
                      <span>Expressive</span>
                      <span>Dynamic</span>
                      <span>Balanced</span>
                      <span>Predictable</span>
                      <span>Stable</span>
                 </div>
                 <input
                     type="range"
                     id="stability"
                     min="0"
                     max="1"
                     step="0.01"
                      // Use value from voiceConfig, default to 0 if not set
                     value={voiceConfig.stability !== undefined ? voiceConfig.stability : 0}
                     onChange={(e) => handleVoiceConfigChange('stability', parseFloat(e.target.value))} // Update voiceConfig
                      className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
            </div>

             {/* Style Exaggeration */}
             <div>
                 {/* Use value from voiceConfig in label */}
                 <label htmlFor="styleExaggeration" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Style Exaggeration ({voiceConfig.styleExaggeration !== undefined ? voiceConfig.styleExaggeration.toFixed(1) : 'N/A'})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Enhances the distinct characteristics of the original voice, but may slow down processing and make the voice less stable.
                 </p>
                  <input
                     type="range"
                     id="styleExaggeration"
                     min="0"
                     max="1"
                     step="0.1"
                      // Use value from voiceConfig, default to 0 if not set
                     value={voiceConfig.styleExaggeration !== undefined ? voiceConfig.styleExaggeration : 0}
                     onChange={(e) => handleVoiceConfigChange('styleExaggeration', parseFloat(e.target.value))} // Update voiceConfig
                     className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
             </div>

            {/* Similarity */}
             <div>
                 {/* Use value from voiceConfig in label */}
                 <label htmlFor="similarity" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Similarity ({voiceConfig.similarity !== undefined ? voiceConfig.similarity.toFixed(2) : 'N/A'})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Determines how closely the AI matches the original voice. Higher values may include unwanted noise from the original recording.
                 </p>
                  <input
                     type="range"
                     id="similarity"
                     min="0"
                     max="1"
                     step="0.01"
                      // Use value from voiceConfig, default to 0 if not set
                     value={voiceConfig.similarity !== undefined ? voiceConfig.similarity : 0}
                     onChange={(e) => handleVoiceConfigChange('similarity', parseFloat(e.target.value))} // Update voiceConfig
                     className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
             </div>

            {/* Fade Out at Interruption */}
             <div>
                 {/* Use value from voiceConfig in label */}
                 <label htmlFor="fadeOutFrames" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Fade Out at Interruption ({voiceConfig.fadeOutFrames !== undefined ? voiceConfig.fadeOutFrames : 'N/A'} frames)
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Each frame is 20 ms. When you interrupt the bot the volume goes down slowly to 0 over that many frames. For example, 5 means 100 ms fadeout.
                 </p>
                  <input
                     type="number"
                     id="fadeOutFrames"
                     min="0"
                      // Use value from voiceConfig, default to 0 if not set, handle parsing
                     value={voiceConfig.fadeOutFrames !== undefined ? voiceConfig.fadeOutFrames : 0}
                     onChange={(e) => handleVoiceConfigChange('fadeOutFrames', parseInt(e.target.value, 10) || 0)} // Update voiceConfig
                     className={`block w-20 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Optimize Latency */}
             <div>
                 {/* Use value from voiceConfig in label */}
                 <label htmlFor="optimizeLatency" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Optimize Latency ({voiceConfig.optimizeLatency !== undefined ? voiceConfig.optimizeLatency : 'N/A'})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Balance voice quality and response time: lower settings improve quality, while higher settings reduce latency but may affect accuracy.
                 </p>
                  <input
                     type="number"
                     id="optimizeLatency"
                     min="0" max="4" // Assuming a max value based on context/API
                      // Use value from voiceConfig, default to 0 if not set, handle parsing
                     value={voiceConfig.optimizeLatency !== undefined ? voiceConfig.optimizeLatency : 0}
                     onChange={(e) => handleVoiceConfigChange('optimizeLatency', parseInt(e.target.value, 10) || 0)} // Update voiceConfig
                     className={`block w-20 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Voice Prompting */}
             {/* These fields are likely part of voiceConfig JSONB as well */}
             <div>
                 <label className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Voice Prompting
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Slightly alters voice intonation, pacing, and emotion for a subtle yet noticeable effect.
                 </p>
                 <div className="flex items-center space-x-2 w-full sm:max-w-lg">
                     <div>
                         <label htmlFor="voicePromptSubject" className="sr-only">Subject (e.g., He / She)</label>
                         <input
                              type="text"
                              id="voicePromptSubject"
                               // Use value from voiceConfig, handle potential undefined/null
                              value={voiceConfig.voicePromptSubject || ''}
                              onChange={(e) => handleVoiceConfigChange('voicePromptSubject', e.target.value)} // Update voiceConfig
                              className={`w-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                              placeholder="Subject"
                          />
                     </div>
                     <div>
                          <label htmlFor="voicePromptAction" className="sr-only">Action (e.g., said)</label>
                          <input
                             type="text"
                              id="voicePromptAction"
                              // Use value from voiceConfig, handle potential undefined/null
                             value={voiceConfig.voicePromptAction || ''}
                             onChange={(e) => handleVoiceConfigChange('voicePromptAction', e.target.value)} // Update voiceConfig
                             className={`w-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                             placeholder="Verb"
                         />
                     </div>
                     <div>
                         <label htmlFor="voicePromptTone" className="sr-only">Tone/Manner (e.g., slowly and at good volume)</label>
                          <input
                             type="text"
                              id="voicePromptTone"
                              // Use value from voiceConfig, handle potential undefined/null
                             value={voiceConfig.voicePromptTone || ''}
                             onChange={(e) => handleVoiceConfigChange('voicePromptTone', e.target.value)} // Update voiceConfig
                             className={`flex-grow p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                             placeholder="Tone/Manner"
                         />
                     </div>
                 </div>
             </div>


             {/* Render the Voice Selection Modal */}
             <VoiceModal
                isOpen={isVoiceModalOpen}
                onClose={closeVoiceModal}
                onVoiceSelect={handleVoiceSelected} // Pass the handler to receive the selected voice object
                // You might pass agentId if the voice lists depend on the agent or cloning
                agentId={agentId}
             />

        </div>
    );
}

export default VoiceConfig;