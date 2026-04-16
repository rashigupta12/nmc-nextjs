// src/app/(protected)/dashboard/admin/layout.tsx
"use client";

import React from "react";
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
  Users,
  BarChart3,
  LogOut,
  Building2,
  Package,
  Truck,
  FileText,
  HelpCircle,
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

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  const navigationItems = [
    { href: "/dashboard/admin", label: "Dashboard", icon: Home },
    { href: "/dashboard/admin/vendors", label: "Vendors", icon: Building2 },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/test-catalog", label: "Test Catalog", icon: Package },
    { href: "/dashboard/admin/samples", label: "Samples", icon: FileText },
    { href: "/dashboard/admin/shipments", label: "Shipments", icon: Truck },
    { href: "/dashboard/admin/reports", label: "Reports", icon: BookOpen },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/admin/helpdesk", label: "Helpdesk", icon: HelpCircle },
    { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
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
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full flex items-center gap-2 rounded-lg p-2 transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-blue-700" : ""}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </Link>
              );
            })}
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