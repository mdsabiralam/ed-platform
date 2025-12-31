-- AddForeignKey
ALTER TABLE "exam_schedules" ADD COLUMN "class_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "exam_schedules" ADD CONSTRAINT "exam_schedules_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
