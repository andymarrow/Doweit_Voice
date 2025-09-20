// characterai/create/page.jsx
"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FiSave, FiAlertCircle } from "react-icons/fi";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import ImageUploadSection from "./_components/ImageUploadSection";
import CharacterFormSection from "./_components/CharacterFormSection";
import VoiceSelectionSection from "./_components/VoiceSelectionSection";
import VoiceModal from "./_components/VoiceModal";
import TagsInput from "./_components/TagsInput";
import VisibilityToggle from "./_components/VisibilityToggle";
import LanguageSelectionSection from "./_components/LanguageSelectionSection"; // <-- IMPORT THIS

import {
	uiColors,
	sectionVariants,
	itemVariants,
} from "../_constants/uiConstants";

// Removed supportedLanguages constant

export default function CharacteraiCreatePage() {
	const {
		user,
		isPending: isUserLoading,
	} = useSession();
	const router = useRouter();

	// State for form data
	const [characterData, setCharacterData] = useState({
		name: "",
		tagline: "",
		description: "",
		greeting: "",
		imageFile: null,
		selectedVoice: null, // Vapi voice object from VoiceModal (structure defined by your /api/voices backend)
		selectedLanguage: "en", // <-- ADD STATE FOR SELECTED LANGUAGE, default to English
		allowDynamicGreetings: true,
		tags: [],
		visibility: "public",
	});

	// State for UI control
	const [isSaving, setIsSaving] = useState(false);
	const [showVoiceModal, setShowVoiceModal] = useState(false);
	const [saveError, setSaveError] = useState(null);

	// Memoize user ID
	const currentUserId = useMemo(() => user?.id, [user]);

	// Handlers for updating character data state
	const handleInputChange = (field) => (e) => {
		setCharacterData({ ...characterData, [field]: e.target.value });
	};

	const handleImageSelect = (file) => {
		setCharacterData({ ...characterData, imageFile: file });
	};

	// This handler receives the full Vapi voice object from VoiceModal
	const handleVoiceSelect = (voice) => {
		setCharacterData({ ...characterData, selectedVoice: voice });
		// Optional: If the voice data *did* include language, you could set it here
		// if (voice.language) {
		//      setCharacterData(prevData => ({ ...prevData, selectedVoice: voice, selectedLanguage: voice.language }));
		// } else {
		//      setCharacterData(prevData => ({ ...prevData, selectedVoice: voice }));
		// }
	};

	// Handler for language selection
	const handleLanguageChange = (languageCode) => {
		// <-- ADD HANDLER FOR LANGUAGE CHANGE
		setCharacterData({ ...characterData, selectedLanguage: languageCode });
	};

	const handleDynamicGreetingsToggle = () => {
		setCharacterData({
			...characterData,
			allowDynamicGreetings: !characterData.allowDynamicGreetings,
		});
	};

	const handleAddTag = (tag) => {
		setCharacterData({ ...characterData, tags: [...characterData.tags, tag] });
	};

	const handleRemoveTag = (tagToRemove) => {
		setCharacterData({
			...characterData,
			tags: characterData.tags.filter((tag) => tag !== tagToRemove),
		});
	};

	const handleVisibilityChange = (visibility) => {
		setCharacterData({ ...characterData, visibility: visibility });
	};

	// --- Handle Image Upload to Backend ---
	const uploadImage = async (file) => {
		if (!file || !currentUserId) {
			console.warn("No file or user ID for upload.");
			return null;
		}

		const formData = new FormData();
		formData.append("avatar", file);
		formData.append("userId", currentUserId);

		try {
			const response = await fetch("/api/upload-avatar", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Image upload failed: ${response.status} - ${errorText}`,
				);
			}

			const data = await response.json();
			if (!data.url) {
				throw new Error("Image upload successful, but no URL returned.");
			}
			return data.url;
		} catch (err) {
			console.error("Error uploading image:", err);
			setSaveError(`Failed to upload image: ${err.message}`);
			setIsSaving(false);
			return null;
		}
	};

	// --- Handle Character Creation (Save Button) ---
	const handleCreate = async () => {
		setSaveError(null);
		setIsSaving(true);

		if (!currentUserId) {
			setSaveError("User not logged in.");
			setIsSaving(false);
			router.push("/sign-in");
			return;
		}

		// Update form validation to include language
		if (!isFormValid) {
			setSaveError("Please fill in all required fields.");
			setIsSaving(false);
			return;
		}

		let avatarUrl = null;
		if (characterData.imageFile) {
			avatarUrl = await uploadImage(characterData.imageFile);
			if (avatarUrl === null) {
				return;
			}
		}
		// Note: If you support editing, handle retaining existing image URL here

		if (!characterData.selectedVoice) {
			setSaveError("Please select a voice.");
			setIsSaving(false);
			return;
		}

		// Prepare data for the backend API call
		const characterPayload = {
			creatorId: currentUserId,
			name: characterData.name,
			tagline: characterData.tagline,
			description: characterData.description,
			greeting: characterData.greeting,
			avatarUrl: avatarUrl,
			// Use the Vapi voice details from the selected voice object
			// The voice object from /api/voices now has 'voiceId', 'provider', and 'name' extracted from the assistant endpoint
			voiceId: characterData.selectedVoice.voiceId, // <-- Use the actual Vapi voice ID like "Elliot", "Hana"
			voiceName: characterData.selectedVoice.name, // <-- Friendly name like "Elliot (vapi)"
			voiceProvider: characterData.selectedVoice.platform, // <-- Provider like "vapi", "elevenlabs"
			language: characterData.selectedLanguage, // <-- INCLUDE SELECTED LANGUAGE FROM NEW STATE
			behavior: characterData.tags,
			isPublic: characterData.visibility === "public",
			// Add any Vapi-specific configuration needed for the chat endpoint later
		};

		console.log("Sending character data to backend:", characterPayload);

		try {
			const response = await fetch("/api/characters", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// Add authorization header if your API requires it (e.g., with Clerk session token)
				},
				body: JSON.stringify(characterPayload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(
					`Character creation failed: ${response.status} - ${errorText}`,
				);
			}

			const result = await response.json();
			console.log("Character created successfully!", result);

			setIsSaving(false);
			alert("Character created successfully!");
			router.push(`/characterai/chat/${result.characterId}`);
		} catch (err) {
			console.error("Error creating character:", err);
			setSaveError(`Failed to create character: ${err.message}`);
			setIsSaving(false);
		}
	};

	// Determine if the form is valid
	const isFormValid =
		characterData.name.trim() !== "" &&
		characterData.description.trim() !== "" &&
		characterData.greeting.trim() !== "" &&
		characterData.selectedVoice !== null &&
		characterData.selectedLanguage !== ""; // <-- ADD LANGUAGE TO VALIDATION

	// Show loading state or redirect if user is not loaded/logged in
	if (isUserLoading) {
		return (
			<div
				className={`flex items-center justify-center h-screen text-lg ${uiColors.textSecondary}`}
			>
				Loading user...
			</div>
		);
	}
	if (!user) {
		return (
			<div
				className={`flex flex-col items-center justify-center h-screen text-lg ${uiColors.textDanger}`}
			>
				<FiAlertCircle className="w-10 h-10 mb-4" />
				Please log in to create a character.
			</div>
		);
	}

	return (
		<div className="flex flex-col space-y-6 w-full h-full p-4">
			{/* Page Title */}
			<h1 className={`text-2xl font-bold mb-4 ${uiColors.textPrimary}`}>
				Create New Character
			</h1>
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
			<div className="space-y-8">
				{/* Image Upload */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<ImageUploadSection onImageSelect={handleImageSelect} />
				</motion.div>

				{/* Character Details (Name, Tagline, Description, Greeting) */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
					className="space-y-6"
				>
					<CharacterFormSection
						id="characterName"
						label="Character name"
						description="e.g. Albert Einstein"
						placeholder="Enter character name"
						value={characterData.name}
						onChange={handleInputChange("name")}
						maxLength={100}
					/>
					<CharacterFormSection
						id="characterTagline"
						label="Tagline"
						description="Add a short tagline of your Character"
						placeholder="Enter tagline"
						value={characterData.tagline}
						onChange={handleInputChange("tagline")}
						maxLength={500000000}
					/>
					<CharacterFormSection
						id="characterDescription"
						label="Description"
						description="How would your Character describe themselves? (Max 500 characters)"
						placeholder="Enter description"
						value={characterData.description}
						onChange={handleInputChange("description")}
						maxLength={500000000}
						isTextArea
					/>
					<CharacterFormSection
						id="characterGreeting"
						label="Greeting"
						description="What should your character say when a user starts a new chat? (Max 4096 characters)"
						placeholder="Enter greeting"
						value={characterData.greeting}
						onChange={handleInputChange("greeting")}
						maxLength={5000}
						isTextArea
					/>
				</motion.div>

				{/* Language Selection Section */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<LanguageSelectionSection // <-- ADD THIS SECTION
						selectedLanguage={characterData.selectedLanguage}
						onLanguageChange={handleLanguageChange}
					/>
				</motion.div>

				{/* Voice Selection */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<VoiceSelectionSection
						selectedVoice={characterData.selectedVoice}
						onChooseVoiceClick={() => setShowVoiceModal(true)}
					/>
				</motion.div>

				{/* Allow Dynamic Greetings Toggle */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<div className="flex items-start justify-between w-full sm:max-w-md space-x-4">
						<div className="flex-grow">
							<label
								htmlFor="dynamicGreetingsToggle"
								className={`block text-md font-medium ${uiColors.textSecondary}`}
							>
								Allow dynamic greetings
							</label>
							<p className={`text-sm ${uiColors.textPlaceholder}`}>
								If enabled, the AI may adjust the greeting based on context.
							</p>
						</div>
						<button
							type="button"
							id="dynamicGreetingsToggle"
							onClick={handleDynamicGreetingsToggle}
							className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 ${uiColors.ringAccentShade} focus:ring-offset-2 ${uiColors.ringOffsetPrimary}
                                           ${characterData.allowDynamicGreetings ? `${uiColors.accentPrimaryGradient}` : `${uiColors.bgSecondary} border ${uiColors.borderPrimary}`}`}
						>
							<span className={`sr-only`}>Allow dynamic greetings</span>
							<span
								aria-hidden="true"
								className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200
                                               ${characterData.allowDynamicGreetings ? "translate-x-5" : "translate-x-0"}`}
							></span>
						</button>
					</div>
				</motion.div>

				{/* Tags Input */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<TagsInput
						tags={characterData.tags}
						onAddTag={handleAddTag}
						onRemoveTag={handleRemoveTag}
					/>
				</motion.div>

				{/* Visibility Toggle */}
				<motion.div
					variants={sectionVariants}
					initial="hidden"
					animate="visible"
				>
					<VisibilityToggle
						visibility={characterData.visibility}
						onVisibilityChange={handleVisibilityChange}
					/>
				</motion.div>
			</div>{" "}
			{/* End Form Sections space-y-8 */}
			{/* Save/Create Button */}
			<motion.div
				variants={itemVariants}
				initial="hidden"
				animate="visible"
				className="flex justify-center mt-8 mb-4"
			>
				<button
					type="button"
					onClick={handleCreate}
					disabled={isSaving || !isFormValid || isUserLoading || !user}
					className={`inline-flex items-center px-8 py-4 text-lg font-semibold rounded-md transition-colors shadow-lg
                                    ${uiColors.accentPrimaryGradient} text-white ${isSaving || !isFormValid || isUserLoading || !user ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					{isSaving ? (
						"Creating..."
					) : (
						<>
							<FiSave className="mr-3 w-6 h-6" /> Create Character
						</>
					)}
				</button>
			</motion.div>
			{/* Voice Selection Modal */}
			<VoiceModal
				isOpen={showVoiceModal}
				onClose={() => setShowVoiceModal(false)}
				onVoiceSelect={handleVoiceSelect}
			/>
		</div>
	);
}
