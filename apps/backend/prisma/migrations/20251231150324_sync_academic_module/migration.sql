/*
  Warnings:

  - You are about to drop the `exam_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_terms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exam_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `exams` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hall_tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN');

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_examGroupId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_termId_fkey";

-- DropForeignKey
ALTER TABLE "exams" DROP CONSTRAINT "exams_typeId_fkey";

-- DropForeignKey
ALTER TABLE "hall_tickets" DROP CONSTRAINT "hall_tickets_examGroupId_fkey";

-- DropForeignKey
ALTER TABLE "hall_tickets" DROP CONSTRAINT "hall_tickets_studentId_fkey";

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT;

-- DropTable
DROP TABLE "exam_groups";

-- DropTable
DROP TABLE "exam_terms";

-- DropTable
DROP TABLE "exam_types";

-- DropTable
DROP TABLE "exams";

-- DropTable
DROP TABLE "hall_tickets";

-- CreateTable
CREATE TABLE "student_sequences" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "last_seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "student_sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_slots" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "label" TEXT,
    "type" TEXT,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_entries" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "class_id" TEXT NOT NULL,
    "section_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "room_id" TEXT,
    "slot_id" TEXT NOT NULL,
    "meeting_link" TEXT,
    "is_live" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routine_entries_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "routine_substitutions" (
    "id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "original_teacher_id" TEXT NOT NULL,
    "substitute_teacher_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_substitutions_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "homeworks" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homeworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "homework_submissions" (
    "id" TEXT NOT NULL,
    "homework_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "file_url" TEXT,
    "grade" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "homework_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_plans" (
    "id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "chapter_name" TEXT NOT NULL,
    "total_lessons" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "actual_completion_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_plans" (
    "id" TEXT NOT NULL,
    "curriculum_plan_id" TEXT NOT NULL,
    "routine_entry_id" TEXT,
    "topic" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completion_date" TIMESTAMP(3),

    CONSTRAINT "lesson_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "student_sequences_school_id_year_key" ON "student_sequences"("school_id", "year");

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

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_original_teacher_id_fkey" FOREIGN KEY ("original_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_substitute_teacher_id_fkey" FOREIGN KEY ("substitute_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_extra_duty_logs" ADD CONSTRAINT "staff_extra_duty_logs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_applications" ADD CONSTRAINT "leave_applications_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homeworks" ADD CONSTRAINT "homeworks_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "homeworks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "homework_submissions" ADD CONSTRAINT "homework_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_plans" ADD CONSTRAINT "curriculum_plans_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_plans" ADD CONSTRAINT "curriculum_plans_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_curriculum_plan_id_fkey" FOREIGN KEY ("curriculum_plan_id") REFERENCES "curriculum_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_plans" ADD CONSTRAINT "lesson_plans_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
