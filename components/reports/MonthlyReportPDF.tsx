import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 15, // Reduzido de 20 para ganhar mais espaço útil
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  // Header Block
  headerBlock: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 5
  },
  headerColLeft: {
    width: '60%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#000'
  },
  headerColRight: {
    width: '40%',
    padding: 5
  },
  headerText: {
    fontSize: 9,
    marginBottom: 2
  },
  
  // Table Container
  tableContainer: {
    width: '100%',
    borderLeftWidth: 1,
    borderRightWidth: 0,
    borderColor: '#000'
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#000',
    minHeight: 18 // Reduzido de 25 para compactação máxima
  },
  
  // Cell Styles - Widths will be dynamic
  cellLabel: {
    padding: 1, // Reduzido para o mínimo
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center'
  },
  cellData: {
    padding: 0, // Zerado
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'stretch'
  },
  innerGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5, // Linha ainda mais fina
    borderColor: '#ccc',
    marginTop: -1, // Sobe um pouco para encostar no P/F
    paddingTop: 0
  },
  innerGridCol: {
    flex: 1,
    alignItems: 'center',
    padding: 0 // Zerado
  },
  innerLabel: {
    fontSize: 4.5, // Reduzido ligeiramente
    color: '#666',
    lineHeight: 1.0
  },
  innerValue: {
    fontSize: 5.5, // Reduzido ligeiramente
    fontWeight: 'bold',
    lineHeight: 1.0
  },
  cellTotal: {
    padding: 1,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  
  // Text Styles
  labelBold: {
    fontSize: 7,
    fontWeight: 'bold',
    lineHeight: 1.0
  },
  dataText: {
    fontSize: 7,
    textAlign: 'center',
    lineHeight: 1.0
  },
  dataTextBold: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 1.0
  },
  valueText: {
    fontSize: 6,
    textAlign: 'center',
    lineHeight: 1.0
  },
  statusP: {
    fontSize: 8, // Reduzido para caber melhor
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    lineHeight: 1.0,
    marginTop: 1 // Pequeno respiro no topo
  },
  statusF: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#e74c3c',
    textAlign: 'center',
    lineHeight: 1.0,
    marginTop: 1
  },
  
  // Section Headers
  sectionHeader: {
    backgroundColor: '#e0e0e0',
    padding: 4,
    borderBottomWidth: 1,
    borderColor: '#000'
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  
  // Footer
  footer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  signatureBox: {
    width: '30%',
    borderTopWidth: 1,
    borderColor: '#000',
    paddingTop: 5,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 8
  },

  // Stamp
  stampContainer: {
    position: 'absolute',
    top: 150,
    left: '30%',
    transform: 'rotate(-30deg)',
    borderWidth: 4,
    borderColor: '#e74c3c', // Red
    padding: 10,
    opacity: 0.6,
    zIndex: 100
  },
  stampText: {
    color: '#e74c3c',
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
})

interface ReportData {
  cellName: string
  leadership: {
    leader: string
    leader2: string
    supervisor: string
    supervisor2: string
  }
  time: string
  month: string
  year: number
  dates: string[]
  reportSummaries: {
    date: string
    realStart?: string | null
    realEnd?: string | null
    corrections?: {
        id: string
        content: string
        createdAt: string | Date
        author?: { nome: string | null }
    }[]
    theme: string
    cancelReason?: string
    observations?: string
    offerDetails?: string
    present: number
    visitors: number
    financials: {
        tithe: number
        offer: number
        missions: number
        other: number
        total: number
    }
  }[]
  adults: {
    id: string
    name: string
    attendance: Record<string, string>
    financials: Record<string, {
        tithe: number
        offer: number
        missions: number
        other: number
    }>
    stats: {
        present: number
        absent: number
        justified: number
        eligible: number
        totalTithe: number
        totalOffer: number
        totalMissions: number
        totalOther: number
    }
  }[]
  kids: {
    id: string
    name: string
    pillars: Record<string, {
      church: boolean
      cell: boolean
      homeWorship: boolean
      devotional: boolean
      challenge: boolean
    }>
    financials: Record<string, {
        tithe: number
        offer: number
        missions: number
        other: number
    }>
    stats: {
        present: number
        eligible: number
        totalTithe: number
        totalOffer: number
        totalMissions: number
        totalOther: number
    }
  }[]
  closure?: {
    dataAssinaturaLider?: Date | string | null;
    lider?: { nome?: string | null };
    dataAssinaturaSupervisor?: Date | string | null;
    supervisor?: { nome?: string | null };
    dataAssinaturaCoord?: Date | string | null;
    coord?: { nome?: string | null };
    isLate?: boolean
    submittedAt?: Date | string | null
  } | null;
}

