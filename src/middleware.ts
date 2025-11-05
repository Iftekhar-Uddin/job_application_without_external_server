import { NextResponse } from "next/server";
import { auth } from "./auth";
import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const user = req.auth?.user;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin") || nextUrl.pathname.startsWith("/admin/jobs");

  if (isApiAuthRoute) {
    return null
  };

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl))
    }
    return null;
  };

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    const encoded = encodeURIComponent(nextUrl.pathname);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
    );
  }


  if (isAdminRoute) {
    if (!isLoggedIn) {
      const encoded = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
      );
    };

    if (user?.role !== "Admin") {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }
  return null;

});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};













// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";
// import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

// export async function middleware(req: any) {
//   const { nextUrl } = req;
//   const token = await getToken({ req, secret: process.env.AUTH_SECRET });
//   const isLoggedIn = !!token;
//   const userRole = token?.role;

//   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
//   const isAuthRoute = authRoutes.includes(nextUrl.pathname);
//   const isAdminRoute =
//     nextUrl.pathname.startsWith("/admin") ||
//     nextUrl.pathname.startsWith("/api/admin") ||
//     nextUrl.pathname.startsWith("/admin/jobs");

//   if (isApiAuthRoute) return NextResponse.next();

//   if (isAuthRoute && isLoggedIn)
//     return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl));

//   if (!isLoggedIn && !isPublicRoute) {
//     const encoded = encodeURIComponent(nextUrl.pathname + nextUrl.search);
//     return NextResponse.redirect(
//       new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
//     );
//   }

//   if (isAdminRoute && userRole !== "Admin") {
//     return NextResponse.redirect(new URL("/403", nextUrl));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
