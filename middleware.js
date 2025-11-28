import { NextResponse } from "next/server";

export async function middleware(request) {
	const cookie = request.cookies.get("better-auth.session_token");
	const validCookie = cookie && cookie.value;
	const { pathname } = request.nextUrl;

	if (
		!validCookie &&
		!["/", "/sign-in", "/sign-up"].includes(pathname) &&
		!pathname.includes("/api/auth")
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
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		// '/(api|trpc)(.*)',
	],
};
