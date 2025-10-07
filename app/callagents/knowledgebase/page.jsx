// app/callagents/knowledgebase/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPlusCircle, FiLoader, FiAlertTriangle } from "react-icons/fi"; // Icons
import { toast } from "react-hot-toast"; // Assuming toast is available
import { useRouter } from "next/navigation";

// Import components
import KnowledgeBaseCard from "./_components/KnowledgeBaseCard";
import AddKnowledgeBaseModal from "./_components/AddKnowledgeBaseModal";

// Import constants - Adjust path as necessary
import { uiColors } from "../_constants/uiConstants";
import { sectionVariants, itemVariants } from "../_constants/uiConstants";

// --- API Helper Functions ---

// Helper function to fetch user's owned knowledge bases
const fetchMyKnowledgeBases = async () => {
	console.log("[KnowledgeBasePage] Calling GET /api/knowledgebases...");
	const response = await fetch("/api/knowledgebases"); // Call the backend API
	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to fetch knowledge bases");
	}
	const kbs = await response.json();
	console.log("[KnowledgeBasePage] Fetched KBs:", kbs);
	// API is expected to return an array of KBs owned by the user, including `isOwner: true`
	return kbs;
};

// Helper function for creating a new KB
const createKnowledgeBase = async (newKbData) => {
	console.log(
		"[KnowledgeBasePage] Calling POST /api/knowledgebases with data:",
		newKbData,
	);
	const response = await fetch("/api/knowledgebases", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(newKbData),
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || "Failed to create knowledge base");
	}
	const createdKb = await response.json();
	console.log("[KnowledgeBasePage] KB created:", createdKb);
	// API is expected to return the newly created KB object, including its new ID and `isOwner: true`
	return createdKb;
};

