import { prisma } from "@/lib/prisma";

export const getTwoFactorTokenByEmail = async (email: string) => {
    try {
        const twoFactorToken = await prisma.twoFactorToken.findFirst({ where: {email:email} });

        return twoFactorToken;

    } catch (error) {
        return null
    }
};

export const getTwoFactorTokenByToken = async (token: string) => {
    try {
        const twoFactorToken = await prisma.twoFactorToken.findUnique({ where: {token:token} });

        return twoFactorToken;

    } catch (error) {
        return null
    }
};