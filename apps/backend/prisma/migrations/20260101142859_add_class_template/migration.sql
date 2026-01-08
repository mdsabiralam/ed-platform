-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "template_id" TEXT;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "marksheet_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
