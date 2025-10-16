import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default { providers: [CredentialsProvider , GitHub , Google] } satisfies NextAuthConfig