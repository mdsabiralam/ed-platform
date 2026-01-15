-- AlterTable
ALTER TABLE "platform_audit_logs"
RENAME COLUMN "target" TO "target_institute_id";

ALTER TABLE "platform_audit_logs"
RENAME COLUMN "created_at" TO "timestamp";
