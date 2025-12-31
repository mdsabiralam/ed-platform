-- DropForeignKey
ALTER TABLE "grading_logics" DROP CONSTRAINT "grading_logics_scale_id_fkey";

-- DropForeignKey
ALTER TABLE "grading_scales" DROP CONSTRAINT "grading_scales_school_id_fkey";

-- AddForeignKey
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_logics" ADD CONSTRAINT "grading_logics_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "grading_scales"("id") ON DELETE CASCADE ON UPDATE CASCADE;
