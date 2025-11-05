import { ExtendedUser } from './../next-auth';
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/users";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";
import authConfig from "./auth.config";
import { UserRole } from "@prisma/client";



export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  // session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  // jwt: {
  //   secret: process.env.NEXTAUTH_JWT_SECRET,
  // },
  session: {
    strategy: "jwt", 
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
  ...authConfig,

  providers: [

    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),


    Github({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),


    Credentials({
      name: "credentials",
      credentials: { email: {}, password: {} },

      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Missing email or password");

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password)
          throw new Error("Invalid email or password");

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) throw new Error("Invalid email or password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
          education: user.education,
          skills: user.skills,
          experience: user.experience,
          previousInstitution: user.previousInstitution,
          address: user.address,
          updatedAt: user.updatedAt,
          isOAuth: false,
        };
      },
    }),
  ],

  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },


  callbacks: {

    async signIn({ account, user }) {
      if (!user) return false;

      if (account?.provider === "credentials") {
        const existingUser = await getUserByEmail(user.email as string);
        if (!existingUser?.emailVerified)
          throw new Error("Please verify your email before signing in.");

        if (existingUser.isTwoFactorEnabled) {
          const confirmation = await getTwoFactorConfirmationByUserId(
            existingUser.id
          );
          if (!confirmation) return false;

          await prisma.twoFactorConfirmation.delete({
            where: { id: confirmation.id },
          });
        }
      }

      return true;
    },

    //JWT callback — control what goes inside the token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || null;
        token.email = user.email || null;
        token.role = user.role;
        token.image = user.image || null;
        token.isTwoFactorEnabled = user.isTwoFactorEnabled || false;
        token.education = user.education || null;
        token.skills = user.skills || [];
        token.experience = user.experience || null;
        token.previousInstitution = user.previousInstitution || null;
        token.address = user.address || null;
        //Mark whether this user logged in via OAuth or credentials
        token.isOAuth = account?.provider !== "credentials";
        token.updatedAt = user.updatedAt || null
      }
      return token;
    },

    //Session callback — expose safe data to client
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.email = token.email as string ?? "";
        session.user.role = token.role as UserRole;
        session.user.image = token.image as string | null;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
        session.user.education = token.education as string | null;
        session.user.skills = (token.skills as string[]) || [];
        session.user.experience = token.experience as string | null;
        session.user.previousInstitution = token.previousInstitution as string | null;
        session.user.address = token.address as string | null;
        session.user.isOAuth = Boolean(token.isOAuth);
        session.user.updatedAt = token.updatedAt as Date | string
      }

      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error",
  },
  
});
