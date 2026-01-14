-- CreateEnum
CREATE TYPE "TrainingAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');

-- CreateTable
CREATE TABLE "teacher_trainings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration_hours" INTEGER NOT NULL,
    "resource_person" TEXT NOT NULL,
    "resource_urls" TEXT[],
    "school_id" TEXT NOT NULL,

    CONSTRAINT "teacher_trainings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_attendances" (
    "id" TEXT NOT NULL,
    "training_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "status" "TrainingAttendanceStatus" NOT NULL,
    "feedback_score" INTEGER,
    "feedback_comments" TEXT,
    "certificate_url" TEXT,

    CONSTRAINT "training_attendances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_attendances_training_id_staff_id_key" ON "training_attendances"("training_id", "staff_id");

-- AddForeignKey
ALTER TABLE "teacher_trainings" ADD CONSTRAINT "teacher_trainings_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_attendances" ADD CONSTRAINT "training_attendances_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "teacher_trainings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_attendances" ADD CONSTRAINT "training_attendances_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
