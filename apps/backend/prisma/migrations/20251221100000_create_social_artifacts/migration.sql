-- CreateTable
CREATE TABLE "social_artifacts" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "public_slug" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_analytics" (
    "id" TEXT NOT NULL,
    "artifact_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "unique_visitors" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "share_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "social_artifacts_public_slug_key" ON "social_artifacts"("public_slug");

-- CreateIndex
CREATE UNIQUE INDEX "share_analytics_artifact_id_platform_key" ON "share_analytics"("artifact_id", "platform");

-- AddForeignKey
ALTER TABLE "social_artifacts" ADD CONSTRAINT "social_artifacts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_analytics" ADD CONSTRAINT "share_analytics_artifact_id_fkey" FOREIGN KEY ("artifact_id") REFERENCES "social_artifacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
