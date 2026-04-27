# Multi-Tenant Authentication & Vendor Isolation Plan

## Project: NMC Next.js Application
## Date: 27 April 2026

---

## 1. Overview

This document defines the multi-tenant architecture implementation for vendor authentication and data isolation. The goal is to create strict security boundaries where each vendor operates as a separate tenant with complete data isolation, while maintaining platform admin capabilities for system management only.

---

## 2. Current State

### 2.1 Existing Implementation
- ✅ NextAuth v5 with Drizzle Adapter
- ✅ Vendor credentials provider exists
- ✅ `VENDOR` role supported in sessions
- ✅ Basic vendor route protection
- ✅ Vendor table schema in PostgreSQL

### 2.2 Identified Gaps
| Gap | Risk Level | Description |
|-----|------------|-------------|
| No data isolation | CRITICAL | Vendors can access all data in the system |
| No tenant scoping | CRITICAL | Database queries do not filter by vendor ID |
| Cross role access | HIGH | Admins can access vendor routes and vice versa |
| No context injection | HIGH | API endpoints don't automatically apply vendor context |
| No RLS policies | MEDIUM | No database level enforcement of data ownership |

---

## 3. Architecture Design Principles

### 3.1 Core Security Rules
1.  **Vendor Isolation**: A vendor can ONLY see and modify their own data
2.  **Strict Boundaries**: No cross access between admin and vendor spaces
3.  **Defense In Depth**: Isolation enforced at multiple layers
4.  **No Impersonation**: System admins CANNOT login as vendors
5.  **Transparent Scoping**: Developers don't need to manually add vendor filters

---

## 4. Implementation Plan

### Phase 1: Security Boundaries (Routes & Middleware)

#### 4.1 Route Isolation
| Role | Allowed Routes | Forbidden Routes |
|---|---|---|
| ADMIN / SUPER_ADMIN | `/dashboard/**` | All `/vendor/**` routes |
| VENDOR | `/vendor/**` | All `/dashboard/**` routes |
| Unauthenticated | `/auth/**`, `/` | All protected routes |

#### 4.2 Middleware Enhancements
```typescript
// Add to middleware.ts:
1.  Check for role mismatch on route access
2.  Block ADMIN users from accessing /vendor/*
3.  Block VENDOR users from accessing /dashboard/*
4.  Extract vendor ID from session for all vendor routes
5.  Attach vendor context to request object
```

### Phase 2: Data Isolation Layer

#### 4.3 Vendor Context System
- Create `getCurrentVendor()` server function that returns authenticated vendor
- Create vendor scoped database helpers:
  ```typescript
  // Automatically applies vendorId filter
  const vendorDb = createVendorScopedDb(vendorId)
  
  // All queries automatically filter: WHERE vendorId = X
  vendorDb.query.OrdersTable.findMany()
  ```

#### 4.4 Database Schema Requirements
All vendor owned tables MUST have:
- `vendorId` column (NOT NULL, foreign key to VendorsTable)
- Index on `vendorId` for performance
- Row Level Security policy

#### 4.5 PostgreSQL Row Level Security
```sql
-- Enable RLS on all vendor tables
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy that only allows vendors to access their own data
CREATE POLICY vendor_isolation_policy ON orders
FOR ALL USING (vendorId = current_setting('app.current_vendor_id')::uuid);
```

### Phase 3: Authentication Enhancements

#### 4.6 Session Improvements
- Vendor session will always include:
  - `vendorId` (primary key)
  - `vendorCode`
  - `loginSlug`
  - `isPasswordReset` flag
- Vendor data automatically refreshed from database on every session access

#### 4.7 Login Flow
- Vendors login only via `/vendor/login/[slug]`
- Platform admins login only via `/auth/login`
- Separate login forms and separate authentication endpoints

### Phase 4: API & Data Access

#### 4.8 API Endpoint Security
- All `/api/vendor/**` endpoints:
  - Require VENDOR role
  - Automatically inject vendor context
  - Reject any request that attempts to access other vendor's data
  - Validate vendor ownership on all create/update/delete operations

#### 4.9 Audit Logging
- All vendor actions are logged with vendor ID
- Admin actions are logged separately
- Login events include role and access type

---

## 5. Implementation Steps

### Milestone 1: Route Boundaries
1.  Update middleware.ts to block cross-role access
2.  Add vendor ID extraction from session
3.  Add request context attachment

### Milestone 2: Data Scoping Helpers
1.  Create vendor scoped database utilities
2.  Implement `getCurrentVendor()` server function
3.  Add type safety for vendor context

### Milestone 3: Database Enforcement
1.  Add vendorId columns to all vendor owned tables
2.  Add foreign keys and indexes
3.  Implement Row Level Security policies

### Milestone 4: Codebase Migration
1.  Update all vendor API endpoints to use scoped queries
2.  Update all server actions for vendor routes
3.  Remove any manual vendorId filtering

### Milestone 5: Testing & Validation
1.  Penetration testing for cross tenant access
2.  Verify admin cannot access vendor data
3.  Verify vendors cannot see each other's data
4.  Performance testing of RLS policies

---

## 6. Success Metrics

✅ Vendor can only access their own data  
✅ Admin cannot access any vendor internal data  
✅ No cross vendor data leakage possible  
✅ Isolation cannot be bypassed by application code  
✅ All existing functionality continues to work as expected

---

## 7. Security Guarantees

This architecture provides isolation at 3 separate layers:
1.  **Route Layer**: Middleware blocks wrong role access
2.  **Application Layer**: Query helpers automatically filter by vendor
3.  **Database Layer**: RLS policies as final security boundary

Even if a bug exists in one layer, the other layers will still prevent unauthorized access.

---

## 8. Future Enhancements

- Vendor specific rate limiting
- Vendor custom authentication policies
- Vendor session management
- Vendor specific branding & configuration