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

export const checkAdminAccess = async () => {
  return await requireRole(["Admin"])
}