export const MonthlyReportPDF = ({ data }: { data: ReportData }) => {
  if (!data) return <Document><Page><Text>Carregando dados...</Text></Page></Document>

  const summaries = data?.reportSummaries || []
  const adults = data?.adults || []
  const kids = data?.kids || []
  const dates = data?.dates || []
  
  // Fallback para financials e outros campos que podem vir undefined
  const safeSummaries = summaries.map(s => ({
    ...s,
    financials: {
      tithe: s.financials?.tithe || 0,
      offer: s.financials?.offer || 0,
      missions: s.financials?.missions || 0,
      other: s.financials?.other || 0,
      total: s.financials?.total || 0
    },
    theme: s.theme || '-',
    present: s.present || 0,
    visitors: s.visitors || 0
  }))

  const numWeeks = safeSummaries.length > 0 ? safeSummaries.length : 1
  
  // Column Widths for Landscape
  const LABEL_WIDTH = '22%' // Reduzido de 25%
  const DATA_WIDTH = `${56 / numWeeks}%` // Ajustado de 60% para 56%
  const TOTAL_WIDTH = '22%' // Aumentado de 15% para acomodar mais colunas
  const TOTAL_FIN_INDIVIDUAL_WIDTH = '4.5%' // Dízimo
  const TOTAL_OFF_INDIVIDUAL_WIDTH = '4.5%' // Oferta
  const TOTAL_MIS_INDIVIDUAL_WIDTH = '4.5%' // Missões
  const TOTAL_OUT_INDIVIDUAL_WIDTH = '4.5%' // Outros
  const TOTAL_FREQ_INDIVIDUAL_WIDTH = '4%' // Freqüência (um pouco menor)
  // 22% (Label) + 56% (Datas) + 22% (Totais) = 100%

  return (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      
      {/* Late Stamp */}
      {data.closure?.isLate && (
        <View style={styles.stampContainer}>
            <Text style={styles.stampText}>ENTREGUE COM ATRASO</Text>
            <Text style={[styles.stampText, { fontSize: 10, marginTop: 5 }]}>
                {data.closure.submittedAt ? new Date(data.closure.submittedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}
            </Text>
        </View>
      )}

      {/* 1. Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerColLeft}>
            {data?.leadership?.leader && data?.leadership?.leader2 ? (
                <Text style={styles.headerText}>Líderes: {data.leadership.leader} e {data.leadership.leader2}</Text>
            ) : (
                <Text style={styles.headerText}>Líder: {data?.leadership?.leader || '-'}</Text>
            )}
            
            {data?.leadership?.supervisor && data?.leadership?.supervisor2 ? (
                <Text style={styles.headerText}>Supervisores: {data.leadership.supervisor} e {data.leadership.supervisor2}</Text>
            ) : (
                <Text style={styles.headerText}>Supervisor: {data?.leadership?.supervisor || '-'}</Text>
            )}
            
            <Text style={[styles.headerText, { marginTop: 4, fontWeight: 'bold' }]}>Célula: {data?.cellName}</Text>
        </View>
        <View style={styles.headerColRight}>
            <Text style={[styles.headerText, { fontSize: 12, fontWeight: 'bold' }]}>Mês/Ano: {data?.month} de {data?.year}</Text>
            <Text style={styles.headerText}>Horário: {data?.time}</Text>
            <Text style={styles.headerText}>Coordenador: -</Text>
        </View>
      </View>

      {/* 2. Summary Table */}
      <View style={styles.tableContainer}>
        {/* Date Header Row */}
        <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>RESUMO / DATAS</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{s.date.split('/').slice(0, 2).join('/')}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.labelBold}>TOTAL</Text>
            </View>
        </View>

        {/* Real Time Row */}
        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Horário Real</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={[styles.valueText, { fontSize: 6 }]}>
                       {s.realStart && s.realEnd ? `${s.realStart}-${s.realEnd}` : '-'}
                    </Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]} />
        </View>

        {/* Theme Row */}
        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Tema do Estudo</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={[styles.valueText, { fontSize: 6 }]}>{s.theme.substring(0, 20)}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]} />
        </View>

        {/* Attendance Counts */}
        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Membros Presentes</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataText}>{s.present}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>{safeSummaries.reduce((acc, curr) => acc + curr.present, 0)}</Text>
            </View>
        </View>

        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Visitantes</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataText}>{s.visitors}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>{safeSummaries.reduce((acc, curr) => acc + curr.visitors, 0)}</Text>
            </View>
        </View>

        {/* Financial Breakdown Rows */}
        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Dízimos</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.tithe.toFixed(2)}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {safeSummaries.reduce((acc, curr) => acc + curr.financials.tithe, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Ofertas</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.offer.toFixed(2)}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {safeSummaries.reduce((acc, curr) => acc + curr.financials.offer, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Missões</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.missions.toFixed(2)}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {safeSummaries.reduce((acc, curr) => acc + curr.financials.missions, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#e0e0e0', borderBottomWidth: 1 }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>TOTAL GERAL</Text>
            </View>
            {safeSummaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>R$ {s.financials.total.toFixed(2)}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {safeSummaries.reduce((acc, curr) => acc + curr.financials.total, 0).toFixed(2)}</Text>
            </View>
        </View>
      </View>

      {/* 3. Members Table */}
      <View wrap={true} style={[styles.tableContainer, { marginTop: 5 }]}>
        {/* Header for Members */}
        <View wrap={false} style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>MEMBROS</Text>
            </View>
            {dates.map((d, i) => (
                 <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{d.split('/').slice(0, 2).join('/')}</Text>
                </View>
            ))}
            <View style={[styles.cellTotal, { width: TOTAL_FIN_INDIVIDUAL_WIDTH }]}>
                <Text style={styles.labelBold}>DÍZ</Text>
            </View>
            <View style={[styles.cellTotal, { width: TOTAL_OFF_INDIVIDUAL_WIDTH }]}>
                <Text style={styles.labelBold}>OF</Text>
            </View>
            <View style={[styles.cellTotal, { width: TOTAL_MIS_INDIVIDUAL_WIDTH }]}>
                <Text style={styles.labelBold}>MIS</Text>
            </View>
            <View style={[styles.cellTotal, { width: TOTAL_OUT_INDIVIDUAL_WIDTH }]}>
                <Text style={styles.labelBold}>OUT</Text>
            </View>
            <View style={[styles.cellTotal, { width: TOTAL_FREQ_INDIVIDUAL_WIDTH, borderRightWidth: 0 }]}>
                <Text style={styles.labelBold}>FRQ</Text>
            </View>
        </View>

        {adults.map((adult, idx) => (
            <View key={adult.id} style={[styles.row, { backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottomWidth: idx === adults.length - 1 ? 1 : 0 }]}>
                <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                    <Text style={[styles.dataText, { textAlign: 'left', paddingLeft: 4 }]}>{adult.name}</Text>
                </View>
                
                {dates.map((date, i) => {
                    const status = adult.attendance?.[date] || '-'
                    const fin = adult.financials?.[date] || { tithe: 0, offer: 0, missions: 0, other: 0 }
                    
                    return (
                        <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                             <Text style={status === 'P' ? styles.statusP : styles.statusF}>{status}</Text>
                             
                             <View style={styles.innerGridRow}>
                                <View style={styles.innerGridCol}>
                                    <Text style={styles.innerLabel}>DIZ</Text>
                                    <Text style={styles.innerValue}>{fin.tithe > 0 ? fin.tithe.toFixed(2) : '0,00'}</Text>
                                </View>
                                <View style={styles.innerGridCol}>
                                    <Text style={styles.innerLabel}>OF</Text>
                                    <Text style={styles.innerValue}>{fin.offer > 0 ? fin.offer.toFixed(2) : '0,00'}</Text>
                                </View>
                                <View style={styles.innerGridCol}>
                                    <Text style={styles.innerLabel}>MIS</Text>
                                    <Text style={styles.innerValue}>{fin.missions > 0 ? fin.missions.toFixed(2) : '0,00'}</Text>
                                </View>
                                <View style={styles.innerGridCol}>
                                    <Text style={styles.innerLabel}>OUT</Text>
                                    <Text style={styles.innerValue}>{fin.other > 0 ? fin.other.toFixed(2) : '0,00'}</Text>
                                </View>
                             </View>
                        </View>
                    )
                })}

                <View style={[styles.cellTotal, { width: TOTAL_FIN_INDIVIDUAL_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{`R$ ${adult.stats.totalTithe.toFixed(2)}`}</Text>
                </View>
                <View style={[styles.cellTotal, { width: TOTAL_OFF_INDIVIDUAL_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{`R$ ${adult.stats.totalOffer.toFixed(2)}`}</Text>
                </View>
                <View style={[styles.cellTotal, { width: TOTAL_MIS_INDIVIDUAL_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{`R$ ${adult.stats.totalMissions.toFixed(2)}`}</Text>
                </View>
                <View style={[styles.cellTotal, { width: TOTAL_OUT_INDIVIDUAL_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{`R$ ${adult.stats.totalOther.toFixed(2)}`}</Text>
                </View>
                <View style={[styles.cellTotal, { width: TOTAL_FREQ_INDIVIDUAL_WIDTH, borderRightWidth: 0 }]}>
                    <Text style={styles.dataTextBold}>
                      {adult.stats.eligible > 0 
                        ? `${Math.round((adult.stats.present / adult.stats.eligible) * 100)}%` 
                        : '-'}
                    </Text>
                </View>
            </View>
        ))}

      </View>

      {/* 4. Observations Section */}
      <View wrap={true} style={{ marginTop: 10, paddingHorizontal: 5 }}>
        <Text style={styles.labelBold}>OBSERVAÇÕES:</Text>
        <View style={{ borderBottomWidth: 1, borderColor: '#ccc', marginTop: 12, width: '100%' }} />
        <View style={{ borderBottomWidth: 1, borderColor: '#ccc', marginTop: 12, width: '100%' }} />
      </View>

      {/* 5. Kids Section (Page 2) */}
      {kids.length > 0 && (
          <View break style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Crianças (Gamificação)</Text>
            <View style={styles.tableContainer}>
                <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
                    <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                        <Text style={styles.labelBold}>NOME</Text>
                    </View>
                    {dates.map((d, i) => (
                        <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                            <Text style={styles.dataTextBold}>{d.split('/').slice(0, 2).join('/')}</Text>
                        </View>
                    ))}
                    <View style={[styles.cellTotal, { width: TOTAL_FIN_INDIVIDUAL_WIDTH }]}>
                        <Text style={styles.labelBold}>DÍZIMO</Text>
                    </View>
                    <View style={[styles.cellTotal, { width: TOTAL_OFF_INDIVIDUAL_WIDTH }]}>
                        <Text style={styles.labelBold}>OFERTA</Text>
                    </View>
                    <View style={[styles.cellTotal, { width: TOTAL_FREQ_INDIVIDUAL_WIDTH }]}>
                        <Text style={styles.labelBold}>PRES.</Text>
                    </View>
                </View>

                {kids.map((kid, idx) => (
                    <View key={kid.id} style={[styles.row, { backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9', borderBottomWidth: idx === kids.length - 1 ? 1 : 0 }]}>
                        <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                             <Text style={[styles.dataText, { textAlign: 'left', paddingLeft: 4 }]}>{kid.name}</Text>
                        </View>
                        {dates.map((date, i) => {
                             const pillars = kid.pillars?.[date]
                             const fin = kid.financials?.[date] || { tithe: 0, offer: 0, missions: 0, other: 0 }
                             let pList: string[] = []
                             if (pillars) {
                                 if (pillars.church) pList.push('I')
                                 if (pillars.cell) pList.push('C')
                                 if (pillars.devotional) pList.push('D')
                                 if (pillars.homeWorship) pList.push('L')
                                 if (pillars.challenge) pList.push('X')
                             }
                             return (
                                 <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                                     <Text style={[styles.valueText, { fontSize: 6, fontWeight: 'bold' }]}>{pList.length > 0 ? pList.join(' ') : 'F'}</Text>
                                     <Text style={[styles.valueText, { fontSize: 5 }]}>Diz: {fin.tithe.toFixed(2)}</Text>
                                     <Text style={[styles.valueText, { fontSize: 5 }]}>Of: {fin.offer.toFixed(2)}</Text>
                                 </View>
                             )
                        })}
                        
                        <View style={[styles.cellTotal, { width: TOTAL_FIN_INDIVIDUAL_WIDTH }]}>
                            <Text style={styles.dataTextBold}>{`R$ ${kid.stats.totalTithe.toFixed(2)}`}</Text>
                        </View>
                        <View style={[styles.cellTotal, { width: TOTAL_OFF_INDIVIDUAL_WIDTH }]}>
                            <Text style={styles.dataTextBold}>{`R$ ${kid.stats.totalOffer.toFixed(2)}`}</Text>
                        </View>
                        <View style={[styles.cellTotal, { width: TOTAL_FREQ_INDIVIDUAL_WIDTH }]}>
                            <Text style={styles.dataTextBold}>{kid.stats.present}</Text>
                        </View>
                    </View>
                ))}
            </View>
            <Text style={{ fontSize: 8, marginTop: 2 }}>Legenda: I=Igreja, C=Célula, D=Devocional, L=Culto Lar, X=Desafio</Text>
          </View>
      )}

      {/* 4. Footer */}
      <View style={styles.footer}>
          <View style={styles.signatureBox}>
              <Text style={styles.footerText}>
                {data.leadership.leader && data.leadership.leader2 ? 'Líderes' : 'Líder'}
              </Text>
              {data.closure?.dataAssinaturaLider && (
                  <>
                    <Text style={{ fontSize: 6, marginTop: 4 }}>Assinado digitalmente por:</Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{data.closure.lider?.nome}</Text>
                    <Text style={{ fontSize: 6 }}>{new Date(data.closure.dataAssinaturaLider).toLocaleString('pt-BR')}</Text>
                  </>
              )}
          </View>
          <View style={styles.signatureBox}>
              <Text style={styles.footerText}>
                {data.leadership.supervisor && data.leadership.supervisor2 ? 'Supervisores' : 'Supervisor'}
              </Text>
              {data.closure?.dataAssinaturaSupervisor && (
                  <>
                    <Text style={{ fontSize: 6, marginTop: 4 }}>Assinado digitalmente por:</Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{data.closure.supervisor?.nome}</Text>
                    <Text style={{ fontSize: 6 }}>{new Date(data.closure.dataAssinaturaSupervisor).toLocaleString('pt-BR')}</Text>
                  </>
              )}
          </View>
          <View style={styles.signatureBox}>
              <Text style={styles.footerText}>Coordenação</Text>
              {data.closure?.dataAssinaturaCoord && (
                  <>
                    <Text style={{ fontSize: 6, marginTop: 4 }}>Assinado digitalmente por:</Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{data.closure.coord?.nome}</Text>
                    <Text style={{ fontSize: 6 }}>{new Date(data.closure.dataAssinaturaCoord).toLocaleString('pt-BR')}</Text>
                  </>
              )}
          </View>
      </View>

    </Page>
    
    {/* 5. Corrections Page */}
    {summaries.some(s => s.corrections && s.corrections.length > 0) && (
        <Page size="A4" style={styles.page}>
            <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 15 }]}>Cartas de Correção e Auditoria</Text>
            {summaries.map(s => (
                s.corrections && s.corrections.length > 0 && (
                    <View key={s.date} style={{ marginBottom: 20 }}>
                        <Text style={[styles.labelBold, { fontSize: 11, marginBottom: 8, backgroundColor: '#f0f0f0', padding: 4 }]}>
                            Relatório de {s.date}
                        </Text>
                        {s.corrections.map((c, idx) => (
                            <View key={idx} style={{ padding: 10, borderLeftWidth: 3, borderColor: '#e74c3c', marginBottom: 10, backgroundColor: '#fff9f9' }}>
                                <Text style={{ fontSize: 9, color: '#555', marginBottom: 4 }}>
                                    {new Date(c.createdAt).toLocaleString('pt-BR')} - Autor: {c.author?.nome || 'Sistema'}
                                </Text>
                                <Text style={{ fontSize: 10 }}>{c.content}</Text>
                            </View>
                        ))}
                    </View>
                )
            ))}
        </Page>
    )}
  </Document>
)}
