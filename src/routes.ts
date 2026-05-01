import { Role } from "./validaton-schema";

export const DEFAULT_LOGIN_REDIRECT: string = "/dashboard";
export const VENDOR_LOGIN_REDIRECT: string = "/business/dashboard";

// Prefix for API authentication routes.
export const apiAuthPrefix: string = "/api/auth";

// Routes which are accessible to all.
export const publicRoutes: string[] = ["/", "/auth/verify-email"];

// APIs which are accessible to all.
export const publicApis: string[] = [];

// Routes which are used for authentication.
export const authRoutes: string[] = [
  "/auth/error",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/business/login",
  "/business/reset-password",
];

// Routes which are protected with diffferent roles
export const protectedRoutes: Record<string, (Role | 'VENDOR')[]> = {
  "^/dashboard/admin(/.*)?$": ["ADMIN"],
  "^/dashboard/user(/.*)?$": ["SUPER_ADMIN"],
  "^/business/dashboard(/.*)?$": ["VENDOR"],
};
