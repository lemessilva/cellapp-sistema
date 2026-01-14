-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "dia_reuniao" TEXT,
    "horario" TEXT,
    "endereco" TEXT,
    "liderId" TEXT,
    "lider2Id" TEXT,
    "supervisorId" TEXT,
    "supervisor2Id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cell_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_lider2Id_fkey" FOREIGN KEY ("lider2Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_supervisor2Id_fkey" FOREIGN KEY ("supervisor2Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cell" ("createdAt", "dia_reuniao", "endereco", "horario", "id", "liderId", "nome", "supervisorId", "updatedAt") SELECT "createdAt", "dia_reuniao", "endereco", "horario", "id", "liderId", "nome", "supervisorId", "updatedAt" FROM "Cell";
DROP TABLE "Cell";
ALTER TABLE "new_Cell" RENAME TO "Cell";
CREATE UNIQUE INDEX "Cell_liderId_key" ON "Cell"("liderId");
CREATE UNIQUE INDEX "Cell_lider2Id_key" ON "Cell"("lider2Id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
