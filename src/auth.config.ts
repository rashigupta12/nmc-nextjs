import { LoginSchema } from "@/validaton-schema";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { findUserByEmail } from "./actions/user";
import { db } from "./db";
import { VendorsTable } from "./db/schema";
import { eq, and } from "drizzle-orm";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validation = LoginSchema.safeParse(credentials);
        if (!validation.success) {
          return null;
        }

        const { email, password } = validation.data;
        const user = await findUserByEmail(email);
        if (!user || !user.password) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        return passwordMatch ? user : null;
      },
    }),
    Credentials({
      id: 'vendor',
      name: 'Vendor Login',
      credentials: {
        slug: { type: 'text' },
        email: { type: 'email' },
        password: { type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.slug || !credentials?.email || !credentials?.password) {
          return null;
        }

        const vendor = await db.query.VendorsTable.findFirst({
          where: and(
            eq(VendorsTable.loginSlug, credentials.slug as string),
            eq(VendorsTable.email, credentials.email as string)
          )
        });

        if (!vendor || vendor.status !== 'ACTIVE') {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string, 
          vendor.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: vendor.id,
          email: vendor.email,
          name: vendor.name,
          type: 'VENDOR',
          vendorCode: vendor.vendorCode,
          loginSlug: vendor.loginSlug,
          isPasswordReset: vendor.isPasswordReset
        };
      }
    })
  ],
} satisfies NextAuthConfig;
