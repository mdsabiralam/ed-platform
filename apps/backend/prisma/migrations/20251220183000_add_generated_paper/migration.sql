-- CreateTable
CREATE TABLE "generated_papers" (
    "id" TEXT NOT NULL,
    "blueprint_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,
    "exam_date" TIMESTAMP(3) NOT NULL,
    "questions_json" JSONB NOT NULL,
    "is_finalized" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generated_papers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "generated_papers" ADD CONSTRAINT "generated_papers_blueprint_id_fkey" FOREIGN KEY ("blueprint_id") REFERENCES "question_blueprints"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_papers" ADD CONSTRAINT "generated_papers_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
