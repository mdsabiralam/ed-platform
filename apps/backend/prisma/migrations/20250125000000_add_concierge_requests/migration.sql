-- CreateEnum
CREATE TYPE "ConciergeRequestStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "assignments" (
    "assignment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("assignment_id")
);

-- CreateTable
CREATE TABLE "concierge_requests" (
    "request_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "raw_image_url" TEXT NOT NULL,
    "voice_note_url" TEXT,
    "instruction_text" TEXT NOT NULL,
    "status" "ConciergeRequestStatus" NOT NULL,
    "assigned_staff_id" TEXT,
    "created_assignment_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concierge_requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateIndex
CREATE INDEX "concierge_requests_status_idx" ON "concierge_requests"("status");

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_assigned_staff_id_fkey" FOREIGN KEY ("assigned_staff_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concierge_requests" ADD CONSTRAINT "concierge_requests_created_assignment_id_fkey" FOREIGN KEY ("created_assignment_id") REFERENCES "assignments"("assignment_id") ON DELETE SET NULL ON UPDATE CASCADE;
