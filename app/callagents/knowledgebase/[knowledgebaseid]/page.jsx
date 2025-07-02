// app/callagents/knowledgebase/[knowledgebaseid]/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiSave, FiLoader, FiAlertTriangle, FiGlobe, FiLock } from 'react-icons/fi'; // Icons
import { toast } from 'react-hot-toast';

// Import components
import KbDetailsForm from './_components/KbDetailsForm';
import KbContentAddChoices from './_components/KbContentAddChoices';
import KbContentList from './_components/KbContentList';

// Import content input components
import KbContentManualInput from './_components/KbContentManualInput';
import KbContentUploadFile from './_components/KbContentUploadFile'; // *** Import KbContentUploadFile ***
import KbContentPasteUrl from './_components/KbContentPasteUrl';

// Import constants
import { uiColors } from '../../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../../_constants/uiConstants';


// --- API Helper Functions ---

// Helper function to fetch a specific knowledge base by ID
const fetchKnowledgeBaseById = async (kbId) => {
    console.log(`[KB Detail Page] Calling GET /api/knowledgebases/${kbId}...`);
    const response = await fetch(`/api/knowledgebases/${kbId}`); // Call the backend API
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch knowledge base');
    }
    const kb = await response.json();
    console.log(`[KB Detail Page] Fetched KB ${kbId}:`, kb);
    // API is expected to return KB object including `isOwner` flag
    return kb;
};

