"use server"

import { sendPasswordResetEmaill } from '@/data/mail';
import { generatePasswordResetToken } from '@/data/allToken';
import { getUserByEmail } from "@/data/users";
import { ResetFormSchema } from "@/schemas"
import z from "zod"


export const reset = async (values: z.Infer<typeof ResetFormSchema>) => {
    const validateFields = ResetFormSchema.safeParse(values);

    if(!validateFields){
        return {error: "Invalid email"}
    }

    const email = validateFields?.data?.email;


    const existingUser = await getUserByEmail(email as string);

    if(!existingUser){
        return {error: "Email not found"}
    };

    const passwordResetToken = await generatePasswordResetToken(email as string);
    await sendPasswordResetEmaill(passwordResetToken.email, passwordResetToken.token)

    return {success: "Password reset email sent!"};
}