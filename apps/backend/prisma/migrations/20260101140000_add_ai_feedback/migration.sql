-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "context" JSONB,
    "source_page" INTEGER,
    "is_helpful" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_interactions_pkey" PRIMARY KEY ("id")
);
