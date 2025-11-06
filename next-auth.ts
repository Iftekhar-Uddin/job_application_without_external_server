import { UserRole } from "@prisma/client";
import { DefaultSession} from "next-auth";

export type ExtendedUser = {
  id: string;
  role: UserRole;
  email: string | null;
  name?: string | null;
  image?: string | null;
  isTwoFactorEnabled: boolean;
  isOAuth?: boolean;
  education?: string | null;
  skills?: string[] | null;
  experience?: string | null;
  previousInstitution?: string | null;
  address?: string | null;
  updatedAt: Date | string | null; 
};



declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & ExtendedUser;
  }

  interface User extends ExtendedUser {}
  interface JWT extends Partial<ExtendedUser> {}
}

