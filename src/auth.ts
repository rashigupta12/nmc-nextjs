/* eslint-disable @typescript-eslint/no-unused-vars */

import authConfig from "@/auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Role } from "./validaton-schema";
import { findUserById } from "./actions/user";
import { db } from "./db";
import { VendorsTable } from "./db/schema";
import { eq } from "drizzle-orm";

export type ExtendedUser = DefaultSession["user"] & {
  role: Role | 'VENDOR';
  vendorCode?: string;
  loginSlug?: string;
  isPasswordReset?: boolean;
};

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser;
  }
}


declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    role?: Role | 'VENDOR';
    isPasswordReset?: boolean;
    vendorCode?: string;
    loginSlug?: string;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Skip user check for vendor logins
      if (account?.provider === 'vendor') {
        return true;
      }

      // Regular user login check
      const existingUser = await findUserById(user.id!);
      if (!existingUser || !existingUser?.emailVerified) {
        return false;
      }

      return true;
    },
    async jwt({ token, account, user }) {
      if (!token.sub) {
        return token;
      }

      // Handle vendor session (initial login)
      if (account?.provider === 'vendor' && user) {
        // @ts-ignore - user object comes from vendor auth provider
        token.role = 'VENDOR';
        // @ts-ignore
        token.vendorCode = user.vendorCode;
        // @ts-ignore
        token.loginSlug = user.loginSlug;
        // @ts-ignore
        token.isPasswordReset = user.isPasswordReset;
        return token;
      }

      // Refresh vendor data from DB on subsequent requests
      if (token.role === 'VENDOR') {
        const vendor = await db.query.VendorsTable.findFirst({
          where: eq(VendorsTable.id, token.sub),
        });
        if (vendor) {
          token.isPasswordReset = vendor.isPasswordReset;
          token.vendorCode = vendor.vendorCode;
          token.loginSlug = vendor.loginSlug;
        }
        return token;
      }

      // Regular user session
      const existingUser = await findUserById(token.sub);
      if (!existingUser) {
        return token;
      }

      token.role = existingUser.role;

      return token;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      // Add vendor fields to session
      // @ts-ignore
      if (token.role === 'VENDOR') {
        // @ts-ignore
        session.user.vendorCode = token.vendorCode;
        // @ts-ignore
        session.user.loginSlug = token.loginSlug;
        // @ts-ignore
        session.user.isPasswordReset = token.isPasswordReset;
      }

      return session;
    },
  },
  ...authConfig,
});
