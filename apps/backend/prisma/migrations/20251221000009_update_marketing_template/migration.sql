-- CreateEnum
CREATE TYPE "MarketingCategory" AS ENUM ('FESTIVAL', 'ADMISSION', 'GENERAL');

-- AlterTable
ALTER TABLE "marketing_templates" ADD COLUMN "svg_content" TEXT;

-- Handle data migration for 'category'
-- Assuming existing 'category' is text. We map common values or default to GENERAL.
UPDATE "marketing_templates"
SET "category" = 'ADMISSION'
WHERE "category" ILIKE '%admission%';

UPDATE "marketing_templates"
SET "category" = 'FESTIVAL'
WHERE "category" ILIKE '%festival%';

-- Set everything else to GENERAL (or if NULL)
UPDATE "marketing_templates"
SET "category" = 'GENERAL'
WHERE "category" NOT IN ('ADMISSION', 'FESTIVAL') OR "category" IS NULL;

-- Alter Column Type
ALTER TABLE "marketing_templates"
ALTER COLUMN "category" TYPE "MarketingCategory"
USING "category"::"MarketingCategory";

-- Set Default
ALTER TABLE "marketing_templates" ALTER COLUMN "category" SET DEFAULT 'GENERAL';
ALTER TABLE "marketing_templates" ALTER COLUMN "category" SET NOT NULL;
