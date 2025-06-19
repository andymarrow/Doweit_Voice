// voice-agents-dashboard/_constants/uiConstants.js

// Framer Motion Variants (for sections and items within sections)
export const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            when: "beforeChildren",
            staggerChildren: 0.1,
        },
    },
};

export const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const toolItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.15 } },
};


// Gradient classes for buttons and other elements
export const accentButtonClasses = `
    bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 text-white
    dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 transition-all
`;

export const accentTextClasses = `
    text-cyan-600 dark:text-purple-400
`;

export const accentBorderClasses = `
    border-cyan-500 dark:border-purple-600
`;

// Specific accent classes for the image UI (purple/cyan dominance)
export const uiAccentClasses = {
    // Active tab background (light purple/dark purple)
    activeTabBg: 'bg-purple-100 dark:bg-purple-800',
    // Active tab text/icon color (purple/white)
    activeTabText: 'text-purple-700 dark:text-white',
    // Primary text color (dark gray/white)
    textPrimary: 'text-gray-900 dark:text-white',
    // Secondary text color (gray/light gray)
    textSecondary: 'text-gray-600 dark:text-gray-300',
    // Border color (light gray/dark gray)
    borderColor: 'border-gray-200 dark:border-gray-700',
    // Background color for cards/tables (white/dark gray)
    bgPrimary: 'bg-white dark:bg-gray-800',
    // Background color for page (very light gray/very dark gray)
    bgPage: 'bg-gray-50 dark:bg-gray-950',
    // Subtle hover background
    hoverBgSubtle: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    // Type badge background (very light purple/subtle dark purple)
    typeBadgeBg: 'bg-purple-50 dark:bg-purple-900',
    // Type badge text color (purple/light purple)
    typeBadgeText: 'text-purple-700 dark:text-purple-300',
    // Help button gradient
    helpButtonGradient: 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 dark:from-cyan-500 dark:to-cyan-700 dark:hover:from-cyan-600 dark:hover:to-cyan-800 transition-all',

    // ADDED: Ring color for focus states matching the accent
    ringAccent: 'focus:ring-purple-500 dark:focus:ring-cyan-500', // Or match textAccent shades: 'focus:ring-purple-700 dark:focus:ring-purple-300' - Let's use a middle ground like 500/500 or 600/400
    ringAccentShade: 'focus:ring-purple-600 dark:focus:ring-purple-400', // Matching textAccent shades more closely
};

export const uiColors = {

     // Primary Accent Colors (Cyan in Light, Purple in Dark)
    accentPrimary: 'text-cyan-600 dark:text-purple-400',
    accentPrimaryBg: 'bg-cyan-600 dark:bg-purple-400', // For solid backgrounds
    accentPrimaryHoverBg: 'hover:bg-cyan-700 dark:hover:bg-purple-500',
    accentPrimaryGradient: 'bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 transition-all',

    // Secondary Accent Colors (Subtle tints/shades for backgrounds, badges)
    accentSubtleBg: 'bg-cyan-100 dark:bg-purple-800', // Used for active sidebar/tab background
    accentBadgeBg: 'bg-purple-500/20 dark:bg-purple-500/30', // Used for badges like '0%'
    accentBadgeText: 'text-cyan-700 dark:text-purple-300', // Used for badge text color

    // Grayscale Palette (Base for text, backgrounds, borders)
    textPrimary: 'text-gray-900 dark:text-white', // Main headings, primary text
    textSecondary: 'text-gray-700 dark:text-gray-300', // Body text, labels
    textPlaceholder: 'text-gray-500 dark:text-gray-500', // Placeholder text, subtle titles
    borderPrimary: 'border-gray-200 dark:border-gray-700', // Main borders
    bgPrimary: 'bg-white dark:bg-gray-800', // Cards, table rows
    bgSecondary: 'bg-gray-100 dark:bg-gray-900', // Input fields, hover backgrounds
    bgPage: 'bg-gray-50 dark:bg-gray-950', // Overall page background

    // Specific Component Colors
    alertWarningBg: 'bg-orange-100 dark:bg-orange-900',
    alertWarningText: 'text-orange-800 dark:text-orange-200',
    alertWarningBorder: 'border-orange-200 dark:border-orange-700',
    typeInboundBg: 'bg-green-100 dark:bg-green-900',
    typeInboundText: 'text-green-800 dark:text-green-200',
    typeOutboundBg: 'bg-blue-100 dark:bg-blue-900',
    typeOutboundText: 'text-blue-800 dark:text-blue-200',

    // Focus/Ring Colors (matching accent)
    ringAccent: 'focus:ring-purple-500 dark:focus:ring-cyan-500', // Used for focus rings

}

export const accentClasses = {
    // Used for active link background (subtle)
    bgSubtle: 'bg-purple-100 dark:bg-purple-800',
    // Used for active link text/icon color
    textBold: 'text-purple-700 dark:text-white',
    // Used for hover background (subtle)
    hoverBg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
    // Used for hover text color
    hoverText: 'hover:text-gray-900 dark:hover:text-white',
    // Used for secondary text (e.g., section titles)
    textSubtle: 'text-gray-500 dark:text-gray-500',
    // Used for accent text/icon (e.g., Academy link, Badge)
    textAccent: 'text-purple-600 dark:text-purple-400',
    // Used for badge background
    badgeBg: 'bg-purple-500/20 dark:bg-purple-500/30', // Use opacity variants
    // Used for Upgrade button gradient
    buttonGradient: 'bg-gradient-to-r from-cyan-400 to-cyan-600 hover:from-cyan-500 hover:to-cyan-700 dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 transition-all',

    buttonBg: 'bg-cyan-400 dark:bg-purple-500 hover:bg-cyan-500 dark:hover:bg-purple-600',
};