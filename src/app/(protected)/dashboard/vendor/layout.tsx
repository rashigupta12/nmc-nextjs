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
  Truck,
  FileText,
  BarChart3,
  HelpCircle,
  ShoppingCart,
  ClipboardList,
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

  // Open Patients by default
  const [isPatientsOpen, setIsPatientsOpen] = useState(true);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/vendor") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isPatientsActive = () => {
    return pathname.startsWith("/dashboard/vendor/patients");
  };

  const isOrdersActive = () => {
    return pathname.startsWith("/dashboard/vendor/orders");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              NeoTech Vendor Portal
            </h1>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {session?.user?.role || "VENDOR"}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="Vendor" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "VN"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name || "Vendor User"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button 
                  onClick={() => router.push("/dashboard/vendor/profile")}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4 sticky top-[65px] overflow-y-auto">
          <nav className="space-y-1">
            {/* Dashboard */}
            <Link href="/dashboard/vendor">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname === "/dashboard/vendor"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className={`h-4 w-4 ${pathname === "/dashboard/vendor" ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </Link>

            {/* Patients Accordion Section */}
            <div className="space-y-1">
              <button
                onClick={() => setIsPatientsOpen(!isPatientsOpen)}
                className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${
                  isPatientsActive()
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className={`h-4 w-4 ${isPatientsActive() ? "text-blue-700" : ""}`} />
                  <span className="text-sm font-medium">Patients</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isPatientsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
                  isPatientsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Link href="/dashboard/vendor/patients">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/dashboard/vendor/patients"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-sm">List Patients</span>
                  </button>
                </Link>

                <Link href="/dashboard/vendor/patients/create">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/dashboard/vendor/patients/create"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Add Patient</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Orders Accordion Section */}
            <div className="space-y-1">
              <button
                onClick={() => setIsOrdersOpen(!isOrdersOpen)}
                className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${
                  isOrdersActive()
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Package className={`h-4 w-4 ${isOrdersActive() ? "text-blue-700" : ""}`} />
                  <span className="text-sm font-medium">Orders</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isOrdersOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
                  isOrdersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Link href="/dashboard/vendor/orders/list">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/dashboard/vendor/orders/list"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm">List Orders</span>
                  </button>
                </Link>

                <Link href="/dashboard/vendor/orders/create">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/dashboard/vendor/orders/create"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Package className="h-4 w-4" />
                    <span className="text-sm">Create Order</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Additional vendor sections (matching admin style) */}
            <Link href="/dashboard/vendor/shipments">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/vendor/shipments")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Truck className={`h-4 w-4 ${pathname.startsWith("/dashboard/vendor/shipments") ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Shipments ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/vendor/reports">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/vendor/reports")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText className={`h-4 w-4 ${pathname.startsWith("/dashboard/vendor/reports") ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Reports ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/vendor/analytics">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/vendor/analytics")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className={`h-4 w-4 ${pathname.startsWith("/dashboard/vendor/analytics") ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Analytics ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/vendor/helpdesk">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/vendor/helpdesk")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HelpCircle className={`h-4 w-4 ${pathname.startsWith("/dashboard/vendor/helpdesk") ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Helpdesk ⚠️</span>
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}