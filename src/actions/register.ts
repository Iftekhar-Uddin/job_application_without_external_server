"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { registerFormSchema } from "@/schemas";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/data/allToken";
import { sendVerificationEmaill } from "@/data/mail";


export const registers = async (data: z.infer<typeof registerFormSchema>) => {
  try {
    // Validate the input data
    const validatedData = registerFormSchema.parse(data);

    //  If the data is invalid, return an error
    if (!validatedData) {
      return { error: "Invalid input data" };
    }

    //  Destructure the validated data
    const { email, name, password, confirmPassword } = validatedData;

    // Check if passwords match
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check to see if user already exists
    const userExists = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    // If the user exists, return an error
    if (userExists) {
      return { error: "Email already is in use. please try another one." };
    }

    const lowerCaseEmail = email.toLowerCase();

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: lowerCaseEmail,
        name,
        password: hashedPassword,
      },
    });

    // Generate a verification token
    const verificationToken = await generateVerificationToken(email)

    await sendVerificationEmaill(verificationToken.email, verificationToken.token)

    return { success: "Confirmation email has been sent!" };

  } catch (error) {
    // Handle the error, specifically check for a 503 error
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
