"use client";
// Tiny client-side wrapper that just provides the chrome the old client
// layout had. Split out so the parent layout can stay a Server Component
// and run the publicId redirect.

import React from "react";
import { uiColors } from "@/app/callagents/_constants/uiConstants";

export default function ChatRoomShell({ children }) {
	return (
		<div className={`h-full flex flex-col ${uiColors.textPrimary}`}>
			{children}
		</div>
	);
}
