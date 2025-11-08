"use server";

import * as z from "zod";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/users";
import { loginFormSchema } from "@/schemas";
import { generateTwofactorToken, generateVerificationToken } from "@/data/allToken";
import { prisma } from "@/lib/prisma";
import { sendTwoFactorTokenEmaill, sendVerificationEmaill } from "@/data/mail";
import { getTwoFactorTokenByEmail } from "@/data/twofactorToken";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";
import { signIn } from "@/auth";




export const login = async (data: z.infer<typeof loginFormSchema>, callbackUrl?: string | null) => {

  const validatedData = loginFormSchema.parse(data);

  if (!validatedData) {
    return { error: "Invalid input data" };
  }

  const { email, password, code } = validatedData;

  const userExists = await getUserByEmail(email);

  if (!userExists || !userExists.email || !userExists.password) {
    return { error: "User does not exist" };
  }

  if (!userExists.emailVerified) {
    const token = await generateVerificationToken(userExists.email);

    await sendVerificationEmaill(userExists?.email, token?.token as string)

    return { success: "Confirmation Email has been sent!" }
  }

  if (userExists.isTwoFactorEnabled && userExists.email) {
    if (code) {
      const twoFactorTokwn = await getTwoFactorTokenByEmail(userExists.email);

      if (!twoFactorTokwn) {
        return { error: "Invalid code!" };
      }

      if (twoFactorTokwn.token !== code) {
        return { error: "Invalid code!" };
      }

      const hasExpired = new Date(twoFactorTokwn.expires) < new Date();

      if (hasExpired) {
        return { code: "Code Expired!" }
      }

      await prisma.twoFactorToken.delete({
        where: { identifier: twoFactorTokwn.identifier }
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(userExists.id);

      if (existingConfirmation) {
        await prisma.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        })
      };

      await prisma.twoFactorConfirmation.create({
        data: {
          userId: userExists.id
        }
      })

    } else {

      const twoFactorToken = await generateTwofactorToken(userExists.email);

      await sendTwoFactorTokenEmaill(twoFactorToken.email, twoFactorToken.token);

      return { twoFactor: true }
    }

  };

  try {
    const res = await signIn("credentials", {
      email: userExists.email,
      password: password,
      redirect: false,
      // redirectTo: callbackUrl || Default_Login_Redirect,
    });

    if (res) {
      return { credentialsSuccess: true }
    }

  } catch (error) {

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Email or password is not correct!" };
      }
    }

    throw error;
  }

  return { success: "User logged in successfully" };

};
