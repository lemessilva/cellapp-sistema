-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'LIDER', 'MEMBRO', 'MIDIA');

-- CreateEnum
CREATE TYPE "MemberCategory" AS ENUM ('ADULTO', 'CRIANCA');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('RASCUNHO', 'ENVIADO_LIDER', 'APROVADO', 'NAO_HOUVE');

-- CreateEnum
CREATE TYPE "MonthlyClosureStatus" AS ENUM ('ABERTO', 'AGUARDANDO_LIDER', 'AGUARDANDO_SUPERVISOR', 'AGUARDANDO_COORDENACAO', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "telefone" TEXT,
    "data_nascimento" TIMESTAMP(3),
    "genero" TEXT,
    "data_batismo" TIMESTAMP(3),
    "endereco" TEXT,
    "estado_civil" TEXT,
    "conjuge_nome" TEXT,
    "foto_url" TEXT,
    "whatsapp" TEXT,
    "sexo" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "naturalidade" TEXT,
    "ufNascimento" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "pontoReferencia" TEXT,
    "nomePai" TEXT,
    "nomeMae" TEXT,
    "estadoCivil" TEXT,
    "nomeConjuge" TEXT,
    "escolaridade" TEXT,
    "profissao" TEXT,
    "dataConversao" TIMESTAMP(3),
    "igrejaAnterior" TEXT,
    "dados_completos" BOOLEAN NOT NULL DEFAULT false,
    "role" "Role" NOT NULL DEFAULT 'MEMBRO',
    "categoria" "MemberCategory" NOT NULL DEFAULT 'ADULTO',
    "responsavelId" TEXT,
    "celulaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteBanner" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "subtitulo" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkBotao" TEXT,
    "textoBotao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteBanner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "bannerUrl" TEXT,
    "coverUrl" TEXT,
    "maxCapacity" INTEGER,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "checkIn" BOOLEAN NOT NULL DEFAULT false,
    "checkInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrowthTrackStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "isMandatory" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrowthTrackStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberGrowthProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "MemberGrowthProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cell" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dia_reuniao" TEXT,
    "horario" TEXT,
    "endereco" TEXT,
    "addressStreet" TEXT,
    "addressNumber" TEXT,
    "addressComplement" TEXT,
    "addressDistrict" TEXT,
    "addressCity" TEXT,
    "addressState" TEXT,
    "addressZip" TEXT,
    "liderId" TEXT,
    "lider2Id" TEXT,
    "supervisorId" TEXT,
    "supervisor2Id" TEXT,
    "tesoureiroId" TEXT,
    "intercessorId" TEXT,
    "secretarioId" TEXT,
    "eventosId" TEXT,
    "louvorId" TEXT,
    "anfitriaoId" TEXT,
    "mcpId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingReport" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT,
    "endTime" TEXT,
    "studyTheme" TEXT,
    "observations" TEXT,
    "cancelReason" TEXT,
    "hostId" TEXT,
    "directionId" TEXT,
    "worshipId" TEXT,
    "evangelismId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'RASCUNHO',
    "offerValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missionsValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "presentMembers" INTEGER NOT NULL DEFAULT 0,
    "visitorsCount" INTEGER NOT NULL DEFAULT 0,
    "cellId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingAttendance" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'P',
    "absenceReason" TEXT,
    "offerValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "titheValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missionsValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingVisitor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "type" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,

    CONSTRAINT "MeetingVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MeetingKidsPillars" (
    "id" TEXT NOT NULL,
    "church" BOOLEAN NOT NULL DEFAULT false,
    "cell" BOOLEAN NOT NULL DEFAULT false,
    "homeWorship" BOOLEAN NOT NULL DEFAULT false,
    "devotional" BOOLEAN NOT NULL DEFAULT false,
    "challenge" BOOLEAN NOT NULL DEFAULT false,
    "offerValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "titheValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "missionsValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MeetingKidsPillars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Oikos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Oikos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdById" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrayerLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyClosure" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "MonthlyClosureStatus" NOT NULL DEFAULT 'ABERTO',
    "totalMeetings" INTEGER NOT NULL DEFAULT 0,
    "totalOffer" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalMissions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgAttendance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "liderSignedAt" TIMESTAMP(3),
    "supervisorSignedAt" TIMESTAMP(3),
    "coordSignedAt" TIMESTAMP(3),
    "liderId" TEXT,
    "supervisorId" TEXT,
    "coordId" TEXT,
    "correctionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyClosure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meeting_rosters" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cellId" TEXT NOT NULL,
    "directionId" TEXT,
    "worshipId" TEXT,
    "evangelismId" TEXT,
    "hostId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_rosters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteConfiguration" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "heroTitle" TEXT,
    "heroSubtitle" TEXT,
    "heroBgImage" TEXT,
    "heroCtaText" TEXT,
    "heroCtaLink" TEXT,
    "weeklySchedule" TEXT,
    "contactWhatsapp" TEXT,
    "socialInstagram" TEXT,
    "footerAddress" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_eventId_userId_key" ON "Registration"("eventId", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberGrowthProgress_userId_stepId_key" ON "MemberGrowthProgress"("userId", "stepId");

-- CreateIndex
CREATE UNIQUE INDEX "Cell_liderId_key" ON "Cell"("liderId");

-- CreateIndex
CREATE UNIQUE INDEX "Cell_lider2Id_key" ON "Cell"("lider2Id");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingAttendance_reportId_userId_key" ON "MeetingAttendance"("reportId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "MeetingKidsPillars_reportId_userId_key" ON "MeetingKidsPillars"("reportId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyClosure_cellId_month_year_key" ON "MonthlyClosure"("cellId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rosters_cellId_date_key" ON "meeting_rosters"("cellId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_celulaId_fkey" FOREIGN KEY ("celulaId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGrowthProgress" ADD CONSTRAINT "MemberGrowthProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberGrowthProgress" ADD CONSTRAINT "MemberGrowthProgress_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "GrowthTrackStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_lider2Id_fkey" FOREIGN KEY ("lider2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_supervisor2Id_fkey" FOREIGN KEY ("supervisor2Id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_tesoureiroId_fkey" FOREIGN KEY ("tesoureiroId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_intercessorId_fkey" FOREIGN KEY ("intercessorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_secretarioId_fkey" FOREIGN KEY ("secretarioId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_eventosId_fkey" FOREIGN KEY ("eventosId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_louvorId_fkey" FOREIGN KEY ("louvorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_anfitriaoId_fkey" FOREIGN KEY ("anfitriaoId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_mcpId_fkey" FOREIGN KEY ("mcpId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_worshipId_fkey" FOREIGN KEY ("worshipId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_evangelismId_fkey" FOREIGN KEY ("evangelismId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingReport" ADD CONSTRAINT "MeetingReport_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendance" ADD CONSTRAINT "MeetingAttendance_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingAttendance" ADD CONSTRAINT "MeetingAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingVisitor" ADD CONSTRAINT "MeetingVisitor_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingKidsPillars" ADD CONSTRAINT "MeetingKidsPillars_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "MeetingReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingKidsPillars" ADD CONSTRAINT "MeetingKidsPillars_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Oikos" ADD CONSTRAINT "Oikos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrayerLog" ADD CONSTRAINT "PrayerLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClosure" ADD CONSTRAINT "MonthlyClosure_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClosure" ADD CONSTRAINT "MonthlyClosure_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClosure" ADD CONSTRAINT "MonthlyClosure_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyClosure" ADD CONSTRAINT "MonthlyClosure_coordId_fkey" FOREIGN KEY ("coordId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rosters" ADD CONSTRAINT "meeting_rosters_cellId_fkey" FOREIGN KEY ("cellId") REFERENCES "Cell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rosters" ADD CONSTRAINT "meeting_rosters_directionId_fkey" FOREIGN KEY ("directionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rosters" ADD CONSTRAINT "meeting_rosters_worshipId_fkey" FOREIGN KEY ("worshipId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rosters" ADD CONSTRAINT "meeting_rosters_evangelismId_fkey" FOREIGN KEY ("evangelismId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meeting_rosters" ADD CONSTRAINT "meeting_rosters_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentTransaction" ADD CONSTRAINT "PaymentTransaction_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
