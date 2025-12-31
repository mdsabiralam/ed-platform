/*
  Warnings:

  - The values [MON,TUE,WED,THU,FRI,SAT,SUN] on the enum `DayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `deleted_at` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `is_live` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `meeting_link` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `original_teacher_id` on the `routine_substitutions` table. All the data in the column will be lost.
  - The `status` column on the `routine_substitutions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `first_name` on the `staff_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `staff_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the `class_recordings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `live_attendance_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `staff_extra_duty_logs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `student_sequences` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[school_id,name]` on the table `rooms` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[school_id,code]` on the table `subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `school_id` to the `routine_substitutions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `routine_substitutions` table without a default value. This is not possible if the table is not empty.
  - Made the column `code` on table `subjects` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `end_time` on the `time_slots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `start_time` on the `time_slots` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubstitutionStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "DayOfWeek_new" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
ALTER TABLE "routine_entries" ALTER COLUMN "day_of_week" TYPE "DayOfWeek_new" USING ("day_of_week"::text::"DayOfWeek_new");
ALTER TYPE "DayOfWeek" RENAME TO "DayOfWeek_old";
ALTER TYPE "DayOfWeek_new" RENAME TO "DayOfWeek";
DROP TYPE "DayOfWeek_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "class_recordings" DROP CONSTRAINT "class_recordings_routine_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "live_attendance_logs" DROP CONSTRAINT "live_attendance_logs_routine_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "live_attendance_logs" DROP CONSTRAINT "live_attendance_logs_student_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_substitutions" DROP CONSTRAINT "routine_substitutions_original_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "staff_extra_duty_logs" DROP CONSTRAINT "staff_extra_duty_logs_teacher_id_fkey";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "deleted_at";

-- AlterTable
ALTER TABLE "routine_entries" DROP COLUMN "created_at",
DROP COLUMN "is_live",
DROP COLUMN "meeting_link",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "routine_substitutions" DROP COLUMN "original_teacher_id",
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "SubstitutionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "staff_profiles" DROP COLUMN "first_name",
DROP COLUMN "last_name";

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "deleted_at",
ALTER COLUMN "code" SET NOT NULL;

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "deleted_at",
DROP COLUMN "label",
DROP COLUMN "type",
ADD COLUMN     "name" TEXT,
DROP COLUMN "end_time",
ADD COLUMN     "end_time" TIMESTAMP(3) NOT NULL,
DROP COLUMN "start_time",
ADD COLUMN     "start_time" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "class_recordings";

-- DropTable
DROP TABLE "live_attendance_logs";

-- DropTable
DROP TABLE "staff_extra_duty_logs";

-- DropTable
DROP TABLE "student_sequences";

-- CreateIndex
CREATE UNIQUE INDEX "rooms_school_id_name_key" ON "rooms"("school_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "subjects_school_id_code_key" ON "subjects"("school_id", "code");

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
