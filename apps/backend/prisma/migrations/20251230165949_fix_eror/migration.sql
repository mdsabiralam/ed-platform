/*
  Warnings:

  - The values [MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY,SUNDAY] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `school_id` on the `routine_substitutions` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `routine_substitutions` table. All the data in the column will be lost.
  - The `status` column on the `routine_substitutions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `name` on the `time_slots` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_teacher_id` to the `routine_substitutions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DayOfWeek_new" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');
ALTER TABLE "routine_entries" ALTER COLUMN "day_of_week" TYPE "DayOfWeek_new" USING ("day_of_week"::text::"DayOfWeek_new");
ALTER TYPE "DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "DayOfWeek_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "routine_substitutions" DROP CONSTRAINT "routine_substitutions_school_id_fkey";

-- DropIndex
DROP INDEX "rooms_school_id_name_key";

-- DropIndex
DROP INDEX "subjects_school_id_code_key";

-- AlterTable
ALTER TABLE "rooms" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "routine_entries" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_live" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meeting_link" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "routine_substitutions" DROP COLUMN "school_id",
DROP COLUMN "updated_at",
ADD COLUMN     "original_teacher_id" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- AlterTable
ALTER TABLE "subjects" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "code" DROP NOT NULL;

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "name",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "label" TEXT,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "end_time" SET DATA TYPE TEXT,
ALTER COLUMN "start_time" SET DATA TYPE TEXT;

-- DropEnum
DROP TYPE "SubstitutionStatus";

-- CreateTable
CREATE TABLE "student_sequences" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "student_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_attendance_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "join_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leave_time" TIMESTAMP(3),

    CONSTRAINT "live_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_recordings" (
    "id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "vod_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_extra_duty_logs" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "hours_worked" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,

    CONSTRAINT "staff_extra_duty_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_applications" (
    "id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "leave_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_sequences_school_id_year_key" ON "student_sequences"("school_id", "year");

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_original_teacher_id_fkey" FOREIGN KEY ("original_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_extra_duty_logs" ADD CONSTRAINT "staff_extra_duty_logs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
