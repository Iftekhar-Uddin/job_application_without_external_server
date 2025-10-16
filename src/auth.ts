import NextAuth from "next-auth";
import { UserRole } from "@prisma/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/data/users";
import { getTwoFactorConfirmationByUserId } from "@/data/twoFactorConfirmation";
import authConfig from "./auth.config";
import { getAccountByUserId } from "./actions/account";


const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  events: {
    async linkAccount({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      })
    }
  },

  callbacks: {
    async signIn({ account, profile, email, credentials, user }) {
      if (user) {
        if (account?.provider !== "credentials") return true

        const existingUser = await getUserByEmail(user?.email as string);

        if (!existingUser?.emailVerified) return false

        if (existingUser.isTwoFactorEnabled) {

          const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

          if (!twoFactorConfirmation) return false

          await prisma.twoFactorConfirmation.delete({ where: { id: twoFactorConfirmation.id } });
        }

      } else if (account?.provider === "google" || "github") {
        const existingUser = await prisma.user.findUnique({ where: { email: profile?.email || "" }, });
        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: profile?.email,
              name: profile?.name,
              image: profile?.picture
            }
          })
        }
      }

      return true;
    },

    async session({ token, session }) {
      if (session.user && token.role) {
        session.user.id = token.sub as string;
        session.user.name = token.name as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.image = token.image as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }
      return session;
    },

    async jwt({ token, user, account, profile }) {

      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({ where: { id: token?.sub || "" } });

      if (!existingUser) return token;

      const existingAccount = await getAccountByUserId(existingUser.id);

      if (existingAccount) {
        token.isOAuth = !!existingAccount //the double exclamatory mark return boolean
      }

      token.name = existingUser?.name
      token.email = existingUser?.email
      token.sub = existingUser?.id
      token.role = existingUser?.role;
      token.isTwoFactorEnabled = existingUser?.isTwoFactorEnabled;
      token.image = existingUser?.image

      return token;
    },

    // async redirect({ url, baseUrl }) {
    //   return baseUrl
    // }

  },

  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,

  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      // allowDangerousEmailAccountLinking: true || undefined,
    }),

    Github({
      clientId: process.env.AUTH_GITHUB_ID as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
      // allowDangerousEmailAccountLinking: true || undefined,
    }),

    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password');
        };

        const user = await prisma.user.findUnique({ where: { email: credentials?.email as string } });

        if (user) {
          const isValidPassword = await bcrypt.compare(
            credentials?.password as string ?? "", await prisma.user.findUnique({ where: { email: credentials?.email as string } }).then(u => u?.password || "")
          );

          if (!user || !isValidPassword) {
            throw new Error('No user found');
          };

          if (!isValidPassword) {
            throw new Error('Invalid password');
          };

          if (user && isValidPassword) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
            };
          }
        }

        return null
      }
    })
  ],

  pages: {
    signIn: "/auth/signin",
    signOut: "/",
    error: "/auth/error"
  },

  secret: process.env.AUTH_SECRET

});