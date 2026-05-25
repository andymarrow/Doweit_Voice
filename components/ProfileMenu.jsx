// components/ProfileMenu.jsx
//
// The avatar + name + dropdown that lives at the top of the workspace
// sidebar. Lets the user switch theme and sign out from any page in the app.
// Originally inlined inside voice-agents-dashboard/_components/sidebar.jsx —
// extracted here so the recruiter and trainee sidebars can drop the same
// behavior in without duplicating its auth + theme plumbing.

"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { HiSun, HiMoon } from "react-icons/hi";
import { ChevronDown, ChevronUp, LogOut, Settings } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

function initialsFor(name, email) {
    const src = (name || email || "").trim();
    if (!src) return "U";
    const parts = src.split(/\s+/);
    const first = (parts[0]?.[0] || "").toUpperCase();
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] || "").toUpperCase() : "";
    return (first + last) || src[0].toUpperCase();
}

// Tiny inline theme toggle — the standalone Themetoggle component has
// hard-coded gray styles that don't match the colored sidebars, so we render
// the icons directly here.
function InlineThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    const current = theme === "system" ? resolvedTheme : theme;
    const isDark = current === "dark";
    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? <HiSun className="w-4 h-4" /> : <HiMoon className="w-4 h-4" />}
        </button>
    );
}

// `variant` lets each sidebar tune the colors without redefining the whole
// component. Add new variants here as new sidebars adopt the menu.
const VARIANTS = {
    // Recruiter sidebar — purple accent, white bg in light, gray-800 in dark.
    purple: {
        avatar: "bg-purple-600 dark:bg-purple-500",
        hoverRow: "hover:bg-purple-50 dark:hover:bg-gray-700",
        panel: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    },
    // Trainee sidebar — same accent, white bg.
    indigo: {
        avatar: "bg-gradient-to-br from-purple-500 to-blue-500",
        hoverRow: "hover:bg-purple-50 dark:hover:bg-gray-700",
        panel: "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700",
    },
};

/**
 * @param {Object} props
 * @param {boolean} [props.collapsed=false] — when true, only the avatar shows.
 * @param {"purple"|"indigo"} [props.variant="purple"]
 */
export default function ProfileMenu({ collapsed = false, variant = "purple" }) {
    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const displayName = user?.name || user?.email || "Account";
    const avatarLetters = initialsFor(user?.name, user?.email);
    const v = VARIANTS[variant] || VARIANTS.purple;
    const ref = useRef(null);

    // Click-outside closes the menu so it doesn't get stranded open after
    // the user moves on.
    useEffect(() => {
        if (!open) return;
        function onClick(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={cn(
                    "w-full flex items-center text-left rounded-xl transition-colors text-gray-900 dark:text-gray-100",
                    collapsed ? "justify-center p-2" : "justify-between gap-2 px-2.5 py-2",
                    "hover:bg-gray-100 dark:hover:bg-gray-700/60",
                )}
                title={collapsed ? displayName : undefined}
            >
                <div className={cn("flex items-center min-w-0", collapsed ? "" : "gap-2.5")}>
                    {user?.image ? (
                        <img
                            src={user.image}
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                            v.avatar,
                        )}>
                            {avatarLetters}
                        </div>
                    )}
                    {!collapsed && (
                        <span className="font-semibold text-xs truncate">{displayName}</span>
                    )}
                </div>
                {!collapsed && (
                    <span className="text-gray-400 flex-shrink-0">
                        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                )}
            </button>

            {open && (
                <div
                    className={cn(
                        "absolute z-50 rounded-xl shadow-lg border overflow-hidden text-sm",
                        v.panel,
                        // Collapsed sidebars are narrow, so the dropdown floats to the
                        // right of the avatar instead of below it.
                        collapsed
                            ? "left-full ml-2 bottom-0 w-48"
                            : "left-0 right-0 bottom-full mb-2",
                    )}
                >
                    {!collapsed && (
                        <div className="px-3 py-2.5 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                {user?.email || "Signed in"}
                            </p>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                {displayName}
                            </p>
                        </div>
                    )}
                    <Link
                        href="/settings"
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200",
                            v.hoverRow,
                        )}
                        onClick={() => setOpen(false)}
                    >
                        <Settings size={14} />
                        Settings
                    </Link>
                    <div className={cn(
                        "flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200",
                        v.hoverRow,
                    )}>
                        <span>Theme</span>
                        <InlineThemeToggle />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setOpen(false);
                            signOut();
                        }}
                        className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 border-t border-gray-100 dark:border-gray-700",
                            v.hoverRow,
                        )}
                    >
                        <LogOut size={14} />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}
