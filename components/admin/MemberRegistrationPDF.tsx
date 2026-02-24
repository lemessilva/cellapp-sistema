import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Register fonts if needed (using standard fonts for now)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  churchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  docTitle: {
    fontSize: 14,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    backgroundColor: '#f1f5f9',
    padding: 4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  col: {
    flexDirection: 'column',
    marginRight: 15,
    flexGrow: 1,
  },
  colHalf: {
    width: '50%',
  },
  colThird: {
    width: '33%',
  },
  label: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 10,
    color: '#0f172a',
    minHeight: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 10,
    alignSelf: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

interface MemberData {
  nome: string
  foto_url?: string | null
  email?: string | null
  telefone?: string | null
  whatsapp?: string | null
  data_nascimento?: string | Date | null
  dataNascimento?: string | Date | null
  genero?: string | null
  sexo?: string | null
  estado_civil?: string | null
  estadoCivil?: string | null
  profissao?: string | null
  escolaridade?: string | null
  role?: string | null
  memberSince?: string | Date | null
  
  // Address
  endereco?: string | null
  numero?: string | null
  bairro?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  
  // Church
  funcoes?: string | null
  data_batismo?: string | Date | null
  dataConversao?: string | Date | null
  celula?: { nome: string, lider?: { nome: string } | null } | null
  responsavel?: { nome: string } | null
  parent?: { nome: string } | null
  
  // Family
  nomeConjuge?: string | null
  nomePai?: string | null
  nomeMae?: string | null
  igrejaAnterior?: string | null
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return ''
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR })
  } catch {
    return ''
  }
}

const formatPhone = (phone: string | null | undefined) => {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return phone
}

