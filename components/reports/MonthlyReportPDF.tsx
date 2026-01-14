import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 20,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica'
  },
  // Header Block
  headerBlock: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 10
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
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#000'
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 15
  },
  
  // Cell Styles - Widths will be dynamic
  cellLabel: {
    padding: 2,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center'
  },
  cellData: {
    padding: 2,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cellTotal: {
    padding: 2,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  
  // Text Styles
  labelBold: {
    fontSize: 8,
    fontWeight: 'bold'
  },
  dataText: {
    fontSize: 8,
    textAlign: 'center'
  },
  dataTextBold: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  valueText: {
    fontSize: 7,
    textAlign: 'center'
  },
  statusP: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  statusF: {
    fontSize: 9,
    color: 'red',
    textAlign: 'center'
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
    theme: string
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
    financials: Record<string, number>
    stats: {
        present: number
        financial: number
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
  }[]
  closure?: {
    dataAssinaturaLider?: Date | string | null;
    lider?: { nome?: string | null };
    dataAssinaturaSupervisor?: Date | string | null;
    supervisor?: { nome?: string | null };
    dataAssinaturaCoord?: Date | string | null;
    coord?: { nome?: string | null };
  } | null;
}

export const MonthlyReportPDF = ({ data }: { data: ReportData }) => {
  if (!data) return <Document><Page><Text>Carregando dados...</Text></Page></Document>

  const summaries = data?.reportSummaries || []
  const adults = data?.adults || []
  const kids = data?.kids || []
  const dates = data?.dates || []
  
  const numWeeks = summaries.length > 0 ? summaries.length : 1
  
  // Dynamic Widths
  const LABEL_WIDTH = '25%'
  const DATA_WIDTH = `${65 / numWeeks}%`
  const TOTAL_WIDTH = '10%'

  return (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      
      {/* 1. Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.headerColLeft}>
            <Text style={styles.headerText}>Líder: {data?.leadership?.leader}</Text>
            {data?.leadership?.leader2 && <Text style={styles.headerText}>Líder em Treinamento: {data?.leadership?.leader2}</Text>}
            <Text style={styles.headerText}>Supervisor: {data?.leadership?.supervisor}</Text>
            {data?.leadership?.supervisor2 && <Text style={styles.headerText}>Supervisor em Treinamento: {data?.leadership?.supervisor2}</Text>}
            <Text style={[styles.headerText, { marginTop: 4, fontWeight: 'bold' }]}>Célula: {data?.cellName}</Text>
        </View>
        <View style={styles.headerColRight}>
            <Text style={[styles.headerText, { fontSize: 12, fontWeight: 'bold' }]}>Mês/Ano: {data?.month} / {data?.year}</Text>
            <Text style={styles.headerText}>Horário: {data?.time}</Text>
            <Text style={styles.headerText}>Coordenador: -</Text>
        </View>
      </View>

      {/* 2. Table Container */}
      <View style={styles.tableContainer}>
        
        {/* === SUMMARY GRID === */}
        {/* Date Header Row */}
        <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>RESUMO / DATAS</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{s.date}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.labelBold}>TOTAL</Text>
            </View>
        </View>

        {/* Theme Row */}
        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Tema do Estudo</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={[styles.valueText, { fontSize: 6 }]}>{s.theme.substring(0, 20)}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]} />
        </View>

        {/* Attendance Counts */}
        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Membros Presentes</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataText}>{s.present}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>{summaries.reduce((acc, curr) => acc + curr.present, 0)}</Text>
            </View>
        </View>

        <View style={styles.row}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Visitantes</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataText}>{s.visitors}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>{summaries.reduce((acc, curr) => acc + curr.visitors, 0)}</Text>
            </View>
        </View>

        {/* Financial Breakdown Rows */}
        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Dízimos</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.tithe.toFixed(2)}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {summaries.reduce((acc, curr) => acc + curr.financials.tithe, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Ofertas</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.offer.toFixed(2)}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {summaries.reduce((acc, curr) => acc + curr.financials.offer, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#f9f9f9' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>Missões</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.valueText}>R$ {s.financials.missions.toFixed(2)}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {summaries.reduce((acc, curr) => acc + curr.financials.missions, 0).toFixed(2)}</Text>
            </View>
        </View>

        <View style={[styles.row, { backgroundColor: '#e0e0e0' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>TOTAL GERAL</Text>
            </View>
            {summaries.map((s, i) => (
                <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>R$ {s.financials.total.toFixed(2)}</Text>
                </View>
            ))}
            {summaries.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.dataTextBold}>R$ {summaries.reduce((acc, curr) => acc + curr.financials.total, 0).toFixed(2)}</Text>
            </View>
        </View>

        {/* Separator */}
        <View style={[styles.row, { backgroundColor: '#000', height: 2, minHeight: 2 }]} />

        {/* === MEMBERS GRID === */}
        {/* Header for Members */}
        <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
            <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                <Text style={styles.labelBold}>MEMBROS</Text>
            </View>
            {dates.map((d, i) => (
                 <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{d.split('/')[0]}</Text>
                </View>
            ))}
            {dates.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
            <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                <Text style={styles.labelBold}>FREQ.</Text>
            </View>
        </View>

        {adults.map((adult, idx) => (
            <View key={adult.id} style={[styles.row, { backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }]}>
                <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                    <Text style={[styles.dataText, { textAlign: 'left', paddingLeft: 4 }]}>{adult.name}</Text>
                </View>
                
                {dates.map((date, i) => {
                    const status = adult.attendance?.[date] || '-'
                    const val = adult.financials?.[date] || 0
                    
                    return (
                        <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                             <Text style={status === 'P' ? styles.statusP : styles.statusF}>{status}</Text>
                             {val > 0 && <Text style={styles.valueText}>{val.toFixed(2)}</Text>}
                        </View>
                    )
                })}
                {dates.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}

                <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]}>
                    <Text style={styles.dataTextBold}>{adult.stats.present}</Text>
                </View>
            </View>
        ))}

      </View>

      {/* 3. Kids Grid (Optional Page Break if needed, but keeping simple for now) */}
      {kids.length > 0 && (
          <View break={false} style={{ marginTop: 20 }}>
            <Text style={[styles.sectionTitle, { marginBottom: 5 }]}>Crianças (Gamificação)</Text>
            <View style={styles.tableContainer}>
                <View style={[styles.row, { backgroundColor: '#f0f0f0' }]}>
                    <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                        <Text style={styles.labelBold}>NOME</Text>
                    </View>
                    {dates.map((d, i) => (
                        <View key={i} style={[styles.cellData, { width: DATA_WIDTH }]}>
                            <Text style={styles.dataTextBold}>{d.split('/')[0]}</Text>
                        </View>
                    ))}
                    {dates.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
                    <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]} />
                </View>

                {kids.map((kid, idx) => (
                    <View key={kid.id} style={[styles.row, { backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9' }]}>
                        <View style={[styles.cellLabel, { width: LABEL_WIDTH }]}>
                             <Text style={[styles.dataText, { textAlign: 'left', paddingLeft: 4 }]}>{kid.name}</Text>
                        </View>
                        {dates.map((date, i) => {
                             const pillars = kid.pillars?.[date]
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
                                     <Text style={[styles.valueText, { fontSize: 6 }]}>{pList.join(' ')}</Text>
                                 </View>
                             )
                        })}
                        {dates.length === 0 && <View style={[styles.cellData, { width: DATA_WIDTH }]}><Text>-</Text></View>}
                        <View style={[styles.cellTotal, { width: TOTAL_WIDTH }]} />
                    </View>
                ))}
            </View>
            <Text style={{ fontSize: 8, marginTop: 2 }}>Legenda: I=Igreja, C=Célula, D=Devocional, L=Culto Lar, X=Desafio</Text>
          </View>
      )}

      {/* 4. Footer */}
      <View style={styles.footer}>
          <View style={styles.signatureBox}>
              <Text style={styles.footerText}>Líder</Text>
              {data.closure?.dataAssinaturaLider && (
                  <>
                    <Text style={{ fontSize: 6, marginTop: 4 }}>Assinado digitalmente por:</Text>
                    <Text style={{ fontSize: 7, fontWeight: 'bold' }}>{data.closure.lider?.nome}</Text>
                    <Text style={{ fontSize: 6 }}>{new Date(data.closure.dataAssinaturaLider).toLocaleString('pt-BR')}</Text>
                  </>
              )}
          </View>
          <View style={styles.signatureBox}>
              <Text style={styles.footerText}>Supervisor</Text>
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
  </Document>
)}
