-- CreateIndex
CREATE UNIQUE INDEX "student_exam_attempts_student_id_exam_id_key" ON "student_exam_attempts"("student_id", "exam_id");
