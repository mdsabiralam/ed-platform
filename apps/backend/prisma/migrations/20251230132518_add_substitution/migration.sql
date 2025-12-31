-- CreateTable
CREATE TABLE "class_recordings" (
    "id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "vod_url" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_recordings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_substitutions" (
    "id" TEXT NOT NULL,
    "routine_entry_id" TEXT NOT NULL,
    "original_teacher_id" TEXT NOT NULL,
    "substitute_teacher_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_substitutions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "class_recordings" ADD CONSTRAINT "class_recordings_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_routine_entry_id_fkey" FOREIGN KEY ("routine_entry_id") REFERENCES "routine_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_original_teacher_id_fkey" FOREIGN KEY ("original_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_substitutions" ADD CONSTRAINT "routine_substitutions_substitute_teacher_id_fkey" FOREIGN KEY ("substitute_teacher_id") REFERENCES "staff_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
