import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Part } from '../types';
import InventoryTable from '../components/InventoryTable';
import * as XLSX from 'xlsx';

const Inventory: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Pagination & Sorting State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'name',
    direction: 'asc'
  });

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
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchParts();
  }, [searchTerm, categoryFilter, statusFilter, currentPage, sortConfig]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.rpc('get_unique_categories');
      if (error) {
        // Fallback if RPC doesn't exist yet
        const { data: fallbackData } = await supabase.from('parts').select('category');
        if (fallbackData) {
          const uniqueCats = Array.from(new Set(fallbackData.map(p => p.category))).sort();
          setCategories(uniqueCats);
        }
      } else if (data) {
        setCategories(data.map((c: any) => c.category).sort());
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchParts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('parts')
        .select('id, name, sku, category, quantity, unit, location, min_quantity, image_url, cost', { count: 'exact' });

      // Search
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,manufacturer.ilike.%${searchTerm}%`);
      }

      // Filters
      if (categoryFilter !== 'Todas') {
        query = query.eq('category', categoryFilter);
      }

      if (statusFilter !== 'Todos') {
        if (statusFilter === 'Crítico') query = query.eq('quantity', 0);
        // Note: Server-side 'Baixo Estoque' and 'Em Estoque' filters require DB functions.
        // Client-side filtering is applied in filteredParts useMemo.
      }

      // Sorting
      query = query.order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });

      // Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      if (data) setParts(data as any);
      if (count !== null) setTotalCount(count);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      let image_url = '';

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('part-images')
          .upload(filePath, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('part-images')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const { error } = await supabase
        .from('parts')
        .insert([{ ...formData, image_url }]);

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
      setSelectedFile(null);
      setImagePreview(null);
      fetchParts();
    } catch (error: any) {
      alert('Erro ao adicionar peça: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];

          // Skip row 0 (title) and start from row 1 (headers)
          const data = XLSX.utils.sheet_to_json(ws, { range: 1 });

          if (data.length === 0) {
            alert('O arquivo está vazio ou não contém dados válidos a partir da segunda linha.');
            return;
          }

          // Map and validate columns (DE/PARA)
          const rawParts = data.map((row: any) => ({
            name: row.Descrição || row.Nome || row.name || '',
            sku: String(row.Item || row.SKU || row.sku || row.Código || ''),
            category: row.Categoria || row.category || 'Mecânica',
            quantity: parseInt(row.Quantidade || row.quantity || 0),
            min_quantity: parseInt(row['Qtde. Mínima'] || row.Mínimo || row.min_quantity || 1),
            location: row.Subinventário || row.Localização || row.location || '',
            unit: row['Unidade de Medida'] || row.Unidade || row.unit || 'UN',
            cost: parseFloat(row['Custo Unitário Padrão'] || row.Custo || row.cost || 0),
            manufacturer: row.Fabricante || row.manufacturer || '',
            model: row.Modelo || row.model || '',
            supplier: row.Fornecedor || row.supplier || ''
          })).filter(p => p.name && p.sku);

          // Deduplicate within the file to avoid "ON CONFLICT" errors in the same batch
          const uniquePartsMap = new Map();
          rawParts.forEach(p => uniquePartsMap.set(p.sku, p));
          const formattedParts = Array.from(uniquePartsMap.values());

          if (formattedParts.length === 0) {
            alert('Não foram encontrados itens válidos. Verifique os nomes das colunas (Nome, SKU, etc).');
            return;
          }

          // Process in chunks to avoid timeouts and handle upsert
          const CHUNK_SIZE = 500;
          let successCount = 0;

          for (let i = 0; i < formattedParts.length; i += CHUNK_SIZE) {
            const chunk = formattedParts.slice(i, i + CHUNK_SIZE);
            const { error } = await supabase
              .from('parts')
              .upsert(chunk, { onConflict: 'sku' });

            if (error) {
              console.error(`Erro no lote ${Math.floor(i / CHUNK_SIZE) + 1}:`, error);
              throw new Error(`Erro ao salvar lote: ${error.message}`);
            }
            successCount += chunk.length;
          }

          alert(`${successCount} itens processados com sucesso! (Novos ou Atualizados)`);
          setIsImportModalOpen(false);
          fetchParts();
        } catch (err: any) {
          console.error('Erro ao processar Excel:', err);
          alert('Erro ao processar arquivo: ' + err.message);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      alert('Erro na leitura do arquivo: ' + error.message);
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const handleUpdatePart = async (partId: string, field: 'quantity' | 'min_quantity', newValue: number) => {
    try {
      const { error } = await supabase
        .from('parts')
        .update({ [field]: newValue })
        .eq('id', partId);

      if (error) throw error;

      // Update local state immediately for optimistic UI
      setParts(prevParts =>
        prevParts.map(p => p.id === partId ? { ...p, [field]: newValue } : p)
      );
    } catch (error) {
      console.error('Error updating part:', error);
      throw error;
    }
  };

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
            onClick={() => setIsImportModalOpen(true)}
            className="h-11 px-5 rounded-xl border border-primary/20 bg-primary/5 font-bold text-sm text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">file_upload</span> Importar (DE/PARA)
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="h-11 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-primary"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Todos">Status: Todos</option>
            <option value="Em Estoque">Em Estoque</option>
            <option value="Baixo Estoque">Baixo Estoque</option>
            <option value="Crítico">Crítico</option>
          </select>
          <select
            className="h-11 pl-4 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-primary"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="Todas">Categoria: Todas</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            onClick={handleExportCsv}
            className="h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span> Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <InventoryTable
        parts={parts}
        sortConfig={sortConfig}
        onSort={(column) => {
          setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc'
          }));
          setCurrentPage(1);
        }}
        onUpdatePart={handleUpdatePart}
      />

      {/* Pagination */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 px-2">
        <p className="text-xs text-slate-500">
          Mostrando <span className="font-bold text-slate-900 dark:text-white">{parts.length ? (currentPage - 1) * pageSize + 1 : 0}</span> até <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * pageSize, totalCount)}</span> de <span className="font-bold text-slate-900 dark:text-white">{totalCount}</span> resultados
        </p>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="size-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <div className="flex items-center gap-1">
            {/* Simple range logic for pagination */}
            {Array.from({ length: Math.min(5, Math.ceil(totalCount / pageSize)) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`size-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'}`}
                >
                  {pageNum}
                </button>
              );
            })}
            {Math.ceil(totalCount / pageSize) > 5 && <span className="text-slate-400 px-1">...</span>}
          </div>

          <button
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="size-8 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
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
                    <option>Civil</option>
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Foto da Peça</label>
                  <div className="flex items-center gap-4">
                    <div className="size-20 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-slate-300">image</span>
                      )}
                    </div>
                    <label className="flex-1">
                      <div className="h-11 px-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-sm">upload</span>
                        <span className="text-xs font-bold uppercase">Selecionar Foto</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
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
                  disabled={uploading}
                  className="px-10 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? <span className="material-symbols-outlined animate-spin text-[18px]">sync</span> : null}
                  {uploading ? 'Salvando...' : 'Salvar Peça'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Importar Planilha (DE/PARA)</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">info</span> Colunas Necessárias:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['SKU', 'Nome', 'Categoria', 'Quantidade', 'Mínimo', 'Localização', 'Unidade', 'Custo', 'Fabricante', 'Modelo', 'Fornecedor'].map(col => (
                    <div key={col} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-bold">
                      <span className="size-1 rounded-full bg-primary/40"></span> {col}
                    </div>
                  ))}
                </div>
              </div>

              <label className="block group">
                <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3 cursor-pointer group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-all">
                  <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">{uploading ? 'sync' : 'upload_file'}</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{uploading ? 'Processando arquivo...' : 'Clique para selecionar Excel'}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Formatos aceitos: .xlsx, .xls</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelImport}
                  disabled={uploading}
                />
              </label>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-900 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
