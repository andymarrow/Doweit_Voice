"use client";

import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import {
	HiOutlineUserCircle,
	HiOutlineChevronUp,
	HiOutlineChevronDown,
	HiLogout,
} from "react-icons/hi";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// Base classes for main header icons that get gradient/scale on hover
const iconBaseClasses =
	"text-gray-600 dark:text-gray-300 transition-all duration-200 ease-in-out hover:scale-105";
// Classes for the gradient hover effect
const iconHoverGradientClasses =
	"hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500";

const UserProfile = () => {
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const { data } = useSession();
	const user = data?.user;

	const router = useRouter();

	const toggleProfileDropdown = (event) => {
		event.stopPropagation();
		setShowProfileDropdown(!showProfileDropdown);
	};

	const closeAllDropdowns = () => {
		setShowProfileDropdown(false);
	};

	const profileDropdownItems = [];

	if (!user)
		return (
			<Link
				href="/sign-in" // Changed href to /sign-in based on button text
				className="ml-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl"
			>
				Sign in →
			</Link>
		);

	return (
		<div className="relative">
			<button
				className={`flex items-center space-x-1 cursor-pointer focus:outline-none text-2xl sm:text-3xl ${iconBaseClasses} ${iconHoverGradientClasses}`}
				onClick={toggleProfileDropdown}
				aria-label="User Profile Menu"
				aria-haspopup="true"
				aria-expanded={showProfileDropdown ? "true" : "false"}
			>
				<HiOutlineUserCircle />
				{showProfileDropdown ? (
					<HiOutlineChevronUp className="h-4 w-4 transition-transform duration-200 text-gray-600 dark:text-gray-300" />
				) : (
					<HiOutlineChevronDown className="h-4 w-4 transition-transform duration-200 text-gray-600 dark:text-gray-300" />
				)}
			</button>

			{/* Profile Dropdown Menu */}
			<AnimatePresence>
				{showProfileDropdown && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-700 rounded-md shadow-lg py-2 z-50 origin-top-right ring-1 ring-black ring-opacity-5 overflow-hidden"
					>
						{/* User Info */}
						<div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600 mb-2">
							<p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 dark:from-cyan-400 dark:to-blue-400">
								{user.name}
							</p>
							<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
								{user.email}
							</p>
						</div>

						{/* Dropdown Menu Items */}
						{profileDropdownItems.map((item, index) => (
							<Link
								key={index}
								href={item.link}
								className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 hover:text-blue-600 dark:hover:text-cyan-400"
								onClick={closeAllDropdowns} // Close ALL dropdowns on item click
							>
								<item.icon className="mr-3 text-lg text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-150" />
								{item.text}
							</Link>
						))}
						<button
							className="group flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150 hover:text-blue-600 dark:hover:text-cyan-400 w-full"
							onClick={async () => {
								await signOut();
								router.refresh();
							}}
						>
							<HiLogout className="mr-3 text-lg text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors duration-150" />{" "}
							Logout
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default UserProfile;
