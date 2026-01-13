-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "textbook_embeddings" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "content_chunk" TEXT NOT NULL,
    "page_number" INTEGER NOT NULL,
    "vector" vector(1536) NOT NULL,

    CONSTRAINT "textbook_embeddings_pkey" PRIMARY KEY ("id")
);
