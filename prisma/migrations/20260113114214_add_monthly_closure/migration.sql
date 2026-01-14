-- CreateTable
CREATE TABLE "monthly_closures" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cellId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "liderId" TEXT,
    "dataAssinaturaLider" DATETIME,
    "supervisorId" TEXT,
    "dataAssinaturaSupervisor" DATETIME,
    "coordId" TEXT,
    "dataAssinaturaCoord" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "monthly_closures_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "monthly_closures_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "monthly_closures_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "monthly_closures_coordId_fkey" FOREIGN KEY ("coordId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
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
    "observations" TEXT,
    "cancelReason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RASCUNHO',
    "offerValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "presentMembers" INTEGER NOT NULL DEFAULT 0,
    "visitorsCount" INTEGER NOT NULL DEFAULT 0,
    "cellId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingReport_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MeetingReport" ("cancelReason", "cellId", "createdAt", "date", "endTime", "id", "missionsValue", "observations", "offerValue", "startTime", "status", "studyTheme") SELECT "cancelReason", "cellId", "createdAt", "date", "endTime", "id", "missionsValue", "observations", "offerValue", "startTime", "status", "studyTheme" FROM "MeetingReport";
DROP TABLE "MeetingReport";
ALTER TABLE "new_MeetingReport" RENAME TO "MeetingReport";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "monthly_closures_cellId_month_year_key" ON "monthly_closures"("cellId", "month", "year");
