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
  const [editData, setEditData] = useState({
    name: '',
    sku: '',
    category: '',
    cost: 0,
    location: '',
    lead_time: 0,
    supplier: '',
    image_url: ''
  });
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

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
        name: partData.name,
        sku: partData.sku,
        category: partData.category,
        cost: partData.cost,
        location: partData.location || '',
        lead_time: partData.lead_time || 0,
        supplier: partData.supplier || '',
        image_url: partData.image_url || ''
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

      // Fetch Price History
      const { data: priceData } = await supabase
        .from('price_history')
        .select('*')
        .eq('part_id', id)
        .order('created_at', { ascending: false });

      if (priceData) setPriceHistory(priceData);

    } catch (error) {
      console.error('Error fetching part details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      // Check for price change
      if (part && editData.cost !== part.cost) {
        await supabase.from('price_history').insert({
          part_id: id,
          old_price: part.cost,
          new_price: editData.cost,
          user_id: authUser?.id
        });
      }

      const { error } = await supabase
        .from('parts')
        .update({
          name: editData.name,
          sku: editData.sku,
          category: editData.category,
          cost: editData.cost,
          location: editData.location,
          lead_time: editData.lead_time,
          supplier: editData.supplier,
          image_url: editData.image_url
        })
        .eq('id', id);

      if (error) throw error;

      alert('Dados atualizados com sucesso!');
      setIsEditing(false);
      fetchPartData();
    } catch (error: any) {
      alert('Erro ao atualizar: ' + error.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('part-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('part-images')
        .getPublicUrl(filePath);

      setEditData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: any) {
      alert('Erro ao carregar imagem: ' + error.message);
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
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{part.name}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${part.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {part.quantity > 0 ? 'Disponível' : 'Indisponível'}
              </span>
            </div>
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
        <div className="mb-8 p-8 bg-white dark:bg-surface-dark rounded-2xl border border-primary/20 shadow-xl space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Nome do Material</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">SKU / Código</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.sku}
                    onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Localização</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.location}
                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary font-bold text-primary"
                    value={editData.cost}
                    onChange={(e) => setEditData({ ...editData, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Fornecedor</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.supplier}
                    onChange={(e) => setEditData({ ...editData, supplier: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Lead Time (Dias)</label>
                  <input
                    type="number"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-primary"
                    value={editData.lead_time}
                    onChange={(e) => setEditData({ ...editData, lead_time: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              <div className="size-40 rounded-2xl overflow-hidden mb-4 bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative group">
                {editData.image_url ? (
                  <img src={editData.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-slate-300 text-5xl">image</span>
                )}
                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs uppercase tracking-widest">
                  Alterar Foto
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Clique para alterar a imagem</p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleUpdate}
              className="h-12 px-10 rounded-xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all"
            >
              Confirmar Alterações
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
          {/* Product Image */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm aspect-square group relative flex items-center justify-center bg-slate-100 dark:bg-slate-900">
            {part.image_url ? (
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{ backgroundImage: `url("${part.image_url}")` }}
              />
            ) : (
              <span className="material-symbols-outlined text-slate-300 text-6xl">image</span>
            )}
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
                onClick={() => setActiveTab('price')}
                className={`px-6 py-4 text-sm font-bold transition-all ${activeTab === 'price' ? 'border-b-2 border-primary text-primary bg-primary/5' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                Histórico de Preços
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
                        <th className="pb-3 text-center">Qtd</th>
                        <th className="pb-3">Responsável</th>
                        <th className="pb-3 text-right">Referência</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {movements.length > 0 ? movements.map(move => (
                        <tr key={move.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 text-slate-600 dark:text-slate-300">{move.date}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase ${move.type === 'Entrada' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              <span className="material-symbols-outlined text-[14px]">{move.type === 'Entrada' ? 'arrow_upward' : 'arrow_downward'}</span>
                              {move.type}
                            </span>
                          </td>
                          <td className="py-4 font-black text-center">{move.type === 'Entrada' ? '+' : '-'}{move.quantity}</td>
                          <td className="py-4 text-slate-600 dark:text-slate-300 font-medium">{move.responsible}</td>
                          <td className="py-4 text-right font-black text-primary">{move.ref || '-'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={5} className="py-10 text-center text-slate-400">Nenhuma movimentação registrada.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : activeTab === 'price' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="text-slate-500 font-medium border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="pb-3">Data de Alteração</th>
                        <th className="pb-3">Preço Anterior</th>
                        <th className="pb-3">Novo Preço</th>
                        <th className="pb-3 text-right">Variação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {priceHistory.length > 0 ? priceHistory.map(price => {
                        const variation = price.old_price ? (((price.new_price - price.old_price) / price.old_price) * 100).toFixed(1) : 'N/A';
                        return (
                          <tr key={price.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-4 text-slate-600 dark:text-slate-300">
                              {new Date(price.created_at).toLocaleString('pt-BR')}
                            </td>
                            <td className="py-4 text-slate-400">R$ {parseFloat(price.old_price || 0).toLocaleString('pt-BR')}</td>
                            <td className="py-4 font-black text-slate-900 dark:text-white">R$ {parseFloat(price.new_price).toLocaleString('pt-BR')}</td>
                            <td className="py-4 text-right">
                              <span className={`font-black ${parseFloat(variation) > 0 ? 'text-red-500' : parseFloat(variation) < 0 ? 'text-green-500' : 'text-slate-400'}`}>
                                {variation !== 'N/A' ? `${parseFloat(variation) > 0 ? '+' : ''}${variation}%` : '-'}
                              </span>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan={4} className="py-10 text-center text-slate-400">Nenhum histórico de preço disponível.</td></tr>
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
