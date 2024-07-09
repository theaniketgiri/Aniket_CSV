-- CreateTable
CREATE TABLE "DynamicData" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DynamicData_pkey" PRIMARY KEY ("id")
);
