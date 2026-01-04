# Security Architecture: Row Level Security (RLS)

This document outlines the Row Level Security (RLS) policies implemented to ensure multi-tenancy isolation and data privacy.

## Overview

RLS is enabled on key tables to restrict data access based on the user's role and institute association. The system uses the `get_current_institute_id()` function to extract the institute ID from the current session's JWT (`app_metadata.institute_id`).

## Policies

### 1. Institute Isolation (Table: `Institute`)
- **Policy Name:** `institute_isolation_policy`
- **Rule:** Administrators/Users can only view their own institute.
- **Condition:** `id = get_current_institute_id()`

### 2. Super Admin Bypass (Table: `Institute`)
- **Policy Name:** `super_admin_bypass_policy`
- **Rule:** Users with the role `SUPER_ADMIN` can access all institute records.
- **Condition:** `auth.jwt() -> 'app_metadata' ->> 'role' = 'SUPER_ADMIN'`

### 3. Profile Access (Table: `Profile`)
- **Policy Name:** `profile_access_policy`
- **Rule:** Users can view profiles if:
    1. The profile belongs to them (`userId = auth.uid()`).
    2. OR the profile belongs to their authorized institute (`instituteId = get_current_institute_id()`).

### 4. Invoice Security (Table: `SaasInvoice`)
- **Policy Name:** `invoice_access_policy`
- **Rule:** Invoices are only visible to users belonging to the associated institute.
- **Condition:** `instituteId = get_current_institute_id()`

### 5. User Privacy (Table: `User`)
- **Policy Name:** `user_privacy_policy`
- **Rule:** Users can strictly view only their own user record.
- **Condition:** `id = auth.uid()`

## Helper Functions

### `get_current_institute_id()`
Extracts the `institute_id` from the `app_metadata` field of the JWT token.

## Analytics View

### `admin_analytics_view`
A centralized view for Super Admins that aggregates data (Total Students, Total Institutes, Total Users) across the entire system. This view utilizes a `SECURITY DEFINER` function `get_admin_analytics_data()` to safely bypass RLS policies and provide global counts.

## Verification

To verify RLS isolation:
```sql
-- Simulate request as user from Institute A
SET request.jwt.claim.app_metadata = '{"institute_id": "institute-a-uuid"}';
SET request.jwt.claim.sub = 'user-uuid';

-- Attempt to read Institute B (should return 0 rows)
SELECT * FROM "Institute" WHERE id = 'institute-b-uuid';
```
