"use client";
import React, { useEffect, useState, useMemo } from "react"; // Import useMemo
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence
import { useTheme } from "next-themes";
import Image from "next/image";

// Define a larger set of agent data with categories
const exploreAgentData = [
	{
		id: "alinax",
		type: "Call Agent", // Category
		badge: "CR", // Badge shown on card (Call/Recruiter?) - based on image
		name: "Alinax #012",
		description:
			"Alina - our most famous And Successful. Real state call agent out in the market.",
		imagePath: "/voiceagents/1.jpg", // Replace with actual paths
		link: "/agents/alinax",
		stat: "220+ Calls", // Stat to display
		statIcon: "/voiceagents/1.jpg", // Small avatar icon next to stat
	},
	{
		id: "selxj",
		type: "Call Agent", // Category
		badge: "CR", // Badge
		name: "Selxj #009",
		description:
			"Selxj - A Call agent in taking appointments in the field of Clinic receptions.",
		imagePath: "/voiceagents/2.jpg", // Replace with actual paths
		link: "/agents/selxj",
		stat: "160+ Calls",
		statIcon: "/voiceagents/2.jpg", // Small avatar icon
	},
	{
		id: "zaras",
		type: "Character", // Category
		badge: "CH", // Badge
		name: "Zaras #028",
		description:
			"Zaras - a scifi character thats gotten very deep voice, talks about all the space adventures he had before the chats.",
		imagePath: "/voiceagents/3.jpg", // Replace with actual paths
		link: "/agents/zaras",
		stat: "220+ Chat", // Different stat
		statIcon: "/voiceagents/3.jpg", // Small avatar icon
	},
	{
		id: "agent-4",
		type: "Character",
		badge: "CH",
		name: "Mystic #045",
		description:
			"Mystic - A wise old sage with tales from ancient times, ready to share forgotten lore.",
		imagePath: "/voiceagents/4.jpg", // Replace
		link: "/agents/mystic",
		stat: "80+ Chat",
		statIcon: "/voiceagents/4.jpg",
	},
	{
		id: "agent-5",
		type: "Recruiter",
		badge: "CR",
		name: "HireBot #011",
		description:
			"HireBot - Streamlines your hiring process by conducting initial candidate screenings.",
		imagePath: "/voiceagents/5.jpg", // Replace
		link: "/agents/hirebot",
		stat: "50+ Interviews",
		statIcon: "/voiceagents/5.jpg",
	},
	{
		id: "agent-6",
		type: "Audio Books",
		badge: "AB", // Custom badge
		name: "Narrator #007",
		description:
			"Narrator - Brings your favorite stories to life with expressive and engaging narration.",
		imagePath: "/voiceagents/6.jpg", // Replace
		link: "/agents/narrator",
		stat: "15+ Books",
		statIcon: "/voiceagents/6.jpg",
	},
	// Add more agents as needed to fill out the grid and test filtering
	{
		id: "agent-7",
		type: "Call Agent",
		badge: "CR",
		name: "Support #021",
		description:
			"Support - Handles customer inquiries and provides instant assistance.",
		imagePath: "/voiceagents/7.jpg", // Replace
		link: "/agents/support",
		stat: "300+ Calls",
		statIcon: "/voiceagents/7.jpg",
	},
	{
		id: "agent-8",
		type: "Character",
		badge: "CH",
		name: "Cyberpunk #084",
		description:
			"Cyberpunk - A gritty inhabitant of the future city, full of street wisdom.",
		imagePath: "/voiceagents/8.jpg", // Replace
		link: "/agents/cyberpunk",
		stat: "110+ Chat",
		statIcon: "/voiceagents/8.jpg",
	},
	{
		id: "agent-9",
		type: "Recruiter",
		badge: "CR",
		name: "SkillFind #003",
		description:
			"SkillFind - Matches candidates to job openings based on their skills and experience.",
		imagePath: "/voiceagents/9.jpg", // Replace
		link: "/agents/skillfind",
		stat: "40+ Matches",
		statIcon: "/voiceagents/9.jpg",
	},
	{
		id: "agent-10",
		type: "Audio Books",
		badge: "AB",
		name: "Storyteller #019",
		description:
			"Storyteller - Crafts and reads original short stories across various genres.",
		imagePath: "/voiceagents/5.jpg", // Replace
		link: "/agents/storyteller",
		stat: "20+ Stories",
		statIcon: "/voiceagents/5.jpg",
	},
];

