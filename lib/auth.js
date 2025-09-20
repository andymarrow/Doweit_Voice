import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database.js";

// dotenv.config({ path: ".env.local" });
console.log(process.env.DATABASE_URL);
console.log(process.env.GOOGLE_CLIENT_ID);

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql"
		usePlural: true,
		transaction: false,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
			clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
		},
	},
	baseURL: process.env.BASE_URL || "http://localhost:3000",
	//... the rest of your config
});

export const getSession = async (headers) => auth.api.getSession({ headers });
