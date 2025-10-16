"use server"

import { getPasswordResetTokenByToken } from "@/data/passwordResetToken"
import { getUserByEmail } from "@/data/users"
import { prisma } from "@/lib/prisma"
import { PasswordFormSchema } from "@/schemas"
import bcrypt from "bcryptjs"
import * as z from "zod"

export const newPassword = async (values: z.infer<typeof PasswordFormSchema>, token?: string | null ) => {

    if(!token){
        return {error: "Missing token!"}
    };

    const validatedFields = PasswordFormSchema.safeParse(values)

    if(!validatedFields.success){
        return {error: "Invalid fields!"}
    };

    const password: string = validatedFields.data.password;

    const existingToken = await getPasswordResetTokenByToken(token);

    if(!existingToken){
        return {error: "Invalid token"}
    };

    const hasExpired = new Date(existingToken.expires) < new Date();

    if(hasExpired){
        return {error: "Token has expired!"}
    };

    const existingUser = await getUserByEmail(existingToken?.email);

    if(!existingUser){
        return {error: "Email does not exist"}
    };

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: {id: existingUser.id},
        data: {password: hashedPassword as string}
    });

    await prisma.passwordResetToken.delete({where: {identifier: existingToken.identifier}});

    return {success: "Password Updated successfully"}


}