-- AlterTable
ALTER TABLE "routine_entries" ADD COLUMN     "is_live" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "meeting_link" TEXT;

-- CreateTable
CREATE TABLE "live_attendance_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "join_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leave_time" TIMESTAMP(3),

    CONSTRAINT "live_attendance_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_attendance_logs" ADD CONSTRAINT "live_attendance_logs_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