// Define categories for filters
const categories = [
	"All Agents",
	...new Set(exploreAgentData.map((agent) => agent.type)),
];

function Exploreagents() {
	const { theme } = useTheme();
	const [isMounted, setIsMounted] = useState(false);
	const [activeFilter, setActiveFilter] = useState("All Agents");

	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Filter agents based on the active filter
	const filteredAgents = useMemo(() => {
		if (activeFilter === "All Agents") {
			return exploreAgentData;
		}
		return exploreAgentData.filter((agent) => agent.type === activeFilter);
	}, [activeFilter]); // Recalculate only when activeFilter changes

	// Dynamic Colors based on Theme (adjust as needed)
	const sectionBg = theme === "dark" ? "bg-black" : "bg-white"; // Different background for contrast
	const titleColor = theme === "dark" ? "text-white" : "text-gray-800";
	const titleHighlightColor =
		theme === "dark" ? "text-purple-500" : "text-cyan-500"; // Highlight color opposite of Popular
	const filterButtonInactiveBg =
		theme === "dark"
			? "bg-gray-800 hover:bg-gray-700"
			: "bg-gray-200 hover:bg-gray-300";
	const filterButtonInactiveText =
		theme === "dark" ? "text-gray-400" : "text-gray-700";
	const filterButtonActiveBg =
		theme === "dark" ? "bg-cyan-600" : "bg-purple-600"; // Active button matches accent
	const filterButtonActiveText = "text-white";
	const cardBg = theme === "dark" ? "bg-gray-800" : "bg-white"; // Card background
	const cardBorderColor =
		theme === "dark" ? "border-gray-700" : "border-gray-200";
	const cardShadow =
		theme === "dark"
			? "shadow-lg shadow-cyan-500/10"
			: "shadow-lg shadow-purple-500/10"; // Subtle shadow
	const cardBadgeBg = theme === "dark" ? "bg-purple-600/80" : "bg-cyan-600/80"; // Badge background
	const cardBadgeText = "text-white";
	const cardNameColor = theme === "dark" ? "text-white" : "text-white";
	const cardDescriptionColor =
		theme === "dark" ? "text-gray-300" : "text-gray-300";
	const cardStatColor = theme === "dark" ? "text-purple-600" : "text-cyan-400"; // Stat number color

	// Framer Motion Variants
	const titleVariants = {
		hidden: { opacity: 0, y: -50 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const filterVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.3 } },
	};

	const cardContainerVariants = {
		hidden: {},
		visible: {
			transition: {
				staggerChildren: 0.08, // Stagger items on initial load
			},
		},
	};

	const cardVariants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				type: "spring",
				stiffness: 50,
				damping: 10,
			},
		},
		hover: {
			scale: 1.02,
			boxShadow:
				theme === "dark"
					? "0 10px 25px rgba(74, 222, 212, 0.2)" // Cyan shadow on hover
					: "0 10px 25px rgba(139, 92, 246, 0.2)", // Purple shadow on hover
			transition: { duration: 0.2 },
		},
		// Added exit animation for AnimatePresence
		exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
	};

	if (!isMounted) {
		return null;
	}

	return (
		<section className={`py-16 ${sectionBg}`}>
			<div className="container mx-auto px-4 max-w-6xl">
				{/* Section Title */}
				<motion.h2
					className={`text-4xl sm:text-5xl font-extrabold text-center mb-8 ${titleColor}`}
					variants={titleVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
				>
					EXPLORE <span className={titleHighlightColor}>AGENTS</span>
				</motion.h2>

				{/* Filter Buttons */}
				<motion.div
					className="flex flex-wrap justify-center gap-3 mb-12"
					variants={filterVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.3 }}
				>
					{categories.map((category) => (
						<button
							key={category}
							className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ease-in-out ${
								activeFilter === category
									? `${filterButtonActiveBg} ${filterButtonActiveText}`
									: `${filterButtonInactiveBg} ${filterButtonInactiveText}`
							}`}
							onClick={() => setActiveFilter(category)}
						>
							{category}
						</button>
					))}
				</motion.div>

				{/* Agents Grid */}
				{/* Using CSS Grid for the main layout */}
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" // Adjusted grid columns for 3 per row on large
					variants={cardContainerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, amount: 0.1 }} // Adjust viewport amount if needed
				>
					{/* AnimatePresence allows exit animations when items are removed (filtered out) */}
					<AnimatePresence>
						{filteredAgents.map((agent) => (
							<motion.div
								key={agent.id} // Key is CRITICAL for AnimatePresence
								className={`group relative rounded-xl overflow-hidden border ${cardBorderColor} ${cardBg} ${cardShadow} cursor-pointer min-h-[300px]`} // Min height hint
								variants={cardVariants}
								whileHover="hover"
								exit="exit" // Apply exit animation variant
								layout // Enable layout animations for smooth position changes
							>
								{/* Agent Image - Positioned to cover the container */}
								<Image
									src={agent.imagePath}
									alt={`${agent.name} Avatar`}
									layout="fill"
									objectFit="cover"
									className="transition-transform duration-300 group-hover:scale-105"
								/>

								{/* Overlay/Gradient at the bottom for text readability */}
								<div
									className="absolute inset-x-0 bottom-0 h-1/2
                                               bg-gradient-to-t from-black/80 via-black/40 to-transparent
                                               z-10 pointer-events-none" // pointer-events-none allows clicks to pass through
								></div>

								{/* Card Content (Text, Badges, Stats) - Positioned over the image/overlay */}
								{/* Added p-4 for padding */}
								<div className="absolute inset-0 p-7 z-20 flex flex-col justify-end">
									{/* Top Left Badge */}
									<div
										className={`absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full ${cardBadgeBg} ${cardBadgeText} z-30`}
									>
										{agent.badge}
									</div>

									{/* Bottom Right Stat (Small Avatar + Count) */}
									<div className="absolute   bottom-4 right-4 flex items-center z-30">
										<div className="relative w-6 h-6 rounded-full overflow-hidden border border-white mr-1">
											{" "}
											{/* Adjust size/border */}
											{agent.statIcon && (
												<Image
													src={agent.statIcon}
													alt="Stat Icon"
													layout="fill"
													objectFit="cover"
												/>
											)}
										</div>
										<span className={`text-xs font-semibold ${cardStatColor}`}>
											{agent.stat}
										</span>
									</div>

									{/* Agent Name */}
									<h3
										className={`text-xl font-bold mb-1 ${cardNameColor} text-shadow-sm`}
									>
										{agent.name}
									</h3>

									{/* Agent Description */}
									<p
										className={`text-sm mb-4 ${cardDescriptionColor} text-shadow-sm`}
									>
										{agent.description}
									</p>

									{/* Button (Link) - You could also make the whole card clickable */}
									{/* For simplicity, we made the whole card clickable via the outer Link/motion.div */}
									{/* If you want a specific button, uncomment/add it here */}
									{/* <Link href={agent.link} legacyBehavior>
                                        <a className="...">Talk to {agent.name.split(' ')[0]}</a>
                                    </Link> */}
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
			</div>
		</section>
	);
}

export default Exploreagents;