export default function KnowledgeBasePage() {
	const router = useRouter();

	const [myKnowledgeBases, setMyKnowledgeBases] = useState([]);
	const [isLoading, setIsLoading] = useState(true); // Loading initial list
	const [fetchError, setFetchError] = useState(null); // Error for initial fetch

	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [isCreatingKb, setIsCreatingKb] = useState(false); // State for the creation API call

	// --- Fetch user's Knowledge Bases on mount ---
	useEffect(() => {
		const loadKnowledgeBases = async () => {
			setIsLoading(true);
			setFetchError(null); // Clear previous fetch errors
			try {
				// Call the API helper
				const fetchedKBs = await fetchMyKnowledgeBases();
				setMyKnowledgeBases(fetchedKBs);
			} catch (err) {
				console.error(
					"[KnowledgeBasePage] Error loading knowledge bases:",
					err,
				);
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
		// Reset any creation-related states when opening the modal
		setIsCreatingKb(false);
		// setCreateError(null); // If you add a specific createError state
	};

	const handleCloseAddModal = () => {
		setIsAddModalOpen(false);
		// Reset any creation-related states when closing the modal
		setIsCreatingKb(false);
		// setCreateError(null);
		// Clear fetch error here IF the modal's interaction was causing it
		// Otherwise, keep fetchError for the main list display
		setFetchError(null); // Clear main page error when modal is closed
		router.refresh();
	};

	// --- Handler for creating a KB from the modal (Scratch or Template) ---
	// This handler is called by the modal component (AddKnowledgeBaseModal)
	// and it initiates the actual API call to create the KB.
	const handleCreateNewKnowledgeBase = async (newKbData) => {
		console.log(
			"[KnowledgeBasePage] Initiating KB creation via API...",
			newKbData,
		);

		// Clear any previous errors related to creation before starting
		setFetchError(null); // Or a dedicated createError state
		setIsCreatingKb(true); // Indicate creation process is starting

		try {
			// Call the API helper to create the KB
			const createdKb = await createKnowledgeBase(newKbData);

			router.refresh();
			toast.success(`Knowledge Base "${createdKb.name}" created successfully!`);

			// *** Update local state AND Navigate to the new KB's detail page ***
			// Add the newly created KB to the state *if* it's an owned KB (which POST should return)
			if (createdKb.isOwner) {
				setMyKnowledgeBases((prevKBs) => [...prevKBs, createdKb]);
			}

			handleCloseAddModal(); // Close the modal first
			router.push(`/callagents/knowledgebase/${createdKb.id}`); // Navigate to the detail page
		} catch (err) {
			console.error("[KnowledgeBasePage] Error creating knowledge base:", err);
			// Set error state for creation
			setFetchError(`Failed to create Knowledge Base: ${err.message}`); // Use fetchError for simplicity
			toast.error(`Failed to create Knowledge Base: ${err.message}`);
		} finally {
			setIsCreatingKb(false); // Indicate creation process is finished
		}
	};

	// --- Handler for Navigating to Detail Page ---
	// This handler is called by the KnowledgeBaseCard component
	const handleCardClick = (kbId) => {
		console.log(`[KnowledgeBasePage] Navigating to KB ${kbId}`);
		router.push(`/callagents/knowledgebase/${kbId}`); // Navigate using router
	};

	// --- Handler for Deleting a KB (Optional, to be added later) ---
	// This handler would be passed down to KnowledgeBaseCard if you add a delete button there
	// const handleDeleteKb = async (kbId) => { ... call DELETE /api/knowledgebases/[kbid] ... update state ... }

	// --- Render ---
	return (
		<div className="flex flex-col space-y-6 w-full h-full">
			{/* Page Title and Add Button */}
			<motion.div
				className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
				variants={itemVariants}
				initial="hidden"
				animate="visible"
			>
				<h1 className={`text-2xl font-bold ${uiColors.textPrimary}`}>
					Knowledge Bases
				</h1>
				<button
					onClick={handleOpenAddModal}
					// Disable adding while the initial list is loading OR a KB is being created
					disabled={isLoading || isCreatingKb}
					className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
				>
					{isCreatingKb ? (
						<FiLoader className="mr-2 w-4 h-4 animate-spin" />
					) : (
						<FiPlusCircle className="mr-2 w-4 h-4" />
					)}
					Add Knowledge Base
				</button>
			</motion.div>

			{fetchError && ( // Display fetch or create error message
				<div
					className={`mb-4 p-3 rounded-md ${uiColors.alertDangerBg} ${uiColors.alertDangerText} text-sm`}
					role="alert"
				>
					<FiAlertTriangle className="inline-block mr-2 w-5 h-5" /> {fetchError}
				</div>
			)}

			{/* Knowledge Base Cards List */}
			<div className="flex-grow overflow-y-auto">
				{isLoading ? (
					<div
						className={`flex flex-col items-center justify-center h-full text-center ${uiColors.textSecondary}`}
					>
						<FiLoader className="animate-spin mx-auto w-8 h-8 mb-4" /> Loading
						Knowledge Bases...
					</div>
				) : myKnowledgeBases.length === 0 && !fetchError ? ( // Show empty state only if not loading, no error, and list is empty
					<motion.div
						variants={sectionVariants}
						initial="hidden"
						animate="visible"
						className={`text-center py-20 ${uiColors.textSecondary}`}
					>
						No knowledge bases found. Click "Add Knowledge Base" to create one.
					</motion.div>
				) : (
					// Show list if not loading and list is not empty
					<motion.div
						variants={sectionVariants}
						initial="hidden"
						animate="visible"
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 md:p-0"
					>
						{myKnowledgeBases.map((kb) => (
							<KnowledgeBaseCard
								key={kb.id} // Use KB ID as key
								kb={kb} // Pass the KB data
								// Pass the navigation handler to make the card clickable
								onClick={() => handleCardClick(kb.id)}
								// Optional: Pass delete handler if you add a delete button here
								// onDelete={handleDeleteKb}
								// Note: Edit/View handlers are typically not needed on the main list card as the click navigates
							/>
						))}
					</motion.div>
				)}
			</div>

			{/* Add Knowledge Base Modal */}
			<AddKnowledgeBaseModal
				isOpen={isAddModalOpen}
				onClose={handleCloseAddModal}
				// Pass the creation handler down to the modal
				onCreateKb={handleCreateNewKnowledgeBase}
				// Pass state to disable modal interaction during creation
				isCreating={isCreatingKb}
			/>
		</div>
	);
}
