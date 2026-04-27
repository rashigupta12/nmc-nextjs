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
import { updateVendorPassword } from "@/actions/vendor/update-password";
import { FormSuccess } from "@/components/form/form-success";
import { FormError } from "@/components/form/form-error";
import { VendorResetPasswordSchema } from "@/validaton-schema";
import { VENDOR_LOGIN_REDIRECT } from "@/routes";

export function VendorResetPasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof VendorResetPasswordSchema>>({
    resolver: zodResolver(VendorResetPasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: z.infer<typeof VendorResetPasswordSchema>) {
    if (isPending) return;

    setError(undefined);
    setSuccess(undefined);

    startTransition(async () => {
      const result = await updateVendorPassword(data);

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.success) {
        setSuccess(result.success);
        // Redirect to location specified by server action
        setTimeout(() => {
          window.location.href = result.redirectTo || VENDOR_LOGIN_REDIRECT;
        }, 1500);
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        {/* Logo Section */}
        <div className="flex flex-col items-center space-y-2">
          <Image
            alt="logo"
            src="/next.svg"
            height={100}
            width={100}
            className="shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
          />
          <h1 className="text-red-500 font-bold text-xl">Vendor Portal</h1>
        </div>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            For security, please change your temporary password before continuing.
          </p>
        </div>

        {/* Alert Box */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
          <p className="text-sm text-amber-800">
            <span className="font-semibold">First time login detected.</span>{" "}
            You must set a new password to access your dashboard.
          </p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">
                    Current Password (Temporary)
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your temporary password"
                        className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type={showCurrentPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">New Password</div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter new password"
                        className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type={showNewPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <FormMessage className="text-sm text-red-500" />
                </FormItem>
              )}
            />

            {/* Confirm New Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm font-medium text-gray-700">
                    Confirm New Password
                  </div>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Confirm new password"
                        className="h-12 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isPending}
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </Form>
      </div>
    </div>
  );
}
