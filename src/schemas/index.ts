import { UserRole } from '@prisma/client';
import * as z from 'zod';

export const SettingsFormSchema = z.object({
  name: z.optional(z.string()),
  isTwoFactorEnabled: z.optional(z.boolean()),
  role: z.enum([UserRole.Admin, UserRole.User, UserRole.Manager]),
  email: z.optional(z.string().email()),
  password: z.optional(z.string().min(6)),
  newPassword: z.optional(z.string().min(6))
})
  .refine((data) => {
    if (data.password && !data.newPassword) {
      return false
    }
    return true
  }, {
    message: "New password is required!",
    path: ["newPassword"]
  })
  .refine((data) => {
    if (!data.password && data.newPassword) {
      return false
    }
    return true
  }, {
    message: "Password is required!",
    path: ["password"]
  });


export const PasswordFormSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters long"),
});



export const ResetFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),
});



export const loginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email format" }),

  password: z
    .string()
    .min(1, { message: "Password is required" }),

  code: z.optional(z.string())
});


export const registerFormSchema = z.object({
  name: z.string().nonempty("Username is required").min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  email: z.string().nonempty("Email is required").min(1, "Email is required").max(50, "Email must be less than 50 characters").email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  confirmPassword: z.string().min(6, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});


export const profileSchema = z.object({
  image: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  education: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  experience: z.string().optional().nullable(),
  previousInstitution: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Password must contain at least one digit")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });