# CellApp — Documentação de Funções do Sistema

Este documento descreve, de forma prática e organizada, todas as principais funcionalidades do sistema (frontend e backend com Server Actions), seus módulos e pontos de integração. Links diretos para os arquivos de origem estão incluídos para facilitar navegação.

## Visão Geral e Arquitetura
- Framework: Next.js (App Router) com Server Actions (Node.js)
- Linguagem: TypeScript
- Banco de dados: PostgreSQL (Prisma ORM)
- UI: Tailwind CSS + componentes React
- Diretório raiz do código: `cell-app`

## Autenticação e Sessão
- Biblioteca e helpers: [auth.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/lib/auth.ts)
- Páginas de login/reset: [login](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/login/page.tsx), [resetar-senha](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/resetar-senha/page.tsx), [esqueci-senha](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/esqueci-senha/page.tsx)
- Server actions relevantes:
  - [auth.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/auth.ts): fluxo de login/logout, sessão
  - [auth-reset.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/auth-reset.ts): `adminResetPassword(userId)`

## Usuários, Perfis e Membros
- Tabela principal: `User` (ver [schema.prisma](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/prisma/schema.prisma))
- Gerenciamento de membros (Admin): [MembersManagementTable.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/MembersManagementTable.tsx)
- Server actions:
  - [member.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/member.ts):
    - `createMember(formData)` — cadastro (adulto/criança), herança de endereço
    - `updateMemberCell(userId, newCellId)` — mover membro entre células
    - `getMemberAttendanceHistory(memberId)` — histórico de presença
    - `getMemberForPdf(memberId)` — dados completos para PDF
- PDF de cadastro: [MemberRegistrationPDF.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/MemberRegistrationPDF.tsx)

## Células e Liderança
- Página de liderança: [lideranca/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/lideranca/page.tsx)
- Tela do líder: [LeaderScreen.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/LeaderScreen.tsx)
- Gerenciamento de células (Admin): [admin/celulas](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/celulas/page.tsx)
- Server actions auxiliares: [admin/celulas/actions.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/celulas/actions.ts)

## Relatórios da Célula (Semanal e Mensal)
- Lançamento e edição: [reuniao](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/celula/reuniao/page.tsx), [editar relatório](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/celula/relatorios/%5Bid%5D/editar/page.tsx)
- Lista mensal (Admin/Supervisor): [relatorios/mensal](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/celula/relatorios/mensal/page.tsx)
- Server actions: [meeting.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/meeting.ts)
  - `approveReport(reportId)` — aprovar relatório semanal
  - `getMonthlyHubData(...)` — gerar semanas elegíveis do mês (hub)
  - `getMonthlyReportData(...)` — dados consolidados do mês
- Correções e devoluções: [report.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/report.ts)
  - `createReportCorrection(reportId, content)` — carta de correção
  - `handleReturnReport(formData)` — devolver relatório com motivo/imagem
- PDFs e componentes:
  - [MonthlyReportPDF.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/reports/MonthlyReportPDF.tsx)
  - [MonthlyReportGenerator.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/reports/MonthlyReportGenerator.tsx)
  - [ReportForm.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/reports/ReportForm.tsx)
  - [ReportListTable.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/reports/ReportListTable.tsx)

## Fechamento Mensal
- Server actions: [closure.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/closure.ts)
- Fluxos de assinatura e status: coordenado com modelos `MonthlyClosure` no schema

## Agenda/Calendário
- Páginas: [agenda/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/agenda/page.tsx), [admin/calendar/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/calendar/page.tsx)
- Server actions: [calendar.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/calendar.ts)
  - `create(...)`, `delete(...)`, `get(...)`, `getNext(...)`
- Widget: [NextEventCard.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/NextEventCard.tsx)

## Eventos e Ingressos
- Listagem pública e inscrição: [app/(public)/eventos/[id]/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(public)/eventos/%5Bid%5D/page.tsx)
- Meus ingressos (membro): [meus-ingressos/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/meus-ingressos/page.tsx)
- Gestão de inscritos (Admin): [EventRegistrationsTable.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/EventRegistrationsTable.tsx)
- Ticket/QR: [TicketModal.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/events/TicketModal.tsx)
- Server actions: [events.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/events.ts)

## Louvor (Escalas e Repertório)
- Páginas Admin: [louvor/escalas/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/louvor/escalas/page.tsx), [louvor/repertorio/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/louvor/repertorio/page.tsx)
- Formulário: [RepertoryForm.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/worship/RepertoryForm.tsx)
- Server actions: [worship.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/worship.ts)
  - `getAdminScales()`, `getSongs()`, `getWorshipMembers()`, `createScale(...)`

