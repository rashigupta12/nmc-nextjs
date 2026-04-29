/*eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { EyeOff, Eye } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import { loginVendor } from "@/actions/vendor/loginVendor";
import { FormSuccess } from "@/components/form/form-success";
import { FormError } from "@/components/form/form-error";
import { VendorLoginSchema } from "@/validaton-schema";

interface VendorLoginFormProps {
  slug: string;
}

export function VendorLoginForm({ slug }: VendorLoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isRedirecting, setIsRedirecting] = useState<boolean | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof VendorLoginSchema>>({
    resolver: zodResolver(VendorLoginSchema),
    defaultValues: {
      slug,
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof VendorLoginSchema>) {
    if (isPending || isRedirecting) return;

    setError(undefined);
    setSuccess(undefined);

    try {
      startTransition(async () => {
        const result = await loginVendor(data);

        if (result?.error) {
          setError(result.error);
          return;
        }

        if (result?.success) {
          setSuccess(result.success);

          if (result.redirectTo) {
            setIsRedirecting(true);
            // Small delay to show success message, then redirect
            await new Promise((resolve) => setTimeout(resolve, 500));
            window.location.href = result.redirectTo;
          }
        }
      });
    } catch (e) {
      console.error("Vendor login error:", e);
      setError("Authentication failed. Please try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-2">
          <Image
            alt="logo"
            src="/neotech.png"
            height={140}
            width={140}
            className="shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
          />
        </div>

        {/* Login Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Vendor Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your vendor dashboard
          </p>
        </div>

        {/* Slug Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Vendor:</span> {slug}
          </p>
        </div>

        {/* Login Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <input type="hidden" {...form.register("slug")} value={slug} />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">Email</div>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="vendor@company.com"
                      className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">Password</div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="********"
                        className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type={showPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            <FormError message={error} />
            <FormSuccess message={success} />

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-[#1B2B65] text-white rounded-lg font-medium hover:bg-[#152451] transition-all duration-300 transform hover:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Login now"
              )}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
