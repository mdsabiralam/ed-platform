-- AlterTable
ALTER TABLE "exams" ADD COLUMN     "group_id" TEXT;

-- CreateTable
CREATE TABLE "exam_groups" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exam_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_groups_tenant_id_name_key" ON "exam_groups"("tenant_id", "name");

-- AddForeignKey
ALTER TABLE "exam_groups" ADD CONSTRAINT "exam_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "exam_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
