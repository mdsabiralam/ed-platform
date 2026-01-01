-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL', 'WITHHELD', 'COMPARTMENT');

-- CreateTable
CREATE TABLE "exam_terms" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "weightage" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "result_summaries" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "exam_term_id" TEXT NOT NULL,
    "total_marks" DOUBLE PRECISION NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "class_rank" INTEGER NOT NULL,
    "section_rank" INTEGER NOT NULL,
    "result_status" "ResultStatus" NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_terms_school_id_name_key" ON "exam_terms"("school_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "result_summaries_student_id_exam_term_id_key" ON "result_summaries"("student_id", "exam_term_id");

-- AddForeignKey
ALTER TABLE "exam_terms" ADD CONSTRAINT "exam_terms_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_summaries" ADD CONSTRAINT "result_summaries_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "result_summaries" ADD CONSTRAINT "result_summaries_exam_term_id_fkey" FOREIGN KEY ("exam_term_id") REFERENCES "exam_terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
