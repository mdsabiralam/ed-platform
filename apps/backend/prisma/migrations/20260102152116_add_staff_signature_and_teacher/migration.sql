-- AlterTable
ALTER TABLE "sections" ADD COLUMN     "class_teacher_id" TEXT;

-- AlterTable
ALTER TABLE "staff_profiles" ADD COLUMN     "signature_url" TEXT;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_class_teacher_id_fkey" FOREIGN KEY ("class_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
