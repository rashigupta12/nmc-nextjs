/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable  @typescript-eslint/ban-ts-comment */

import authConfig from "@/auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { findUserById } from "./actions/user";
import { db } from "./db";
import { Role } from "./validaton-schema";

export type ExtendedUser = DefaultSession["user"] & {
  role: Role | 'VENDOR';
  vendorCode?: string;
  loginSlug?: string;
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
    role?: Role;
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

      // Handle vendor session
      if (account?.provider === 'vendor' && user) {
        // @ts-expect-error - user object comes from vendor auth provider
        token.role = 'VENDOR';
        // @ts-expect-error
        token.vendorCode = user.vendorCode;
        // @ts-expect-error
        token.loginSlug = user.loginSlug;
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
      // @ts-expect-error
      if (token.role === 'VENDOR') {
        // @ts-expect-error
        session.user.vendorCode = token.vendorCode;
        // @ts-expect-error
        session.user.loginSlug = token.loginSlug;
      }

      return session;
    },
  },
  ...authConfig,
});
