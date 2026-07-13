import { z } from "zod";
import { isPasswordValid, PASSWORD_MAX_LENGTH } from "@/lib/auth/password";

const passwordRequirementsMessage =
  "Password must be 8–128 characters and include uppercase, lowercase, a number, and a special character.";

const botGuardFields = {
  /** Honeypot — must stay empty; bots often auto-fill visible-looking fields. */
  website: z.string().max(200).optional(),
  /** Client mount timestamp; server rejects submissions faster than ~2s. */
  formStartedAt: z.number().optional(),
};

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(254, "Email is too long")
      .email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(PASSWORD_MAX_LENGTH, "Password is too long")
      .refine(isPasswordValid, { message: passwordRequirementsMessage }),
    confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
    ...botGuardFields,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .email("Invalid email address"),
  password: z.string().min(1, "Password is required").max(PASSWORD_MAX_LENGTH),
  remember: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, "Email is too long")
    .email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(PASSWORD_MAX_LENGTH, "Password is too long")
      .refine(isPasswordValid, { message: passwordRequirementsMessage }),
    confirmPassword: z.string().max(PASSWORD_MAX_LENGTH),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
