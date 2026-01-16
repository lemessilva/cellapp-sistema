-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'IMAGEM', 'OUTRO');

-- CreateEnum
CREATE TYPE "ResourceAudience" AS ENUM ('LIDERES', 'GERAL');

-- AlterTable
ALTER TABLE "SiteConfiguration" ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "liveLink" TEXT;

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" "ResourceType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "publicoAlvo" "ResourceAudience" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
