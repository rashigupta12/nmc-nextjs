# Vendor Unique Login URL Implementation Plan

**Document Version**: 1.0  
**Date**: 18 April 2026  
**Target System**: NMC Genetics Platform  
**Status**: Ready for Implementation

---

## 1. Overview

This document describes the complete implementation plan for unique per-vendor login URLs as designed in the NMC database schema.

### 1.1 Objective
Each Business Partner (Vendor) will receive a unique, dedicated login URL that they can bookmark and use exclusively to access their portal. Vendors will never see the main staff/admin login page.

### 1.2 URL Format
```
Production:  https://app.nmcgenetics.com/vendor/{VENDOR_CODE}
Development: http://localhost:3000/vendor/{VENDOR_CODE}
```

Example:
```
https://app.nmcgenetics.com/vendor/BP001
```

---

## 2. Implementation Timeline & Phases

| Phase | Description | Estimated Effort | Priority |
|-------|-------------|------------------|----------|
| 1 | Dynamic Route & Page Implementation | 4 hours | HIGH |
| 2 | NextAuth Vendor Provider | 6 hours | HIGH |
| 3 | Middleware & Route Protection | 3 hours | HIGH |
| 4 | First Login Password Reset Flow | 5 hours | MEDIUM |
| 5 | Admin UI & Email Notifications | 4 hours | MEDIUM |
| 6 | Testing & Security Audit | 4 hours | HIGH |

**Total Estimated Effort**: 26 hours

---

## 3. Phase 1: Dynamic Vendor Login Route

### 3.1 File Structure
```
nmc-nextjs/src/app/
└── vendor/
    └── [vendorCode]/
        ├── layout.tsx
        └── page.tsx
```

### 3.2 Page Behaviour
1. Extract `vendorCode` from URL parameters
2. Lookup vendor in database using `vendorCode`
3. Validate vendor status:
   - If vendor not found → Show "Invalid login link" page
   - If vendor status != ACTIVE → Show "Account suspended" page
4. Render branded login page with:
   - Vendor logo from VendorSettings
   - Vendor custom theme colors
   - Auto-populated vendor context (hidden field)
   - Email and Password input fields

---

## 4. Phase 2: NextAuth Vendor Authentication Provider

### 4.1 Credentials Provider for Vendors
```typescript
// nmc-nextjs/src/auth.ts
Providers.Credentials({
  id: 'vendor',
  name: 'Vendor Login',
  credentials: {
    vendorCode: { type: 'text' },
    email: { type: 'email' },
    password: { type: 'password' }
  },
  async authorize(credentials) {
    // 1. Validate vendor exists and is active
    // 2. Validate email belongs to this vendor
    // 3. Verify password hash
    // 4. Return vendor user object or null
  }
})
```

### 4.2 Session Configuration
- Separate session cookies for staff vs vendor users
- Vendor sessions have `vendorId` in JWT token
- Vendor users cannot access `/admin` routes
- Staff users cannot access `/vendor` routes

---

## 5. Phase 3: Middleware Implementation

### 5.1 Route Protection Logic
```typescript
// nmc-nextjs/src/middleware.ts

if (pathname.startsWith('/vendor/')) {
  const vendorCode = pathname.split('/')[2];
  
  // Skip auth for login page
  if (pathname === `/vendor/${vendorCode}`) {
    return validateVendorExists(vendorCode);
  }
  
  // All other vendor routes require authenticated vendor session
  const session = await getSession();
  if (!session || session.user.type !== 'VENDOR') {
    return redirect(`/vendor/${vendorCode}`);
  }
  
  // Validate session vendor matches URL vendor
  if (session.user.vendorCode !== vendorCode) {
    return redirect('/unauthorized');
  }
}
```

---

## 6. Phase 4: First Login Password Reset Flow

### 6.1 Mandatory Password Reset
When vendor logs in for the first time:
1. Check `isPasswordReset = false` flag on Vendor record
2. Force redirect to password reset page
3. Vendor must:
   - Enter temporary password
   - Enter new password (meet complexity requirements)
   - Confirm new password
4. On success:
   - Update vendor password hash
   - Set `isPasswordReset = true`
   - Update `lastLoginAt` timestamp
   - Proceed to vendor dashboard

### 6.2 Security Rules
- Temporary passwords expire after 72 hours
- Cannot reuse last 5 passwords
- Minimum 12 characters, mixed case, numbers, symbols

---

## 7. Phase 5: Admin UI & Email Notifications

### 7.1 Admin Vendor Creation Flow
When Admin creates new vendor:
1. System auto-generates sequential vendorCode (BP001, BP002...)
2. System generates secure temporary password
3. System constructs unique login URL
4. All values saved to VendorsTable
5. Automated email sent to vendor contact email:
   - Welcome message
   - Unique login URL
   - Temporary password
   - Instructions to reset password on first login

### 7.2 Email Template Variables
```
{{VENDOR_NAME}}
{{UNIQUE_LOGIN_URL}}
{{TEMPORARY_PASSWORD}}
{{SUPPORT_CONTACT}}
```

---

## 8. Database Schema Usage

All required fields already exist in `VendorsTable`:

| Field | Purpose |
|-------|---------|
| `vendorCode` | Unique identifier used in URL |
| `loginurl` | Full unique URL stored for reference |
| `password` | Hashed password |
| `isPasswordReset` | First login flag |
| `lastLoginAt` | Last successful login timestamp |
| `status` | ACTIVE / SUSPENDED / INACTIVE |

---

## 9. Security Requirements

✅ Vendor URLs are unguessable (sequential but non-public)  
✅ Each vendor is completely isolated at database query level  
✅ Rate limiting per vendor login endpoint  
✅ Failed login attempts tracked per vendor  
✅ Session timeout after 15 minutes inactivity  
✅ All vendor routes protected by CORS policies  
✅ PII data remains encrypted at all times

---

## 10. Acceptance Criteria

- [ ] Admin can create vendor which automatically generates unique URL
- [ ] Vendor receives email with login URL and temporary password
- [ ] Vendor can only login through their own unique URL
- [ ] Vendor is forced to reset password on first login
- [ ] Vendor cannot access any other vendor's data
- [ ] Vendor cannot access admin routes
- [ ] Suspended vendor cannot login
- [ ] All login attempts are logged in audit trail

---

## 11. Rollout Plan

1. Develop and test in staging environment
2. Create test vendors and verify complete flow
3. Perform security penetration testing
4. Rollout to existing vendors with password reset
5. Monitor login success rates for 72 hours
6. Retire old shared vendor login page

---

## 12. Dependencies

- Existing PostgreSQL schema with VendorsTable
- NextAuth authentication system
- NodeMailer / Resend for email delivery
- Existing middleware system
- Audit logging infrastructure

---

**Next Step**: Toggle to Act mode to begin implementation of Phase 1.