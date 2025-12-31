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

-- AddForeignKey
ALTER TABLE "staff_extra_duty_logs" ADD CONSTRAINT "staff_extra_duty_logs_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
