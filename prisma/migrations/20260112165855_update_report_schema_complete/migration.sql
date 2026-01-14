/*
  Warnings:

  - You are about to drop the column `present` on the `MeetingAttendance` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `MeetingReport` table. All the data in the column will be lost.
  - You are about to drop the column `visitorsCount` on the `MeetingReport` table. All the data in the column will be lost.
  - You are about to drop the column `visitorsDetails` on the `MeetingReport` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "MeetingVisitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    CONSTRAINT "MeetingVisitor_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MeetingKidsPillars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "church" BOOLEAN NOT NULL DEFAULT false,
    "cell" BOOLEAN NOT NULL DEFAULT false,
    "homeWorship" BOOLEAN NOT NULL DEFAULT false,
    "devotional" BOOLEAN NOT NULL DEFAULT false,
    "challenge" BOOLEAN NOT NULL DEFAULT false,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "MeetingKidsPillars_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeetingKidsPillars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MeetingAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'P',
    "absenceReason" TEXT,
    "offerValue" REAL NOT NULL DEFAULT 0,
    "titheValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "otherValue" REAL NOT NULL DEFAULT 0,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingAttendance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeetingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MeetingAttendance" ("createdAt", "id", "missionsValue", "offerValue", "reportId", "titheValue", "userId") SELECT "createdAt", "id", "missionsValue", "offerValue", "reportId", "titheValue", "userId" FROM "MeetingAttendance";
DROP TABLE "MeetingAttendance";
ALTER TABLE "new_MeetingAttendance" RENAME TO "MeetingAttendance";
CREATE UNIQUE INDEX "MeetingAttendance_reportId_userId_key" ON "MeetingAttendance"("reportId", "userId");
CREATE TABLE "new_MeetingReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "studyTheme" TEXT,
    "observations" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "offerValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "cellId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingReport_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MeetingReport" ("cellId", "createdAt", "date", "endTime", "id", "missionsValue", "offerValue", "startTime", "studyTheme") SELECT "cellId", "createdAt", "date", "endTime", "id", "missionsValue", "offerValue", "startTime", "studyTheme" FROM "MeetingReport";
DROP TABLE "MeetingReport";
ALTER TABLE "new_MeetingReport" RENAME TO "MeetingReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingKidsPillars_reportId_userId_key" ON "MeetingKidsPillars"("reportId", "userId");
