import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { UserRole } from "@prisma/client"
import { getTwoFactorConfirmationByUserId } from "./data/twoFactorConfirmation"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<any | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        if (!user || !user.password) {
          return null
        }

        if (user?.isTwoFactorEnabled) {
          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(user.id);
          if (!twoFactorConfirmation) return false
          await prisma.twoFactorConfirmation.delete({ where: { id: twoFactorConfirmation.id } });
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          education: user.education,
          skills: user.skills,
          experience: user.experience,
          previousInstitution: user.previousInstitution,
          address: user.address,
          updatedAt: user.updatedAt,
        }
      }
    })
  ],
  callbacks: {

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
        session.user.role = token.role as UserRole
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
        session.user.education = token.education as string | null
        session.user.skills = (token.skills as string[]) || []
        session.user.experience = token.experience as string | null
        session.user.previousInstitution = token.previousInstitution as string | null
        session.user.address = token.address as string | null
        session.user.isOAuth = token.isOAuth as boolean
        session.user.updatedAt = token.updatedAt as string | null
      }
      return session
    },


    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = (user as any).role
        token.picture = (user as any).image
        token.isTwoFactorEnabled = (user as any).isTwoFactorEnabled
        token.education = (user as any).education
        token.skills = (user as any).skills
        token.experience = (user as any).experience
        token.previousInstitution = (user as any).previousInstitution
        token.address = (user as any).address
        token.isOAuth = (user as any).isOAuth
        token.updatedAt = (user as any).updatedAt
      }

      if (trigger === "update" && session?.user) {
        return {
          ...token,
          ...session.user,
          picture: session.user.image,
          updatedAt: new Date().toISOString()
        }
      }

      return token
    },

  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },

})



