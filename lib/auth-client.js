import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, useSession, signOut, getSession } =
	createAuthClient({
		/** The base URL of the server (optional if you're using the same domain) */
		baseURL: process.env.BASE_URL || "http://localhost:3000",
	});
