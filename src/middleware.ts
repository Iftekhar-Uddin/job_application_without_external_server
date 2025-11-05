import { NextResponse } from "next/server";
import { auth } from "./auth";
import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

// const { auth } = NextAuth(authConfig);

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










// export { auth as middleware} from "@/lib/auth";


// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { auth } from "@/lib/auth";


// const protectedRoutes = ["/user-info"];

// export default async function middleware(request: NextRequest){
//   const session = await auth();
//   const {pathname} = request.nextUrl;

//   const isProtected = protectedRoutes.some((route)=> pathname.startsWith(route));

//   if(!session && !isProtected){
//     return NextResponse.redirect(new URL("api/auth/signin", request.url))
//   }

//   return NextResponse.next();
// }


// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// }














