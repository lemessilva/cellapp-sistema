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
    "tesoureiroId" TEXT,
    "intercessorId" TEXT,
    "secretarioId" TEXT,
    "eventosId" TEXT,
    "louvorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cell_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_lider2Id_fkey" FOREIGN KEY ("lider2Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_supervisor2Id_fkey" FOREIGN KEY ("supervisor2Id") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_tesoureiroId_fkey" FOREIGN KEY ("tesoureiroId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_intercessorId_fkey" FOREIGN KEY ("intercessorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_secretarioId_fkey" FOREIGN KEY ("secretarioId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_eventosId_fkey" FOREIGN KEY ("eventosId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Cell_louvorId_fkey" FOREIGN KEY ("louvorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cell" ("createdAt", "dia_reuniao", "endereco", "horario", "id", "lider2Id", "liderId", "nome", "supervisor2Id", "supervisorId", "updatedAt") SELECT "createdAt", "dia_reuniao", "endereco", "horario", "id", "lider2Id", "liderId", "nome", "supervisor2Id", "supervisorId", "updatedAt" FROM "Cell";
DROP TABLE "Cell";
ALTER TABLE "new_Cell" RENAME TO "Cell";
CREATE UNIQUE INDEX "Cell_liderId_key" ON "Cell"("liderId");
CREATE UNIQUE INDEX "Cell_lider2Id_key" ON "Cell"("lider2Id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
