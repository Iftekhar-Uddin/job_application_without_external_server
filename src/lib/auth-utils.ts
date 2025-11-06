import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { prisma } from "./prisma"

export interface SessionUser {
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

export const getCurrentUser = async (): Promise<SessionUser | null> => {
  const session = await auth()
  
  if (!session?.user) return null

  // Fetch fresh user data for server components
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isTwoFactorEnabled: true,
      education: true,
      skills: true,
      experience: true,
      previousInstitution: true,
      address: true,
      updatedAt: true,
    }
  })

  if (!dbUser) return null

  const existingAccount = await prisma.account.findFirst({
    where: { userId: dbUser.id }
  })

  return {
    id: dbUser.id,
    email: dbUser.email!,
    name: dbUser.name,
    image: dbUser.image,
    role: dbUser.role,
    isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
    education: dbUser.education,
    skills: dbUser.skills,
    experience: dbUser.experience,
    previousInstitution: dbUser.previousInstitution,
    address: dbUser.address,
    isOAuth: !!existingAccount,
    updatedAt: dbUser.updatedAt.toISOString(),
  }
}

export const requireAuth = async (): Promise<SessionUser> => {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Authentication required")
  }
  
  return user
}

export const requireRole = async (allowedRoles: UserRole[]): Promise<SessionUser> => {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }
  
  return user
}









// import { auth } from "@/auth"
// import { UserRole } from "@prisma/client"

// export interface SessionUser {
//   id: string
//   email: string
//   name?: string | null
//   image?: string | null
//   role: UserRole
//   isTwoFactorEnabled: boolean
//   education?: string | null
//   skills: string[]
//   experience?: string | null
//   previousInstitution?: string | null
//   address?: string | null
//   isOAuth: boolean
//   updatedAt: string | null
// }

// export const getCurrentUser = async (): Promise<SessionUser | null> => {
//   const session = await auth()
//   return session?.user as SessionUser | null
// }

// export const requireAuth = async (): Promise<SessionUser> => {
//   const user = await getCurrentUser()
  
//   if (!user) {
//     throw new Error("Authentication required")
//   }
  
//   return user
// }

// export const requireRole = async (allowedRoles: UserRole[]): Promise<SessionUser> => {
//   const user = await requireAuth()
  
//   if (!allowedRoles.includes(user.role)) {
//     throw new Error("Insufficient permissions")
//   }
  
//   return user
// }

// export const isAdmin = (user: SessionUser): boolean => {
//   return user.role === "Admin"
// }

// export const isManagerOrAdmin = (user: SessionUser): boolean => {
//   return user.role === "Manager" || user.role === "Admin"
// }












// import { auth } from "@/auth"
// import { UserRole } from "@prisma/client"

// export const getCurrentUser = async () => {
//   const session = await auth()
//   return session?.user
// }

// export const checkRole = (userRole: UserRole, allowedRoles: UserRole[]) => {
//   return allowedRoles.includes(userRole)
// }

// export const isAdmin = (role: UserRole) => {
//   return role === "Admin"
// }

// export const isManager = (role: UserRole) => {
//   return role === "Manager" || role === "Admin"
// }