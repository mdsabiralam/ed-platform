# Mobile Schema Handover Report (2.J.07)

**Status:** ✅ Core Schema Frozen & Ready for Mobile Sync
**Date:** 2026-01-06

The backend schema has been finalized and verified. Please use this reference to update the mobile `Drift` / `WatermelonDB` schema.

## 1. Core Structural Changes
*   **Tenant Renamed to Institute:** The entity formerly known as `Tenant` is now **`Institute`**.
    *   **Table:** `institutes`
    *   **Foreign Key:** `institute_id` (replaced `tenant_id` and `school_id`).
    *   **Impact:** All local tables must include `institute_id` for multi-tenancy and RLS compatibility.

## 2. Core Tables for Offline-First Implementation

### A. Institute (New)
*   **Table:** `institutes`
*   **Fields:** `id` (UUID), `name`, `subdomain`, `logo_url`, `is_active`.
*   **Sync Priority:** High (Required for bootstrapping app context).

### B. User & Profile
*   **Tables:** `users`, `profiles`
*   **Fields:** Standard user details + `institute_id` linkage in `profiles`.

### C. Student (Updated)
*   **Table:** `students`
*   **Backend ID Type:** UUID (String). *Mobile currently uses Integer - Needs Migration.*
*   **Fields:** `id`, `first_name`, `last_name`, `admission_no`, `roll_no`, `section_id`, `institute_id`, `user_id`.
*   **Note:** Mobile currently has `classId`; Backend uses `sectionId` which links to `Class`. Ensure proper hierarchy (Institute -> Class -> Section -> Student).

### D. Transport (New Module)
*   **Tables:**
    1.  `transport_vehicles`: `id`, `number`, `capacity`, `type`, `institute_id`.
    2.  `transport_routes`: `id`, `name`, `vehicle_id`, `institute_id`.
    3.  `transport_stops`: `id`, `route_id`, `name`, `lat`, `lng`, `sequence`.

### E. Finance
*   **Table:** `chart_of_accounts`
*   **Fields:** `id`, `code`, `name`, `type`, `institute_id`.

## 3. Discrepancy Action Plan (Mobile Team)
1.  **Update IDs:** Switch `Student.id` from `Integer` to `String` (UUID) to match backend.
2.  **Add Context:** Add `institute_id` column to all synced tables.
3.  **New Tables:** Create local Drift tables for `Transport` and `Finance` entities.
4.  **Sync Logic:** Update API endpoints to use `prisma.institute` instead of `prisma.tenant`.

## 4. RLS & Security
*   **RLS Enabled:** Backend tables now enforce RLS. Ensure the sync pull request includes the `x-institute-id` header or correct auth token context.
