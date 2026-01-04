import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Part } from '../types';

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAlertParts();
  }, []);

  const fetchAlertParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*');

      if (error) throw error;
      if (data) setParts(data as any);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const alertParts = useMemo(() => {
    return parts.filter(p => p.quantity <= (p.min_quantity || 0))
      .sort((a, b) => {
        if (a.quantity === 0 && b.quantity !== 0) return -1;
        if (a.quantity !== 0 && b.quantity === 0) return 1;
        return a.quantity - b.quantity;
      });
  }, [parts]);

  const criticalCount = alertParts.filter(p => p.quantity === 0).length;
  const lowStockCount = alertParts.filter(p => p.quantity > 0).length;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkBuy = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds).join(',');
    navigate(`/requests?partIds=${ids}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl font-display relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-[40px] fill">emergency</span>
            Alertas de Reposição
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Monitoramento em tempo real de itens que atingiram o ponto de ressuprimento ou estão indisponíveis.
          </p>
        </div>
      </div>

      {/* Floating Bulk Action */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
          <button
            onClick={handleBulkBuy}
            className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 font-black uppercase tracking-wider transform transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined">shopping_cart_checkout</span>
            Solicitar Selecionados ({selectedIds.size})
          </button>
        </div>
      )}

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
            <span className="material-symbols-outlined text-[14px]">emergency</span> Estoque zerado, requer ação imediata
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
            <span className="material-symbols-outlined text-[14px]">emergency</span> Itens abaixo da quantidade mínima
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4 pb-24">
        {alertParts.length > 0 ? (
          alertParts.map((part) => (
            <div
              key={part.id}
              className={`bg-white dark:bg-surface-dark rounded-2xl border transition-all overflow-hidden group flex items-stretch ${selectedIds.has(part.id)
                ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
            >
              {/* Checkbox Overlay/Side */}
              <div
                onClick={() => toggleSelect(part.id)}
                className={`w-14 flex items-center justify-center cursor-pointer transition-colors ${selectedIds.has(part.id) ? 'bg-primary/10 text-primary' : 'bg-slate-50/50 dark:bg-slate-800/30 text-slate-300 hover:bg-slate-100'
                  }`}
              >
                <span className="material-symbols-outlined text-[24px]">
                  {selectedIds.has(part.id) ? 'check_box' : 'check_box_outline_blank'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col lg:flex-row items-center gap-6">
                <div className={`size-16 rounded-2xl flex items-center justify-center shrink-0 ${part.quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                  <span className="material-symbols-outlined text-[32px]">{part.quantity === 0 ? 'dangerous' : 'warning'}</span>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{part.name}</h3>
                    <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{part.sku}</span>
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-x-4 gap-y-1 text-sm">
                    <span className="text-slate-500 font-medium">Categoria: <span className="text-slate-900 dark:text-slate-300 font-bold">{part.category}</span></span>
                    <span className="text-slate-500 font-medium">Local: <span className="text-slate-900 dark:text-slate-300 font-bold">{part.location}</span></span>
                  </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-1 px-6 border-x border-slate-100 dark:border-slate-800 shrink-0">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Estoque Atual</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black ${part.quantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>{part.quantity}</span>
                    <span className="text-slate-400 font-bold">/ {part.min_quantity} {part.unit}</span>
                  </div>
                </div>

                <div className="flex gap-3 shrink-0">
                  <Link
                    to={`/part/${part.id}`}
                    className="h-12 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility</span> Detalhes
                  </Link>
                  <Link
                    to={`/requests?partIds=${part.id}`}
                    className="h-12 px-5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
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
            <p className="text-slate-500 max-w-sm">Não há alertas ativos no momento.</p>
            <button onClick={() => navigate('/inventory')} className="mt-8 text-primary font-bold hover:underline">Voltar ao Inventário Geral</button>
          </div>
        )}
      </div>
    </div>
  );
};


export default Alerts;
