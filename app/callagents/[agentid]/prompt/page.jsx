// voice-agents-CallAgents/[agentid]/prompt/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    FiSave, FiEdit3, FiFileText, FiCpu, FiCheck, FiBookOpen // Icons
} from 'react-icons/fi'; // Import necessary icons

// Import components
import UseTemplateModal from './_component/UseTemplateModal'; // Use _components path
import AskDoweitChatModal from './_component/AskDoweitChatModal'; // Use _components path

// Import constants
import { uiColors } from '../../_constants/uiConstants';    // Adjust path as necessary
import { sectionVariants, itemVariants } from '../../_constants/uiConstants'; // Assuming these are still used for animation


export default function PromptPage() {
    const params = useParams();
    const agentId = params.agentid;

    // State for prompt content
    const [greetingMessage, setGreetingMessage] = useState('"Hello..."'); // Placeholder initial value
    const [promptText, setPromptText] = useState(''); // Placeholder initial value (will load)
    // New state for Knowledge Base content
    const [knowledgeBaseContent, setKnowledgeBaseContent] = useState(''); // Can be text or markdown

    // State for UI control
    const [isEditing, setIsEditing] = useState(false); // Controls if prompt textarea is editable
    const [isFlowDesignerEnabled, setIsFlowDesignerEnabled] = useState(false); // Controls Prompt/Flow Designer toggle
    const [showTemplateModal, setShowTemplateModal] = useState(false); // Controls Use Template modal
    const [showDoweitChatModal, setShowDoweitChatModal] = useState(false); // Controls Ask DoweitChat modal

    // State to track loading/saving status (optional but good practice)
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Placeholder useEffect to load initial data
    useEffect(() => {
        const fetchPromptData = async () => {
            setIsLoading(true);
            // --- Simulate API Call ---
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
            const fetchedData = {
                 greeting: '"Hello..."',
                 prompt: `start with hello (pause 1.5 sec) "This is Emma from AutoTrust Cars. I hope you're doing well. Are you calling about buying or selling a vehicle today?"
(Avoid speaking over the user. If the user starts with a greeting like "met shahidi," wait until they finish.)

♦ Agent Information
Agent Name: Emma
Personality: Friendly, trustworthy, helpful, and concise be more polite and friendly kind of like a real agent never aggressive
Role: AI Receptionist at AutoTrust Cars, assisting with buying and selling vehicle inquiries
Goal: To qualify leads by gathering key information about car buying or selling intentions, and guide callers toward scheduling a test drive, requesting a quote, or speaking to a human advisor. The agent will not fabricate or assume any details.
Conversational Style: Warm, natural tone—never robotic. Sound approachable, knowledgeable, and easy to talk to, like a helpful human rep.

♦ Company Info
Company Name: AutoTrust Cars
Specialization: Buying and selling new and used vehicles
Services: Car sales, vehicle purchasing, test drives, trade-in quotes, financing assistance
Location: [Insert Company Location]
Hours: [Insert Company Hours]
Website: [Insert Company Website]

♦ Conversation Flow
1. Greet caller and introduce self (Emma from AutoTrust Cars).
2. State the purpose of the call or ask how can help (e.g., buying or selling a vehicle today?).
3. If buying: Ask about specific vehicle interest (make, model, year), budget, financing needs, and preferred method of contact for next steps (schedule call, test drive, visit).
4. If selling: Ask about vehicle details (make, model, year, mileage, condition), desired selling price, and preferred method of contact for appraisal/offer.
5. Handle common questions (hours, location, financing).
6. If the caller asks for a human or has complex needs, offer to transfer them to a human advisor or schedule a callback.
7. Thank the caller and end the call politely.

♦ Constraints
- Do not provide exact pricing or financial advice.
- Do not schedule appointments directly unless integrated with a calendar system (placeholder). Always offer to schedule a callback or transfer.
- Remain polite and professional at all times.
- Do not make up information. If unsure, state that you will transfer them or find someone who can help.`
            };
            const fetchedKb = "## Agent Knowledge Base\n\n- This is a placeholder for loaded knowledge base content.\n- It can include facts, FAQs, product details, etc."; // Simulate fetching KB too
            setGreetingMessage(fetchedData.greeting);
            setPromptText(fetchedData.prompt);
            setKnowledgeBaseContent(fetchedKb); // Set KB content
            setIsLoading(false);
            // --- End Simulate API Call ---
        };

        fetchPromptData();
    }, [agentId]);


    // Handlers for Modals
    const openTemplateModal = () => setShowTemplateModal(true);
    const closeTemplateModal = () => setShowTemplateModal(false);
    const openDoweitChatModal = () => setShowDoweitChatModal(true);
    const closeDoweitChatModal = () => setShowDoweitChatModal(false);

    // Handler for Edit Prompt Button
    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    // Handler for Save Button
    const handleSave = async () => {
        setIsSaving(true);
        console.log(`Saving prompt for agent ${agentId}:`);
        console.log("Greeting:", greetingMessage);
        console.log("Prompt:", promptText);
        console.log("Knowledge Base:", knowledgeBaseContent); // Save KB too

        // --- Simulate API Call to Save ---
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        console.log("Save successful!");
        // --- End Simulate API Call ---

        setIsSaving(false);
        setIsEditing(false); // Exit editing mode after saving
        // Optionally show a success message
    };

    // Toggle for Prompt/Flow Designer
    const handleFlowDesignerToggle = () => {
         setIsFlowDesignerEnabled(!isFlowDesignerEnabled);
    };

    // Handler for using a template from the modal
    const handleUseTemplate = (templatePrompt) => {
        setPromptText(templatePrompt); // Replace the main prompt text
        setIsEditing(true); // Automatically enter editing mode if using a template
        closeTemplateModal(); // Close the modal
    };

    // Handler for adding knowledge base content from the modal
    const handleAddKnowledgeBase = (kbContent) => {
        setKnowledgeBaseContent(prevKb => {
             // Append the new content, maybe with a separator if existing content exists
             const separator = prevKb ? "\n\n---\n\n" : "";
             return prevKb + separator + kbContent;
        });
         // Decide if adding KB should automatically enter editing mode for the main prompt
         // setIsEditing(true);
        closeTemplateModal(); // Close the modal
    };


    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Important Alert Banner (Keep if needed) */}
            {/* Assuming this was made responsive in a previous step */}
            {/* <motion.div ... ></motion.div> */}


            {/* Prompt Header/Controls */}
            <motion.div
                 className={`flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                 variants={itemVariants} initial="hidden" animate="visible"
            >
                {/* Left: Title and Toggle */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                    <h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>Prompt</h2>
                     {/* Flow Designer Toggle */}
                     <div className="flex items-center">
                          {/* Button acting as toggle */}
                         <button
                              onClick={handleFlowDesignerToggle}
                             className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary} mr-2
                                         ${isFlowDesignerEnabled ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                             id="flowDesignerToggle" // Added ID for accessibility
                         >
                             <span className={`sr-only`}>Enable Flow Designer</span>
                              <span
                                 aria-hidden="true"
                                 className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                             ${isFlowDesignerEnabled ? 'translate-x-5' : 'translate-x-0'}`}
                             ></span>
                         </button>
                          <label htmlFor="flowDesignerToggle" className={`text-sm font-medium ${uiColors.textSecondary} cursor-pointer`}>Flow Designer</label> {/* Label for toggle */}
                     </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex flex-wrap w-full sm:w-auto sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
                     <button
                         onClick={handleEditToggle}
                          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${isEditing ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} ${uiColors.textPrimary} ${uiColors.hoverBgSubtle}`} ${uiColors.ringAccentShade} focus:ring-1 outline-none w-full sm:w-auto`}
                     >
                          <FiEdit3 className="mr-2 w-4 h-4" /> {isEditing ? 'Exit Editing' : 'Edit Prompt'}
                     </button>
                </div>
            </motion.div>

            {/* Conditional Rendering: Prompt Text Area or Flow Designer Placeholder */}
             {!isFlowDesignerEnabled ? ( // Show text area if Flow Designer is NOT enabled
                 <>
                     {/* Greeting Message */}
                     <motion.div
                          className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                         variants={sectionVariants} initial="hidden" animate="visible"
                     >
                          <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Greeting message</h3>
                          <input
                             type="text"
                             value={greetingMessage}
                             onChange={(e) => setGreetingMessage(e.target.value)}
                             id="greetingMessageInput" // Added ID
                              className={`block w-full p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1`}
                         />
                     </motion.div>

                     {/* Prompt */}
                      <motion.div
                           className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                          variants={sectionVariants} initial="hidden" animate="visible"
                      >
                          <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Prompt</h3>
                          {isLoading ? (
                             <div className={`text-center py-10 ${uiColors.textSecondary}`}>Loading Prompt...</div>
                          ) : (
                               <textarea
                                   value={promptText}
                                   onChange={(e) => setPromptText(e.target.value)}
                                   id="promptTextInput" // Added ID
                                    className={`block w-full h-96 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y
                                                ${!isEditing ? 'cursor-not-allowed opacity-75' : ''}`}
                                    disabled={!isEditing}
                                    placeholder="Enter your agent prompt here..."
                               >
                               </textarea>
                          )}
                      </motion.div>

                     {/* Knowledge Base Section (Show only if content exists) */}
                     {knowledgeBaseContent && (
                          <motion.div
                               className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                               variants={sectionVariants} initial="hidden" animate="visible"
                          >
                             <h3 className={`text-lg font-semibold ${uiColors.textPrimary}`}>Knowledge Base</h3>
                              {/* Display KB content - maybe as markdown */}
                              <div className={`prose prose-sm max-w-none ${uiColors.textPrimary}`}>
                                  {/* Render knowledgeBaseContent, potentially parsed as markdown */}
                                   {/* Example: Simple display */}
                                   <textarea
                                       value={knowledgeBaseContent}
                                       onChange={(e) => setKnowledgeBaseContent(e.target.value)} // Allow editing if desired
                                       className={`block w-full h-48 p-3 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 resize-y`}
                                        placeholder="Enter Knowledge Base content here..."
                                    ></textarea>
                                   {/* Or use a markdown renderer component if you have one */}
                                   {/* <MarkdownRenderer content={knowledgeBaseContent} /> */}
                              </div>
                          </motion.div>
                     )}


                     {/* Save Button - Only visible when editing */}
                     {isEditing && (
                          <motion.div
                             variants={itemVariants} initial="hidden" animate="visible"
                             className="flex justify-end"
                          >
                             <button
                                  onClick={handleSave}
                                  disabled={isSaving || isLoading}
                                   className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white ${isSaving || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                             >
                                  {isSaving ? 'Saving...' : <><FiSave className="mr-2 w-5 h-5" /> Save</>}
                             </button>
                          </motion.div>
                     )}
                 </>
             ) : (
                 // Placeholder for Flow Designer UI
                 <motion.div
                      className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 text-center ${uiColors.textSecondary}`}
                      variants={sectionVariants} initial="hidden" animate="visible"
                 >
                      <h3 className={`text-lg font-semibold mb-4 ${uiColors.textPrimary}`}>Flow Designer (Placeholder)</h3>
                      <p>Flow Designer UI would be rendered here.</p>
                      <p className="text-sm mt-2">Switch the toggle off to see the text prompt editor.</p>
                 </motion.div>
             )}


            {/* Render Modals */}
             <UseTemplateModal
                isOpen={showTemplateModal}
                onClose={closeTemplateModal}
                onUseTemplate={handleUseTemplate} // Pass handler for using a template
                onAddKnowledgeBase={handleAddKnowledgeBase} // Pass handler for adding KB content
             />
             <AskDoweitChatModal
                isOpen={showDoweitChatModal}
                onClose={closeDoweitChatModal}
                agentId={agentId}
             />

        </div>
    );
}