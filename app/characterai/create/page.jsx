// characterai/create/page.jsx
"use client";

import React, { useState, useMemo, useEffect } from 'react'; // Import useMemo, useEffect
import { motion } from 'framer-motion';
import { FiSave, FiPlusCircle, FiVolume2, FiAlertCircle } from 'react-icons/fi'; // Added FiAlertCircle
import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
import { useRouter } from 'next/navigation'; // Import Next.js router for redirection

// Import components
import ImageUploadSection from './_components/ImageUploadSection';
import CharacterFormSection from './_components/CharacterFormSection';
import VoiceSelectionSection from './_components/VoiceSelectionSection';
import VoiceModal from './_components/VoiceModal';
import TagsInput from './_components/TagsInput';
import VisibilityToggle from './_components/VisibilityToggle';

// Import constants - Adjusted path as necessary
import { uiColors } from '../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../_constants/uiConstants';

// Define supported languages for the character's responses
const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'am', name: 'Amharic' },
    // Add more languages supported by Google AI Studio voices/models
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    // ... etc.
];


export default function CharacteraiCreatePage() {
    const { user, isLoading: isUserLoading } = useUser(); // Get user info from Clerk
    const router = useRouter();

    // State for form data
    const [characterData, setCharacterData] = useState({
        name: '',
        tagline: '',
        description: '',
        greeting: '',
        imageFile: null, // File object selected by user
        selectedVoice: null, // Full voice object from VoiceModal
        language: 'en', // Default language
        allowDynamicGreetings: true,
        tags: [],
        visibility: 'public',
    });

    // State for UI control
    const [isSaving, setIsSaving] = useState(false);
    const [showVoiceModal, setShowVoiceModal] = useState(false);
    const [saveError, setSaveError] = useState(null); // State to show save errors

    // Memoize user ID for efficient checks
    const currentUserId = useMemo(() => user?.id, [user]);


    // Handlers for updating character data state - Kept similar
    const handleInputChange = (field) => (e) => {
        setCharacterData({ ...characterData, [field]: e.target.value });
    };

    const handleImageSelect = (file) => {
        setCharacterData({ ...characterData, imageFile: file });
    };

    const handleVoiceSelect = (voice) => {
        setCharacterData({ ...characterData, selectedVoice: voice });
    };

    const handleLanguageChange = (e) => {
         setCharacterData({ ...characterData, language: e.target.value });
    };

    const handleDynamicGreetingsToggle = () => {
        setCharacterData({ ...characterData, allowDynamicGreetings: !characterData.allowDynamicGreetings });
    };

    const handleAddTag = (tag) => {
        setCharacterData({ ...characterData, tags: [...characterData.tags, tag] });
    };

    const handleRemoveTag = (tagToRemove) => {
        setCharacterData({ ...characterData, tags: characterData.tags.filter(tag => tag !== tagToRemove) });
    };

    const handleVisibilityChange = (visibility) => {
        setCharacterData({ ...characterData, visibility: visibility });
    };

    // --- Handle Image Upload to Backend ---
    const uploadImage = async (file) => {
        if (!file || !currentUserId) {
             console.warn("No file or user ID for upload.");
             return null; // Return null if no file or user
        }

        const formData = new FormData();
        formData.append('avatar', file); // 'avatar' is the field name expected by the backend API
        formData.append('userId', currentUserId); // Pass userId for folder structure

        try {
            // Call your backend API route for image upload
            const response = await fetch('/api/upload-avatar', {
                method: 'POST',
                // Do NOT set Content-Type for FormData, browser does it correctly
                // headers: { 'Authorization': `Bearer ${await user.getSessionId()}` } // Optional: Add auth
                body: formData,
            });

            if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            // Assuming the backend returns the Firebase Storage URL
            // Expected data: { url: 'firebase-download-url' }
            if (!data.url) {
                 throw new Error("Image upload successful, but no URL returned.");
            }
            return data.url; // Return the Firebase Storage URL

        } catch (err) {
            console.error("Error uploading image:", err);
            setSaveError(`Failed to upload image: ${err.message}`);
            setIsSaving(false); // Stop saving process on upload failure
            return null; // Return null on failure
        }
    };

    // --- Handle Character Creation (Save Button) ---
    const handleCreate = async () => {
        setSaveError(null); // Clear previous errors
        setIsSaving(true);

        if (!currentUserId) {
             setSaveError("User not logged in.");
             setIsSaving(false);
             // Redirect to login if necessary
             router.push('/sign-in'); // Example: redirect to Clerk sign-in
            return;
        }

        // Check if form is valid before proceeding
         if (!isFormValid) {
             setSaveError("Please fill in all required fields.");
             setIsSaving(false);
             return;
         }


        let avatarUrl = null;
        // 1. Upload image if a file is selected
        if (characterData.imageFile) {
            avatarUrl = await uploadImage(characterData.imageFile);
            if (avatarUrl === null) {
                 // uploadImage already sets error and sets isSaving to false
                 return; // Stop the process if upload failed
            }
        } else if (characterData.existingImageUrl) {
             // If editing an existing character, use the existing URL if no new file is selected
             // (This logic might be slightly different if this page is also for editing)
             // For creation, if no new file, avatarUrl remains null, which is fine if image is optional
        }


        // Ensure a voice is selected if required
         // You might want to add validation if voice is mandatory
        // if (!characterData.selectedVoice) {
        //     setSaveError("Please select a voice.");
        //     setIsSaving(false);
        //     return;
        // }

        // Prepare data for the backend API call
        const characterPayload = {
            creatorId: currentUserId, // Add Clerk user ID
            name: characterData.name,
            tagline: characterData.tagline,
            description: characterData.description,
            greeting: characterData.greeting,
            avatarUrl: avatarUrl, // Add the uploaded image URL
            voiceId: characterData.selectedVoice?.platformVoiceId || null, // Add the platform voice ID, ensure it's null if no voice selected
             voiceName: characterData.selectedVoice?.name || null, // Optional: save voice name too
            language: characterData.language, // Add selected language
            behavior: characterData.tags, // Use tags as behavior
            isPublic: characterData.visibility === 'public', // Convert visibility to boolean
            // Initial metrics - Backend should set these defaults
            // likes: 0,
            // chats: 0,
        };

        console.log("Sending character data to backend:", characterPayload);

        // 2. Send character data to the backend API
        try {
             // Call your backend API route to create the character
             const response = await fetch('/api/characters', {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/json',
                     // Add authorization header if your API requires it (e.g., with Clerk session token)
                     // 'Authorization': `Bearer ${await user.getSessionId()}`
                 },
                 body: JSON.stringify(characterPayload),
             });

             if (!response.ok) {
                 const errorText = await response.text();
                 throw new Error(`Character creation failed: ${response.status} - ${errorText}`);
             }

             const result = await response.json();
             console.log("Character created successfully!", result);

             // 3. Handle success (e.g., redirect to the new character's page)
             setIsSaving(false);
             alert("Character created successfully!"); // Simple feedback
             router.push(`/characterai/chat/${result.characterId}`); // Assuming backend returns the new character's ID


        } catch (err) {
            console.error("Error creating character:", err);
            setSaveError(`Failed to create character: ${err.message}`);
            setIsSaving(false);
            // Keep form data so user can try again
        }
    };

     // Determine if the form is valid to enable the Save button
     const isFormValid = characterData.name.trim() !== '' &&
                         characterData.description.trim() !== '' &&
                         characterData.greeting.trim() !== '' &&
                        // Add validation for required fields here:
                         (characterData.imageFile !== null || characterData.existingImageUrl) && // Require an image (new or existing)
                         characterData.selectedVoice !== null; // Require a voice


    // Show loading state or redirect if user is not loaded/logged in
     if (isUserLoading) {
         return <div className={`flex items-center justify-center h-screen text-lg ${uiColors.textSecondary}`}>Loading user...</div>;
     }
     if (!user) {
         // Redirect to login or show a login message if creation requires auth
         // router.push('/sign-in'); // Example redirection
         return (
              <div className={`flex flex-col items-center justify-center h-screen text-lg ${uiColors.textDanger}`}>
                 <FiAlertCircle className="w-10 h-10 mb-4" />
                 Please log in to create a character.
              </div>
         );
     }


    return (
        // The layout component already provides padding, so no need for extra large padding here
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Page Title */}
            <h1 className={`text-2xl font-bold mb-4 ${uiColors.textPrimary}`}>Create New Character</h1>

             {/* Save Error Display */}
             {saveError && (
                 <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className={`p-4 mb-4 text-sm rounded-md bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200`}
                 >
                     <div className="flex items-center">
                         <FiAlertCircle className="mr-2 w-5 h-5" />
                         <span>{saveError}</span>
                     </div>
                 </motion.div>
             )}


            {/* Form Sections */}
            <div className="space-y-8"> {/* Vertical space between main sections */}

                {/* Image Upload */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <ImageUploadSection
                         onImageSelect={handleImageSelect}
                         // If editing, you'd pass existingImageUrl here
                         // existingImageUrl={characterData.existingImageUrl}
                     />
                </motion.div>


                {/* Character Details (Name, Tagline, Description, Greeting) */}
                 <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-6">
                     <CharacterFormSection
                         id="characterName"
                         label="Character name"
                         description="e.g. Albert Einstein"
                         placeholder="Enter character name"
                         value={characterData.name}
                         onChange={handleInputChange('name')}
                         maxLength={50} // Increased length slightly
                     />
                     <CharacterFormSection
                         id="characterTagline"
                         label="Tagline"
                         description="Add a short tagline of your Character"
                         placeholder="Enter tagline"
                         value={characterData.tagline}
                         onChange={handleInputChange('tagline')}
                         maxLength={100} // Increased length
                     />
                     <CharacterFormSection
                         id="characterDescription"
                         label="Description"
                         description="How would your Character describe themselves? (Max 500 characters)"
                         placeholder="Enter description"
                         value={characterData.description}
                         onChange={handleInputChange('description')}
                         maxLength={500}
                         isTextArea
                     />
                      <CharacterFormSection
                          id="characterGreeting"
                          label="Greeting"
                          description="What should your character say when a user starts a new chat? (Max 4096 characters)"
                          placeholder="Enter greeting"
                          value={characterData.greeting}
                          onChange={handleInputChange('greeting')}
                          maxLength={4096}
                          isTextArea
                      />
                 </motion.div>

                 {/* Language Selection */}
                  <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="space-y-2">
                      <label htmlFor="characterLanguage" className={`block text-md font-medium ${uiColors.textSecondary}`}>
                           Response Language
                       </label>
                       <p className={`text-sm ${uiColors.textPlaceholder}`}>
                           Choose the primary language for your character's responses.
                       </p>
                       <select
                            id="characterLanguage"
                            value={characterData.language}
                            onChange={handleLanguageChange}
                            className={`block w-full sm:max-w-md p-2 text-sm rounded-md ${uiColors.bgSecondary} ${uiColors.textPrimary} border ${uiColors.borderPrimary} outline-none ${uiColors.ringAccentShade} focus:ring-1 transition-colors`}
                       >
                           {supportedLanguages.map(lang => (
                                <option key={lang.code} value={lang.code}>{lang.name}</option>
                           ))}
                       </select>
                   </motion.div>


                 {/* Voice Selection */}
                <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                    <VoiceSelectionSection
                         selectedVoice={characterData.selectedVoice}
                         onChooseVoiceClick={() => setShowVoiceModal(true)}
                         // You might need to pass a play handler here if you want a separate play button
                         // for the *selected* voice on the main form, beyond the modal preview.
                         // For now, VoiceSelectionSection has its own preview player.
                    />
                </motion.div>

                 {/* Allow Dynamic Greetings Toggle */}
                 <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                      <div className="flex items-start justify-between w-full sm:max-w-md space-x-4"> {/* Added space-x */}
                         <div className="flex-grow">
                             <label htmlFor="dynamicGreetingsToggle" className={`block text-md font-medium ${uiColors.textSecondary}`}> {/* Adjusted font size */}
                                  Allow dynamic greetings
                             </label>
                              <p className={`text-sm ${uiColors.textPlaceholder}`}> {/* Adjusted font size */}
                                  If enabled, the AI may adjust the greeting based on context.
                             </p>
                         </div>
                          {/* Toggle Switch */}
                           <button
                                type="button" // Added type="button"
                                id="dynamicGreetingsToggle"
                              onClick={handleDynamicGreetingsToggle}
                               className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                           ${characterData.allowDynamicGreetings ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
                           >
                               <span className={`sr-only`}>Allow dynamic greetings</span>
                                <span
                                   aria-hidden="true"
                                   className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                               ${characterData.allowDynamicGreetings ? 'translate-x-5' : 'translate-x-0'}`}
                               ></span>
                           </button>
                     </div>
                 </motion.div>


                 {/* Tags Input */}
                 <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                     <TagsInput
                          tags={characterData.tags}
                          onAddTag={handleAddTag}
                          onRemoveTag={handleRemoveTag}
                     />
                 </motion.div>


                 {/* Visibility Toggle */}
                 <motion.div variants={sectionVariants} initial="hidden" animate="visible">
                     <VisibilityToggle
                          visibility={characterData.visibility}
                          onVisibilityChange={handleVisibilityChange}
                     />
                 </motion.div>

             </div> {/* End Form Sections space-y-8 */}


            {/* Save/Create Button */}
             <motion.div
                 variants={itemVariants} initial="hidden" animate="visible"
                 className="flex justify-center mt-8 mb-4"
              >
                 <button
                      type="button" // Added type="button"
                      onClick={handleCreate}
                      disabled={isSaving || !isFormValid || isUserLoading || !user} // Disable while saving, invalid, or user loading/not logged in
                       className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-md transition-colors shadow-lg
                                    ${uiColors.accentPrimaryGradient} text-white ${isSaving || !isFormValid || isUserLoading || !user ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                     {isSaving ? 'Creating...' : <><FiSave className="mr-3 w-6 h-6" /> Create Character</>}
                 </button>
             </motion.div>


            {/* Voice Selection Modal */}
             <VoiceModal
                isOpen={showVoiceModal}
                onClose={() => setShowVoiceModal(false)}
                onVoiceSelect={handleVoiceSelect} // This handler now receives the full voice object
                // VoiceModal itself manages its own playback, no need to pass playback handlers here
             />

        </div>
    );
}