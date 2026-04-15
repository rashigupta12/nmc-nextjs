import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navbar */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                The - Library
              </Link>
            </div>

          

            {/* Auth Buttons */}
            <div className="flex items-center space-x-6">
              <Link href="/auth/login">
                <Button variant="ghost" size="lg" className="text-lg">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="default" size="lg" className="text-lg">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Proper Spacing */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              This is a Shadcn Button
            </h1>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Button size="lg" className="text-lg w-full sm:w-auto">
                Learn
              </Button>
              <Button size="lg" className="text-lg w-full sm:w-auto">
                Examples
              </Button>
              <Link href="https://nextjs.org" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="text-lg w-full">
                  Go to nextjs.org →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}