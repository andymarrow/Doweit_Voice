// voice-agents-CallAgents/[agentid]/_components/VoiceConfig.jsx
"use client";

import React, { useState } from 'react';
import { FiPlay, FiEdit3 } from 'react-icons/fi'; // Example icons

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Ensure correct import path

function VoiceConfig({ agentId }) {
     // Placeholder states for form fields
    const [language, setLanguage] = useState('english');
    const [voiceId, setVoiceId] = useState('elevenlabs-jessica-cg...CkdW9'); // Represents selected voice
    const [patienceLevel, setPatienceLevel] = useState('medium'); // 'low', 'medium', 'high'
    const [stability, setStability] = useState(0.5); // 0.0 to 1.0
    const [styleExaggeration, setStyleExaggeration] = useState(0.0); // 0.0 to 1.0
    const [similarity, setSimilarity] = useState(0.80); // 0.0 to 1.0
    const [fadeOutFrames, setFadeOutFrames] = useState(5); // Number of frames
    const [optimizeLatency, setOptimizeLatency] = useState(0); // 0 to 4
    const [voicePromptSubject, setVoicePromptSubject] = useState('He / She'); // Text input
    const [voicePromptAction, setVoicePromptAction] = useState('said'); // Text input
    const [voicePromptTone, setVoicePromptTone] = useState('slowly and at good volume'); // Text input


     // Placeholder voice data - replace with actual fetched data
    const selectedVoice = {
        name: 'Jessica',
        platform: 'ElevenLabs',
        id: 'cg...CkdW9',
        gender: 'Female',
        accent: 'American'
    };

    // Placeholder functions
    const handleListenVoice = () => {
        console.log(`Listening to voice ID: ${voiceId}`);
        alert(`Simulating playing voice: ${selectedVoice.name}`); // Placeholder
    };

    const handleEditVoice = () => {
         console.log(`Editing voice ID: ${voiceId}`);
         alert(`Simulating editing voice: ${selectedVoice.name}`); // Placeholder - could open a modal/page
    };


    return (
        <div className="space-y-8">

            {/* Language */}
             <div>
                 <label htmlFor="language" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Language
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     The language your agent understands. Should be the same language as the agent speaks.
                 </p>
                 <select
                     id="language" // Has ID
                     value={language}
                     onChange={(e) => setLanguage(e.target.value)}
                     className={`form-select block p-2 w-fit text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     <option value="english">English</option>
                 </select>
            </div>

            {/* Voice */}
             <div>
                 <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Voice
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Choose the language and voice of the agent or clone your own.
                 </p>
                {/* This section describes the selected voice, doesn't contain form fields needing labels */}
                 <div className={`flex items-center space-x-4 p-3 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} w-full sm:max-w-md`}>
                     <div className="flex-grow">
                         <div className={`font-semibold text-lg ${uiColors.textPrimary}`}>
                              {selectedVoice.name} <span className={`${uiColors.textSecondary} font-normal`}>({selectedVoice.platform})</span>
                         </div>
                         <div className={`text-md ${uiColors.textPlaceholder}`}>
                             ID: {selectedVoice.id}
                         </div>
                          <div className={`text-md ${uiColors.textSecondary}`}>
                              {selectedVoice.accent} - {selectedVoice.gender}
                         </div>
                     </div>
                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button onClick={handleListenVoice} className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Listen">
                             <FiPlay className={`w-4 h-4 ${uiColors.textSecondary}`} />
                        </button>
                        <button onClick={handleEditVoice} className={`p-2 rounded-md ${uiColors.hoverBgSubtle}`} title="Edit Voice">
                             <FiEdit3 className={`w-4 h-4 ${uiColors.textSecondary}`} />
                        </button>
                    </div>
                 </div>
            </div>

            {/* Patience Level */}
             <div>
                 {/* Label with 'for' attribute */}
                 <label htmlFor="patienceLevel" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Patience Level
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Adjust the response speed. Low for rapid exchanges, high for more focused turns with less crosstalk.
                 </p>
                 <div className="flex items-center space-x-4 w-full sm:max-w-md">
                     {/* Placeholder for slider or segmented control - currently not a form field */}
                     {/* <div className="flex-grow h-2 rounded-full ${uiColors.bgSecondary} border ${uiColors.borderPrimary}">
                     </div> */}
                     {/* Select element with matching 'id' attribute */}
                     <select
                         id="patienceLevel" // Added ID
                         value={patienceLevel}
                         onChange={(e) => setPatienceLevel(e.target.value)}
                         className={`form-select block p-2 w-fit text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         <option value="low">Low (~1 sec.)</option>
                         <option value="medium">Medium (~3 sec.)</option>
                         <option value="high">High (~5 sec.)</option>
                     </select>
                 </div>
            </div>

            {/* Stability */}
             <div>
                 {/* Label with 'for' attribute */}
                 <label htmlFor="stability" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Stability ({stability.toFixed(2)})
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Lower settings may make the voice sound more expressive but less predictable, while higher settings make it sound steadier but less emotional.
                 </p>
                 <div className="flex justify-between text-md ${uiColors.textPlaceholder} mb-2 w-full sm:max-w-md">
                      <span>Expressive</span>
                      <span>Dynamic</span>
                      <span>Balanced</span>
                      <span>Predictable</span>
                      <span>Stable</span>
                 </div>
                 {/* Range input with matching 'id' attribute */}
                 <input
                     type="range"
                     id="stability" // Added ID
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
                 {/* Label with 'for' attribute */}
                 <label htmlFor="styleExaggeration" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Style Exaggeration ({styleExaggeration.toFixed(1)})
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Enhances the distinct characteristics of the original voice, but may slow down processing and make the voice less stable.
                 </p>
                  {/* Range input with matching 'id' attribute */}
                  <input
                     type="range"
                     id="styleExaggeration" // Added ID
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
                 {/* Label with 'for' attribute */}
                 <label htmlFor="similarity" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Similarity ({similarity.toFixed(2)})
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Determines how closely the AI matches the original voice. Higher values may include unwanted noise from the original recording.
                 </p>
                  {/* Range input with matching 'id' attribute */}
                  <input
                     type="range"
                     id="similarity" // Added ID
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
                 <label htmlFor="fadeOutFrames" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Fade Out at Interruption ({fadeOutFrames} frames)
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Each frame is 20 ms. When you interrupt the bot the volume goes down slowly to 0 over that many frames. For example, 5 means 100 ms fadeout.
                 </p>
                  <input
                     type="number"
                     id="fadeOutFrames" // Has ID
                     min="0"
                     value={fadeOutFrames}
                     onChange={(e) => setFadeOutFrames(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Optimize Latency */}
             <div>
                 <label htmlFor="optimizeLatency" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Optimize Latency ({optimizeLatency})
                 </label>
                 <p className={`text-xs mb-2 ${uiColors.textPlaceholder}`}>
                     Balance voice quality and response time: lower settings improve quality, while higher settings reduce latency but may affect accuracy.
                 </p>
                  <input
                     type="number"
                     id="optimizeLatency" // Has ID
                     min="0" max="4"
                     value={optimizeLatency}
                     onChange={(e) => setOptimizeLatency(parseInt(e.target.value, 10) || 0)}
                     className={`block w-20 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 />
             </div>

            {/* Voice Prompting */}
             <div>
                 {/* This label is for the whole section, individual inputs below need their own labels */}
                 <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Voice Prompting
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Slightly alters voice intonation, pacing, and emotion for a subtle yet noticeable effect.
                 </p>
                 <div className="flex items-center space-x-2 w-full sm:max-w-lg">
                     {/* Inputs with unique IDs and associated labels (using sr-only for hidden labels if no visible needed beside input) */}
                     <div> {/* Container for label+input */}
                         <label htmlFor="voicePromptSubject" className="sr-only">Subject (e.g., He / She)</label>
                         <input
                              type="text"
                              id="voicePromptSubject" // Added ID
                              value={voicePromptSubject}
                              onChange={(e) => setVoicePromptSubject(e.target.value)}
                              className={`w-24 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                              placeholder="Subject"
                          />
                     </div>
                     <div> {/* Container for label+input */}
                          <label htmlFor="voicePromptAction" className="sr-only">Action (e.g., said)</label>
                          <input
                             type="text"
                              id="voicePromptAction" // Added ID
                              value={voicePromptAction}
                              onChange={(e) => setVoicePromptAction(e.target.value)}
                              className={`w-24 p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                             placeholder="Verb"
                         />
                     </div>
                     <div> {/* Container for label+input */}
                         <label htmlFor="voicePromptTone" className="sr-only">Tone/Manner (e.g., slowly and at good volume)</label>
                          <input
                             type="text"
                              id="voicePromptTone" // Added ID
                              value={voicePromptTone}
                              onChange={(e) => setVoicePromptTone(e.target.value)}
                             className={`flex-grow p-2 text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                             placeholder="Tone/Manner"
                         />
                     </div>
                 </div>
             </div>


        </div>
    );
}

export default VoiceConfig;