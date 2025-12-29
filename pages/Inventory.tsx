
import React, { useState, useMemo } from 'react';
import { MOCK_PARTS } from '../data';
import InventoryTable from '../components/InventoryTable';

const Inventory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');

  const filteredParts = useMemo(() => {
    return MOCK_PARTS.filter(part => {
      const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        part.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || part.category === categoryFilter;

      let matchesStatus = true;
      if (statusFilter === 'Crítico') matchesStatus = part.quantity === 0;
      else if (statusFilter === 'Baixo Estoque') matchesStatus = part.quantity > 0 && part.quantity <= part.minQuantity;
      else if (statusFilter === 'Em Estoque') matchesStatus = part.quantity > part.minQuantity;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleExportCsv = () => {
    const headers = ['SKU', 'Nome', 'Categoria', 'Quantidade', 'Mínimo', 'Localização', 'Unidade', 'Custo'];
    const csvRows = filteredParts.map(part => [
      part.sku,
      part.name,
      part.category,
      part.quantity,
      part.minQuantity,
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
          <button className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2">
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
    </div>
  );
};

export default Inventory;
