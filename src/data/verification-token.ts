import { prisma } from "@/lib/prisma";

export const getVerificationTokenByEmail = async (email: string) => {
    try {
        const verifacationToken = await prisma.verificationToken.findFirst({ where: {email:email} });

        return verifacationToken;

    } catch (error) {
        return null
    }
};

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verifacationToken = await prisma.verificationToken.findUnique({ where: {token:token} });

        return verifacationToken;

    } catch (error) {
        return null
    }
};