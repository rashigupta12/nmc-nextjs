import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function VendorDashboardPage() {
  const session = await auth();

  // Safety check — middleware already enforces this, but we double-check here
  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, {session.user.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Pending Samples</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-sm font-medium text-gray-500">Reports Generated</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">—</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Account Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Vendor Code</p>
              <p className="text-base font-medium text-gray-900">
                {session.user.vendorCode || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">
                {session.user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Login Slug</p>
              <p className="text-base font-medium text-gray-900">
                {session.user.loginSlug || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
