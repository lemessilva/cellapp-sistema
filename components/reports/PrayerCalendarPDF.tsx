'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 20, // Reduced padding
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 10, // Reduced margin
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderBottomStyle: 'solid',
    paddingBottom: 5, // Reduced padding
  },
  title: {
    fontSize: 18, // Reduced font size
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#3730a3',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10, // Reduced font size
    color: '#666',
    textAlign: 'center',
    marginBottom: 10, // Reduced margin
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 5, // Reduced gap
  },
  infoBox: {
    width: '48%',
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 8, // Reduced font size
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 9, // Reduced font size
    color: '#000',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  monthContainer: {
    width: '32%', 
    marginBottom: 8, // Reduced margin
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 4,
    padding: 2, // Reduced padding
  },
  monthTitle: {
    fontSize: 8, // Reduced font size
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    backgroundColor: '#f3f4f6',
    padding: 1,
    color: '#374151',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 1,
  },
  dayCell: {
    width: '13%', 
    height: 14, // Reduced height significantly
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderRadius: 1,
  },
  dayText: {
    fontSize: 5, // Reduced font size
    color: '#374151',
  },
  prayedDay: {
    backgroundColor: '#4ade80',
    borderColor: '#4ade80',
  },
  prayedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 20, // Adjusted position
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 7, // Reduced font size
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderTopStyle: 'solid',
    paddingTop: 5,
  },
})

export interface ReportData {
  memberName: string
  year: number
  cellName: string
  leaders: string
  supervisors: string
  prayedDates: string[] // ISO date strings
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

export const PrayerCalendarPDF = ({ data }: { data: ReportData }) => {
  const getDaysInMonth = (monthIndex: number, year: number) => {
    return new Date(year, monthIndex + 1, 0).getDate()
  }

  const isPrayed = (monthIndex: number, day: number) => {
    // Construct date string YYYY-MM-DD in local time logic (since input is likely UTC ISO)
    // Actually, simple comparison:
    // We can assume prayedDates are full ISO strings.
    // We need to match the day.
    // Let's create a Set of "YYYY-MM-DD" for O(1) lookup.
    // But inside render, we just iterate.
    
    // Better approach: Pre-process dates in component or parent?
    // Let's do it here on the fly.
    const targetDate = new Date(data.year, monthIndex, day)
    const targetStr = targetDate.toLocaleDateString('pt-BR') // DD/MM/YYYY or YYYY-MM-DD depending on locale... 
    // Wait, ISO strings are YYYY-MM-DD...
    // Let's stick to YYYY-MM-DD comparison.
    
    const yearStr = data.year
    const monthStr = String(monthIndex + 1).padStart(2, '0')
    const dayStr = String(day).padStart(2, '0')
    const dateKey = `${yearStr}-${monthStr}-${dayStr}`
    
    return data.prayedDates.some(pd => pd.startsWith(dateKey))
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Relatório Anual de Oração</Text>
          <Text style={styles.subtitle}>Histórico de {data.year}</Text>
          
          <View style={styles.infoContainer}>
             <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>MEMBRO</Text>
                <Text style={styles.infoValue}>{data.memberName}</Text>
             </View>
             <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>CÉLULA</Text>
                <Text style={styles.infoValue}>{data.cellName}</Text>
             </View>
             <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>LIDERANÇA</Text>
                <Text style={styles.infoValue}>{data.leaders}</Text>
             </View>
             <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>SUPERVISÃO</Text>
                <Text style={styles.infoValue}>{data.supervisors}</Text>
             </View>
          </View>
        </View>

        <View style={styles.grid}>
          {months.map((month, index) => (
            <View key={month} style={styles.monthContainer}>
              <Text style={styles.monthTitle}>{month}</Text>
              <View style={styles.daysGrid}>
                {Array.from({ length: getDaysInMonth(index, data.year) }).map((_, i) => {
                  const day = i + 1
                  const prayed = isPrayed(index, day)
                  return (
                    <View 
                        key={day} 
                        style={[
                            styles.dayCell, 
                            prayed ? styles.prayedDay : {}
                        ]}
                    >
                      <Text style={[
                          styles.dayText,
                          prayed ? styles.prayedDayText : {}
                      ]}>{day}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
            "Orai sem cessar." (1 Tessalonicenses 5:17) • Gerado pelo CellApp em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>
    </Document>
  )
}
