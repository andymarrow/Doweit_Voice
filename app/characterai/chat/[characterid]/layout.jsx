// voice-agents-dashboard/chat/[characterid]/layout.jsx
"use client";

import React from "react";
import { uiColors } from "../../_constants/uiConstants";

export default function ChatRoomLayout({ children }) {
	return (
		<div className={`h-full flex flex-col  ${uiColors.textPrimary}`}>
			{children}
		</div>
	);
}

