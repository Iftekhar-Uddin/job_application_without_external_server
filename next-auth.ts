import { UserRole } from "@prisma/client";
import { DefaultSession} from "next-auth";

export type ExtendedUser = {
  id: string;
  email: string | null;
  name?: string | null;
  image?: string | null;
  education?: string | null;
  skills?: string[] | null;
  experience?: string | null;
  previousInstitution?: string | null;
  updatedAt: Date | string | null; 
  address?: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOAuth?: boolean;
};



declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & ExtendedUser;
  }

  interface User extends ExtendedUser {}
  interface JWT extends Partial<ExtendedUser> {}
}







// import { UserRole } from "@prisma/client";
// import { DefaultSession, DefaultUser } from "next-auth";
// import "next-auth/jwt";

// export interface ExtendedUser {
//   id: string;
//   email: string | null;
//   name?: string | null;
//   image?: string | null;
//   education?: string | null;
//   skills?: string[] | null;
//   experience?: string | null;
//   previousInstitution?: string | null;
//   updatedAt: Date | string | null;
//   address?: string | null;
//   role: UserRole;
//   isTwoFactorEnabled: boolean;
//   isOAuth?: boolean;
// }

// /**
//  * Extend next-auth types so `session.user.role`, etc. are typed.
//  * Keep this file included by tsconfig `include`.
//  */
// declare module "next-auth" {
//   interface Session {
//     user: ExtendedUser & DefaultSession["user"];
//   }
//   interface User extends DefaultUser, ExtendedUser {}
// }

// declare module "next-auth/jwt" {
//   // JWT stores a subset of ExtendedUser fields (partial allowed)
//   interface JWT extends Partial<ExtendedUser> {
//     // `sub` is present by NextAuth, but we keep the ExtendedUser fields optional
//     sub?: string;
//   }
// }
