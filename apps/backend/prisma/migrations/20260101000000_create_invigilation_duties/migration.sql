-- CreateTable
CREATE TABLE "invigilation_duties" (
    "id" TEXT NOT NULL,
    "exam_schedule_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invigilation_duties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invigilation_duties" ADD CONSTRAINT "invigilation_duties_exam_schedule_id_fkey" FOREIGN KEY ("exam_schedule_id") REFERENCES "exam_schedules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilation_duties" ADD CONSTRAINT "invigilation_duties_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invigilation_duties" ADD CONSTRAINT "invigilation_duties_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
