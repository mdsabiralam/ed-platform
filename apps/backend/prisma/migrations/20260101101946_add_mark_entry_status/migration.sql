-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED');

-- CreateTable
CREATE TABLE "mark_entry_statuses" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_by" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mark_entry_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "mark_entry_statuses_exam_id_key" ON "mark_entry_statuses"("exam_id");

-- CreateIndex
CREATE UNIQUE INDEX "mark_entry_statuses_exam_id_class_id_subject_id_key" ON "mark_entry_statuses"("exam_id", "class_id", "subject_id");

-- AddForeignKey
ALTER TABLE "mark_entry_statuses" ADD CONSTRAINT "mark_entry_statuses_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_entry_statuses" ADD CONSTRAINT "mark_entry_statuses_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mark_entry_statuses" ADD CONSTRAINT "mark_entry_statuses_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