// Helper function to update a specific knowledge base
const updateKnowledgeBase = async (kbId, updateData) => {
    console.log(`[KB Detail Page] Calling PATCH /api/knowledgebases/${kbId} with data:`, updateData);
    const response = await fetch(`/api/knowledgebases/${kbId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update knowledge base');
    }
    const updatedKb = await response.json();
    console.log(`[KB Detail Page] KB ${kbId} updated:`, updatedKb);
    // API is expected to return the updated KB object, including `isOwner` flag (which should be true here)
    return updatedKb;
};


// Content input method keys
const CONTENT_METHODS = {
    CHOICES: 'choices',
    MANUAL: 'manual',
    UPLOAD: 'upload', // Maps to KbContentUploadFile
    PASTE_URL: 'paste-url', // Maps to KbContentPasteUrl
};

// Map content method keys to components
const contentMethodComponents = {
    [CONTENT_METHODS.MANUAL]: KbContentManualInput,
    [CONTENT_METHODS.UPLOAD]: KbContentUploadFile, // *** Use KbContentUploadFile ***
    [CONTENT_METHODS.PASTE_URL]: KbContentPasteUrl, // *** Use KbContentPasteUrl ***
};


export default function KnowledgeBaseDetailPage() {
    const params = useParams();
    const kbId = parseInt(params.knowledgebaseid, 10);

    const [knowledgeBase, setKnowledgeBase] = useState(null); // Stores the fetched KB data
    const [isLoading, setIsLoading] = useState(true); // Loading initial fetch
    const [fetchError, setFetchError] = useState(null); // Initial fetch error

    // State for editing basic info (Name, Description, isPublic)
    const [basicInfoEditState, setBasicInfoEditState] = useState({
         name: '', description: '', isPublic: false
    });
    const [isBasicInfoDirty, setIsBasicInfoDirty] = useState(false); // Tracks changes in basic info form
    const [isSavingBasicInfo, setIsSavingBasicInfo] = useState(false); // State for basic info save API call

    // State for adding content flow
    const [addContentMethod, setAddContentMethod] = useState(CONTENT_METHODS.CHOICES); // Controls current content addition step
    const [isAddingContent, setIsAddingContent] = useState(false); // State for content addition API call


    // --- Fetch KB Data on mount ---
    useEffect(() => {
        if (!kbId) {
            // Handle invalid KB ID in URL immediately
             setFetchError('Invalid Knowledge Base ID.');
             setIsLoading(false);
             return; // Stop effect if ID is invalid
        }

        const loadKb = async () => {
            setIsLoading(true);
            setFetchError(null); // Clear previous fetch errors
            try {
                const fetchedKb = await fetchKnowledgeBaseById(kbId);
                setKnowledgeBase(fetchedKb);

                // Initialize basic info edit state only if KB is owned
                 if (fetchedKb.isOwner) {
                     setBasicInfoEditState({
                         name: fetchedKb.name || '',
                         description: fetchedKb.description || '',
                         isPublic: fetchedKb.isPublic || false,
                     });
                      setIsBasicInfoDirty(false); // Reset dirty state on successful load
                 }
                // If not owner, basicInfoEditState is not used, form shows read-only `knowledgeBase` data

            } catch (err) {
                console.error(`[KB Detail Page] Error loading KB ${kbId}:`, err);
                setFetchError(err.message);
                setKnowledgeBase(null); // Clear KB data on error
                 setBasicInfoEditState({ name: '', description: '', isPublic: false }); // Clear state
                 setIsBasicInfoDirty(false);
            } finally {
                setIsLoading(false);
            }
        };

        loadKb();
    }, [kbId]);


    // --- Handlers for Basic Info ---

    // Handler for changes in the basic info form inputs
    const handleBasicInfoChange = (field, value) => {
         if (!knowledgeBase?.isOwner) return; // Only allow changes if the user is the owner

        setBasicInfoEditState(prevState => ({
            ...prevState,
            [field]: value
        }));
        setIsBasicInfoDirty(true);
    };

    // Handler for saving basic info changes
    const handleSaveBasicInfo = async () => {
        if (!isBasicInfoDirty || isSavingBasicInfo || !knowledgeBase?.isOwner || !kbId) {
             console.log("[KB Detail Page] Save Basic Info: Button disabled or not owned.");
            return;
        }

        setIsSavingBasicInfo(true);
         setFetchError(null); // Clear general fetch/save error before saving basic info

        try {
             const updateData = {
                 name: basicInfoEditState.name,
                 description: basicInfoEditState.description,
                 isPublic: basicInfoEditState.isPublic,
             };

             console.log("[KB Detail Page] Calling PATCH API to save basic info:", updateData);
             const updatedKbResponse = await updateKnowledgeBase(kbId, updateData);

            setKnowledgeBase(updatedKbResponse); // Update local state with data from API

            setIsBasicInfoDirty(false);
            toast.success('Knowledge Base basic info updated!');
            console.log("[KB Detail Page] Basic info saved successfully.");

        } catch (err) {
            console.error('[KB Detail Page] Error saving basic info:', err);
             setFetchError(`Save failed: ${err.message}`);
            toast.error(`Save failed: ${err.message}`);
        } finally {
            setIsSavingBasicInfo(false);
        }
    };


    // --- Handlers for Adding Content ---

    // Handler for selecting a content addition method (Manual, Upload, URL)
    const handleSelectContentMethod = (method) => {
         if (!knowledgeBase?.isOwner || isAddingContent || isSavingBasicInfo) return;

        if (contentMethodComponents[method]) {
            setAddContentMethod(method);
        } else {
            console.warn(`[KB Detail Page] Attempted to select unknown content method: ${method}`);
             setAddContentMethod(CONTENT_METHODS.CHOICES); // Default
        }
    };

     // Handler to go back to the content addition choices screen
     const handleBackToContentChoices = () => {
         if (isAddingContent) return;
         setAddContentMethod(CONTENT_METHODS.CHOICES);
          setIsAddingContent(false);
     };

     // Handler for adding content (receives data from input components)
     // This handler structures the new content item and calls the PATCH API to update the KB's content
     const handleAddContent = async (contentData) => {
         // contentData structure depends on the method:
         // - Manual: string (text content)
         // - Upload: { type: 'file-upload-text', value: textContent, metadata: { filename: ..., size: ... } }
         // - Paste URL: { type: 'url', value: urlString, metadata: { ... } }

          if (!knowledgeBase?.isOwner || !kbId || isAddingContent || isSavingBasicInfo) {
               console.warn("[KB Detail Page] Attempted to add content while disabled or not owned.");
              toast.error("You can only add content to Knowledge Bases you own.");
              return;
          }

         setIsAddingContent(true);
          setFetchError(null); // Clear any previous errors

         try {
              // Construct a new content item object with a unique ID and type
               let newContentItem = null;
               let itemType = 'unknown'; // Default type

               if (typeof contentData === 'string') { // Manual Input
                    itemType = 'text';
                   newContentItem = {
                       id: `${itemType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                       type: itemType,
                       value: contentData, // Store the text directly
                       addedAt: new Date().toISOString(),
                   };
               } else if (contentData && typeof contentData === 'object' && contentData.type === 'file-upload-text') {
                    // *** Handle data from KbContentUploadFile (TEXT content from a file) ***
                     itemType = 'text'; // Store as type 'text' since we have the text content
                     // You might choose a different type like 'file-text' if needed for distinction
                    newContentItem = {
                         id: `${itemType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                         type: itemType, // Store as 'text' because value is text
                         value: contentData.value, // Store the actual text content from the file
                         metadata: {
                             sourceType: 'file', // Indicate it came from a file
                             filename: contentData.metadata?.filename,
                             size: contentData.metadata?.size,
                             // Add other file metadata if needed
                         },
                          addedAt: new Date().toISOString(),
                          status: 'ready', // Assume text is ready after reading
                     };
                    // If you later implement server-side chunking/processing for large files,
                    // the status would be 'processing' and the backend would handle updates.
               } else if (contentData && typeof contentData === 'object' && contentData.type === 'url') {
                    // *** Handle data from KbContentPasteUrl (URL) ***
                     itemType = 'url';
                    newContentItem = {
                        id: `${itemType}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                        type: itemType,
                        value: contentData.value, // Store the URL string
                         metadata: contentData.metadata,
                         addedAt: new Date().toISOString(),
                          status: 'processing', // URLs typically need backend processing (scraping)
                    };
               } else {
                   console.warn("[KB Detail Page] Unknown or invalid content data structure received:", contentData);
                    toast.error("Invalid content data provided.");
                    setIsAddingContent(false);
                    return; // Stop if data is invalid
               }

              // Ensure a valid item was constructed
               if (!newContentItem) {
                   console.warn("[KB Detail Page] Failed to construct new content item.");
                   toast.error("Failed to process content data.");
                   setIsAddingContent(false);
                   return;
               }

              // Get the current content array from the state (ensure it's an array)
              const currentContent = Array.isArray(knowledgeBase.content) ? knowledgeBase.content : [];

              // Create the new content array by appending the new item
              const updatedContent = [...currentContent, newContentItem];

              // *** Call the API helper to update the KB, sending the entire updated content array ***
              console.log("[KB Detail Page] Calling PATCH API to add content. Sending updated content array:", updatedContent);
              const updatedKbResponse = await updateKnowledgeBase(kbId, { content: updatedContent });

              // Update the local knowledgeBase state with the response from the API
              setKnowledgeBase(updatedKbResponse); // This should include the saved `content` array

             toast.success('Content added successfully! Changes automatically saved.');
             console.log("[KB Detail Page] Content added and KB updated successfully.");

             // Reset back to choices after successful addition
             setAddContentMethod(CONTENT_METHODS.CHOICES);


         } catch (err) {
             console.error('[KB Detail Page] Error adding content:', err);
              setFetchError(`Failed to add content: ${err.message}`);
             toast.error(`Failed to add content: ${err.message}`);
         } finally {
             setIsAddingContent(false); // Indicate content addition process is finished
         }
     };


     // Determine the current content input component to render
     const CurrentContentMethodComponent = contentMethodComponents[addContentMethod];

     // Show loading or error state for initial fetch
     if (isLoading) {
         return (
              <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                 <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading Knowledge Base...
              </div>
         );
     }

     // Show error state if fetch failed or KB data is null/invalid
     if (fetchError || !knowledgeBase) {
         return (
              <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textDanger}`}>
                 <FiAlertTriangle className="mx-auto w-8 h-8 mb-4" />
                 Error loading Knowledge Base: {fetchError || 'Knowledge Base not found.'}
              </div>
         );
     }

    // Render the detail page UI
    return (
        <motion.div
            className="flex flex-col space-y-6 w-full h-full"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        >
             {/* Page Header / KB Name */}
             <motion.div variants={itemVariants}>
                 <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>
                     Knowledge Base: {knowledgeBase.name || 'Unnamed'}
                     {/* Display public/private icon */}
                     {knowledgeBase.isPublic ? (
                         <FiGlobe className={`inline-block ml-3 w-5 h-5 ${uiColors.textSecondary}`} title="Public Knowledge Base" />
                     ) : (
                          <FiLock className={`inline-block ml-3 w-5 h-5 ${uiColors.textSecondary}`} title="Private Knowledge Base" />
                     )}
                 </h1>
             </motion.div>

             {/* Display general error message if any */}
             {fetchError && (
                  <motion.div variants={itemVariants} className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`} role="alert">
                     <FiAlertTriangle className="inline-block mr-2 w-5 h-5" /> {fetchError}
                  </motion.div>
             )}


            {/* Basic Info Section */}
             <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                 variants={sectionVariants}
             >
                 <h2 className={`text-xl font-semibold ${uiColors.textPrimary}`}>Basic Information</h2>
                 {/* Pass data and handlers to the Basic Info form component */}
                 <KbDetailsForm
                     kb={knowledgeBase} // Pass full KB object for read-only display if not owner
                     editState={basicInfoEditState} // Pass editable state for inputs (only used if isOwner)
                     onEditStateChange={handleBasicInfoChange} // Pass change handler (only used if isOwner)
                     onSave={handleSaveBasicInfo} // Pass save handler (only used if isOwner)
                     isSaving={isSavingBasicInfo} // Pass saving state
                     isOwner={knowledgeBase.isOwner} // Tell the form if the user is the owner
                     isDirty={isBasicInfoDirty} // Tell the form if changes were made (only relevant if isOwner)
                 />
             </motion.div>

            {/* Existing Content Section */}
             <motion.div
                 className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                 variants={sectionVariants}
             >
                 <h2 className={`text-xl font-semibold ${uiColors.textPrimary}`}>Knowledge Base Content ({knowledgeBase.content?.length || 0})</h2>
                 {/* Display the list of existing content chunks */}
                 <KbContentList content={knowledgeBase.content || []} />
             </motion.div>


            {/* Add New Content Section (Show only if owned) */}
            {knowledgeBase.isOwner && (
                 <motion.div
                     className={`${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border p-6 space-y-4`}
                     variants={sectionVariants}
                 >
                     <h2 className={`text-xl font-semibold ${uiColors.textPrimary}`}>Add More Content</h2>

                     {/* Conditional rendering based on addContentMethod state */}
                      {addContentMethod === CONTENT_METHODS.CHOICES ? (
                         // Show choices initially
                         // Pass isAddingContent state to disable choices while processing
                         <KbContentAddChoices
                            onSelectMethod={handleSelectContentMethod}
                            isAdding={isAddingContent}
                         />
                     ) : (
                          // Show the selected input form
                          // Pass necessary props: back handler, add content handler, adding state
                         <CurrentContentMethodComponent
                             onBack={handleBackToContentChoices}
                             onAddContent={handleAddContent} // Pass the central handler
                             isAdding={isAddingContent}
                         />
                     )}
                 </motion.div>
             )}

             {/* Optional: Delete KB Button (Show only if owned) */}
             {/* Implement delete handler and button here if needed */}
             {/* {knowledgeBase.isOwner && (
                  <motion.div ... variants={itemVariants}>
                      <button onClick={handleDeleteKb} ... >Delete Knowledge Base</button>
                  </motion.div>
             )} */}

        </motion.div>
    );
}