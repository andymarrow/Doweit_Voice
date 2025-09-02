// characterai/create/_components/VoiceModalTabs.jsx
"use client";

import React from "react";
import { uiColors } from "../../_constants/uiConstants"; // Corrected path

// tabs prop format expected: [{ name: 'All', key: 'all' }, { name: 'AI Studio', key: 'ai-studio' }, ...]
function VoiceModalTabs({ activeTab, onTabChange, tabs }) {
	// Added tabs prop
	// Provide a default tabs array if none is passed
	const defaultTabs = [{ name: "Loading...", key: "loading" }];
	const tabsToDisplay = tabs && tabs.length > 0 ? tabs : defaultTabs;

	return (
		<div className={`flex border-b ${uiColors.borderPrimary} -mb-[1px]`}>
			{" "}
			{/* Add negative margin to prevent double border */}
			{tabsToDisplay.map((tab) => {
				const isActive = activeTab === tab.key;
				// Disable tabs if default loading tabs are shown
				const isDisabled = tabsToDisplay === defaultTabs;

				return (
					<button
						key={tab.key}
						onClick={() => !isDisabled && onTabChange(tab.key)} // Only clickable if not disabled
						disabled={isDisabled} // Disable the button itself
						className={`flex-1 text-center px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px]
                                       ${isActive ? `${uiColors.accentPrimary} border-${uiColors.accentPrimaryText}` : `${uiColors.textSecondary} border-transparent ${uiColors.hoverText}`}
                                        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} // Styling for disabled state
                                        `}
					>
						{tab.name}
					</button>
				);
			})}
		</div>
	);
}

export default VoiceModalTabs;

