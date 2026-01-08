-- CreateTable
CREATE TABLE "grading_scales" (
    "id" TEXT NOT NULL,
    "school_id" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_marks_based" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_logics" (
    "id" TEXT NOT NULL,
    "scale_id" TEXT NOT NULL,
    "min_score" DOUBLE PRECISION,
    "max_score" DOUBLE PRECISION,
    "grade_point" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "grading_logics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_logics" ADD CONSTRAINT "grading_logics_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "grading_scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
