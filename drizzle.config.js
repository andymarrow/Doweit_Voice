// drizzle.config.js

// We have temporarily removed 'dotenv/config' as it's not needed for this manual test.

/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./lib/db/schemaCharacterAI.js",
    dialect: "postgresql",
    dbCredentials: {
        // --- MANUAL TEST ---
        // The DATABASE_URL is hardcoded here to bypass any environment variable loading issues.
        url: "postgresql://neondb_owner:npg_1qFX3RTnlcho@ep-twilight-fog-adnbqdka-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    },
};