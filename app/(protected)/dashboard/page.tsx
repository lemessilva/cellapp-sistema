import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, Users, Heart, Share2 } from 'lucide-react'
import { getUser } from '@/lib/auth'

export default async function DashboardPage() {
    const user = await getUser()
    if (!user) redirect('/login')

    // Buscar logs de oração separadamente
    const prayerLogs = await prisma.prayerLog.findMany({
        where: {
            userId: user.id,
            date: {
                gte: new Date(new Date().setHours(0,0,0,0)),
                lt: new Date(new Date().setHours(23,59,59,999))
            }
        }
    })

    const hasPrayedToday = prayerLogs.length > 0

    // Renderização condicional baseada na ROLE
    
    // --- ADMIN ---
    if (user.role === 'ADMIN') {
        const totalMembers = await prisma.user.count()
        const totalCells = await prisma.cell.count()
        const totalOikos = await prisma.oikos.count()

        return (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">Visão Geral</h2>
                
                <div className="grid grid-cols-2 gap-4">
                    <DashboardCard title="Membros" value={totalMembers} icon={<Users className="w-5 h-5 text-indigo-600" />} />
                    <DashboardCard title="Células" value={totalCells} icon={<Share2 className="w-5 h-5 text-purple-600" />} />
                    <DashboardCard title="Oikos" value={totalOikos} icon={<Heart className="w-5 h-5 text-pink-600" />} />
                </div>

                <div className="card">
                    <h3 className="font-semibold text-gray-700 mb-4">Ações Rápidas</h3>
                    <div className="space-y-3">
                         <button className="w-full text-left p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm"><Users size={18}/></div>
                            <span>Gerenciar Usuários</span>
                         </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- LIDER / SUPERVISOR ---
    if (user.role === 'LIDER' || user.role === 'SUPERVISOR') {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-gray-500 text-sm">Bem-vindo, Líder</p>
                        <h2 className="text-2xl font-bold text-gray-900">{user.nome}</h2>
                    </div>
                </div>

                {/* Destaque: Gerar Convite */}
                <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
                    <h3 className="text-lg font-semibold mb-2">Crescimento da Célula</h3>
                    <p className="text-indigo-100 text-sm mb-4">Gere um link único para convidar novos membros.</p>
                    <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-2xl shadow-sm hover:bg-indigo-50 transition">
                        Gerar Convite de Membro
                    </button>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Users size={20} className="text-indigo-600"/>
                        Membros da Célula
                    </h3>
                    <div className="space-y-3">
                        {user.celula?.membros.filter(m => m.id !== user.id).map(membro => (
                            <div key={membro.id} className="card flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">
                                        {membro.nome.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{membro.nome}</p>
                                        <p className="text-xs text-gray-500">Membro</p>
                                    </div>
                                </div>
                                {/* Indicador se orou (mockado por enquanto) */}
                                <div className="w-3 h-3 rounded-full bg-gray-300" title="Ainda não orou hoje"></div>
                            </div>
                        ))}
                        {(!user.celula?.membros || user.celula.membros.length <= 1) && (
                            <p className="text-gray-500 text-sm text-center py-4">Sua célula ainda não tem membros cadastrados.</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // --- MEMBRO (Padrão) ---
    return (
        <div className="space-y-6">
             <div>
                <p className="text-gray-500 text-sm">Olá, irmão(ã)</p>
                <h2 className="text-2xl font-bold text-gray-900">{user.nome}</h2>
            </div>

            {/* Card de Verificação Diária */}
            {hasPrayedToday ? (
                <div className="bg-green-100 border border-green-200 rounded-3xl p-6 text-center">
                    <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200">
                        <Heart fill="currentColor" />
                    </div>
                    <h3 className="text-green-800 font-bold text-lg">Parabéns!</h3>
                    <p className="text-green-700 text-sm">Você já registrou sua oração hoje.</p>
                </div>
            ) : (
                <div className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Hora de Orar</h3>
                            <p className="text-xs text-gray-500">Mantenha sua chama acesa 🔥</p>
                        </div>
                    </div>
                    <button className="btn-primary">
                        Registrar Oração
                    </button>
                </div>
            )}

            {/* Listas de Oração */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-800">Seus Oikos</h3>
                <div className="grid grid-cols-1 gap-3">
                    {user.oikos.map(o => (
                        <div key={o.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-3">
                             <div className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
                                <Heart size={14} />
                             </div>
                             <span className="font-medium text-gray-700">{o.nome}</span>
                        </div>
                    ))}
                    {user.oikos.length === 0 && (
                        <p className="text-sm text-gray-500">Nenhum Oikos cadastrado.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function DashboardCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
    return (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm font-medium">{title}</span>
                {icon}
            </div>
            <span className="text-3xl font-bold text-gray-900">{value}</span>
        </div>
    )
}