## Pastoral e Mensagens
- Admin: [pastoral/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/pastoral/page.tsx) e [novo/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/pastoral/novo/page.tsx)
- Público: [mensagens](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/mensagens/page.tsx), [mensagem/[id]](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/mensagem/%5Bid%5D/page.tsx)
- Server actions: [pastoral-messages.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/pastoral-messages.ts)

## Website (Editor Interno)
- Páginas/Admin: [WebsiteEditor.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/website/WebsiteEditor.tsx)
- Server actions: [website.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/website.ts)

## Notificações Internas
- Popover no Header: [NotificationsPopover.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/notifications/NotificationsPopover.tsx)
- Server actions: [notifications.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/notifications.ts)
- Integrações/Disparos: promovidos/demovidos, mudanças de célula, relatórios devolvidos

## Módulo Kids
- Widget e modal: [KidsWidget.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/kids/KidsWidget.tsx)
- Server actions: [kids.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/kids.ts)
  - `getMyChildren()` — filhos do usuário (motherId/fatherId/responsável)
  - `addKidOikos(kidId, name)`, `removeKidOikos(kidId, oikosId)` — Oikós
  - `updateKidData(kidId, data)` — dados vitais (nascimento/gênero)

## Live Meeting (Reunião ao vivo)
- Componentes: [LiveMeetingInterface.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/live/LiveMeetingInterface.tsx), [StartLiveMeetingButton.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/live/StartLiveMeetingButton.tsx)
- Server actions: [live-meeting.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/live-meeting.ts)

## Fotos / Mural
- Componentes: [PhotoUpload.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/photos/PhotoUpload.tsx), [CommunityFeed.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/photos/CommunityFeed.tsx)
- Server actions: [photos.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/photos.ts)

## Trilho de Crescimento
- Componentes: [MemberGrowthModal.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/growth/MemberGrowthModal.tsx), [GrowthTrackManager.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/GrowthTrackManager.tsx)
- Server actions: [growth-track.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/growth-track.ts)

## Feedback de Sistema
- Páginas/Admin: [feedbacks/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/feedbacks/page.tsx), [FeedbackRow.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/FeedbackRow.tsx)
- Server actions: [feedback.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/feedback.ts)

## Recursos e Sermões
- Recursos: [resources.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/resources.ts), UI em [admin](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/admin/page.tsx)
- Sermões: [sermons.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/sermons.ts), componentes em [components/admin/SermonsManager.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/admin/SermonsManager.tsx)

## Perfil e Configurações
- Página de perfil: [perfil/page.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/(protected)/app/perfil/page.tsx)
- Server actions: [profile.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/profile.ts)
- Configurações de célula: [CellSettingsModal.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/settings/CellSettingsModal.tsx) e [settings.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/settings.ts)

## Relatórios e Calendários de Oração (PDF)
- Geração PDF individual: [PrayerCalendarPDF.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/reports/PrayerCalendarPDF.tsx)
- Ações relacionadas: [report.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/report.ts)

## Cron Jobs (Vercel)
- Definições em [vercel.json](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/vercel.json)
- Rotas: [api/cron/prayer](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/api/cron/prayer/route.ts), [api/cron/reports](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/api/cron/reports/route.ts), [api/cron/daily-report-check](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/api/cron/daily-report-check/route.ts)

## Módulos e Ações Adicionais
- **Leader**: [leader.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/leader.ts)
- **Media**: [media.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/media.ts)
- **Dashboard**: [dashboard.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/dashboard.ts)
- **Bio Links**: [bio-links.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/bio-links.ts)
- **Church Info**: [church-info.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/app/actions/church-info.ts)
- **Website push/notifications**: [push.ts](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/lib/push.ts)

## Convenções, Boas Práticas e Regras de Negócio
- Tipos explícitos para Prisma em Server Actions, evitar inferência fraca
- Uploads (Supabase): converter `File` em `Buffer`; usar Service Role no backend
- Promoção/Demissão automática de papéis de liderança ao alterar vínculos
- Geração proativa de semanas do mês no hub de relatórios
- Pro rata de frequência conforme `joinedAt` e elegibilidade de reuniões
- Tratamento de nulos e optional chaining nos formulários
- Segurança: não expor segredos; preferir variáveis de ambiente

## Estruturas de Navegação e Acesso
- Sidebar/Header: [AppNavigation.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/AppNavigation.tsx), [Header.tsx](file:///c:/Users/lucas/Documents/trae_projects/CellApp/cell-app/components/Header.tsx)
- Regras de permissão e exibição por `role` (Admin/Supervisor/Líder/Secretário/Membro)

---

Caso precise detalhamento de uma função específica (assinatura/retornos) ou gerar docs técnicos por módulo, indique o arquivo ou fluxo desejado e ampliaremos este documento.

