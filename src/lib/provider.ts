"use server";

import { signIn, signOut } from "@/auth";
import { Default_Login_Redirect } from "@/routes";


// import { signIn, signOut } from "@/lib/auth";

export const loginWithGoogle = async (callbackUrl:any) => {
  await signIn("google", { callbackUrl:  callbackUrl || Default_Login_Redirect});
};

export const loginWithGithub = async (callbackUrl:any) => {
  await signIn("github", { callbackUrl:  callbackUrl || Default_Login_Redirect});
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
};