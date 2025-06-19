"use client";
import { useTheme } from 'next-themes'; // This hook helps toggle themes
import { useEffect, useState } from 'react';
import { HiSun, HiMoon } from 'react-icons/hi'; // Import icons from react-icons/hi

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // To prevent hydration errors
  }, []);

  if (!mounted) return null; // Prevents hydration issues

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-3 bg-gray-200 dark:bg-gray-800 text-black dark:text-white rounded-full transition-all duration-300 ease-in-out hover:scale-105 transform"
    >
      {theme === 'dark' ? (
        <HiSun className="w-6 h-6" /> // Sun icon for light mode
      ) : (
        <HiMoon className="w-6 h-6" /> // Moon icon for dark mode
      )}
    </button>
  );
}
