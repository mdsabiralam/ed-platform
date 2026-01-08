-- CreateEnum
CREATE TYPE "PageSize" AS ENUM ('A4', 'LETTER');

-- CreateTable
CREATE TABLE "subject_analytics" (
    "id" TEXT NOT NULL,
    "exam_id" TEXT NOT NULL,
    "average" DOUBLE PRECISION NOT NULL,
    "highest" DOUBLE PRECISION NOT NULL,
    "lowest" DOUBLE PRECISION NOT NULL,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subject_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marksheet_templates" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "structure_json" JSONB NOT NULL,
    "background_image_url" TEXT,
    "page_size" "PageSize" NOT NULL DEFAULT 'A4',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marksheet_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subject_analytics_exam_id_key" ON "subject_analytics"("exam_id");

-- AddForeignKey
ALTER TABLE "subject_analytics" ADD CONSTRAINT "subject_analytics_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marksheet_templates" ADD CONSTRAINT "marksheet_templates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
