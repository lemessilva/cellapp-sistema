# 📱 CellApp - Documentação de Transferência e Estado Atual

Este documento serve como guia para continuar o desenvolvimento do sistema **CellApp** em outro ambiente. Ele contém a visão geral, regras de negócio críticas, estado atual e instruções de setup.

---

## 1. 🛠️ Stack Tecnológico

*   **Framework:** Next.js 15 (App Router)
*   **Linguagem:** TypeScript
*   **Banco de Dados:** SQLite (Dev) / PostgreSQL (Prod) via **Prisma ORM**
*   **Estilização:** Tailwind CSS + Shadcn/UI (Radix)
*   **Ícones:** Lucide React
*   **PDF:** @react-pdf/renderer
*   **QR Code:** react-zxing (Leitura) / qrcode.react (Geração)

---

## 2. 🔐 Arquitetura de Permissões (Crítico)

O sistema utiliza uma lógica de **RBAC (Role-Based Access Control)** refinada. É crucial manter a distinção entre permissões **Estruturais** e **Operacionais**.

### Roles (Cargos)
*   **ADMIN / SUPERVISOR:** "Arquitetos". Gerenciam a estrutura (Células, Liderança).
*   **LIDER / SECRETARIO:** "Operadores". Gerenciam o dia-a-dia (Membros, Relatórios).
*   **MEMBRO:** Acesso limitado (Visualização de perfil, oração).

### Regras de Ouro (Implementadas em `LeaderScreen.tsx`, `CellList.tsx` e `lancamento/page.tsx`)
1.  **`canManageStructure`**:
    *   **Quem:** ADMIN, SUPERVISOR.
    *   **Acesso:** Botões "Nova Célula", "Editar Célula", "Gerenciar Liderança", "Excluir".
    *   **Localização:** Lista de Células (`/admin/celulas`) e Header do Líder.
2.  **`canEditReport` / `isAuthorized`**:
    *   **Quem:** LIDER, SECRETARIO (da respectiva célula).
    *   **Acesso:** Preencher formulário de relatório, editar ofertas/presença.
    *   **Detalhe:** O Admin pode **VER** o relatório, mas os inputs ficam `readonly` (cinza/travados).

---

## 3. 🚀 Funcionalidades Principais e Status

### ✅ Gestão de Células (`/admin/celulas`)
*   Listagem completa com filtros.
*   CRUD de Células (Nome, Endereço, Dia/Horário).
*   Vínculo de Líderes, Supervisores e Membros.

### ✅ Sistema de Relatórios (`/app/celula/reuniao`)
*   **Fluxo:** Lançamento semanal -> Aprovação do Líder -> Consolidação Mensal.
*   **Kids:** Controle separado de frequência para crianças.
*   **PDF:** Geração de relatório mensal consolidado com matriz de presença.

### ✅ Eventos e Check-in (`/admin/eventos` e `/admin/checkin`)
*   **Inscrições:** Modelo `Registration` vinculado a `Event` e `User`.
*   **QR Code:** Leitura via câmera do dispositivo (mobile-first).
*   **Check-in:** Validação em tempo real, prevenção de check-in duplicado, feedback sonoro e visual.
*   **Correção Recente:** Função `getAdminEvents` adicionada em `actions/events.ts` para listar eventos no painel.

### 🚧 Em Desenvolvimento / Pendente
*   **Financeiro:** Dashboard detalhado de ofertas (estrutura básica existe).
*   **Notificações:** Refinar triggers automáticos.

---

## 4. 📂 Estrutura de Pastas Chave

*   `app/(protected)`: Rotas protegidas (requerem login).
    *   `/admin`: Área administrativa (Células, Eventos, Check-in).
    *   `/app`: Área do usuário/líder (Célula, Relatórios).
*   `app/actions`: Server Actions (Backend Logic).
    *   `meeting.ts`: Lógica de relatórios.
    *   `events.ts`: Lógica de eventos e check-in.
    *   `auth.ts`: Gestão de sessão.
*   `components`: Componentes UI reutilizáveis.
    *   `LeaderScreen.tsx`: Dashboard principal do líder.
    *   `reports/ReportForm.tsx`: O formulário complexo de relatório.
*   `prisma/schema.prisma`: Definição do banco de dados.

---

## 5. 💻 Como Rodar no Novo PC

1.  **Pré-requisitos:** Node.js 18+ instalado.
2.  **Clone/Cópia:** Baixe o repositório.
3.  **Instalação:**
    ```bash
    npm install
    ```
4.  **Banco de Dados:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```
5.  **Executar:**
    ```bash
    npm run dev
    ```
6.  **Acesso:** `http://localhost:3000`

---

## 6. 📝 Últimas Alterações Realizadas (Log)
*   **FIX:** Separadas permissões de Admin (Estrutura) vs Líder (Relatório) para evitar bloqueios indevidos.
*   **FIX:** Corrigido crash `ReferenceError: isAuthorized` na tela de lançamento.
*   **FEAT:** Implementado sistema de Check-in com QR Code e sons.
*   **FIX:** Adicionada exportação `getAdminEvents` faltante para corrigir build.

---

> **Nota:** Se precisar reiniciar o banco do zero (apenas em dev), delete o arquivo `dev.db` (se usar SQLite) e rode `npx prisma db push`.
