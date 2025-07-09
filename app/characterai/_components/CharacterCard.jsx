// characterai/_components/CharacterCard.jsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	FiMessageCircle,
	FiHeart,
	FiShare2, // Share is likely a placeholder for now
	FiUser,
	FiBook,
	FiFilm,
	FiMusic,
	FiMap,
	FiHome,
	FiCpu,
	FiBookOpen,
} from "react-icons/fi";
import { FaFantasyFlightGames } from "react-icons/fa";

// Import constants
import { uiColors } from "@/app/characterai/_constants/uiConstants"; // Adjusted path

// Map behavior strings to icons - Keep as is, assuming backend uses these strings
const behaviorIcons = {
	Scifi: FiCpu,
	Wise: FiBook,
	Movies: FiFilm,
	Songs: FiMusic,
	Adventure: FiMap,
	"Gf/Bf": FiHeart,
	Family: FiHome,
	Friend: FiUser,
	Gamer: FaFantasyFlightGames,
	// Add more mappings as needed for your tags
};

// Animation variants for cards - Keep as is
const cardVariants = {
	hidden: { opacity: 0, scale: 0.9 },
	visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

// Character prop structure expected from backend:
// {
//   id: string,
//   name: string,
//   avatarUrl: string | null, // Changed from avatar
//   description: string, // Combines story/realPersonInfo
//   creatorName: string, // Added creator's name for display
//   creatorId: string, // Added creator's Clerk ID
//   behavior: string[],
//   likes: number, // Changed from string
//   chats: number, // Changed from string
//   isLikedByCurrentUser: boolean // Added based on currentUserId
// }

// Receive currentUserId and onLikeToggle from the parent (page.jsx)
function CharacterCard({ character, currentUserId, onLikeToggle }) {
	// Determine which description to show - Backend might combine this into one field,
	// but let's keep this logic for now if backend sends separate fields or nulls.
	// Assuming backend sends a single `description` field now:
	// const description = character.type === 'real' ? character.realPersonInfo : character.story;
	const description = character.description; // Use the new `description` field

	// Determine if the character is liked by the current user
	// This state is ideally derived from the character object received from the parent,
	// which should include `isLikedByCurrentUser` fetched from the API.
	const isLiked = character.isLikedByCurrentUser; // Assume backend provides this boolean

	// Handler for clicking the like button
	const handleLikeClick = (e) => {
		e.preventDefault(); // Prevent navigating if wrapped in a Link
		if (onLikeToggle && character?.id) {
			onLikeToggle(character.id, isLiked); // Call parent handler
		}
	};

	// Placeholder for Share functionality (client-side or future backend)
	const handleShareClick = (e) => {
		e.preventDefault();
		// Implement share logic here (e.g., copy link to clipboard)
		const shareUrl = `${window.location.origin}/characterai/chat/${character.id}`;
		navigator.clipboard
			.writeText(shareUrl)
			.then(() => {
				alert(`Link copied to clipboard: ${shareUrl}`);
			})
			.catch((err) => {
				console.error("Failed to copy link:", err);
				alert("Could not copy link.");
			});
	};

	return (
		<motion.div
			className={`rounded-lg shadow-sm border ${uiColors.borderPrimary} ${uiColors.bgSecondary} p-4 flex flex-col h-full`}
			// initial="hidden" // Let the parent control initial animation via sectionVariants
			// animate="visible" // Let the parent control animation
			// NOTE: If using parent's staggered animation (sectionVariants), CharacterCard
			// might not need its own `initial`/`animate` props here, but rather just `variants`.
			// However, keeping them here allows individual card animation if needed.
			// We will rely on `sectionVariants` in the parent for the list effect.
			// Remove initial/animate from CharacterCard to use parent's stagger effect:
			// initial="hidden" animate="visible" // <-- Remove these if using staggered list animation from parent
			variants={cardVariants}
		>
			{/* Top Section: Avatar, Name, and Creator */}
			<div className="flex items-start mb-3">
				{/* Character Avatar */}
				<div className="flex-shrink-0 mr-4">
					{character.avatarUrl ? (
						<Image
							src={character.avatarUrl} // Use avatarUrl from backend
							alt={character.name}
							width={64}
							height={64}
							className="rounded-full object-cover" // Added object-cover
						/>
					) : (
						// Fallback for characters without avatars
						<div
							className={`w-16 h-16 rounded-full ${uiColors.bgSecondary} flex items-center justify-center text-xl font-semibold text-gray-500 dark:text-gray-400 border ${uiColors.borderPrimary} flex-shrink-0`}
						>
							{character.name?.charAt(0).toUpperCase() || "?"}
						</div>
					)}
				</div>
				{/* Name, Creator, and Info */}
				<div className="flex-grow">
					<h3
						className={`text-lg font-semibold ${uiColors.textPrimary} leading-tight mb-1`}
					>
						{character.name}
					</h3>
					{/* Display Creator Name */}
					{character.creatorName && (
						<p className={`text-xs ${uiColors.textSecondary} mb-1`}>
							By {character.creatorName}{" "}
							{/* Display creator's name */}
						</p>
					)}
					{/* Behavior Tags */}
					<div className="flex flex-wrap gap-1">
						{character.behavior?.map((b, index) => {
							const Icon = behaviorIcons[b] || FiBookOpen; // Default icon
							return (
								<span
									key={index}
									className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded ${uiColors.accentBadgeBg} ${uiColors.textAccent}`}
								>
									{Icon && <Icon className="mr-1 w-3 h-3" />}{" "}
									{b}
								</span>
							);
						})}
					</div>
				</div>
			</div>

			{/* Story / Description */}
			{/* Added max-h for consistent card height if description length varies */}
			<p
				className={`text-sm ${uiColors.textSecondary} mb-4 flex-grow overflow-hidden text-ellipsis max-h-20`}
			>
				{" "}
				{/* Added max-height */}
				{description}
			</p>

			{/* Metrics and Chat Button */}
			<div
				className={`flex items-center justify-between mt-auto pt-3 border-t ${uiColors.borderPrimary}`}
			>
				{/* Engagement Metrics */}
				<div
					className={`flex items-center text-xs ${uiColors.textSecondary} space-x-3`}
				>
					{/* Like Button/Metric */}
					<button
						onClick={handleLikeClick}
						className={`flex items-center transition-colors ${uiColors.hoverTextAccent} ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`}
						title={isLiked ? "Unlike" : "Like"}
					>
						{/* Change icon color based on isLiked state */}
						<FiHeart
							className={`mr-1 ${isLiked ? uiColors.textAccent : uiColors.textSecondary}`}
						/>
						{character.likes || 0}{" "}
						{/* Display numeric likes, default to 0 */}
					</button>
					{/* Share Metric (Placeholder for now) */}
					<button
						onClick={handleShareClick} // Add click handler for share
						className={`flex items-center transition-colors ${uiColors.hoverTextAccent}`}
						title="Share Character"
					>
						<FiShare2 className="mr-1" /> {character.shares || 0}{" "}
						{/* Display numeric shares, default to 0 */}
					</button>
					{/* Chats Metric */}
					<div className="flex items-center">
						<FiMessageCircle className="mr-1" />{" "}
						{character.chats || 0}{" "}
						{/* Display numeric chats, default to 0 */}
					</div>
				</div>
				{/* Chat Button */}
				<Link href={`/characterai/chat/${character.id}`} legacyBehavior>
					<a
						className={`inline-flex items-center px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${uiColors.accentPrimaryGradient} text-white ${uiColors.hoverBgSubtle}`}
					>
						<span className="flex items-center">
							<FiMessageCircle className="mr-1" />
							Chat
						</span>
					</a>
				</Link>
			</div>
		</motion.div>
	);
}

export default CharacterCard;
