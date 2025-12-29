
import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MOCK_PARTS } from '../data';
import { PartStatus } from '../types';

const Alerts: React.FC = () => {
  const navigate = useNavigate();

  const alertParts = useMemo(() => {
    return MOCK_PARTS.filter(p => p.quantity <= p.minQuantity)
      .sort((a, b) => {
        // Ordenar críticos (0) primeiro
        if (a.quantity === 0 && b.quantity !== 0) return -1;
        if (a.quantity !== 0 && b.quantity === 0) return 1;
        return a.quantity - b.quantity;
      });
  }, []);

  const criticalCount = alertParts.filter(p => p.quantity === 0).length;
  const lowStockCount = alertParts.filter(p => p.quantity > 0).length;

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl font-display">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-[40px] fill">notifications_active</span>
            Alertas de Estoque
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Monitoramento em tempo real de itens que atingiram o ponto de ressuprimento ou estão indisponíveis.
          </p>
        </div>
        <button 
          onClick={() => navigate('/requests')}
          className="h-11 px-6 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span> Nova Requisição Global
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border-l-4 border-l-red-600 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Peças Críticas</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">{criticalCount}</p>
            </div>
            <div className="size-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[30px] fill">error</span>
            </div>
          </div>
          <p className="text-xs text-red-600 font-bold mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">warning</span> Estoque zerado, requer ação imediata
          </p>
        </div>

        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Baixo Estoque</p>
              <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">{lowStockCount}</p>
            </div>
            <div className="size-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[30px] fill">warning</span>
            </div>
          </div>
          <p className="text-xs text-amber-600 font-bold mt-4 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">info</span> Itens abaixo da quantidade mínima de segurança
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {alertParts.length > 0 ? (
          alertParts.map((part) => (
            <div 
              key={part.id} 
              className={`bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden group`}
            >
              <div className="p-5 flex flex-col lg:flex-row items-center gap-6">
                {/* Visual Indicator */}
                <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${part.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <span className="material-symbols-outlined text-[32px]">{part.quantity === 0 ? 'dangerous' : 'history_toggle_off'}</span>
                </div>

                {/* Info */}
                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{part.name}</h3>
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{part.sku}</span>
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500 font-medium">Categoria: <span className="text-slate-900 dark:text-slate-300 font-bold">{part.category}</span></span>
                    <span className="text-slate-500 font-medium">Local: <span className="text-slate-900 dark:text-slate-300 font-bold">{part.location}</span></span>
                    <span className="text-slate-500 font-medium">Fornecedor: <span className="text-slate-900 dark:text-slate-300 font-bold">{part.supplier}</span></span>
                  </div>
                </div>

                {/* Status & Quantity */}
                <div className="flex flex-col items-center lg:items-end gap-1 px-6 border-x border-slate-100 dark:border-slate-800 shrink-0">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estoque Atual</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${part.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>{part.quantity}</span>
                    <span className="text-slate-400 font-bold">/ {part.minQuantity} {part.unit}</span>
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${part.quantity === 0 ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                    {part.quantity === 0 ? 'Status Crítico' : 'Baixo Estoque'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 shrink-0">
                  <Link 
                    to={`/part/${part.id}`}
                    className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility</span> Detalhes
                  </Link>
                  <Link 
                    to={`/requests?partId=${part.id}`}
                    className="h-12 px-5 rounded-xl bg-[#0018a8] text-white font-bold text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_cart</span> Comprar
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center text-center">
            <div className="size-24 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-[48px] fill">check_circle</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Tudo em conformidade!</h2>
            <p className="text-slate-500 max-w-sm">
              Não há alertas ativos no momento. Todas as peças estão com níveis de estoque acima da margem de segurança.
            </p>
            <button 
              onClick={() => navigate('/inventory')}
              className="mt-8 text-primary font-bold hover:underline"
            >
              Voltar ao Inventário Geral
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
