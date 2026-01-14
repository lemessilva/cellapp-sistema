'use client'

import { AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'

interface CellHealthProps {
  data: any[]
}

export default function CellHealthTable({ data }: CellHealthProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">Saúde das Células</h3>
        <p className="text-sm text-slate-500">Performance baseada na frequência média vs. total de membros</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Célula</th>
              <th className="px-6 py-4 text-left">Líder</th>
              <th className="px-6 py-4 text-center">Membros</th>
              <th className="px-6 py-4 text-center">Média Presença</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((cell) => (
              <tr key={cell.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{cell.name}</td>
                <td className="px-6 py-4 text-slate-600">{cell.leader}</td>
                <td className="px-6 py-4 text-center text-slate-600">{cell.members}</td>
                <td className="px-6 py-4 text-center font-medium text-slate-800">
                  {cell.avgAttendance}
                  <span className="text-xs text-slate-400 ml-1">({cell.ratio}%)</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    cell.status === 'HEALTHY' ? 'bg-green-100 text-green-700 border-green-200' :
                    cell.status === 'WARNING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {cell.status === 'HEALTHY' && <CheckCircle className="w-3 h-3" />}
                    {cell.status === 'WARNING' && <HelpCircle className="w-3 h-3" />}
                    {cell.status === 'CRITICAL' && <AlertCircle className="w-3 h-3" />}
                    
                    {cell.status === 'HEALTHY' ? 'Saudável' :
                     cell.status === 'WARNING' ? 'Atenção' : 'Crítico'}
                  </span>
                </td>
              </tr>
            ))}
            
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  Nenhuma célula encontrada ou sem dados suficientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
