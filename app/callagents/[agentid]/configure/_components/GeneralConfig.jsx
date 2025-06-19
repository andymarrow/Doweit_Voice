// voice-agents-CallAgents/[agentid]/_components/GeneralConfig.jsx
"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { FiTrash2, FiX, FiCheck } from 'react-icons/fi'; // Include FiX for vocab remove

// Import constants
import { uiColors } from '@/app/callagents/_constants/uiConstants';  // Ensure correct import path

function GeneralConfig({ agentId }) {
    // Placeholder states for form fields
    const [agentName, setAgentName] = useState('Emma from AutoTrust');
    const [voiceEngine, setVoiceEngine] = useState('v2'); // 'v1' or 'v2'
    const [aiModel, setAiModel] = useState('gpt4o'); // 'gpt4o', 'openai', etc.
    const [timezone, setTimezone] = useState('Africa/Addis_Ababa'); // Placeholder timezone
    const [knowledgeBase, setKnowledgeBase] = useState(''); // Placeholder
    const [customVocabulary, setCustomVocabulary] = useState([]); // Array of terms
    const [newVocabTerm, setNewVocabTerm] = useState('');
    const [useFillerWords, setUseFillerWords] = useState(true); // Toggle state

    // Placeholder for image handling (more complex in reality)
    const [agentImage, setAgentImage] = useState('/voiceagents/1.jpg'); // Placeholder image path

    // Placeholder function for removing image
    const handleRemoveImage = () => {
        setAgentImage(null); // Or a default placeholder image
    };

    // Placeholder function for adding vocabulary
    const handleAddVocab = (e) => {
        e.preventDefault();
        if (newVocabTerm.trim() && !customVocabulary.includes(newVocabTerm.trim())) {
            setCustomVocabulary([...customVocabulary, newVocabTerm.trim()]);
            setNewVocabTerm('');
        }
    };

    // Placeholder function for removing vocabulary
    const handleRemoveVocab = (termToRemove) => {
        setCustomVocabulary(customVocabulary.filter(term => term !== termToRemove));
    };

    // Placeholder function for deleting agent
    const handleDeleteAgent = () => {
        if (confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
            console.log(`Deleting agent ${agentId}`);
            // Implement actual deletion logic (API call, redirect)
            alert(`Agent ${agentId} deleted (simulated)`);
        }
    };


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
                     id="agentName" // Has ID
                     value={agentName}
                     onChange={(e) => setAgentName(e.target.value)}
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
                     {agentImage && (
                         <div className="flex-shrink-0">
                             <Image
                                 src={agentImage}
                                 alt="Agent Avatar"
                                 width={64}
                                 height={64}
                                 className="rounded-md"
                             />
                         </div>
                     )}
                    <div className="flex flex-col items-start">
                         <p className={`text-md ${uiColors.textPlaceholder} mb-2`}>
                             Recommended size: 250px x 250px
                         </p>
                         {/* Placeholder for file upload button */}
                         {/* <button className={`px-3 py-1.5 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} ${uiColors.hoverBgSubtle}`}>
                             Upload Image
                         </button> */}
                         {agentImage && (
                              <button
                                  onClick={handleRemoveImage}
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
                         Learn more <FiCheck className="inline w-3 h-3 ml-0.5 -mt-0.5" />
                     </a>
                </p>
                <div className="flex rounded-md border ${uiColors.borderPrimary} overflow-hidden w-fit">
                    <button
                        className={`px-4 py-2 text-lg font-medium transition-colors ${
                            voiceEngine === 'v1'
                                ? `${uiColors.accentPrimaryGradient} text-white`
                                : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                        onClick={() => setVoiceEngine('v1')}
                    >
                        Version 1.0
                    </button>
                    <button
                        className={`px-4 py-2 text-lg font-medium transition-colors ${
                            voiceEngine === 'v2'
                                ? `${uiColors.accentPrimaryGradient} text-white`
                                : `${uiColors.bgSecondary} ${uiColors.textSecondary} ${uiColors.hoverBgSubtle}`
                        }`}
                        onClick={() => setVoiceEngine('v2')}
                    >
                        Version 2.0
                    </button>
                </div>
            </div>

             {/* AI Model */}
             <div>
                 {/* Label with 'for' attribute */}
                 <label htmlFor="aiModel" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     AI Model
                 </label>
                 <p className={`text-md mb-2 ${uiColors.textPlaceholder}`}>
                     Opt for speed or depth to suit your agent's role
                 </p>
                 <div className="flex items-center space-x-4">
                     {/* Placeholder for AI Model selection display */}
                     <div className={`flex items-center p-2 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}>
                         <div className={`w-5 h-5 mr-2 flex items-center justify-center rounded-full ${uiColors.accentBadgeBg} ${uiColors.accentBadgeText}`}>AI</div>
                         <span className={`${uiColors.textPrimary} text-lg font-medium`}>GPT-4o</span>
                     </div>
                     {/* Select element with matching 'id' attribute */}
                      <select
                         id="aiModel" // Added ID
                         value={aiModel}
                         onChange={(e) => setAiModel(e.target.value)}
                         className={`form-select block p-2 w-fit text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                     >
                         <option value="gpt4o">GPT-4o</option>
                         <option value="openai">OpenAI</option>
                         <option value="other">Other</option>
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
                     id="timezone" // Has ID
                     value={timezone}
                     onChange={(e) => setTimezone(e.target.value)}
                     className={`form-select block p-2 w-fit text-lg rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.borderPrimary} border outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                 >
                     <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
                     <option value="America/New_York">America/New_York</option>
                     <option value="Europe/London">Europe/London</option>
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
                 {/* Placeholder - this would likely be a link or a complex input */}
                 {/* Note: This is a div, not a form field, doesn't need an ID/for match */}
                 <div className={`p-3 rounded-md ${uiColors.bgSecondary} border ${uiColors.borderPrimary} w-full sm:max-w-md ${uiColors.textPlaceholder} text-sm`}>
                    Knowledge Base Link/Component Placeholder
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
                         id="newVocabTerm" // Has ID
                         value={newVocabTerm}
                         onChange={(e) => setNewVocabTerm(e.target.value)}
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
                         Enter
                     </button>
                 </form>
                 {customVocabulary.length > 0 && (
                     <div className="mt-3 flex flex-wrap gap-2">
                         {customVocabulary.map((term, index) => (
                              <span key={index} className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded ${uiColors.accentSubtleBg} ${uiColors.accentBadgeText}`}>
                                  {term}
                                  <button
                                      onClick={() => handleRemoveVocab(term)}
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
             {/* Label targets the button's ID */}
             <div className="flex items-center justify-between w-full sm:max-w-md">
                 <div>
                     <label htmlFor="fillerWordsToggle" className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                          Use Realistic Filler Words
                     </label>
                     <p className={`text-md ${uiColors.textPlaceholder}`}>
                          If enabled, the agent will include natural filler words like 'uh' and 'um'.
                     </p>
                 </div>
                 {/* Button acting as toggle, has ID */}
                 <button
                      id="fillerWordsToggle" // Has ID
                     onClick={() => setUseFillerWords(!useFillerWords)}
                     className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                 ${useFillerWords ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`} // Fixed string interpolation
                 >
                     <span className={`sr-only`}>Use realistic filler words</span>
                      <span
                         aria-hidden="true"
                         className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                     ${useFillerWords ? 'translate-x-5' : 'translate-x-0'}`}
                     ></span>
                 </button>
            </div>


            {/* Delete Agent */}
            {/* This is a button for an action, not a form field for data entry, no label needed */}
            <div className={`p-4 rounded-md border ${uiColors.alertDangerBorder} ${uiColors.alertDangerBg} w-full sm:max-w-md`}>
                <label className={`block text-lg font-medium ${uiColors.textSecondary}`}>
                     Delete Agent
                </label>
                <p className={`text-xs mb-4 ${uiColors.textPlaceholder}`}>
                    Deleting agents will mean erasing personalized data, voice profiles, and integrations.
                </p>
                 <button
                     onClick={handleDeleteAgent}
                      className={`px-4 py-2 text-lg font-semibold rounded-md transition-colors ${uiColors.alertDangerButtonBg} ${uiColors.alertDangerButtonText} ${uiColors.alertDangerButtonHoverBg}`}
                 >
                     Delete Agent
                 </button>
            </div>


        </div>
    );
}

export default GeneralConfig;