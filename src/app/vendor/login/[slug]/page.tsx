import React from 'react'
import Link from 'next/link'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { VendorsTable } from '@/db/schema'
import VendorLoginForm from '@/components/vendor/VendorLoginForm'

interface Props {
  params: { slug: string }
}

export default async function VendorLoginPage({ params }: Props) {
  const { slug } = params

  // Lookup vendor by login slug
  const vendor = await db.query.VendorsTable.findFirst({
    where: eq(VendorsTable.loginSlug, slug),
    with: {
      settings: true
    }
  })

  if (!vendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Invalid Login Link</h1>
          <p className="text-gray-500 mb-6">
            This vendor login URL is not valid. Please check the link and try again.
          </p>
          <Link href="/" className="text-primary hover:underline">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (vendor.status !== 'ACTIVE') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Account Suspended</h1>
          <p className="text-gray-500 mb-6">
            This vendor account has been suspended. Please contact support for assistance.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {vendor.settings?.logoImg && (
          <div className="flex justify-center mb-6">
            <img 
              src={vendor.settings.logoImg} 
              alt={vendor.name} 
              className="max-h-16 object-contain"
            />
          </div>
        )}
        
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">{vendor.name}</h1>
          <p className="text-sm text-gray-500">Vendor Portal Login</p>
        </div>

        <VendorLoginForm 
          vendorSlug={slug}
          vendorId={vendor.id}
          themeColor={vendor.settings?.testThemeColor ?? undefined}
        />
      </div>
    </div>
  )
}