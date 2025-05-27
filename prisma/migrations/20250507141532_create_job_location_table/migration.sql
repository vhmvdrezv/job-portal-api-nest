-- CreateTable
CREATE TABLE "JobLocation" (
    "jobId" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT,
    "alley" TEXT,

    CONSTRAINT "JobLocation_pkey" PRIMARY KEY ("jobId")
);

-- AddForeignKey
ALTER TABLE "JobLocation" ADD CONSTRAINT "JobLocation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
