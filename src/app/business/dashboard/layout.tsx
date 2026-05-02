// src/app/(protected)/business/dashboard/layout.tsx
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
  Building2,
  UserPlus,
  MessageSquare,
  PlusCircle,
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

  // Accordion states
  const [isPatientsOpen, setIsPatientsOpen] = useState(true);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isShipmentsOpen, setIsShipmentsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const isActive = (href: string) => {
    if (href === "/business/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isPatientsActive = () => {
    return pathname.startsWith("/business/dashboard/patients");
  };

  const isOrdersActive = () => {
    return pathname.startsWith("/business/dashboard/orders");
  };

  const isShipmentsActive = () => {
    return pathname.startsWith("/business/dashboard/shipments");
  };

  const isSettingsActive = () => {
    return pathname.startsWith("/business/dashboard/settings");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar - Sticky */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              NeoTech Business Partner Portal
            </h1>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {"Business Partner"}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="Vendor" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "BP"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name || "BP User"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button 
                  onClick={() => router.push("/business/dashboard/profile")}
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

      <div className="flex relative">
        {/* Sidebar - Fixed position */}
        <aside className="w-64 bg-white border-r h-[calc(100vh-64px)] sticky top-[64px] overflow-y-auto shrink-0">
          <nav className="p-4 space-y-1">
            {/* Dashboard */}
            <Link href="/business/dashboard">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname === "/business/dashboard"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home className={`h-4 w-4 ${pathname === "/business/dashboard" ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </Link>

            {/* 1. Patients Accordion Section */}
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
                <Link href="/business/dashboard/patients">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/patients/list"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-sm">List Patients</span>
                  </button>
                </Link>

                <Link href="/business/dashboard/patients/create">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/patients/create"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    <span className="text-sm">Add Patient</span>
                  </button>
                </Link>

                <Link href="/business/dashboard/patients/enquiry">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/patients/enquiry"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm">Patient Enquiry</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* 2. All Orders */}
            <Link href="/business/dashboard/orders">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/business/dashboard/orders") && pathname !== "/business/dashboard/orders/create"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ShoppingCart className={`h-4 w-4 ${pathname.startsWith("/business/dashboard/orders") && pathname !== "/business/dashboard/orders/create" ? "text-blue-700" : ""}`} />
                <span className="text-sm font-medium">All Orders</span>
              </button>
            </Link>

            {/* 3. Shipments - Create Shipment */}
            <div className="space-y-1">
              <button
                onClick={() => setIsShipmentsOpen(!isShipmentsOpen)}
                className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${
                  isShipmentsActive()
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${isShipmentsActive() ? "text-blue-700" : ""}`} />
                  <span className="text-sm font-medium">Shipments</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isShipmentsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
                  isShipmentsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Link href="/business/dashboard/shipment">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/shipments/list"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span className="text-sm">List Shipments</span>
                  </button>
                </Link>

                <Link href="/business/dashboard/shipment/create">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/shipments/create"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span className="text-sm">Create Shipment</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* 4. Settings - Hospitals & Profile */}
            <div className="space-y-1">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${
                  isSettingsActive()
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className={`h-4 w-4 ${isSettingsActive() ? "text-blue-700" : ""}`} />
                  <span className="text-sm font-medium">Settings</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isSettingsOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
                  isSettingsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <Link href="/business/dashboard/settings/hospitals">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/settings/hospitals"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">Hospitals</span>
                  </button>
                </Link>

                <Link href="/business/dashboard/settings/profile">
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      pathname === "/business/dashboard/settings/profile"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Profile</span>
                  </button>
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}