import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const authConfig: NextAuthConfig = {
  providers: [CredentialsProvider, GitHub, Google],
};

export default authConfig