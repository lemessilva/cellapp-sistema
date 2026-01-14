/*
  Warnings:

  - You are about to drop the column `cellId` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Cell_supervisorId_key";

-- CreateTable
CREATE TABLE "MeetingReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "studyTheme" TEXT,
    "visitorsCount" INTEGER NOT NULL DEFAULT 0,
    "offerValue" REAL NOT NULL DEFAULT 0,
    "missionsValue" REAL NOT NULL DEFAULT 0,
    "presentMembers" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MeetingReport_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "telefone" TEXT,
    "data_nascimento" DATETIME,
    "endereco" TEXT,
    "estado_civil" TEXT,
    "conjuge_nome" TEXT,
    "foto_url" TEXT,
    "dados_completos" BOOLEAN NOT NULL DEFAULT false,
    "role" TEXT NOT NULL DEFAULT 'MEMBRO',
    "celulaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Cell" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("conjuge_nome", "createdAt", "dados_completos", "data_nascimento", "email", "endereco", "estado_civil", "foto_url", "id", "nome", "password", "role", "telefone", "updatedAt") SELECT "conjuge_nome", "createdAt", "dados_completos", "data_nascimento", "email", "endereco", "estado_civil", "foto_url", "id", "nome", "password", "role", "telefone", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
