// src/app/(protected)/dashboard/vendor/layout.tsx
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut, useSession } from "next-auth/react";
import {
  Home,
  Users,
  Package,
  LogOut,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Default open Patients
  const [openMenu, setOpenMenu] = useState<"patients" | "orders" | "">(
    "patients",
  );

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔝 Navbar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Vendor Portal</h1>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "VN"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {session?.user?.name || "Vendor"}
                </span>
              </button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-56">
              <button
                onClick={() => router.push("/dashboard/vendor/profile")}
                className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded"
              >
                <Settings className="h-4 w-4" />
                Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <div className="flex">
        {/* 📌 Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4">
          <nav className="space-y-2">
            {/* Dashboard */}
            <Link href="/dashboard/vendor">
              <button
                className={`w-full flex items-center gap-2 p-2 rounded-lg ${
                  pathname === "/dashboard/vendor"
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </button>
            </Link>

            {/* ================= Patients ================= */}
            <div>
              <button
                onClick={() =>
                  setOpenMenu(openMenu === "patients" ? "" : "patients")
                }
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Patients</span>
                </div>

                {openMenu === "patients" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openMenu === "patients" && (
                <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                  {/* List (Default) */}
                  <Link href="/dashboard/vendor/patients">
                    <button
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        isActive("/dashboard/vendor/patients/list")
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      📋 List Patients
                    </button>
                  </Link>

                  {/* Create */}
                  <Link href="/dashboard/vendor/patients/create">
                    <button
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        isActive("/dashboard/vendor/patients/create")
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      ➕ Add Patient
                    </button>
                  </Link>
                </div>
              )}
            </div>

            {/* ================= Orders ================= */}
            <div>
              <button
                onClick={() =>
                  setOpenMenu(openMenu === "orders" ? "" : "orders")
                }
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Orders</span>
                </div>

                {openMenu === "orders" ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openMenu === "orders" && (
                <div className="ml-6 mt-1 space-y-1 border-l pl-3">
                  <Link href="/dashboard/vendor/orders/list">
                    <button
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        isActive("/dashboard/vendor/orders/list")
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      📦 List Orders
                    </button>
                  </Link>

                  <Link href="/dashboard/vendor/orders/create">
                    <button
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        isActive("/dashboard/vendor/orders/create")
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      ➕ Create Order
                    </button>
                  </Link>

                  {/* <Link href="/dashboard/vendor/orders/edit">
                    <button
                      className={`w-full text-left px-2 py-2 rounded-md text-sm ${
                        isActive("/dashboard/vendor/orders/edit")
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      ✏️ Edit Order
                    </button>
                  </Link> */}
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* 📄 Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
