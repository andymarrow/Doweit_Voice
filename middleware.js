import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// const isProtectedRoute = createRouteMatcher(["/voice-agents(.*)"]);

// export default clerkMiddleware((auth, req) => {
// 	if (isProtectedRoute(req)) auth().protect();
// });

export async function middleware(request) {
	const sessionCookie = getSessionCookie(request);
	console.log("sessionCookie", sessionCookie);
	const { pathname } = request.nextUrl;

	if (
		!sessionCookie &&
		!["/", "/sign-in", "/sign-up"].includes(pathname) &&
		!pathname.includes("/api/auth")
	) {
		console.log("redirecting to signin");
		return NextResponse.redirect(new URL("/sign-in", request.url));
	} else if (sessionCookie && ["/sign-in", "/sign-up"].includes(pathname)) {
		return NextResponse.redirect(new URL("/voice-agents", request.url));
	}
	return NextResponse.next();
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		// '/(api|trpc)(.*)',
	],
};
