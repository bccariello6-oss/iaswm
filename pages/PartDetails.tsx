import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Part, Movement } from '../types';

const PartDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('history');
  const [part, setPart] = useState<Part | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ quantity: 0, cost: 0, location: '' });

  useEffect(() => {
    if (id) {
      fetchPartData();
    }
  }, [id]);

  const fetchPartData = async () => {
    try {
      setLoading(true);
      const { data: partData, error: partError } = await supabase
        .from('parts')
        .select('*')
        .eq('id', id)
        .single();

      if (partError) throw partError;
      setPart(partData as any);
      setEditData({
        quantity: partData.quantity,
        cost: partData.cost,
        location: partData.location || ''
      });

      const { data: moveData, error: moveError } = await supabase
        .from('movements')
        .select('*')
        .eq('part_id', id)
        .order('created_at', { ascending: false });

      if (moveError) throw moveError;
      setMovements(moveData.map(m => ({
        ...m,
        date: new Date(m.created_at).toLocaleDateString('pt-BR')
      })) as any);

    } catch (error) {
      console.error('Error fetching part details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { error } = await supabase
        .from('parts')
        .update({
          quantity: editData.quantity,
          cost: editData.cost,
          location: editData.location
        })
        .eq('id', id);

      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();

      // Log movement if quantity changed
      if (part && editData.quantity !== part.quantity) {
        await supabase.from('movements').insert({
          part_id: id,
          type: editData.quantity > part.quantity ? 'Entrada' : 'Saída',
          quantity: Math.abs(editData.quantity - part.quantity),
          responsible: 'Sistema',
          ref: 'Ajuste Manual'
        });

        // Trigger Notification for Low Stock
        if (editData.quantity === 0) {
          await supabase.from('notifications').insert({
            title: 'Peça Zerada!',
            message: `O estoque de ${part.name} chegou a zero.`,
            type: 'critical',
            user_id: user?.id
          });
        } else if (editData.quantity <= (part.min_quantity || 0)) {
          await supabase.from('notifications').insert({
            title: 'Estoque Baixo',
            message: `A peça ${part.name} atingiu o nível crítico (${editData.quantity}).`,
            type: 'warning',
            user_id: user?.id
          });
        }
      }

      alert('Dados atualizados!');
      setIsEditing(false);
      fetchPartData();
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${(part.quantity || 0) > (part.min_quantity || 0) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {(part.quantity || 0) > 0 ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          <p className="text-slate-500">
            SKU: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{part.sku}</span> | Categoria: <span className="font-medium text-slate-700 dark:text-slate-300">{part.category}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">{isEditing ? 'close' : 'edit'}</span> {isEditing ? 'Cancelar' : 'Editar Peça'}
          </button>
          <Link to="/requests" className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span> Solicitar Compra
          </Link>
        </div>
      </div>

      {isEditing && (
        <div className="mb-8 p-6 bg-primary/5 rounded-2xl border border-primary/20 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-2">Quantidade em Estoque</label>
            <input
              type="number"
              className="w-full h-11 px-4 rounded-xl border-primary/20 bg-white focus:ring-primary"
              value={editData.quantity}
              onChange={(e) => setEditData({ ...editData, quantity: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-primary uppercase mb-2">Custo Unitário (R$)</label>
            <input
              type="number"
              step="0.01"
              className="w-full h-11 px-4 rounded-xl border-primary/20 bg-white focus:ring-primary"
              value={editData.cost}
              onChange={(e) => setEditData({ ...editData, cost: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex flex-col justify-end gap-3 md:flex-row md:items-end">
            <button
              onClick={handleUpdate}
              className="h-11 px-8 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Estoque Atual</p>
            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.quantity} <span className="text-base font-normal text-slate-400">{part.unit?.toLowerCase() || 'un'}.</span></p>
          <p className="text-xs font-bold text-amber-600 mt-2">Mínimo: {part.min_quantity}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Custo Unitário</p>
            <div className="size-8 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {parseFloat(part.cost as any || 0).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-slate-400 mt-2">Investimento: R$ {(parseFloat(part.cost as any || 0) * (part.quantity || 0)).toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Localização</p>
            <div className="size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.location || 'N/A'}</p>
          <p className="text-xs text-slate-400 mt-2">Almoxarifado Central</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500">Lead Time</p>
            <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">schedule</span>
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{part.lead_time || 0} <span className="text-base font-normal text-slate-400">dias</span></p>
          <p className="text-xs text-slate-400 mt-2">{part.supplier || 'Não informado'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Image & Specs */}
        <div className="flex flex-col gap-6">
          {/* Product Image */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm aspect-square group">
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundImage: `url("${part.image_url || 'https://picsum.photos/seed/' + part.id + '/600/600'}")` }}
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
                <span className="font-bold text-slate-700 dark:text-slate-200">{part.manufacturer || '-'}</span>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <span className="text-slate-500">Modelo</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">{part.model || '-'}</span>
              </div>
              {part.specs && Object.entries(part.specs).map(([key, val]) => (
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
                          <td className="py-4 text-right font-bold text-primary">{move.ref || '-'}</td>
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
