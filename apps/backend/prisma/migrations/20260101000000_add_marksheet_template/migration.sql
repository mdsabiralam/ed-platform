-- CreateTable
CREATE TABLE "marksheet_templates" (
    "template_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "layout_config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marksheet_templates_pkey" PRIMARY KEY ("template_id")
);

-- AddForeignKey
ALTER TABLE "marksheet_templates" ADD CONSTRAINT "marksheet_templates_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
