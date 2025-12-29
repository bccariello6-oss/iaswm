
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_PARTS, MOCK_MOVEMENTS } from '../data';

const PartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('history');
  
  const part = useMemo(() => MOCK_PARTS.find(p => p.id === id), [id]);
  const movements = useMemo(() => MOCK_MOVEMENTS.filter(m => m.partId === id), [id]);

  if (!part) {
    return <div className="p-10 text-center">Peça não encontrada.</div>;
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 mb-8 text-sm text-slate-500">
        <Link to="/inventory" className="hover:text-primary transition-colors">Inventário</Link>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-slate-400">{part.category}</span>
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        <span className="text-slate-900 dark:text-white font-bold">{part.name}</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{part.name}</h1>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${part.quantity > part.minQuantity ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {part.quantity > 0 ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          <p className="text-slate-500">
            SKU: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{part.sku}</span> | Categoria: <span className="font-medium text-slate-700 dark:text-slate-300">{part.category}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-50 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">edit</span> Editar Peça
          </button>
          <button className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span> Solicitar Compra
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm font-medium text-slate-500">Estoque Atual</p>
             <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
               <span className="material-symbols-outlined text-[18px]">inventory_2</span>
             </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.quantity} <span className="text-base font-normal text-slate-400">{part.unit.toLowerCase()}.</span></p>
          <p className="text-xs font-bold text-amber-600 mt-2">Mínimo: {part.minQuantity}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm font-medium text-slate-500">Custo Unitário</p>
             <div className="size-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
               <span className="material-symbols-outlined text-[18px]">payments</span>
             </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {part.cost.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-2">Investimento: R$ {(part.cost * part.quantity).toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm font-medium text-slate-500">Localização</p>
             <div className="size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
               <span className="material-symbols-outlined text-[18px]">location_on</span>
             </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.location}</p>
          <p className="text-xs text-slate-400 mt-2">Almoxarifado Central</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
             <p className="text-sm font-medium text-slate-500">Lead Time</p>
             <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
               <span className="material-symbols-outlined text-[18px]">schedule</span>
             </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.leadTime} <span className="text-base font-normal text-slate-400">dias</span></p>
          <p className="text-xs text-slate-400 mt-2">{part.supplier}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Image & Specs */}
        <div className="flex flex-col gap-6">
          {/* Product Image */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm aspect-square group">
            <div 
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url("${part.imageUrl || 'https://picsum.photos/seed/' + part.id + '/600/600'}")` }}
            />
          </div>

          {/* Specifications */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">tune</span> Especificações
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
               <div className="py-3 flex justify-between text-sm">
                  <span className="text-slate-500">Fabricante</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{part.manufacturer}</span>
               </div>
               <div className="py-3 flex justify-between text-sm">
                  <span className="text-slate-500">Modelo</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{part.model}</span>
               </div>
               {Object.entries(part.specs).map(([key, val]) => (
                  <div key={key} className="py-3 flex justify-between text-sm">
                    <span className="text-slate-500">{key}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{val}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Right: History & Tabs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
            <div className="flex border-b border-slate-100 dark:border-slate-800">
               <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'history' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 Histórico de Uso
               </button>
               <button 
                  onClick={() => setActiveTab('docs')}
                  className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'docs' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 Documentos
               </button>
            </div>

            <div className="p-6 flex-1">
              {activeTab === 'history' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-slate-500 font-medium border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="pb-3">Data</th>
                        <th className="pb-3">Tipo</th>
                        <th className="pb-3">Qtd</th>
                        <th className="pb-3">Responsável</th>
                        <th className="pb-3 text-right">Referência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {movements.length > 0 ? movements.map(move => (
                        <tr key={move.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 text-slate-600 dark:text-slate-300">{move.date}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[10px] uppercase ${move.type === 'Entrada' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              <span className="material-symbols-outlined text-[14px]">{move.type === 'Entrada' ? 'arrow_upward' : 'arrow_downward'}</span>
                              {move.type}
                            </span>
                          </td>
                          <td className="py-4 font-bold">{move.type === 'Entrada' ? '+' : '-'}{move.quantity}</td>
                          <td className="py-4 text-slate-600 dark:text-slate-300">{move.responsible}</td>
                          <td className="py-4 text-right font-bold text-primary">{move.ref}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400">Nenhuma movimentação registrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer group">
                    <div className="size-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Manual Técnico.pdf</p>
                      <p className="text-xs text-slate-400">2.4 MB · PDF</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-primary transition-colors cursor-pointer group">
                    <div className="size-10 rounded-lg bg-blue-100 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">Certificado Garantia.docx</p>
                      <p className="text-xs text-slate-400">145 KB · DOCX</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartDetails;
