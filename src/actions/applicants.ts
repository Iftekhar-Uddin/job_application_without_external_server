"use server"

import { prisma } from "@/lib/prisma"

export const applicants = async (applicationId: string, jobId: string, status: string) => {

    try {
        await prisma.application.update({
            where: {
                id: applicationId
            },
            data: {
                status: status
            }
        });

        return {success: "Status updated successfully!"};

    } catch (error) {

        return {error: "Something went wrong!"}
    }

}