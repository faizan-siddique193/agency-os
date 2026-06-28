import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. The export MUST be named 'proxy' (not middleware)
export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    // NextAuth/Auth.js session cookies
    const sessionCookie =
        request.cookies.get("next-auth.session-token")?.value ||
        request.cookies.get("__Secure-next-auth.session-token")?.value;

    // 2. The Fast Bouncer: If no cookie exists, redirect to login
    if (!sessionCookie) {
        const callbackUrl = encodeURIComponent(`${pathname}${search}`);
        return NextResponse.redirect(new URL(`/api/auth/signin?callbackUrl=${callbackUrl}`, request.url));
    }

    // Pass through to the Server Components
    return NextResponse.next();
}

// 3. The config matcher remains the same
export const config = {
    matcher: [
        "/w/:path*",
        "/onboarding/:path*",
        "/settings/:path*",
    ],
};