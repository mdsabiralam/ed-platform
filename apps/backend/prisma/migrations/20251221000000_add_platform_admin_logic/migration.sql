-- CreateEnum
CREATE TYPE "PlatformAdminRole" AS ENUM ('OWNER', 'SUPPORT');

-- AlterTable
ALTER TABLE "platform_admins" ADD COLUMN "access_level" TEXT;

-- Set default for existing rows to avoid NOT NULL violation
UPDATE "platform_admins" SET "access_level" = 'FULL' WHERE "access_level" IS NULL;

-- Add NOT NULL constraint
ALTER TABLE "platform_admins" ALTER COLUMN "access_level" SET NOT NULL;

-- Handle Role Conversion
-- Assuming existing roles are 'SUPER_ADMIN' or similar text. Map them to 'OWNER'.
UPDATE "platform_admins" SET "role" = 'OWNER' WHERE "role" = 'SUPER_ADMIN' OR "role" IS NULL;

-- Alter Role Column
ALTER TABLE "platform_admins" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "platform_admins" ALTER COLUMN "role" TYPE "PlatformAdminRole" USING ("role"::"PlatformAdminRole");
ALTER TABLE "platform_admins" ALTER COLUMN "role" SET DEFAULT 'OWNER';
