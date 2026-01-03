import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Part } from '../types';
import InventoryTable from '../components/InventoryTable';

const Inventory: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Mecânica',
    quantity: 0,
    min_quantity: 1,
    location: '',
    unit: 'UN',
    cost: 0,
    manufacturer: '',
    model: '',
    supplier: ''
  });

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, sku, category, quantity, unit, location, min_quantity, image_url, cost')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setParts(data as any);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('parts')
        .insert([formData]);

      if (error) throw error;

      alert('Peça adicionada com sucesso!');
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        sku: '',
        category: 'Mecânica',
        quantity: 0,
        min_quantity: 1,
        location: '',
        unit: 'UN',
        cost: 0,
        manufacturer: '',
        model: '',
        supplier: ''
      });
      fetchParts();
    } catch (error: any) {
      alert('Erro ao adicionar peça: ' + error.message);
    }
  };

  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || part.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'Crítico') matchesStatus = part.quantity === 0;
      else if (statusFilter === 'Baixo Estoque') matchesStatus = (part.quantity || 0) > 0 && (part.quantity || 0) <= (part.min_quantity || 0);
      else if (statusFilter === 'Em Estoque') matchesStatus = (part.quantity || 0) > (part.min_quantity || 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [parts, searchTerm, categoryFilter, statusFilter]);

  const handleExportCsv = () => {
    const headers = ['SKU', 'Nome', 'Categoria', 'Quantidade', 'Mínimo', 'Localização', 'Unidade', 'Custo'];
    const csvRows = filteredParts.map(part => [
      part.sku,
      part.name,
      part.category,
      part.quantity,
      part.min_quantity,
      part.location,
      part.unit,
      part.cost
    ].join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventario_swm_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && parts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Inventário de Peças</h1>
          <p className="text-slate-500 max-w-2xl mt-2">Gerencie o estoque de sobressalentes, monitore movimentações e acompanhe os níveis críticos de reposição.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCsv}
            className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span> Exportar
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span> Adicionar Peça
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-surface-dark p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined">search</span>
          <input
            type="text"
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary focus:border-primary transition-all"
            placeholder="Buscar por nome, código ou fabricante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-primary"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Status: Todos</option>
            <option>Em Estoque</option>
            <option>Baixo Estoque</option>
            <option>Crítico</option>
          </select>
          <select
            className="h-11 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-primary"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option>Categoria: Todas</option>
            <option>Mecânica</option>
            <option>Elétrica</option>
            <option>Hidráulica</option>
            <option>Lubrificantes</option>
            <option>Transmissão</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <InventoryTable parts={filteredParts} />

      {/* Pagination Placeholder */}
      <div className="mt-6 flex items-center justify-between px-2">
        <p className="text-xs text-slate-500">Mostrando <span className="font-bold text-slate-900 dark:text-white">{filteredParts.length}</span> resultados</p>
        <div className="flex gap-2">
          <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 disabled:opacity-50"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
          <button className="size-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
          <button className="size-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
        </div>
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-surface-dark z-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Nova Peça</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddPart} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nome da Peça</label>
                  <input
                    type="text"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">SKU / Código</label>
                  <input
                    type="text"
                    required
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Categoria</label>
                  <select
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Mecânica</option>
                    <option>Elétrica</option>
                    <option>Hidráulica</option>
                    <option>Lubrificantes</option>
                    <option>Transmissão</option>
                    <option>Insumos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Localização</label>
                  <input
                    type="text"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quantidade Inicial</label>
                  <input
                    type="number"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.min_quantity}
                    onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Unidade</label>
                  <select
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    <option>UN</option>
                    <option>L</option>
                    <option>KG</option>
                    <option>CX</option>
                    <option>MT</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-10 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Salvar Peça
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
