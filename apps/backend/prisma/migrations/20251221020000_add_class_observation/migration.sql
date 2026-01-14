-- CreateTable
CREATE TABLE "class_observations" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_observations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "class_observations" ADD CONSTRAINT "class_observations_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_observations" ADD CONSTRAINT "class_observations_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
