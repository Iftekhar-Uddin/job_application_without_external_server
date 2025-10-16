import {Resend} from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL

export const sendVerificationEmaill = async (email: string, token: string) => {
    const confirmationLink = `${domain}/verifyEmail?token=${token}`

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Verify your email",
        html: `<p>Click <a href="${confirmationLink}"> here</a> to confirm email.</p>`
    })
}

export const sendPasswordResetEmaill = async (email: string, token: string) => {
    const resetLink = `${domain}/newPassword?token=${token}`

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}"> here</a> to reset password.</p>`
    })
}

export const sendTwoFactorTokenEmaill = async (email: string, token: string) => {
    // const twoFactorTokenLink = `${domain}/twoFactorAuth?token=${token}`

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Two Factor Authentication Code",
        html: `<p>Your 2FA code: ${token}</p>`
    })
}