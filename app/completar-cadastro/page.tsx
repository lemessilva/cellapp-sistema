'use client'

import { useState } from 'react'
import { completeRegistration } from './actions'

export default function OnboardingPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [estadoCivil, setEstadoCivil] = useState('')
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const res = await completeRegistration(formData)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-900">
            Ficha de Membro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete seu cadastro para ter acesso total ao sistema.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="mt-8 space-y-8">
          
          {/* Dados Pessoais */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Nome Completo *</label>
                <input name="nome" type="text" required className="input-field" placeholder="Seu nome completo" />
              </div>
              
              <div>
                <label className="label">Data de Nascimento *</label>
                <input name="data_nascimento" type="date" required className="input-field" />
              </div>

              <div>
                <label className="label">Sexo</label>
                <select name="sexo" className="input-field">
                  <option value="">Selecione</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div>
                <label className="label">Naturalidade (Cidade)</label>
                <input name="naturalidade" type="text" className="input-field" placeholder="Ex: São Paulo" />
              </div>

              <div>
                <label className="label">UF Nascimento</label>
                <input name="ufNascimento" type="text" className="input-field" placeholder="Ex: SP" maxLength={2} />
              </div>

              <div>
                <label className="label">Nome do Pai</label>
                <input name="nomePai" type="text" className="input-field" />
              </div>

              <div>
                <label className="label">Nome da Mãe</label>
                <input name="nomeMae" type="text" className="input-field" />
              </div>

              <div>
                <label className="label">Estado Civil</label>
                <select 
                  name="estadoCivil" 
                  className="input-field" 
                  value={estadoCivil} 
                  onChange={(e) => setEstadoCivil(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="SOLTEIRO">Solteiro(a)</option>
                  <option value="CASADO">Casado(a)</option>
                  <option value="VIUVO">Viúvo(a)</option>
                  <option value="DIVORCIADO">Divorciado(a)</option>
                </select>
              </div>

              {estadoCivil === 'CASADO' && (
                <div className="col-span-2 bg-indigo-50 p-4 rounded-xl">
                  <label className="label text-indigo-800">Nome do Cônjuge</label>
                  <input name="nomeConjuge" type="text" className="input-field" placeholder="Nome completo do esposo(a)" />
                </div>
              )}
            </div>
          </section>

          {/* Contato e Endereço */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">Contato e Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="label">Whatsapp / Telefone *</label>
                <input name="telefone" type="tel" required className="input-field" placeholder="(11) 99999-9999" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="label">CEP</label>
                <input name="cep" type="text" className="input-field" placeholder="00000-000" />
              </div>

              <div className="col-span-2">
                <label className="label">Endereço (Rua)</label>
                <input name="endereco" type="text" className="input-field" />
              </div>

              <div>
                <label className="label">Número</label>
                <input name="numero" type="text" className="input-field" />
              </div>

              <div>
                <label className="label">Bairro</label>
                <input name="bairro" type="text" className="input-field" />
              </div>

              <div className="col-span-2">
                <label className="label">Ponto de Referência</label>
                <input name="pontoReferencia" type="text" className="input-field" />
              </div>
            </div>
          </section>

          {/* Vida Profissional e Eclesiástica */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-indigo-700 border-b pb-2">Outras Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Escolaridade</label>
                <select name="escolaridade" className="input-field">
                  <option value="">Selecione</option>
                  <option value="FUNDAMENTAL">Ensino Fundamental</option>
                  <option value="MEDIO">Ensino Médio</option>
                  <option value="SUPERIOR">Ensino Superior</option>
                  <option value="POS">Pós-Graduação</option>
                </select>
              </div>

              <div>
                <label className="label">Profissão</label>
                <input name="profissao" type="text" className="input-field" />
              </div>

              <div>
                <label className="label">Data de Conversão</label>
                <input name="dataConversao" type="date" className="input-field" />
              </div>

              <div>
                <label className="label">Data de Batismo</label>
                <input name="dataBatismo" type="date" className="input-field" />
              </div>

              <div className="col-span-2">
                <label className="label">Igreja Anterior (se houver)</label>
                <input name="igrejaAnterior" type="text" className="input-field" />
              </div>
            </div>
          </section>

          {/* Oikos */}
          <section className="space-y-4 bg-yellow-50 p-6 rounded-2xl border border-yellow-100">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-yellow-800">Seus Oikos</h3>
              <p className="text-sm text-yellow-700">Pessoas que você está orando para alcançar.</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="label text-yellow-900">1º Oikos</label>
                <input name="oikos1" type="text" className="input-field border-yellow-200 focus:ring-yellow-500" placeholder="Nome completo" />
              </div>
              <div>
                <label className="label text-yellow-900">2º Oikos</label>
                <input name="oikos2" type="text" className="input-field border-yellow-200 focus:ring-yellow-500" placeholder="Nome completo" />
              </div>
            </div>
          </section>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full btn-primary py-3 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? 'Salvando...' : 'Finalizar Cadastro'}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .label {
          @apply block text-sm font-medium text-gray-700 mb-1;
        }
        .input-field {
          @apply appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm;
        }
        .btn-primary {
          @apply flex justify-center py-2 px-4 border border-transparent rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium;
        }
      `}</style>
    </div>
  )
}
