import { prisma } from "@/lib/prisma"


export const getTwoFactorConfirmationByUserId = async (userId: string) => {
    try {
        const twoFactorConfirmaton = await prisma.twoFactorConfirmation.findUnique({
            where: { userId }
        });

        return twoFactorConfirmaton
        
    } catch (error) {
        return null
    }
}