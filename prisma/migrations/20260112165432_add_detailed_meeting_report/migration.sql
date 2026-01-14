/*
  Warnings:

  - You are about to drop the column `presentMembers` on the `MeetingReport` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "MeetingAttendance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "present" BOOLEAN NOT NULL DEFAULT false,
    "offerValue" REAL NOT NULL DEFAULT 0,
    "titheValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingAttendance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MeetingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MeetingReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "studyTheme" TEXT,
    "visitorsCount" INTEGER NOT NULL DEFAULT 0,
    "visitorsDetails" TEXT,
    "offerValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "duration" INTEGER,
    "cellId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingReport_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MeetingReport" ("cellId", "createdAt", "date", "duration", "id", "missionsValue", "offerValue", "studyTheme", "visitorsCount") SELECT "cellId", "createdAt", "date", "duration", "id", "missionsValue", "offerValue", "studyTheme", "visitorsCount" FROM "MeetingReport";
DROP TABLE "MeetingReport";
ALTER TABLE "new_MeetingReport" RENAME TO "MeetingReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendance_reportId_userId_key" ON "MeetingAttendance"("reportId", "userId");
