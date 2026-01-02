-- AlterTable
ALTER TABLE "assignments" ADD COLUMN "allow_late_submission" BOOLEAN NOT NULL DEFAULT true, ADD COLUMN "is_locked" BOOLEAN NOT NULL DEFAULT false;
