import { z } from "zod";

// Zod validation schemas
export const RegisterSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    firstName: z.string().min(1, "First name is required").max(50),
    lastName: z.string().trim().max(50).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  preferences: z
    .object({
      defaultView: z.enum(["grid", "list"]).optional(),
      itemsPerPage: z.number().min(10).max(100).optional(),
      theme: z.enum(["light", "dark"]).optional(),
      language: z.string().optional(),
      timezone: z.string().optional(),
    })
    .optional(),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Request/Response types
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type LoginRequest = z.infer<typeof LoginSchema>;
export type UpdateProfileRequest = z.infer<typeof UpdateProfileSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
