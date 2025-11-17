import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const apiAuthPrefix = "/api/auth";
const authRoutes = [ "/auth/signin", "/auth/register", "/auth/reset", "/newPassword", "/auth/error"];
const publicRoutes = [ "/", "/verifyEmail", "/settings", "/jobs", "/contact",];
const Default_Login_Redirect = "/dashboard";

export default function middleware(request: NextRequest) {
  const { nextUrl } = request;
  

  const isLoggedIn = request.cookies.has("next-auth.session-token") || request.cookies.has("__Secure-next-auth.session-token");
  
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin");

  if (isApiAuthRoute || nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();
    
    // Add CORS headers for development
    if (process.env.NODE_ENV === "development") {
      response.headers.set(
        "Access-Control-Allow-Origin",
        "http://localhost:3000"
      );
      response.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type");
    }
    return response;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl));
    }
    return NextResponse.next();
  }

  // Redirect unauthenticated users for protected routes
  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // For admin routes, handle role checking in pages themselves
  if (isAdminRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  return NextResponse.next();
}


export const config = {
  matcher: [ "/dashboard/", "/admin/", "/profile/"],
};

