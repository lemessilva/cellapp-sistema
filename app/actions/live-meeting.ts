'use server'

import { prisma } from "@/lib/prisma"
import { ReportStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { sendNotification } from "./notifications"
import { startOfWeek, endOfWeek, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function getWeeklyScheduledMeetings(cellId: string, currentReportId: string) {
    try {
        const today = new Date()
        const start = startOfWeek(today, { locale: ptBR }) // Sunday
        const end = endOfWeek(today, { locale: ptBR })     // Saturday

        const meetings = await prisma.meetingReport.findMany({
            where: {
                cellId,
                status: ReportStatus.RASCUNHO,
                date: {
                    gte: start,
                    lte: end
                },
                id: {
                    not: currentReportId // Exclude current live one if it's somehow draft (though live is EM_ANDAMENTO)
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        return meetings.map(m => ({
            id: m.id,
            date: m.date,
            formattedDate: format(m.date, "EEEE, dd/MM", { locale: ptBR }),
            studyTheme: m.studyTheme
        }))
    } catch (error) {
        console.error('Error fetching scheduled meetings:', error)
        return []
    }
}

export async function startLiveMeeting(cellId: string, date: string) {
  try {
    const now = new Date()
    // 1. Defina o intervalo da SEMANA ATUAL (Domingo a Sábado)
    const start = startOfWeek(now, { locale: ptBR })
    const end = endOfWeek(now, { locale: ptBR })

    // 2. Busque se JÁ EXISTE uma célula REALIZADA (COMPLETED) nesta semana
    // O usuário pediu bloqueio para COMPLETED e IN_PROGRESS.
    // Mas bloquear IN_PROGRESS impediria o RESUME (retomar célula que caiu).
    // Portanto, vamos bloquear apenas as FINALIZADAS para evitar duplicidade de envio.
    // Se houver uma IN_PROGRESS, a lógica abaixo (existente) irá retomá-la.
    const existingCompleted = await prisma.meetingReport.findFirst({
      where: {
        cellId,
        date: { gte: start, lte: end },
        status: { in: [ReportStatus.ENVIADO_LIDER, ReportStatus.APROVADO, ReportStatus.NAO_HOUVE] }
      }
    })

    if (existingCompleted) {
      throw new Error('Já existe uma célula realizada nesta semana! Edite o relatório existente.')
    }

    // 3. Busque QUALQUER reunião pendente nesta janela de tempo
    let meeting = await prisma.meetingReport.findFirst({
      where: {
        cellId,
        date: {
          gte: start,
          lte: end
        },
        // Ignora as já finalizadas (COMPLETED)
        status: {
          notIn: [ReportStatus.ENVIADO_LIDER, ReportStatus.APROVADO, ReportStatus.NAO_HOUVE]
        }
      },
      orderBy: { date: 'asc' }
    })

    // 3. Lógica de Decisão
    if (meeting) {
      // ENCONTROU (ex: a de Quarta-feira).
      
      // Se já estiver EM_ANDAMENTO (IN_PROGRESS), não reseta o timer, apenas retorna ela.
      if (meeting.status === ReportStatus.EM_ANDAMENTO) {
        // Resume logic
      } else {
        // Se estiver SCHEDULED (RASCUNHO), inicia agora.
        meeting = await prisma.meetingReport.update({
          where: { id: meeting.id },
          data: {
            status: ReportStatus.EM_ANDAMENTO,
            startedAt: new Date() // <--- ZERA O CRONÔMETRO AQUI (Timestamp atual)
            // NÃO altere o campo 'date'. Mantenha a data original.
          }
        })
      }
    } else {
      // NÃO ENCONTROU (Semana vazia? Cria nova com data de HOJE)
      meeting = await prisma.meetingReport.create({
        data: {
          cellId,
          date: new Date(), // Data de hoje
          startedAt: new Date(),
          status: ReportStatus.EM_ANDAMENTO
        }
      })
    }

    // Notify members (apenas se foi iniciada agora - simplificação: notifica sempre que entra no live mode)
    // Opcional: verificar se já notificou recentemente para evitar spam
    
    return { success: true, reportId: meeting.id, startedAt: meeting.startedAt }
  } catch (error: any) {
    console.error('Error starting live meeting:', error)
    return { error: error.message || 'Falha ao iniciar célula' }
  }
}

export async function getLiveMeetingData(cellId: string) {
  try {
    const report = await prisma.meetingReport.findFirst({
      where: {
        cellId,
        status: ReportStatus.EM_ANDAMENTO
      },
      include: {
        attendance: true,
        kidsPillars: true
      }
    })

    if (!report) return { active: false }

    const members = await prisma.user.findMany({
      where: {
        celulaId: cellId,
        ativo: true
      },
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        foto_url: true,
        role: true,
        categoria: true
      }
    })

    return { 
      active: true, 
      report, 
      members 
    }
  } catch (error) {
    console.error('Error fetching live meeting data:', error)
    return { error: 'Erro ao carregar dados da célula ao vivo' }
  }
}

export async function checkLiveStatus(cellId: string) {
  try {
    const count = await prisma.meetingReport.count({
      where: {
        cellId,
        status: ReportStatus.EM_ANDAMENTO
      }
    })
    return { active: count > 0 }
  } catch (error) {
    return { active: false }
  }
}

export async function finishLiveMeeting(
  reportId: string, 
  attendanceData: Record<string, any>, 
  financials: { offer: number; missions: number },
  targetReportId?: string
) {
  try {
    // 1. Finaliza a Reunião
    // Usa targetReportId se fornecido (para manter compatibilidade com frontend atual), senão usa reportId
    const finalId = targetReportId && targetReportId !== 'new' ? targetReportId : reportId

    const meeting = await prisma.meetingReport.update({
      where: { id: finalId },
      data: {
        status: ReportStatus.ENVIADO_LIDER, // = COMPLETED
        endedAt: new Date(),
        realEndTime: new Date() // <--- CRONOMETRAGEM EXATA
      }
    })

    // 2. Garante que o Relatório existe (Upsert) - redundante pois o update acima já garante, 
    // mas vamos manter a lógica de garantir dados consistentes
    // Se houve troca de ID (targetReportId), precisamos garantir que os dados do report original (live)
    // sejam migrados ou que o novo tenha os dados corretos.
    // Mas seguindo a lógica estrita do user: "Upsert Report... Usa a data original"
    
    // Se o frontend mandou um targetId diferente, o update acima foi no target.
    // Se o reportId original era um "temporário" e agora estamos salvando no target,
    // devemos deletar o temporário depois? O user não especificou, mas é boa prática.
    // PELA LÓGICA DO USER: Apenas Update status e Loop members.
    
    // Preparar dados financeiros totais para atualizar no report
    let totalOffer = 0
    let totalMissions = 0
    let presentCount = 0

    // Fetch members to know categories (Adult/Kid)
    // Precisamos saber quem é criança para salvar na tabela certa
    const memberIds = Object.keys(attendanceData)
    const members = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, categoria: true }
    })
    const memberCategoryMap = new Map(members.map(m => [m.id, m.categoria]))

    await prisma.$transaction(async (tx) => {
        // 3. Salva os Membros (Iteração Otimizada)
        
        // Separa os dados por categoria para usar createMany
        const attendanceToCreate: any[] = []
        const kidsToCreate: any[] = []

        for (const [userId, data] of Object.entries(attendanceData)) {
            const category = memberCategoryMap.get(userId) || 'ADULTO'
            const isPresent = data.status === 'P'
            
            // "Se 'Falta', force valor 0"
            const offerValue = isPresent ? Number(data.offerValue || 0) : 0
            const titheValue = isPresent ? Number(data.titheValue || 0) : 0
            const missionsValue = isPresent ? Number(data.missionsValue || 0) : 0
            const otherValue = isPresent ? Number(data.otherValue || 0) : 0

            // Totals
            if (isPresent) {
                if (category === 'ADULTO') presentCount++
                totalOffer += offerValue
                totalMissions += missionsValue
            }

            if (category === 'CRIANCA') {
                kidsToCreate.push({
                    reportId: finalId,
                    userId,
                    cell: isPresent,
                    church: data.church || false,
                    homeWorship: data.homeWorship || false,
                    devotional: data.devotional || false,
                    challenge: data.challenge || false,
                    offerValue, titheValue, missionsValue, otherValue
                })
            } else {
                attendanceToCreate.push({
                    reportId: finalId,
                    userId,
                    status: data.status || 'F',
                    offerValue, titheValue, missionsValue, otherValue
                })
            }
        }

        // Limpa registros existentes antes de criar novos (Efeito de Upsert em massa)
        await tx.meetingAttendance.deleteMany({ where: { reportId: finalId } })
        await tx.meetingKidsPillars.deleteMany({ where: { reportId: finalId } })

        if (attendanceToCreate.length > 0) {
            await tx.meetingAttendance.createMany({ data: attendanceToCreate })
        }
        if (kidsToCreate.length > 0) {
            await tx.meetingKidsPillars.createMany({ data: kidsToCreate })
        }

        // Atualiza totais no relatório pai
        await tx.meetingReport.update({
            where: { id: finalId },
            data: {
                offerValue: totalOffer,
                missionsValue: totalMissions,
                presentMembers: presentCount
            }
        })

        // Cleanup: Se usamos um targetId e ele é diferente do reportId (e reportId existe), deletamos o temporário
        if (targetReportId && targetReportId !== 'new' && targetReportId !== reportId) {
             // Verifica se o reportId ainda existe antes de tentar deletar
             const oldReport = await tx.meetingReport.findUnique({ where: { id: reportId } })
             if (oldReport) {
                 await tx.meetingReport.delete({ where: { id: reportId } })
             }
        }
    }, {
        timeout: 15000 // Timeout de 15s para evitar P2028
    })

    revalidatePath('/app')
    return { success: true }
  } catch (error) {
    console.error('Error finishing live meeting:', error)
    return { error: 'Erro ao finalizar célula' }
  }
}
