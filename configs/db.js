// configs/db.jsx

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// 1. Import ALL your schema files
// Use import * as ... to import all exports from each schema file under a namespace
import * as schemaCharacterAI from "@/lib/db/schemaCharacterAI"; // Assuming the path is correct relative to root

// 2. Get the database URL from environment variables (BEST PRACTICE)
// Replace the hardcoded URL with reading from process.env
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	// Add a check and throw an error if the environment variable is missing
	// This prevents cryptic errors later
	throw new Error("DATABASE_URL environment variable is not set.");
}

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
