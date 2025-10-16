import { prisma } from "@/lib/prisma";

export const getVerificationTokenByToken = async (token: string) => {
    try {
        const verifacationToken = await prisma.verificationToken.findUnique({
            where: {token}
        });

        return verifacationToken;

    } catch (error) {
        return null
    }
};

export const getUserByEmail = async (email: string)=> {
    try {
        const user = await prisma.user.findUnique({
            where: {email : email}
        });

        return user;

    } catch (error) {
        return null
    }
};

