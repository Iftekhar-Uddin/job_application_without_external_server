import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { apiAuthPrefix, authRoutes, publicRoutes, Default_Login_Redirect } from "./routes";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLogedIn = !!req.auth;
  const isApiAuthRote = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isApiAuthRote) {
    return null
  };

  if (isAuthRoute) {
    if (isLogedIn) {
      return Response.redirect(new URL(Default_Login_Redirect, nextUrl))
    }
    return null;
  };


  if (!isLogedIn && !isPublicRoute ) {
    // return Response.redirect(new URL("/auth/signin", nextUrl));
    let callbackUrl = nextUrl.pathname;

    if(nextUrl.search){
      callbackUrl += nextUrl.search
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);
  
    return Response.redirect(new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl));
  };

  return null;

});


export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}









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