export default function MemberRegistrationPDF({ member }: { member: MemberData }) {
  const birthDate = member.dataNascimento || member.data_nascimento
  const gender = member.sexo || member.genero
  const civilStatus = member.estadoCivil || member.estado_civil
  const phone = member.whatsapp || member.telefone
  const age = (() => {
    if (!birthDate) return null
    try {
      const d = new Date(birthDate as any)
      const today = new Date()
      let a = today.getFullYear() - d.getFullYear()
      const m = today.getMonth() - d.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a--
      return a
    } catch { return null }
  })()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* Placeholder for Logo if needed */}
            <View>
               <Text style={styles.churchName}>CELL APP</Text>
               <Text style={{ fontSize: 10, color: '#64748b' }}>Sistema de Gestão de Células</Text>
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'right' }}>Cargo</Text>
            <Text style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', textAlign: 'right' }}>{(member.role || '').toString() || 'Não informado'}</Text>
          </View>
          <Text style={styles.docTitle}>Ficha Cadastral</Text>
        </View>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
           {/* Photo Section */}
           <View style={{ width: '25%', alignItems: 'center', marginRight: 20 }}>
              <View style={styles.photoContainer}>
                 {member.foto_url ? (
                   <Image src={member.foto_url} style={styles.photo} />
                 ) : (
                   <View style={{ flex: 1, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 24, color: '#cbd5e1' }}>
                        {member.nome.charAt(0).toUpperCase()}
                      </Text>
                   </View>
                 )}
              </View>
              <Text style={{ fontSize: 8, color: '#64748b' }}>Matrícula: {Math.random().toString(36).substr(2, 6).toUpperCase()}</Text>
           </View>

           {/* Main Info */}
           <View style={{ width: '75%' }}>
              <View style={styles.section}>
                 <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                 
                 <View style={styles.row}>
                    <View style={styles.col}>
                       <Text style={styles.label}>Nome Completo</Text>
                       <Text style={styles.value}>{member.nome}</Text>
                    </View>
                 </View>

                 <View style={styles.row}>
                    <View style={[styles.col, styles.colThird]}>
                       <Text style={styles.label}>Data Nascimento</Text>
                       <Text style={styles.value}>{formatDate(birthDate)}</Text>
                    </View>
                    <View style={[styles.col, styles.colThird]}>
                       <Text style={styles.label}>Gênero</Text>
                       <Text style={styles.value}>{gender || '-'}</Text>
                    </View>
                    <View style={[styles.col, styles.colThird]}>
                       <Text style={styles.label}>Estado Civil</Text>
                       <Text style={styles.value}>{civilStatus || '-'}</Text>
                    </View>
                 </View>

                 <View style={styles.row}>
                    <View style={[styles.col, styles.colThird]}>
                       <Text style={styles.label}>Idade</Text>
                       <Text style={styles.value}>{age !== null ? String(age) : '-'}</Text>
                    </View>
                    <View style={[styles.col, styles.colHalf]}>
                       <Text style={styles.label}>Profissão</Text>
                       <Text style={styles.value}>{member.profissao || '-'}</Text>
                    </View>
                    <View style={[styles.col, styles.colHalf]}>
                       <Text style={styles.label}>Escolaridade</Text>
                       <Text style={styles.value}>{member.escolaridade || '-'}</Text>
                    </View>
                 </View>

                <View style={styles.row}>
                  <View style={[styles.col, styles.colHalf]}>
                    <Text style={styles.label}>CPF</Text>
                    <Text style={styles.value}>{'-'}</Text>
                  </View>
                  <View style={[styles.col, styles.colHalf]}>
                    <Text style={styles.label}>RG</Text>
                    <Text style={styles.value}>{'-'}</Text>
                  </View>
                </View>
              </View>
           </View>
        </View>

        {/* Contact & Address */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Contato e Endereço</Text>
           
           <View style={styles.row}>
              <View style={[styles.col, styles.colHalf]}>
                 <Text style={styles.label}>Email</Text>
                 <Text style={styles.value}>{member.email || '-'}</Text>
              </View>
              <View style={[styles.col, styles.colHalf]}>
                 <Text style={styles.label}>Telefone / WhatsApp</Text>
                 <Text style={styles.value}>{formatPhone(phone)}</Text>
              </View>
           </View>

           <View style={styles.row}>
              <View style={[styles.col, { flexGrow: 2 }]}>
                 <Text style={styles.label}>Logradouro</Text>
                 <Text style={styles.value}>{member.endereco || '-'}</Text>
              </View>
              <View style={[styles.col, { width: 60 }]}>
                 <Text style={styles.label}>Número</Text>
                 <Text style={styles.value}>{member.numero || '-'}</Text>
              </View>
           </View>

           <View style={styles.row}>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>Bairro</Text>
                 <Text style={styles.value}>{member.bairro || '-'}</Text>
              </View>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>Cidade / UF</Text>
                 <Text style={styles.value}>
                    {member.cidade ? `${member.cidade}${member.estado ? '/' + member.estado : ''}` : '-'}
                 </Text>
              </View>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>CEP</Text>
                 <Text style={styles.value}>{member.cep || '-'}</Text>
              </View>
           </View>
        </View>

        {/* Family */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Dados Familiares</Text>
           
           <View style={styles.row}>
              <View style={[styles.col, styles.colHalf]}>
                 <Text style={styles.label}>Cônjuge</Text>
                 <Text style={styles.value}>{member.nomeConjuge || '-'}</Text>
              </View>
           </View>

           <View style={styles.row}>
              <View style={[styles.col, styles.colHalf]}>
                 <Text style={styles.label}>Pai</Text>
                 <Text style={styles.value}>{member.nomePai || '-'}</Text>
              </View>
              <View style={[styles.col, styles.colHalf]}>
                 <Text style={styles.label}>Mãe</Text>
                 <Text style={styles.value}>{member.nomeMae || '-'}</Text>
              </View>
           </View>
        </View>

        {/* Church Data */}
        <View style={styles.section}>
           <Text style={styles.sectionTitle}>Dados Eclesiásticos</Text>
           
           <View style={styles.row}>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>Célula</Text>
                 <Text style={styles.value}>{member.celula?.nome || '-'}</Text>
              </View>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>Data Conversão</Text>
                 <Text style={styles.value}>{formatDate(member.dataConversao)}</Text>
              </View>
              <View style={[styles.col, styles.colThird]}>
                 <Text style={styles.label}>Data Batismo</Text>
                 <Text style={styles.value}>{formatDate(member.data_batismo)}</Text>
              </View>
           </View>

           <View style={styles.row}>
            <View style={[styles.col, styles.colThird]}>
              <Text style={styles.label}>Membro Desde</Text>
              <Text style={styles.value}>{formatDate(member.memberSince)}</Text>
            </View>
            <View style={[styles.col, styles.colThird]}>
              <Text style={styles.label}>Líder da Célula</Text>
              <Text style={styles.value}>{member.celula?.lider?.nome || '-'}</Text>
            </View>
              <View style={styles.col}>
                 <Text style={styles.label}>Funções / Ministérios</Text>
                 <Text style={styles.value}>{member.funcoes || '-'}</Text>
              </View>
           </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Discipulador / Responsável</Text>
              <Text style={styles.value}>{member.responsavel?.nome || member.parent?.nome || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.value}>{member.igrejaAnterior || 'Não informado'}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
           <Text style={styles.footerText}>
              Emitido em {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
           </Text>
           <Text style={styles.footerText}>
              Página 1 de 1
           </Text>
        </View>
      </Page>
    </Document>
  )
}
