-- CreateTable
CREATE TABLE "result_summaries" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "class_rank" INTEGER,
    "percentage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "result_summaries_pkey" PRIMARY KEY ("id")
);
