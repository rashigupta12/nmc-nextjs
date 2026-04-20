// src/app/(protected)/dashboard/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Package, DollarSign, TrendingUp, TrendingDown, FileText } from "lucide-react";

interface DashboardStats {
  totalVendors: number;
  totalUsers: number;
  totalSamples: number;
  totalRevenue: number;
  recentOrders: number;
  pendingShipments: number;
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    totalUsers: 0,
    totalSamples: 0,
    totalRevenue: 0,
    recentOrders: 0,
    pendingShipments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // Replace with actual API calls
      // const response = await fetch('/api/admin/dashboard-stats');
      // const data = await response.json();
      
      // Mock data for now
      setStats({
        totalVendors: 24,
        totalUsers: 156,
        totalSamples: 1234,
        totalRevenue: 124567,
        recentOrders: 89,
        pendingShipments: 12,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Vendors",
      value: stats.totalVendors,
      icon: Building2,
      color: "bg-blue-500",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-green-500",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Total Samples",
      value: stats.totalSamples,
      icon: Package,
      color: "bg-purple-500",
      trend: "+23%",
      trendUp: true,
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      trend: "-3%",
      trendUp: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, Admin!</h2>
        <p className="text-blue-100 mt-2">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center mt-2">
                  {stat.trendUp ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.trendUp ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #ORD-{23042610000 + item}</p>
                    <p className="text-sm text-gray-500">Vendor: Health Labs Inc.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">₹12,500</p>
                    <p className="text-xs text-gray-500">Pending</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Samples */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Samples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">Sample #BP1SL{String(item).padStart(6, '0')}</p>
                    <p className="text-sm text-gray-500">Patient: John Doe</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      PROCESSING
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium">Add Vendor</p>
            </button>
            <button className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">Create Order</p>
            </button>
            <button className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors">
              <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Generate Report</p>
            </button>
            <button className="p-4 text-center border rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium">Manage Users</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}