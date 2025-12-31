-- CreateTable
CREATE TABLE "hall_tickets" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "exam_group_id" TEXT NOT NULL,
    "roll_no" TEXT NOT NULL,
    "exam_center" TEXT NOT NULL,
    "seat_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hall_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hall_tickets_student_id_exam_group_id_key" ON "hall_tickets"("student_id", "exam_group_id");

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_exam_group_id_fkey" FOREIGN KEY ("exam_group_id") REFERENCES "exam_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
