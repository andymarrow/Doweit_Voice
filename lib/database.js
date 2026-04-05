// configs/db.jsx

import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({ path: ".env.local" });
// 1. Import ALL your schema files
// Use import * as ... to import all exports from each schema file under a namespace
import * as schemaCharacterAI from "./db/schemaCharacterAI.js"; // Assuming the path is correct relative to root

// 2. Get the database URL from environment variables
// NOTE: We do NOT throw here if DATABASE_URL is missing.
// Next.js build phase imports all route modules (which import this file).
// Throwing at module init causes the Vercel build to fail at "Collecting page data".
// Queries will fail naturally at runtime if DATABASE_URL is not configured.
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://user:pass@host/db";

// 3. Initialize the Neon connection using the URL from env
const sql = neon(databaseUrl);

// 4. Initialize Drizzle, providing the schema objects in the options
// Pass the 'sql' instance as the first argument
// Pass an options object as the second argument, with a 'schema' property
// The 'schema' property should be an object combining all your schema exports
export const db = drizzle(sql, {
	schema: {
		...schemaCharacterAI, // Spread exports from schemaCharacterAI
	},
	// Optional: Add a logger to see the SQL queries Drizzle executes (helpful for debugging)
	// logger: true,
});

// Now, the 'db' object is initialized with knowledge of all tables and relations
// defined in both schema files, enabling the use of db.query... methods.
