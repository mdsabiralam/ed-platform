-- CreateTable
CREATE TABLE "concierge_requests" (
    "id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "staff_id" TEXT,
    "raw_image_url" TEXT,
    "content" JSONB,

    CONSTRAINT "concierge_requests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
