-- CreateTable
CREATE TABLE "hall_tickets" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "examGroupId" TEXT NOT NULL,
    "roll_no" TEXT NOT NULL,
    "exam_center" TEXT NOT NULL,
    "seat_number" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hall_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hall_tickets_studentId_examGroupId_key" ON "hall_tickets"("studentId", "examGroupId");

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hall_tickets" ADD CONSTRAINT "hall_tickets_examGroupId_fkey" FOREIGN KEY ("examGroupId") REFERENCES "exam_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
