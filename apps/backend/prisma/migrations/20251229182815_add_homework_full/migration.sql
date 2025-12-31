/*
  Warnings:

  - You are about to drop the column `class_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `day_of_week` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `school_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `section_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `slot_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `subject_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `routine_entries` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `school_id` on the `subjects` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `end_time` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `school_id` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `time_slots` table. All the data in the column will be lost.
  - You are about to drop the `rooms` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `tenant_id` to the `routine_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `class_id` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endTime` to the `time_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `time_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `time_slots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tenant_id` to the `time_slots` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE');

-- CreateEnum
CREATE TYPE "LessonPlanStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'SUBMITTED', 'GRADED', 'LATE', 'MISSING');

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_school_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_class_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_room_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_school_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_section_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_slot_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "routine_entries" DROP CONSTRAINT "routine_entries_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "subjects" DROP CONSTRAINT "subjects_school_id_fkey";

-- DropForeignKey
ALTER TABLE "time_slots" DROP CONSTRAINT "time_slots_school_id_fkey";

-- AlterTable
ALTER TABLE "routine_entries" DROP COLUMN "class_id",
DROP COLUMN "created_at",
DROP COLUMN "day_of_week",
DROP COLUMN "room_id",
DROP COLUMN "school_id",
DROP COLUMN "section_id",
DROP COLUMN "slot_id",
DROP COLUMN "subject_id",
DROP COLUMN "teacher_id",
DROP COLUMN "updated_at",
ADD COLUMN     "subjectId" TEXT,
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "subjects" DROP COLUMN "deleted_at",
DROP COLUMN "school_id",
ADD COLUMN     "class_id" TEXT NOT NULL,
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "time_slots" DROP COLUMN "deleted_at",
DROP COLUMN "end_time",
DROP COLUMN "label",
DROP COLUMN "school_id",
DROP COLUMN "start_time",
ADD COLUMN     "endTime" TIME NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "startTime" TIME NOT NULL,
ADD COLUMN     "tenant_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "rooms";

-- DropEnum
DROP TYPE "DayOfWeek";

-- CreateTable
CREATE TABLE "attendance_registers" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "student_id" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "marked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_registers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday_calendars" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,

    CONSTRAINT "holiday_calendars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "learningOutcomes" TEXT,
    "plannedDate" DATE NOT NULL,
    "resourcesUrl" JSONB,
    "status" "LessonPlanStatus" NOT NULL DEFAULT 'PENDING',
    "routine_entry_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "chapter_id" TEXT,

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_diaries" (
    "id" TEXT NOT NULL,
    "executionDate" DATE NOT NULL,
    "contentCovered" TEXT,
    "homeworkAssigned" TEXT,
    "teacher_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "lesson_plan_id" TEXT NOT NULL,

    CONSTRAINT "daily_diaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "max_marks" INTEGER NOT NULL,
    "attachment_urls" JSONB,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "file_urls" JSONB,
    "submitted_at" TIMESTAMP(3),
    "obtained_marks" DOUBLE PRECISION,
    "teacher_feedback" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "student_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_registers_date_student_id_routine_entry_id_key" ON "attendance_registers"("date", "student_id", "routine_entry_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_diaries_lesson_plan_id_key" ON "daily_diaries"("lesson_plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_student_id_assignment_id_key" ON "assignment_submissions"("student_id", "assignment_id");

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_entries" ADD CONSTRAINT "routine_entries_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_registers" ADD CONSTRAINT "attendance_registers_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_registers" ADD CONSTRAINT "attendance_registers_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_slots" ADD CONSTRAINT "time_slots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holiday_calendars" ADD CONSTRAINT "holiday_calendars_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_diaries" ADD CONSTRAINT "daily_diaries_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_diaries" ADD CONSTRAINT "daily_diaries_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_diaries" ADD CONSTRAINT "daily_diaries_lesson_plan_id_fkey" FOREIGN KEY ("lesson_plan_id") REFERENCES "lesson_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_submissions" ADD CONSTRAINT "assignment_submissions_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
