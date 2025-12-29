
import React, { useState } from 'react';
import { MOCK_PARTS, MOCK_REQUESTS } from '../data';

const PurchaseRequest: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState('');
  const [priority, setPriority] = useState('Normal');
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Nova Requisição</h1>
        <p className="text-slate-500">Solicite a reposição de itens ou novos materiais para manutenção.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-8 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
          <form className="space-y-8">
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="material-symbols-outlined text-primary">shopping_cart</span> Detalhes do Item
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Selecione a Peça</label>
                  <select 
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={selectedPart}
                    onChange={(e) => setSelectedPart(e.target.value)}
                  >
                    <option value="">Pesquise por nome, SKU ou código...</option>
                    {MOCK_PARTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quantidade</label>
                    <div className="flex">
                      <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="size-12 rounded-l-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">-</button>
                      <input type="number" value={quantity} readOnly className="h-12 w-full text-center border-y border-slate-200 dark:border-slate-700 bg-transparent text-sm" />
                      <button type="button" onClick={() => setQuantity(quantity + 1)} className="size-12 rounded-r-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Unidade</label>
                    <select className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
                      <option>Unidade (UN)</option>
                      <option>Litros (L)</option>
                      <option>Caixa (CX)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="material-symbols-outlined text-primary">priority_high</span> Prioridade
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Baixa', 'Normal', 'Urgente'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      priority === p 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary font-bold' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-primary'
                    }`}
                  >
                    <span className={`material-symbols-outlined mb-1 block ${p === 'Urgente' ? 'text-red-500' : p === 'Normal' ? 'text-primary' : 'text-green-500'}`}>
                      {p === 'Urgente' ? 'emergency' : p === 'Normal' ? 'assignment' : 'low_priority'}
                    </span>
                    <span className="text-sm block">{p}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Justificativa / Observações</label>
              <textarea 
                className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm focus:ring-primary"
                placeholder="Descreva o motivo da compra e onde será utilizado..."
              />
            </section>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button type="button" className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900 transition-colors">Cancelar</button>
              <button type="button" className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">send</span> Enviar Requisição
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Requisições Pendentes</h3>
            <div className="space-y-4">
              {MOCK_REQUESTS.map(req => (
                <div key={req.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-1 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{req.partName}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{req.status}</span>
                  </div>
                  <p className="text-xs text-slate-500">#{req.id} • {req.date}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex flex-col items-center text-center">
             <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center mb-4">
               <span className="material-symbols-outlined">help</span>
             </div>
             <h4 className="font-bold text-slate-900 dark:text-white mb-1">Dúvidas com o SKU?</h4>
             <p className="text-xs text-slate-500 mb-4">Entre em contato direto com a equipe de suprimentos.</p>
             <button className="text-xs font-bold text-primary hover:underline">Falar com Almoxarifado</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequest;
