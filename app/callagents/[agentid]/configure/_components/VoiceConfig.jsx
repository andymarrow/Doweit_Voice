// voice-agents-CallAgents/[agentid]/configure/_components/VoiceConfig.jsx
"use client";

import React, { useState } from 'react';
import { FiPlay, FiEdit3, FiVolume2 } from 'react-icons/fi';

// Import the reusable Voice Modal component
import VoiceModal from '@/app/characterai/create/_components/VoiceModal'; // Adjust path based on actual location

// Import constants - Adjust path as necessary
import { uiColors } from '../../../_constants/uiConstants'; // Using the path provided

// Placeholder voice data - This should ideally be the initial state fetched for this agent
const initialSelectedVoice = {
    name: 'Jessica',
    platform: 'ElevenLabs',
    id: 'elevenlabs-jessica-cg...CkdW9',
    gender: 'Female',
    accent: 'American',
    // Include avatar path if available in your voice data structure
    avatar: '/voiceagents/9.jpg', // Add a placeholder avatar path
};


function VoiceConfig({ agentId }) {
     // Placeholder states for form fields (remaining voice configuration)
    const [language, setLanguage] = useState('english');
    const [patienceLevel, setPatienceLevel] = useState('medium');
    const [stability, setStability] = useState(0.5);
    const [styleExaggeration, setStyleExaggeration] = useState(0.0);
    const [similarity, setSimilarity] = useState(0.80);
    const [fadeOutFrames, setFadeOutFrames] = useState(5);
    const [optimizeLatency, setOptimizeLatency] = useState(0);
    const [voicePromptSubject, setVoicePromptSubject] = useState('He / She');
    const [voicePromptAction, setVoicePromptAction] = useState('said');
    const [voicePromptTone, setVoicePromptTone] = useState('slowly and at good volume');

    // State for the selected voice object (replaces static 'selectedVoice')
    const [currentSelectedVoice, setCurrentSelectedVoice] = useState(initialSelectedVoice);

    // State to control the visibility of the voice selection modal
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

    // Handlers for Modals
    const openVoiceModal = () => setIsVoiceModalOpen(true);
    const closeVoiceModal = () => setIsVoiceModalOpen(false);

    // Handler to receive the selected voice from the modal
    const handleVoiceSelected = (voice) => {
        setCurrentSelectedVoice(voice); // Update the selected voice state
        // You might also need to update the voiceId state if other parts of VoiceConfig
        // rely on the raw ID string. Let's keep it simple and rely on the object for now.
        // If needed: setVoiceId(voice.id);
    };


    // Placeholder functions (using the currentSelectedVoice state)
    const handleListenVoice = () => {
        if (currentSelectedVoice) {
            console.log(`Listening to voice ID: ${currentSelectedVoice.id}`);
            alert(`Simulating playing voice: ${currentSelectedVoice.name}`); // Placeholder
            // Implement actual audio playback using currentSelectedVoice.id or audio file
        } else {
            alert("No voice selected to listen to.");
        }
    };

    const handleEditVoice = () => {
         if (currentSelectedVoice) {
             console.log(`Editing voice ID: ${currentSelectedVoice.id}`);
             alert(`Simulating editing voice: ${currentSelectedVoice.name}`); // Placeholder - could open a modal/page
             // Implement navigation or modal for editing the voice settings
         } else {
             alert("No voice selected to edit.");
         }
    };


    return (
        <div className="space-y-8">

            {/* Language */}
             <div>
                 <label htmlFor="language" className={`block text-sm font-medium ${uiColors.textSecondary}`}>
                     Language
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}> 
                     The language your agent understands. Should be the same language as the agent speaks.
                 </p>
                 <select
                     id="language"
                     value={language}
                     onChange={(e) => setLanguage(e.target.value)}
                     className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`} 
                 >
                     <option value="english">English</option>
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
                     {currentSelectedVoice ? (
                         <>
                             {/* Voice Avatar */}
                             <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
                                 <img src={currentSelectedVoice.avatar || '/placeholder-avatar.jpg'} alt="Voice Avatar" width={40} height={40} className="rounded-full object-cover" />
                             </div>
                             {/* Voice Details */}
                              <div className="flex-grow">
                                  <div className={`font-semibold text-sm ${uiColors.textPrimary}`}>{currentSelectedVoice.name}</div> 
                                  <div className={`text-xs ${uiColors.textSecondary}`}>
                                      {currentSelectedVoice.description || currentSelectedVoice.details}
                                  </div>
                                   <div className={`text-xs ${uiColors.textPlaceholder}`}>
                                       ID: {currentSelectedVoice.id} {/* Display ID */}
                                  </div>
                              </div>
                              {/* Actions */}
                              <div className="flex items-center space-x-2 flex-shrink-0">
                                  <button onClick={handleListenVoice} className={`p-1.5 rounded-md ${uiColors.hoverBgSubtle}`} title="Listen"> {/* Reduced padding */}
                                       {/* Using FiVolume2 as play icon for voice */}
                                       <FiVolume2 className={`w-4 h-4 ${uiColors.textSecondary}`} /> {/* Reduced size */}
                                  </button>
                                   {/* Edit button might open the same voice modal or a different config modal */}
                                  <button onClick={handleEditVoice} className={`p-1.5 rounded-md ${uiColors.hoverBgSubtle}`} title="Edit Voice Settings"> {/* Reduced padding */}
                                       <FiEdit3 className={`w-4 h-4 ${uiColors.textSecondary}`} /> {/* Reduced size */}
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
                     {/* Placeholder for slider or segmented control - removed empty div */}
                     <select
                         id="patienceLevel"
                         value={patienceLevel}
                         onChange={(e) => setPatienceLevel(e.target.value)}
                         className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`} 
                     >
                         <option value="low">Low (~1 sec.)</option>
                         <option value="medium">Medium (~3 sec.)</option>
                         <option value="high">High (~5 sec.)</option>
                     </select>
                 </div>
            </div>

            {/* Stability */}
             <div>
                 <label htmlFor="stability" className={`block text-sm font-medium ${uiColors.textSecondary}`}> 
                     Stability ({stability.toFixed(2)})
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
                     value={stability}
                     onChange={(e) => setStability(parseFloat(e.target.value))}
                      className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
            </div>

             {/* Style Exaggeration */}
             <div>
                 <label htmlFor="styleExaggeration" className={`block text-sm font-medium ${uiColors.textSecondary}`}> 
                     Style Exaggeration ({styleExaggeration.toFixed(1)})
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
                     value={styleExaggeration}
                     onChange={(e) => setStyleExaggeration(parseFloat(e.target.value))}
                     className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
             </div>

            {/* Similarity */}
             <div>
                 <label htmlFor="similarity" className={`block text-sm font-medium ${uiColors.textSecondary}`}> 
                     Similarity ({similarity.toFixed(2)})
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
                     value={similarity}
                     onChange={(e) => setSimilarity(parseFloat(e.target.value))}
                     className={`w-full sm:max-w-md h-2 rounded-lg appearance-none cursor-pointer ${uiColors.rangeTrack} ${uiColors.rangeThumb}`}
                 />
             </div>

            {/* Fade Out at Interruption */}
             <div>
                 <label htmlFor="fadeOutFrames" className={`block text-sm font-medium ${uiColors.textSecondary}`}> 
                     Fade Out at Interruption ({fadeOutFrames} frames)
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}> 
                     Each frame is 20 ms. When you interrupt the bot the volume goes down slowly to 0 over that many frames. For example, 5 means 100 ms fadeout.
                 </p>
                  <input
                     type="number"
                     id="fadeOutFrames"
                     min="0"
                     value={fadeOutFrames}
                     onChange={(e) => setFadeOutFrames(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`} 
                 />
             </div>

            {/* Optimize Latency */}
             <div>
                 <label htmlFor="optimizeLatency" className={`block text-sm font-medium ${uiColors.textSecondary}`}> 
                     Optimize Latency ({optimizeLatency})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}> 
                     Balance voice quality and response time: lower settings improve quality, while higher settings reduce latency but may affect accuracy.
                 </p>
                  <input
                     type="number"
                     id="optimizeLatency"
                     min="0" max="4"
                     value={optimizeLatency}
                     onChange={(e) => setOptimizeLatency(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Voice Prompting */}
             <div>
                 {/* This label is for the whole section */}
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
                              value={voicePromptSubject}
                              onChange={(e) => setVoicePromptSubject(e.target.value)}
                              className={`w-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`} 
                              placeholder="Subject"
                          />
                     </div>
                     <div>
                          <label htmlFor="voicePromptAction" className="sr-only">Action (e.g., said)</label>
                          <input
                             type="text"
                              id="voicePromptAction"
                              value={voicePromptAction}
                              onChange={(e) => setVoicePromptAction(e.target.value)}
                              className={`w-24 p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`} 
                             placeholder="Verb"
                         />
                     </div>
                     <div>
                         <label htmlFor="voicePromptTone" className="sr-only">Tone/Manner (e.g., slowly and at good volume)</label>
                          <input
                             type="text"
                              id="voicePromptTone"
                              value={voicePromptTone}
                              onChange={(e) => setVoicePromptTone(e.target.value)}
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
                // You might pass agentId if the voice lists depend on the agent
                // agentId={agentId}
             />

        </div>
    );
}

export default VoiceConfig;