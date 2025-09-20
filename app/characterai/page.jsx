// characterai/page.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { FiSearch } from "react-icons/fi"; // Only need Search icon here
import { useSession } from "@/lib/auth-client";

// Import components
import CharacterCard from "./_components/CharacterCard";

// Import constants
import { uiColors } from "./_constants/uiConstants";
import { sectionVariants, itemVariants } from "./_constants/uiConstants";
import Link from "next/link";

export default function CharacterAiPage() {
	const { data, isPending: isUserLoading } = useSession();
	const user = data?.user;

	const [searchTerm, setSearchTerm] = useState("");
	const [characters, setCharacters] = useState([]); // State to hold the fetched characters
	const [isLoading, setIsLoading] = useState(true); // Loading state
	const [error, setError] = useState(null); // Error state

	// Function to fetch characters from the backend API
	const fetchCharacters = async (searchQuery = "") => {
		setIsLoading(true);
		setError(null);
		try {
			// Call your backend API endpoint
			const response = await fetch(
				`/api/characters?search=${encodeURIComponent(searchQuery)}`,
			);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			// The data structure from the backend should match the expected format for CharacterCard
			setCharacters(data.characters || []); // Assuming API returns { characters: [...] }
		} catch (err) {
			console.error("Failed to fetch characters:", err);
			setError("Failed to load characters.");
			setCharacters([]); // Clear characters on error
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch characters on component mount and when search term changes
	useEffect(() => {
		fetchCharacters(searchTerm); // Fetch when search term changes
		// We don't need the manual client-side filtering now
	}, [searchTerm]); // Dependency array includes searchTerm

	// Memoized current user ID for efficiency in child components
	const currentUserId = useMemo(() => user?.id, [user]);

	// Client-side filtering logic is now removed as search is handled by the API.
	// If you implement server-side filtering, the `characters` state will already be filtered.
	// If you decide to keep client-side filtering for small lists, you would re-add
	// the `useMemo` hook similar to the original code, but it's generally better
	// to push filtering to the backend for scalability.

	// For now, let's assume the `characters` state holds the data returned by the API,
	// which is already filtered by the `searchTerm` query parameter.

	return (
		<div className="flex flex-col space-y-6 w-full h-full">
			{/* Header: Welcome and Search */}
			<motion.div
				className={`flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0 p-4 ${uiColors.bgPrimary} rounded-lg shadow-sm ${uiColors.borderPrimary} border`}
				variants={itemVariants}
				initial="hidden"
				animate="visible"
			>
				{/* Welcome Message */}
				{/* Display user's name from Clerk */}
				<div className="flex-grow">
					<h2 className={`text-xl font-bold ${uiColors.textPrimary}`}>
						{isUserLoading
							? "Loading user..."
							: `Welcome back, ${user?.name || user?.username || "Guest"}`}
					</h2>
				</div>

				{/* Search Input */}
				<div
					className={`flex items-center rounded-md border ${uiColors.borderPrimary} ${uiColors.bgSecondary} w-full sm:w-64 transition-colors focus-within:border-${uiColors.accentPrimaryText} focus-within:ring-1 ${uiColors.ringAccentShade}`}
				>
					<FiSearch
						className={`w-5 h-5 text-gray-400 dark:text-gray-500 ml-3 mr-2 flex-shrink-0`}
					/>
					<input
						type="text"
						placeholder="Search characters..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className={`block w-full p-2 text-sm rounded-r-md ${uiColors.bgSecondary} ${uiColors.textPrimary} outline-none border-none`}
					/>
				</div>
			</motion.div>

			{/* Character Cards Grid */}
			{/* Adjusted padding/margin to fit layout better */}
			<div className="flex-grow overflow-y-auto pb-4 -mb-4 hide-scrollbar">
				{isLoading ? (
					<div className={`text-center py-20 ${uiColors.textSecondary}`}>
						Loading characters...
					</div>
				) : error ? (
					<div className={`text-center py-20 text-red-500`}>{error}</div>
				) : characters.length === 0 ? (
					<div className={`text-center py-20 ${uiColors.textSecondary}`}>
						No characters found matching your search.
					</div>
				) : (
					<motion.div
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 -m-4" // Add padding/margin back to the grid itself
						variants={sectionVariants}
						initial="hidden"
						animate="visible" // Animation for the grid container
					>
						{characters.map((character) => (
							// Pass required props to CharacterCard
							<CharacterCard
								key={character.id}
								character={character}
								// Pass user ID to determine if current user liked the character
								currentUserId={currentUserId}
								// Pass a handler for the like action
								onLikeToggle={async (charId, isCurrentlyLiked) => {
									// Simulate API call for liking/unliking
									console.log(
										`Attempting to ${isCurrentlyLiked ? "unlike" : "like"} character ${charId}`,
									);
									try {
										// Call backend API to toggle like
										const response = await fetch(
											`/api/characters/${charId}/like`,
											{
												method: "POST",
												headers: { "Content-Type": "application/json" },
												body: JSON.stringify({ isLiking: !isCurrentlyLiked }), // Send action type
											},
										);

										if (!response.ok) {
											throw new Error(
												`Failed to toggle like status: ${response.status}`,
											);
										}

										// Update character list state optimistically or by refetching
										// Option 1: Optimistic Update (faster UI, needs careful state management)
										setCharacters((prevChars) =>
											prevChars.map((char) => {
												if (char.id === charId) {
													// Adjust likes count and liked status based on the API response or action
													const updatedLikes = isCurrentlyLiked
														? char.likes - 1
														: char.likes + 1;
													// Assuming the API confirms the new status or sends back updated data
													// For now, just toggle client-side state
													return {
														...char,
														likes: updatedLikes,
														isLikedByCurrentUser: !isCurrentlyLiked, // Update based on action
													};
												}
												return char;
											}),
										);

										// Option 2: Refetch character list (simpler state update, slower UI)
										// fetchCharacters(searchTerm); // Refetch the whole list

										console.log(`Like status toggled for ${charId}`);
									} catch (err) {
										console.error("Failed to toggle like:", err);
										// Revert optimistic update or show error message
									}
								}}
							/>
						))}
					</motion.div>
				)}
			</div>

			{/* "Didn't find a character?" Section */}
			{/* Only show this section if search is NOT active and NOT loading and no error */}
			{!searchTerm && !isLoading && !error && (
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
					className={`text-center py-10 border-t ${uiColors.borderPrimary} mt-6`} // Top border and padding
				>
					<h3 className={`text-lg font-semibold mb-2 ${uiColors.textPrimary}`}>
						Didn't find a character that matches your vibe?
					</h3>
					<p className={`text-sm mb-6 ${uiColors.textSecondary}`}>
						Create your own
					</p>
					{/* Create Button - Link to the create page */}
					<Link href="/characterai/create" legacyBehavior>
						<a
							className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-md transition-colors shadow-sm
                                         ${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}
						>
							<span>✨ Create Your Own</span>
						</a>
					</Link>
				</motion.div>
			)}
		</div>
	);
}
