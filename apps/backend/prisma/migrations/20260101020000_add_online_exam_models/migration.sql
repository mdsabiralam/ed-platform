-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateTable
CREATE TABLE "online_exams" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_marks" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "online_exams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'MEDIUM',
    "marks" INTEGER NOT NULL,
    "options" JSONB,
    "correct_answer" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "online_exam_submissions" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "total_marks" DOUBLE PRECISION NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answers" JSONB NOT NULL,

    CONSTRAINT "online_exam_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "online_exams" ADD CONSTRAINT "online_exams_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "online_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_exam_submissions" ADD CONSTRAINT "online_exam_submissions_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "online_exams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "online_exam_submissions" ADD CONSTRAINT "online_exam_submissions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
