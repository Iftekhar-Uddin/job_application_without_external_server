"use server"

import { getUserByEmail } from "@/data/users";
import { getVerificationTokenByToken } from "@/data/verification-token"
import { prisma } from "@/lib/prisma";

export const newVerification = async (token: string) => {
    const existingtoken  = await getVerificationTokenByToken(token);

    if(!existingtoken){
        return {error: "Invalid token"}
    }

    const hasExpired = new Date(existingtoken.expires) < new Date();

    if(hasExpired){
        return {error: "Token has expired"}
    }

    const existingUser = await getUserByEmail(existingtoken.email)

    if(!existingUser){
        return {error: "User not found"}
    }

    await prisma.user.update({
        where: {
            id: existingUser.id
        },
        data: {
            emailVerified: new Date(),
            email: existingUser.email
        }
    })

    await prisma.verificationToken.delete({
        where: {
            identifier: existingtoken.identifier
        }
    })

    return {success: "Email verified"}
}