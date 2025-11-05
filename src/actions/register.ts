"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { registerFormSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/data/allToken";
import { sendVerificationEmaill } from "@/data/mail";


export const registers = async (data: z.infer<typeof registerFormSchema>) => {
  try {
    const validatedData = registerFormSchema.parse(data);

    if (!validatedData) {
      return { error: "Invalid input data" };
    }

    const { email, name, password, confirmPassword } = validatedData;

    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      return { error: "Email already is in use. please try another one." };
    }

    const lowerCaseEmail = email.toLowerCase();

    const user = await prisma.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
      },
    });

    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmaill(verificationToken.email, verificationToken.token)

    return { success: "Confirmation email has been sent!" };

  } catch (error) {
    console.error("Database error:", error);

    if ((error as { code: string }).code === "ETIMEDOUT") {
      return {
        error: "Unable to connect to the database. Please try again later.",
      };
    } else if ((error as { code: string }).code === "503") {
      return {
        error: "Service temporarily unavailable. Please try again later.",
      };
    } else {
      return { error: "An unexpected error occurred. Please try again later." };
    }
  }

};
