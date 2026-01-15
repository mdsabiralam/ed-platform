-- Rename Tenant table to Institutes
ALTER TABLE IF EXISTS "tenants" RENAME TO "institutes";
ALTER TABLE IF EXISTS "institutes" RENAME CONSTRAINT "tenants_pkey" TO "institutes_pkey";

-- Rename Subscription table
ALTER TABLE IF EXISTS "tenant_subscriptions" RENAME TO "institute_subscriptions";
ALTER TABLE IF EXISTS "institute_subscriptions" RENAME CONSTRAINT "tenant_subscriptions_pkey" TO "institute_subscriptions_pkey";

-- Rename Columns (tenant_id -> institute_id)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institute_subscriptions' AND column_name='tenant_id') THEN
        ALTER TABLE "institute_subscriptions" RENAME COLUMN "tenant_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='saas_invoices' AND column_name='tenant_id') THEN
        ALTER TABLE "saas_invoices" RENAME COLUMN "tenant_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='school_id') THEN
        ALTER TABLE "profiles" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admission_sessions' AND column_name='school_id') THEN
        ALTER TABLE "admission_sessions" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='classes' AND column_name='school_id') THEN
        ALTER TABLE "classes" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='school_id') THEN
        ALTER TABLE "students" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='school_id') THEN
        ALTER TABLE "staff_profiles" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='chart_of_accounts' AND column_name='school_id') THEN
        ALTER TABLE "chart_of_accounts" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leave_types' AND column_name='school_id') THEN
        ALTER TABLE "leave_types" RENAME COLUMN "school_id" TO "institute_id";
    END IF;

    -- Update any other tenant_id columns in standard tables if they exist
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='referral_linkages' AND column_name='tenant_id') THEN
        ALTER TABLE "referral_linkages" RENAME COLUMN "tenant_id" TO "institute_id";
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='kyc_documents' AND column_name='tenant_id') THEN
        ALTER TABLE "kyc_documents" RENAME COLUMN "tenant_id" TO "institute_id";
    END IF;
END $$;

-- Create Transport Tables (New Module)
CREATE TABLE IF NOT EXISTS "transport_vehicles" (
    "id" TEXT NOT NULL,
    "institute_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_vehicles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "transport_routes" (
    "id" TEXT NOT NULL,
    "institute_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_point" TEXT,
    "end_point" TEXT,
    "vehicle_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_routes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "transport_stops" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transport_stops_pkey" PRIMARY KEY ("id")
);

-- Add Constraints/Indexes for Transport if needed (FKs implicitly handled by Prisma usually, but good to have in SQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='transport_vehicles_institute_id_fkey') THEN
        ALTER TABLE "transport_vehicles" ADD CONSTRAINT "transport_vehicles_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='transport_routes_institute_id_fkey') THEN
        ALTER TABLE "transport_routes" ADD CONSTRAINT "transport_routes_institute_id_fkey" FOREIGN KEY ("institute_id") REFERENCES "institutes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
