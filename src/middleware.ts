import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
  runtime: "nodejs",
};

export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isLoggedIn = !!token;
  const user = token;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isAdminRoute =
    nextUrl.pathname.startsWith("/admin") ||
    nextUrl.pathname.startsWith("/api/admin") ||
    nextUrl.pathname.startsWith("/admin/jobs");

  // Skip API auth routes
  if (isApiAuthRoute) return null;

  // Redirect logged-in users away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl));
    }
    return null;
  }

  // Protect private routes
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    const callback = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callback}`, nextUrl)
    );
  }

  // Admin routes
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const encoded = encodeURIComponent(nextUrl.pathname);
      return NextResponse.redirect(
        new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
      );
    }

    if (user?.role !== "Admin") {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
  }

  return null;
}











// import { NextResponse } from "next/server";
// import { auth } from "./auth";
// import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

// export default auth((req) => {
//   const { nextUrl } = req;
//   const isLoggedIn = !!req.auth;
//   const user = req.auth?.user;
//   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
//   const isAuthRoute = authRoutes.includes(nextUrl.pathname);
//   const isAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin") || nextUrl.pathname.startsWith("/admin/jobs");

//   if (isApiAuthRoute) {
//     return null
//   };

//   if (isAuthRoute) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl))
//     }
//     return null;
//   };


//   if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
//     const callback = encodeURIComponent(nextUrl.pathname + nextUrl.search);
//     return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callback}`, nextUrl));
//   }


//   if (isAdminRoute) {
//     if (!isLoggedIn) {
//       const encoded = encodeURIComponent(nextUrl.pathname);
//       return NextResponse.redirect(
//         new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
//       );
//     };

//     if (user?.role !== "Admin") {
//       return NextResponse.redirect(new URL("/403", nextUrl));
//     }
//   }
//   return null;

// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
//   runtime: "nodejs",
// };










// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export const runtime = "experimental-edge"; // Required for middleware

// const authRoutes = ["/auth/signin", "/auth/register", "/auth/reset", "/newPassword", "/auth/error"];
// const publicRoutes = ["/", "/verifyEmail", "/settings", "/jobs"];
// const Default_Login_Redirect = "/dashboard";

// export async function middleware(req: any) {
//   const { nextUrl } = req;
//   const pathname = nextUrl.pathname;

//   // Get JWT token
//   const token = await getToken({ req, secret: process.env.AUTH_SECRET }) as any;
//   const isLoggedIn = !!token;
//   const userRole = token?.role;

//   const isAuthRoute = authRoutes.includes(pathname);
//   const isPublicRoute = publicRoutes.includes(pathname);
//   const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

//   // 1. Allow public or API auth routes
//   if (pathname.startsWith("/api/auth") || isPublicRoute) return NextResponse.next();

//   // 2. Redirect logged-in users away from auth pages
//   if (isAuthRoute && isLoggedIn) return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl));

//   // 3. Redirect non-logged-in users to sign-in
//   if (!isLoggedIn && !isAuthRoute) {
//     const callback = encodeURIComponent(nextUrl.pathname + nextUrl.search);
//     return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callback}`, nextUrl));
//   }

//   // 4. Admin-only routes
//   if (isAdminRoute && userRole !== "Admin") {
//     if (!isLoggedIn) return NextResponse.redirect(new URL(`/auth/signin`, nextUrl));
//     return NextResponse.redirect(new URL("/403", nextUrl));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
// };







// import { NextResponse } from "next/server";
// import { getToken } from "next-auth/jwt";

// export const runtime = "experimental-edge";

// const apiAuthPrefix = "/api/auth";
// const authRoutes = ["/auth/signin", "/auth/register", "/auth/reset", "/newPassword", "/auth/error"];
// const publicRoutes = ["/", "/verifyEmail", "/settings", "/jobs"];
// const Default_Login_Redirect = "/dashboard";

// export async function middleware(req: any) {
//   const { nextUrl } = req;
//   // Use same secret as NextAuth
//   const token = await getToken({ req, secret: process.env.AUTH_SECRET }) as any;
//   const user = token;
//   const isLoggedIn = !!token;

//   const pathname = nextUrl.pathname;
//   const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(pathname);
//   const isAuthRoute = authRoutes.includes(pathname);
//   const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

//   // Allow API auth routes
//   if (isApiAuthRoute) return NextResponse.next();

//   // Logged-in users trying to access auth pages
//   if (isAuthRoute && isLoggedIn) return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl));

//   // Non-logged-in users trying to access protected pages
//   if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
//     const callback = encodeURIComponent(nextUrl.pathname + nextUrl.search);
//     return NextResponse.redirect(new URL(`/auth/signin?callbackUrl=${callback}`, nextUrl));
//   }

//   // Admin routes
//   if (isAdminRoute && user?.role !== "Admin") {
//     if (!isLoggedIn) return NextResponse.redirect(new URL(`/auth/signin`, nextUrl));
//     return NextResponse.redirect(new URL("/403", nextUrl));
//   }

//   return NextResponse.next();
// }

// // Exclude static files from middleware

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"
//   ],
// };













// import { NextResponse } from "next/server";
// import { auth } from "./auth";
// import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

// export default auth((req) => {
//   const { nextUrl } = req;
//   const isLoggedIn = !!req.auth;
//   const user = req.auth?.user;
//   const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
//   const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
//   const isAuthRoute = authRoutes.includes(nextUrl.pathname);
//   const isAdminRoute = nextUrl.pathname.startsWith("/admin") || nextUrl.pathname.startsWith("/api/admin") || nextUrl.pathname.startsWith("/admin/jobs");

//   if (isApiAuthRoute) {
//     return null
//   };

//   if (isAuthRoute) {
//     if (isLoggedIn) {
//       return NextResponse.redirect(new URL(Default_Login_Redirect, nextUrl))
//     }
//     return null;
//   };

//   if (!isLoggedIn && !isPublicRoute) {
//     let callbackUrl = nextUrl.pathname;
//     if (nextUrl.search) {
//       callbackUrl += nextUrl.search
//     }
//     const encoded = encodeURIComponent(nextUrl.pathname);
//     return NextResponse.redirect(
//       new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
//     );
//   }


// if (isAdminRoute) {
//   if (!isLoggedIn) {
//     const encoded = encodeURIComponent(nextUrl.pathname);
//     return NextResponse.redirect(
//       new URL(`/auth/signin?callbackUrl=${encoded}`, nextUrl)
//     );
//   };

//   if (user?.role !== "Admin") {
//     return NextResponse.redirect(new URL("/403", nextUrl));
//   }
// }
//   return null;

// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };













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
