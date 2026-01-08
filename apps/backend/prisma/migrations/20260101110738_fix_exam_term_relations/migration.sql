-- CreateEnum
CREATE TYPE "CalculationStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "exam_term_id" TEXT;

-- CreateTable
CREATE TABLE "calculation_logs" (
    "id" TEXT NOT NULL,
    "exam_term_id" TEXT NOT NULL,
    "status" "CalculationStatus" NOT NULL DEFAULT 'PROCESSING',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "processed_count" INTEGER NOT NULL DEFAULT 0,
    "error_log" JSONB,

    CONSTRAINT "calculation_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_exam_term_id_fkey" FOREIGN KEY ("exam_term_id") REFERENCES "exam_terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculation_logs" ADD CONSTRAINT "calculation_logs_exam_term_id_fkey" FOREIGN KEY ("exam_term_id") REFERENCES "exam_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
