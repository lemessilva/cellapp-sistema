'use server'

import { prisma } from "@/lib/prisma";
import { MonthlyClosureStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getMonthlyReportData } from "./meeting";

export async function getMonthlyClosure(cellId: string, month: number, year: number) {
  try {
    const closure = await prisma.monthlyClosure.findUnique({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      include: {
        lider: true,
        supervisor: true,
        coord: true
      }
    });
    return closure;
  } catch (error) {
    console.error("Erro ao buscar fechamento mensal:", error);
    return null;
  }
}

export async function closeMonthlyReport(cellId: string, month: number, year: number) {
  try {
    // 1. Promote all DRAFTS to SUBMITTED (ENVIADO_LIDER)
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    await prisma.meetingReport.updateMany({
        where: {
            cellId,
            date: { gte: startDate, lte: endDate },
            status: 'RASCUNHO'
        },
        data: {
            status: 'ENVIADO_LIDER'
        }
    })

    // 2. Calculate totals for the closure record (now fetching all valid reports)
    const result = await getMonthlyReportData(cellId, month, year)
    if (!result) return { success: false, error: "Falha ao calcular totais do relatório." }

    const summaries = result.reportSummaries || []
    const totalMeetings = summaries.length
    const totalOffer = summaries.reduce((acc: number, curr: any) => acc + curr.financials.offer, 0)
    const totalMissions = summaries.reduce((acc: number, curr: any) => acc + curr.financials.missions, 0)
    
    // Average attendance calculation
    const totalPresent = summaries.reduce((acc: number, curr: any) => acc + curr.present, 0)
    const avgAttendance = totalMeetings > 0 ? totalPresent / totalMeetings : 0

    const closure = await prisma.monthlyClosure.upsert({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      update: {
        status: MonthlyClosureStatus.AGUARDANDO_LIDER,
        totalMeetings,
        totalOffer,
        totalMissions,
        avgAttendance
      },
      create: {
        cellId,
        month,
        year,
        status: MonthlyClosureStatus.AGUARDANDO_LIDER,
        totalMeetings,
        totalOffer,
        totalMissions,
        avgAttendance
      }
    });

    revalidatePath("/app/celula/relatorios");
    return { success: true, closure };
  } catch (error) {
    console.error("Erro ao fechar mês:", error);
    return { success: false, error: "Falha ao fechar o mês." };
  }
}

export async function signMonthlyReportLider(cellId: string, month: number, year: number, userId: string) {
  try {
    // Verificar se tem supervisor
    const cell = await prisma.cell.findUnique({
      where: { id: cellId },
      select: { supervisorId: true }
    });

    const nextStatus = cell?.supervisorId 
      ? MonthlyClosureStatus.AGUARDANDO_SUPERVISOR 
      : MonthlyClosureStatus.CONCLUIDO;

    const closure = await prisma.monthlyClosure.update({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      data: {
        status: nextStatus,
        liderId: userId,
        liderSignedAt: new Date()
      }
    });

    revalidatePath("/app/celula/relatorios");
    return { success: true, closure };
  } catch (error) {
    console.error("Erro ao assinar como líder:", error);
    return { success: false, error: "Falha ao assinar relatório." };
  }
}

export async function requestCorrection(cellId: string, month: number, year: number, reason: string) {
  try {
    const closure = await prisma.monthlyClosure.update({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      data: {
        status: MonthlyClosureStatus.ABERTO,
        correctionReason: reason
      }
    });

    revalidatePath("/app/celula/relatorios");
    return { success: true, closure };
  } catch (error) {
    console.error("Erro ao solicitar correção:", error);
    return { success: false, error: "Falha ao solicitar correção." };
  }
}

export async function signMonthlyReportSupervisor(cellId: string, month: number, year: number, userId: string) {
  try {
    const closure = await prisma.monthlyClosure.update({
      where: {
        cellId_month_year: {
          cellId,
          month,
          year
        }
      },
      data: {
        status: MonthlyClosureStatus.CONCLUIDO,
        supervisorId: userId,
        supervisorSignedAt: new Date()
      }
    });

    revalidatePath("/app/celula/relatorios");
    return { success: true, closure };
  } catch (error) {
    console.error("Erro ao assinar como supervisor:", error);
    return { success: false, error: "Falha ao assinar relatório." };
  }
}
