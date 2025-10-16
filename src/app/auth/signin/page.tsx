"use client";
import Signin from "@/components/signin";
import { useSession, getCsrfToken  } from "next-auth/react";
import { loginWithGithub, loginWithGoogle } from "@/lib/provider";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";


const SignInPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [csrfToken, setCsrfToken] = useState<string>("");

  React.useEffect(() => {
    if (session) {
      router.push(callbackUrl);
    }
  }, [session, router, callbackUrl]);

  useEffect(() => {
    getCsrfToken().then((token) => {
      if (token) setCsrfToken(token);
    });
  }, []);

  const googleLogin = async () => {
    await loginWithGoogle(callbackUrl);
  };

  const onGitHubLogin = async () => {
    await loginWithGithub(callbackUrl);
  };


  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <div className="flex justify-center items-center h-72 w-[560px] bg-amber-500 rounded-2xl">
          <h2 className="text-center text-4xl text-cyan-700">Loading...</h2>
        </div>
      </div>
    );

  } else if (status === "unauthenticated") {
    {
      return (
        <div className="flex justify-center items-center min-h-[500px]">
          <div className="grid grid-rows-1 md:gap-4 max-h-fit w-auto bg-amber-100 p-4 md:p-8 rounded-md md:rounded-xl">
            <div className="flex flex-col items-center">
              <h1 className="text-orange-500 font-light md:font-bold text-xl md:text-4xl">
                Welcome to job portal
              </h1>
              <div className="flex text-sm md:text-base text-center">
                Sign in to post jobs
                <br />
                <div className="flex items-center gap-2">
                  <div className="h-px bg-borderGray flex-grow"></div>
                  <span className="text-textGrayLight">or</span>
                  <div className="h-px bg-borderGray flex-grow"></div>
                </div>
                <br />
                Apply for opportunity
              </div>
            </div>
            <Signin csrfToken={csrfToken || ""} />
            <div className="grid grid-rows-2 gap-1.5 items-center justify-center md:flex py-1 md:justify-between">
              <button
                onClick={googleLogin}
                className="w-69 md:w-47 flex items-center justify-center gap-1 py-1.5 border border-black bg-black text-green-400 rounded-md hover:text-white hover:border-red-500 transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-base font-medium">Continue with Google</span>
              </button>
              <button
                onClick={onGitHubLogin}
                className="w-69 md:w-47 flex items-center justify-center gap-1 py-1.5 border border-black bg-black text-yellow-400 rounded-md hover:text-white hover:border-red-500 transition-colors duration-200 cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-base font-medium">Continue with GitHub</span>
              </button>
            </div>
            <div className="flex max-w-88 justify-center mt-2">
              <p className="w-full text-center text-xs md:text-sm ">
                By signing in, you agree to&nbsp;
                <a href="#" className="text-blue-600 hover:text-indigo-500">
                  Terms of Service
                </a>
                &nbsp;and&nbsp;
                <a href="#" className="text-blue-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
                , including&nbsp;
                <a href="#" className="text-blue-600 hover:text-indigo-500">
                  Cookie Use.
                </a>
              </p>
            </div>
          </div>
        </div>
      )
    }
  }
}

export default SignInPage;
