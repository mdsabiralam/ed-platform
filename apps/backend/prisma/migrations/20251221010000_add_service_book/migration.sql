-- CreateTable
CREATE TABLE "service_books" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "school_id" TEXT NOT NULL,
    "entry_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration_hours" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_books_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "service_books" ADD CONSTRAINT "service_books_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_books" ADD CONSTRAINT "service_books_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
