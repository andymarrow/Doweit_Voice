import { NextResponse } from "next/server";

export async function middleware(request) {
	const cookieName =
		process.env.NODE_ENV === "production"
			? "__Secure-better-auth.session_token"
			: "better-auth.session_token";
	const cookie = request.cookies.get(cookieName);
	const validCookie = cookie && cookie.value;
	const { pathname } = request.nextUrl;

	if (
		!validCookie &&
		!["/", "/sign-in", "/sign-up"].includes(pathname) &&
		!pathname.startsWith("/admin") &&
		!pathname.startsWith("/api/admin") &&
		!pathname.includes("/api/auth") &&
		// The SDK endpoints are public by design — they authenticate via the
		// publishable key + per-app domain whitelist inside the route itself.
		// They are called cross-origin from third-party sites with no session
		// cookie; redirecting them to /sign-in turns the CORS preflight into a
		// redirect, which browsers reject ("Redirect is not allowed for a
		// preflight request") — breaking the SDK for every external developer.
		!pathname.startsWith("/api/sdk")
	) {
		console.log("redirecting to signin");
		return NextResponse.redirect(new URL("/sign-in", request.url));
	} else if (validCookie && ["/sign-in", "/sign-up"].includes(pathname)) {
		return NextResponse.redirect(new URL("/voice-agents", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search paramsss
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routess
		// '/(api|trpc)(.*)',
	],
};
