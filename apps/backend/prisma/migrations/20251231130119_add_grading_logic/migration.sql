-- CreateTable
CREATE TABLE "grading_scales" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SCHOLASTIC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_scales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grading_logics" (
    "id" TEXT NOT NULL,
    "scale_id" TEXT NOT NULL,
    "min_score" DOUBLE PRECISION NOT NULL,
    "max_score" DOUBLE PRECISION NOT NULL,
    "grade_point" DOUBLE PRECISION NOT NULL,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grading_logics_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "grading_scales" ADD CONSTRAINT "grading_scales_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grading_logics" ADD CONSTRAINT "grading_logics_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "grading_scales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
