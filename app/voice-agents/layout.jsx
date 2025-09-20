// c:/Users/Samson/OneDrive/Desktop/doweitvoice/DoweitV3/app/voice-agents/layout.jsx

import React from "react";
import Header from "./_components/header";

// --- ADD THESE IMPORTS ---
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

// --- CONVERT THE COMPONENT TO ASYNC ---
export default async function VoiceAgentsLayout({ children }) {
	return (
		<div>
			<Header />
			<div className="">{children}</div>
		</div>
	);
}
