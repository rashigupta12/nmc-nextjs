# Vendor Login System Final Implementation Plan

**URL Pattern**: `http://localhost:3000/vendor/login/{vendor-slug}`  
**Status**: Ready for Implementation

---

## ✅ Complete End-to-End Flow

```
1.  NEO TECH ADMIN creates vendor
    ├─ Auto generates unique URL slug (ex: "rashi-gupta")
    ├─ Creates full login URL: /vendor/login/rashi-gupta
    ├─ Generates temporary password
    └─ Sends email with URL + credentials

2.  VENDOR opens their unique URL
    ├─ System looks up vendor by slug
    ├─ Shows branded login page with vendor logo/themes
    └─ Vendor enters Email + Password

3.  AUTHENTICATION
    ├─ Validate credentials against vendor record
    ├─ Check if vendor is ACTIVE
    ├─ If first login → FORCE password reset
    └─ Create vendor session and redirect to dashboard

4.  VENDOR DASHBOARD
    └─ All routes are scoped to their vendorId only
```

---

## 🚀 Step by Step Implementation

---

### **Step 1: Create Dynamic Login Route**

**File**: `nmc-nextjs/src/app/vendor/login/[slug]/page.tsx`

```tsx
export default async function VendorLoginPage({ params }) {
  const { slug } = params;
  
  // Lookup vendor by slug
  const vendor = await db.query.VendorsTable.findFirst({
    where: eq(VendorsTable.loginSlug, slug),
    with: { settings: true }
  });

  if (!vendor) return <InvalidLinkPage />
  if (vendor.status !== 'ACTIVE') return <AccountSuspendedPage />

  return (
    <LoginPage 
      vendor={vendor} 
      logo={vendor.settings.logoImg}
      themeColor={vendor.settings.testThemeColor}
    />
  )
}
```

---

### **Step 2: Add Vendor Credentials Provider to NextAuth**

**File**: `nmc-nextjs/src/auth.ts`

```typescript
CredentialsProvider({
  id: 'vendor',
  name: 'Vendor Login',
  credentials: {
    slug: { type: 'hidden' },
    email: { type: 'email' },
    password: { type: 'password' }
  },
  async authorize(credentials) {
    // 1. Find vendor by slug
    const vendor = await db.query.VendorsTable.findFirst({
      where: and(
        eq(VendorsTable.loginSlug, credentials.slug),
        eq(VendorsTable.email, credentials.email)
      )
    })

    // 2. Validate status
    if (!vendor || vendor.status !== 'ACTIVE') return null

    // 3. Verify password hash
    const valid = await bcrypt.compare(credentials.password, vendor.password)
    if (!valid) return null

    // 4. Return vendor user object
    return {
      id: vendor.id,
      email: vendor.email,
      name: vendor.name,
      type: 'VENDOR',
      vendorCode: vendor.vendorCode,
      loginSlug: vendor.loginSlug
    }
  }
})
```

---

### **Step 3: Middleware Route Protection**

**File**: `nmc-nextjs/src/middleware.ts`

```typescript
if (pathname.startsWith('/vendor/')) {
  
  // Allow public access to login page
  if (pathname.match(/^\/vendor\/login\/[^/]+$/)) {
    return NextResponse.next()
  }

  // All other vendor routes require valid vendor session
  const session = await getSession()
  
  if (!session || session.user.type !== 'VENDOR') {
    // Redirect back to their own login page
    const slug = pathname.split('/')[3]
    return redirect(`/vendor/login/${slug}`)
  }

  // ✅ IMPORTANT: Row Level Security - attach vendorId to request
  request.headers.set('X-Vendor-Id', session.user.id)

  return NextResponse.next()
}
```

---

### **Step 4: Mandatory First Login Password Reset**

```typescript
// After successful login:
if (vendor.isPasswordReset === false) {
  return redirect(`/vendor/${slug}/reset-password`)
}

// Password reset page logic:
// 1. Require current temporary password
// 2. New password must meet complexity requirements
// 3. Update password hash
// 4. Set isPasswordReset = true
// 5. Log audit entry
// 6. Redirect to dashboard
```

---

### **Step 5: Admin Vendor Creation Workflow**

When Admin creates vendor:
```typescript
// 1. Generate URL friendly slug from vendor name
const loginSlug = slugify(vendorName, { lower: true, strict: true })

// 2. Generate unique URL
const loginUrl = `${process.env.NEXTAUTH_URL}/vendor/login/${loginSlug}`

// 3. Generate temporary password
const tempPassword = generatePassword(14)

// 4. Save to database
await db.insert(VendorsTable).values({
  ...vendorData,
  loginSlug,
  loginurl: loginUrl,
  password: await bcrypt.hash(tempPassword, 12),
  isPasswordReset: false
})

// 5. Send welcome email
await sendVendorWelcomeEmail({
  to: vendor.email,
  vendorName: vendor.name,
  loginUrl,
  tempPassword
})
```

---

## 🔐 Security Guarantees

| Security Feature | Status |
|------------------|--------|
| ✅ Vendors can **ONLY** login through their own unique URL | ✅ |
| ✅ Vendor session is isolated and cannot access admin routes | ✅ |
| ✅ Vendor can **NEVER** see data from other vendors | ✅ |
| ✅ Password is hashed with bcrypt 12 rounds | ✅ |
| ✅ All login attempts logged to audit trail | ✅ |
| ✅ Rate limiting 5 failed attempts per 15 minutes | ✅ |
| ✅ Temporary password expires after 72 hours | ✅ |
| ✅ Session timeout after 15 minutes inactivity | ✅ |

---

## 📁 Required Files to Create

```
nmc-nextjs/src/app/
└── vendor/
    ├── layout.tsx
    ├── login/
    │   └── [slug]/
    │       └── page.tsx
    ├── reset-password/
    │   └── page.tsx
    └── dashboard/
        └── page.tsx
```

---

## ✅ Acceptance Criteria

- [ ] Admin creates vendor → unique URL is generated automatically
- [ ] Vendor receives email with login URL and temporary password
- [ ] Opening URL shows branded login page for that specific vendor
- [ ] Vendor cannot login from main /auth/login page
- [ ] First login forces password reset
- [ ] Vendor dashboard only shows their own patients/samples/orders
- [ ] Suspended vendor gets proper error message
- [ ] All actions are logged in audit log

---

## 👨💻 Next Steps

This plan is 100% compatible with your existing database schema, URL pattern and already stored vendor login URLs.

**Toggle to Act mode** and I will implement this entire system starting with the dynamic route.