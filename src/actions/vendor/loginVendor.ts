/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import * as z from "zod";
import { VendorLoginSchema } from "@/validaton-schema";
import { VENDOR_LOGIN_REDIRECT } from "@/routes";

export async function loginVendor(values: z.infer<typeof VendorLoginSchema>) {
  const validation = VendorLoginSchema.safeParse(values);

  if (!validation.success) {
    return { error: "Invalid fields!" };
  }

  const { slug, email, password } = validation.data;

  try {
    const result = await signIn("vendor", {
      slug,
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid credentials or vendor not active!" };
    }

    return {
      success: "Logged in successfully!",
      redirectTo: VENDOR_LOGIN_REDIRECT,
    };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }
    return { error: "An unexpected error occurred." };
  }
}
