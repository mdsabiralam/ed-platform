-- AlterTable
ALTER TABLE "platform_audit_logs" DROP COLUMN "target",
ADD COLUMN     "target_institute_id" TEXT,
DROP COLUMN "created_at",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
