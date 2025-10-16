"use server"

import * as z from "zod";
import { SettingsFormSchema } from "@/schemas"
import { getUserByEmail } from "@/data/users";
import { prisma } from "@/lib/prisma";
import { currentUserServer } from "@/lib/currentUser";
import { generateVerificationToken } from "@/data/allToken";
import { sendVerificationEmaill } from "@/data/mail";
import bcrypt from "bcryptjs";


export const settings = async (values: z.infer<typeof SettingsFormSchema>) => {

    const user = await currentUserServer();

    if(!user){
        return {error: "Unauthorized"}
    };

    const databseUser = await getUserByEmail(user.email as string);

    if(!databseUser){
        return {error: "Unauthorized"}
    }

    //User can not modified these field
    if(user.isOAuth){
        values.email = undefined
        values.password = undefined
        values.newPassword = undefined
        values.isTwoFactorEnabled = undefined
    }

    if(values.email && values.email !== user.email){
        const existingUser = await getUserByEmail(values.email);

        if(existingUser && existingUser.id !== user.id){
            return {error: "Email already in use!"}
        }

        const verificationToken = await generateVerificationToken(values.email);
        await sendVerificationEmaill(verificationToken.email, verificationToken.token);

        return {success: "Verification email sent!"}
    }

    if(values.password && values.newPassword && databseUser.password){
        const passwordMatch = await bcrypt.compare(values.password, databseUser.password);

        if(!passwordMatch){
            return {error: "Incorrect password!"}
        }

        const hashedPassword = await bcrypt.hash(values.newPassword, 10);
        values.password = hashedPassword;
        values.newPassword = undefined;
    }

    await prisma.user.update({
        where: {id: databseUser.id},
        data: {...values}
    });

    return {success: "User update successfully"}
}