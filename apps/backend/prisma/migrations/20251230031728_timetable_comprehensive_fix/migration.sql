/*
  Warnings:

  - You are about to drop the column `subjectId` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `class_id` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the `assignment_submissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `assignments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attendance_registers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chapters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_diaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `holiday_calendars` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_plans` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `class_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `day_of_week` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `section_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slot_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teacher_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_time` to the `time_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `time_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_time` to the `time_slots` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_assignment_id_fkey";

-- DropForeignKey
ALTER TABLE "assignment_submissions" DROP CONSTRAINT "assignment_submissions_student_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_section_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "assignments" DROP CONSTRAINT "assignments_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_registers" DROP CONSTRAINT "attendance_registers_routine_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "attendance_registers" DROP CONSTRAINT "attendance_registers_student_id_fkey";

-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_diaries" DROP CONSTRAINT "daily_diaries_lesson_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_diaries" DROP CONSTRAINT "daily_diaries_section_id_fkey";

-- DropForeignKey
ALTER TABLE "daily_diaries" DROP CONSTRAINT "daily_diaries_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "holiday_calendars" DROP CONSTRAINT "holiday_calendars_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_plans" DROP CONSTRAINT "lesson_plans_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_plans" DROP CONSTRAINT "lesson_plans_routine_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_plans" DROP CONSTRAINT "lesson_plans_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_class_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "time_slots" DROP CONSTRAINT "time_slots_tenant_id_fkey";

-- AlterTable
ALTER TABLE "routine_entries" DROP COLUMN "subjectId",
DROP COLUMN "tenant_id",
ADD COLUMN     "class_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "day_of_week" "DayOfWeek" NOT NULL,
ADD COLUMN     "room_id" TEXT,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "section_id" TEXT NOT NULL,
ADD COLUMN     "slot_id" TEXT NOT NULL,
ADD COLUMN     "subject_id" TEXT NOT NULL,
ADD COLUMN     "teacher_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "class_id",
DROP COLUMN "tenant_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "school_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "endTime",
DROP COLUMN "name",
DROP COLUMN "startTime",
DROP COLUMN "tenant_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "end_time" TEXT NOT NULL,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "school_id" TEXT NOT NULL,
ADD COLUMN     "start_time" TEXT NOT NULL;

-- DropTable
DROP TABLE "assignment_submissions";

-- DropTable
DROP TABLE "assignments";

-- DropTable
DROP TABLE "attendance_registers";

-- DropTable
DROP TABLE "chapters";

-- DropTable
DROP TABLE "daily_diaries";

-- DropTable
DROP TABLE "holiday_calendars";

-- DropTable
DROP TABLE "lesson_plans";

-- DropEnum
DROP TYPE "AttendanceStatus";

-- DropEnum
DROP TYPE "LessonPlanStatus";

-- DropEnum
DROP TYPE "SubmissionStatus";

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
