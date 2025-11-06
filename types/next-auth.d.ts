import { UserRole } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role: UserRole
  }

  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      isTwoFactorEnabled: boolean
      education?: string | null
      skills: string[]
      experience?: string | null
      previousInstitution?: string | null
      address?: string | null
      isOAuth: boolean
      updatedAt: string | null
    }
  }
}









// import { UserRole } from "@prisma/client"
// import NextAuth from "next-auth"

// declare module "next-auth" {
//   interface User {
//     id: string
//     email: string
//     name?: string | null
//     image?: string | null
//     role: UserRole
//   }

//   interface Session {
//     user: {
//       id: string
//       email: string
//       name?: string | null
//       image?: string | null
//       role: UserRole
//     }
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string
//     role: UserRole
//   }
// }