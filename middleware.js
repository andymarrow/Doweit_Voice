import { NextResponse } from "next/server";

export async function middleware(request) {
    // 1. Manually get the session token from cookies
    // Note: The default cookie name is "better-auth.session_token"
    // If you use a custom prefix, adjust the name (e.g., "my-app.session_token")
    const sessionCookie = request.cookies.get("better-auth.session_token");
    
    console.log("sessionCookie", sessionCookie);
    const { pathname } = request.nextUrl;

    const isAuthRoute = pathname.includes("/api/auth");
    const isPublicRoute = ["/", "/sign-in", "/sign-up"].includes(pathname);

    // 2. Perform your checks based on the existence of the cookie
    if (!sessionCookie && !isPublicRoute && !isAuthRoute) {
        console.log("redirecting to signin");
        return NextResponse.redirect(new URL("/sign-in", request.url));
    } else if (sessionCookie && ["/sign-in", "/sign-up"].includes(pathname)) {
        return NextResponse.redirect(new URL("/voice-agents", request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    ],
};