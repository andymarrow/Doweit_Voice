"use client";
// app/callagents/Integrations/_components/IntegrationLogo.jsx
//
// Renders an integration's logo. Falls back to a colored letter badge when
// the image is missing (404) or the integration entry has no logo path.
// We intentionally use a plain <img> rather than next/image because some
// providers don't have a local PNG yet, and next/image throws on missing
// files instead of degrading gracefully.

import React, { useState } from "react";

// Distinct background per provider so the fallback is visually identifiable.
// Tailwind needs the full class string at compile time, so we map to fixed strings.
const FALLBACK_BG = {
    slack: "bg-[#611f69] text-white",
    telegram: "bg-[#229ED9] text-white",
    email: "bg-gradient-to-br from-cyan-500 to-blue-600 text-white",
    calcom: "bg-black text-white",
    twilio: "bg-[#F22F46] text-white",
    google: "bg-gradient-to-br from-blue-500 to-green-500 text-white",
    elevenlabs: "bg-black text-white",
    zapier: "bg-[#FF4F00] text-white",
    trello: "bg-[#0079BF] text-white",
};

export default function IntegrationLogo({
    integration,
    size = 24,
    className = "",
}) {
    const [errored, setErrored] = useState(false);
    const showFallback = errored || !integration?.logo;

    if (showFallback) {
        const bg =
            FALLBACK_BG[integration?.id] ||
            "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
        const letter = (integration?.name || "?").charAt(0).toUpperCase();
        return (
            <div
                className={`flex items-center justify-center rounded-md font-bold ${bg} ${className}`}
                style={{ width: size, height: size, fontSize: Math.max(10, size * 0.5) }}
                aria-label={`${integration?.name || "Integration"} logo`}
            >
                {letter}
            </div>
        );
    }

    return (
        <img
            src={integration.logo}
            alt={`${integration.name} logo`}
            width={size}
            height={size}
            onError={() => setErrored(true)}
            className={className}
            style={{ objectFit: "contain" }}
        />
    );
}
