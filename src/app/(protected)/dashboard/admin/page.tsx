"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { signOut } from "next-auth/react";
import { BookOpen, Home, Settings, Users, BarChart3, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">Admin User</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
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
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4">
          <nav className="space-y-2">
            <button className="w-full flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <Home className="h-4 w-4" />
              <span className="text-sm">Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <Users className="h-4 w-4" />
              <span className="text-sm">Users</span>
            </button>
            <button className="w-full flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Content</span>
            </button>
            <button className="w-full flex items-center gap-2 rounded-lg p-2 text-gray-700 hover:bg-gray-100 transition-colors">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Analytics</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard Cards */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
              <p className="text-sm text-green-600 mt-2">↑ 12% from last month</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800">Active Sessions</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">567</p>
              <p className="text-sm text-green-600 mt-2">↑ 8% from last week</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-800">Total Revenue</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">$12,345</p>
              <p className="text-sm text-red-600 mt-2">↓ 3% from last month</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}