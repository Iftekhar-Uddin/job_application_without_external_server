import { auth } from "@/auth"
import { UserRole } from "@prisma/client"
import { redirect } from "next/navigation"

export const getCurrentUser = async () => {
  const session = await auth()
  return session?.user
}

export const requireAuth = async () => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }
  return user
}

export const requireRole = async (allowedRoles: UserRole[]) => {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    redirect("/403")
  }
  
  return user
}

// Use this in your admin pages/components
export const checkAdminAccess = async () => {
  return await requireRole(["Admin"])
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