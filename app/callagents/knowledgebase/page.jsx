// app/callagents/knowledgebase/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiLoader } from 'react-icons/fi'; // Icons
import { toast } from 'react-hot-toast'; // Assuming toast is available

// Import components
import KnowledgeBaseCard from './_components/KnowledgeBaseCard'; // Component to display KB
import AddKnowledgeBaseModal from './_components/AddKnowledgeBaseModal'; // The modal for adding KB

// Import constants - Adjust path as necessary
import { uiColors } from '../_constants/uiConstants';
import { sectionVariants, itemVariants } from '../_constants/uiConstants';

// --- Placeholder Mock Data (Replace with API Call later) ---
// Simulates fetching the user's existing knowledge bases
const fetchMyKnowledgeBases = async () => {
    console.log("Fetching mock user knowledge bases...");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay

    // Mock data structure matching the DB schema
    const mockData = [
        {
            id: 1,
            creatorId: 'user_abc', // Placeholder user ID
            name: 'AutoTrust Cars FAQs',
            description: 'Answers to common questions about car sales and service.',
            isPublic: false,
            content: [{ type: 'text', value: 'What are your hours? We are open 9-6...' }, { type: 'text', value: 'Do you offer financing? Yes, we...' }],
            status: 'ready',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            creatorId: 'user_abc',
            name: 'Pizza Place Menu Items',
            description: 'Details on pizzas, toppings, sides, and drinks.',
            isPublic: false,
            content: [{ type: 'text', value: 'Large pepperoni pizza...' }],
            status: 'ready',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
         {
            id: 3,
            creatorId: 'user_abc',
            name: 'Product Catalog Details',
            description: 'Specifications for product X, Y, Z.',
            isPublic: false,
            content: [], // Empty content example
            status: 'processing', // Processing example
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
    ];

    return mockData; // In real API, filter by creatorId
};

export default function KnowledgeBasePage() {

    const [myKnowledgeBases, setMyKnowledgeBases] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
     const [isCreatingKb, setIsCreatingKb] = useState(false); // State for async creation process


    // --- Fetch user's Knowledge Bases ---
    useEffect(() => {
        const loadKnowledgeBases = async () => {
            setIsLoading(true);
            setFetchError(null);
            try {
                // Replace with API call: const fetchedKBs = await fetch('/api/knowledgebases');
                // Handle API response and errors...
                 const fetchedKBs = await fetchMyKnowledgeBases(); // Using mock data for now
                setMyKnowledgeBases(fetchedKBs);
                console.log("[KnowledgeBasePage] Fetched KBs:", fetchedKBs);
            } catch (err) {
                console.error('[KnowledgeBasePage] Error loading knowledge bases:', err);
                setFetchError(err.message);
                setMyKnowledgeBases([]); // Clear list on error
            } finally {
                setIsLoading(false);
            }
        };

        loadKnowledgeBases();
    }, []); // Empty dependency array: fetch only on initial mount


    // --- Handlers for the Add Knowledge Base Modal ---
    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
         // Clear any previous errors/loading states related to creation
         setIsCreatingKb(false);
         // No need to clear fetchError here, it's for the main list load
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
         // Clear any previous errors/loading states related to creation
         setIsCreatingKb(false);
    };


    // --- Handlers for creating/using KBs from the modal ---

    // Handler for 'Start from Scratch' creation (or 'Use Template')
    // This receives the data needed to create the NEW Knowledge Base
    const handleCreateNewKnowledgeBase = async (newKbData) => {
        console.log("[KnowledgeBasePage] Attempting to create/use KB:", newKbData);

        // In a real app, this would make an API call: POST /api/knowledgebases
        // The newKbData could be { name, description, content, isPublic: false } for scratch
        // Or { name: templateName, description: templateDesc, content: templateContent, isPublic: false } for template

        setIsCreatingKb(true); // Indicate creation process is starting
        // setFetchError(null); // Clear list fetch error - maybe not needed here
        // setAddError(null); // You might add a specific createError state if needed

        try {
             // --- Simulate API Call to Create KB ---
             await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

             // Simulate a successful API response with the newly created KB object
             const createdKb = {
                 id: Math.max(0, ...myKnowledgeBases.map(kb => kb.id)) + 1, // Simulate new ID
                 creatorId: 'user_abc', // Mock user
                 name: newKbData.name,
                 description: newKbData.description || '',
                 isPublic: newKbData.isPublic || false, // Default to false if not provided
                 content: newKbData.content || [], // Should receive content or start empty
                 status: 'ready', // Assume ready after creation
                 createdAt: new Date(),
                 updatedAt: new Date(),
             };
              console.log("[KnowledgeBasePage] Simulated KB created:", createdKb);
             toast.success(`Knowledge Base "${createdKb.name}" created successfully!`);

             // Update the local list state with the new KB
             setMyKnowledgeBases(prevKBs => [...prevKBs, createdKb]);

             // --- End Simulate API Call ---

            handleCloseAddModal(); // Close modal on success

        } catch (err) {
             console.error('[KnowledgeBasePage] Error creating knowledge base:', err);
            // setAddError(err.message); // Set a specific create error state
            toast.error(`Failed to create Knowledge Base: ${err.message}`);
        } finally {
             setIsCreatingKb(false); // Indicate creation process is finished
        }
    };

    // You would pass this handleCreateNewKnowledgeBase down to KbScratchForm and KbTemplateList


    // --- Render ---
    return (
        <div className="flex flex-col space-y-6 w-full h-full">

            {/* Page Title and Add Button */}
             <motion.div
                 className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
                  variants={itemVariants} initial="hidden" animate="visible"
             >
                <h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>Knowledge Bases</h1>
                <button
                    onClick={handleOpenAddModal}
                     disabled={isCreatingKb} // Disable adding while a KB is being created
                     className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                     <FiPlusCircle className="mr-2 w-4 h-4" /> Add Knowledge Base
                 </button>
            </motion.div>

            {/* Optional: Search/Filter Controls */}
            {/* Add search input and filter dropdowns here if needed */}
            {/* <motion.div ... ></motion.div> */}

            {fetchError && ( // Display fetch error message
                  <div className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}>
                     Error loading knowledge bases: {fetchError}
                  </div>
             )}


            {/* Knowledge Base Cards List */}
            <div className="flex-grow overflow-y-auto"> {/* Allow this area to scroll */}
                {isLoading ? (
                    <div className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}>
                         <FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading Knowledge Bases...
                    </div>
                ) : myKnowledgeBases.length === 0 ? (
                    <motion.div
                         variants={sectionVariants} initial="hidden" animate="visible"
                         className={`text-center py-20 ${uiColors.textSecondary}`}
                    >
                        No knowledge bases found. Click "Add Knowledge Base" to create one.
                    </motion.div>
                ) : (
                     <motion.div
                          variants={sectionVariants} initial="hidden" animate="visible"
                         className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-0" // Grid layout, padding adjusted
                     >
                         {/* Map and render KnowledgeBaseCard for each KB */}
                         {myKnowledgeBases.map(kb => (
                              <KnowledgeBaseCard
                                  key={kb.id} // Use KB ID as key
                                  kb={kb} // Pass the KB data
                                   // TODO: Add handlers for View/Edit/Delete actions if needed later
                                   // onView={() => handleViewKb(kb.id)}
                                   // onEdit={() => handleEditKb(kb.id)}
                                   // onDelete={() => handleDeleteKb(kb.id)}
                              />
                         ))}
                     </motion.div>
                 )}
             </div>


            {/* Add Knowledge Base Modal */}
             <AddKnowledgeBaseModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                 onCreateKb={handleCreateNewKnowledgeBase} // Pass the handler for creation
                 isCreating={isCreatingKb} // Pass state to disable modal during creation
             />

        </div>
    );
}