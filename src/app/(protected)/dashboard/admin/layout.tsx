/*eslint-disable @typescript-eslint/no-unused-vars */
// src/app/(protected)/dashboard/admin/layout.tsx
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
  BookOpen,
  Home,
  Settings,
  BarChart3,
  LogOut,
  Building2,
  Truck,
  FileText,
  HelpCircle,
  PenIcon,
  Dna,
  ChevronDown,
  Database,
  FileSearch,
  Info,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isGeneticOpen, setIsGeneticOpen] = useState(true); // Set to true if you want it open by default

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  // Genetic Data dropdown items
  const geneticItems = [
    {
      href: "/dashboard/admin/genetic-data/variants",
      label: "Gene Variants",
      icon: FileSearch,
    },
    {
      href: "/dashboard/admin/genetic-data/gene-page",
      label: "Gene Page Data",
      icon: Database,
    },
    {
      href: "/dashboard/admin/genetic-data/gene-description",
      label: "Gene Page Description",
      icon: Info,
    },
    {
      href: "/dashboard/admin/genetic-data/additional-data",
      label: "Additional Data",
      icon: PlusCircle,
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const isGeneticActive = () => {
    return pathname.startsWith("/dashboard/admin/genetic-data");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              NeoTech Admin Portal
            </h1>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {session?.user?.role || "ADMIN"}
            </span>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="Admin" />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "AD"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">
                  {session?.user?.name || "Admin User"}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button
                  onClick={() => router.push("/dashboard/admin/profile")}
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
            <Link href="/dashboard/admin">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname === "/dashboard/admin"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Home
                  className={`h-4 w-4 ${pathname === "/dashboard/admin" ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </Link>

            {/* Vendors */}
            <Link href="/dashboard/admin/vendors">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/vendors")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Building2
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/vendors") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Vendors</span>
              </button>
            </Link>

            {/* Test Catalog */}
            <Link href="/dashboard/admin/test-catalog">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/test-catalog")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <PenIcon
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/test-catalog") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Test Catalog</span>
              </button>
            </Link>

            {/* Genetic Data Accordion Section */}
            <div className="space-y-1">
              {/* Genetic Data Header Button */}
              <button
                onClick={() => setIsGeneticOpen(!isGeneticOpen)}
                className={`w-full flex items-center justify-between rounded-lg p-2 transition-colors ${
                  isGeneticActive()
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Dna
                    className={`h-4 w-4 ${isGeneticActive() ? "text-blue-700" : ""}`}
                  />
                  <span className="text-sm font-medium">Genetic Data</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isGeneticOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Genetic Data Sub-items (Collapsible) */}
              <div
                className={`ml-6 space-y-1 overflow-hidden transition-all duration-200 ${
                  isGeneticOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {geneticItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                          active
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${active ? "text-blue-700" : ""}`}
                        />
                        <span className="text-sm">{item.label}</span>
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link href="/dashboard/admin/hospitals">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/hospitals")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/samples") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Hospitals</span>
              </button>
            </Link>

              <Link href="/dashboard/admin/ethnicity">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/ethnicity")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/ethnicity") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Ethnicity</span>
              </button>
            </Link>
            {/* Remaining navigation items */}
            <Link href="/dashboard/admin/samples">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/samples")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FileText
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/samples") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Samples ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/admin/shipments">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/shipments")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Truck
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/shipments") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Shipments ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/admin/reports">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/reports")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BookOpen
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/reports") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Reports ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/admin/analytics">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/analytics")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/analytics") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Analytics ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/admin/helpdesk">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/helpdesk")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <HelpCircle
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/helpdesk") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Helpdesk ⚠️</span>
              </button>
            </Link>

            <Link href="/dashboard/admin/settings">
              <button
                className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                  pathname.startsWith("/dashboard/admin/settings")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Settings
                  className={`h-4 w-4 ${pathname.startsWith("/dashboard/admin/settings") ? "text-blue-700" : ""}`}
                />
                <span className="text-sm font-medium">Settings ⚠️</span>
              </button>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
