import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid"
import { getVerificationTokenByEmail } from "./verification-token";
import { getPasswordResetTokenByEmail } from "./passwordResetToken";
import crypto from "crypto"
import { getTwoFactorTokenByEmail } from "./twofactorToken";


export const generateVerificationToken = async (email: string) => {

    const token = uuidv4();

    const expires = new Date(new Date().getTime() + 900 * 1000);

    const existingToken = await getVerificationTokenByEmail(email);


    if (existingToken) {
        await prisma.verificationToken.delete({
            where: {
                identifier: existingToken.identifier
            }
        });
    };

    const VerificationToken = await prisma.verificationToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return VerificationToken
};


export const generatePasswordResetToken = async (email: string) => {

    const token = uuidv4();

    const expires = new Date(new Date().getTime() + 900 * 1000);

    const existingToken = await getPasswordResetTokenByEmail(email);


    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: {
                identifier: existingToken.identifier
            }
        });
    };

    const PasswordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return PasswordResetToken
};

export const generateTwofactorToken = async (email: string) => {

    const token = crypto.randomInt(100_000, 1_000_000).toString();

    const expires = new Date(new Date().getTime() + 900 * 1000);

    const existingToken = await getTwoFactorTokenByEmail(email);


    if (existingToken) {
        await prisma.twoFactorToken.delete({
            where: {
                identifier: existingToken.identifier
            }
        });
    };

    const twoFactorToken = await prisma.twoFactorToken.create({
        data: {
            email,
            token,
            expires,
        }
    });

    return twoFactorToken
};