// drizzle.config.js

import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
// We have temporarily removed 'dotenv/config' as it's not needed for this manual test.

/** @type { import("drizzle-kit").Config } */
export default {
	schema: "./lib/db/schemaCharacterAI.js",
	dialect: "postgresql",
	dbCredentials: {
		// --- MANUAL TEST ---
		// The DATABASE_URL is hardcoded here to bypass any environment variable loading issues.
		url: process.env.DATABASE_URL,
	},
};

