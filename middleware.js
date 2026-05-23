import { NextResponse } from "next/server";

export async function middleware(request) {
	const cookieName =
		process.env.NODE_ENV === "production"
			? "__Secure-better-auth.session_token"
			: "better-auth.session_token";
	const cookie = request.cookies.get(cookieName);
	const validCookie = cookie && cookie.value;
	const { pathname } = request.nextUrl;

	// Path prefixes that must stay reachable WITHOUT a dashboard session.
	// The middleware matcher covers all of /api/*, so anything called by an
	// outside party (no session cookie) would otherwise be redirected to
	// /sign-in — which silently breaks webhooks and, for CORS preflights,
	// fails outright ("Redirect is not allowed for a preflight request").
	const PUBLIC_PREFIXES = [
		"/admin", // admin pages handle their own gating
		"/api/admin",
		"/api/auth", // better-auth handler
		"/api/sdk", // SDK endpoints — auth via publishable key + domain whitelist
		"/api/vapi-webhook", // Vapi end-of-call reports
		"/api/integrations/calcom/tool", // Vapi Cal.com tool webhook
		"/api/interview", // candidate interview APIs (session, snapshot, transcript)
		"/interview", // public candidate interview page
	];

	const isPublicPath =
		["/", "/sign-in", "/sign-up"].includes(pathname) ||
		PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));

	if (!validCookie && !isPublicPath) {
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
