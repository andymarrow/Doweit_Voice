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