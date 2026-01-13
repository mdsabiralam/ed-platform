-- CreateTable
CREATE TABLE "student_activity_logs" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'VIEW',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_activity_logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "student_activity_logs" ADD CONSTRAINT "student_activity_logs_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_activity_logs" ADD CONSTRAINT "student_activity_logs_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "learning_resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
