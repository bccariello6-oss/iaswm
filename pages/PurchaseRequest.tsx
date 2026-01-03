import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Part } from '../types';

const PurchaseRequest: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partIdsParam = searchParams.get('partIds');

  const [parts, setParts] = useState<Part[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [items, setItems] = useState<{ part: Part, quantity: number, unit: string }[]>([]);
  const [priority, setPriority] = useState('Normal');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Unidade (UN)');
  const [justification, setJustification] = useState('');
  const [osNumber, setOsNumber] = useState('');
  const [osType, setOsType] = useState('Ordem Corretiva');
  const [usageArea, setUsageArea] = useState('');
  const [projectNumber, setProjectNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParts();
  }, []);

  useEffect(() => {
    if (parts.length > 0 && partIdsParam) {
      const ids = partIdsParam.split(',');
      const selected = parts.filter(p => ids.includes(p.id));
      const initialItems = selected.map(p => ({
        part: p,
        quantity: 1, // Default quantity for bulk selects
        unit: p.unit || 'Unidade (UN)'
      }));
      setItems(initialItems);
    }
  }, [parts, partIdsParam]);

  const fetchParts = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      if (data) setParts(data as any);
    } catch (error) {
      console.error('Error fetching parts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!selectedPartId) return;
    const part = parts.find(p => p.id === selectedPartId);
    if (!part) return;

    // Check if item already exists
    if (items.some(i => i.part.id === part.id)) {
      alert('Esta peça já foi adicionada à lista.');
      return;
    }

    setItems([...items, { part, quantity, unit }]);
    setSelectedPartId('');
    setQuantity(1);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Sua lista de peças está vazia.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const requests = items.map(item => ({
        part_id: item.part.id,
        part_name: item.part.name,
        sku: item.part.sku,
        quantity: item.quantity,
        unit: item.unit,
        priority,
        justification,
        user_id: user?.id,
        status: 'Pendente',
        os_number: osNumber,
        os_type: osType,
        usage_area: usageArea,
        project_number: osType === 'Projeto' ? projectNumber : null
      }));

      const { error } = await supabase
        .from('purchase_requests')
        .insert(requests);

      if (error) throw error;

      // Create notification summary
      const message = items.length === 1
        ? `Solicitação de ${items[0].part.name} (OS: ${osNumber || 'N/A'}) enviada.`
        : `Solicitação em lote de ${items.length} itens (OS: ${osNumber || 'N/A'}) enviada.`;

      await supabase.from('notifications').insert({
        title: items.length === 1 ? 'Nova Requisição' : 'Nova Requisição em Lote',
        message: message,
        type: priority === 'Urgente' ? 'critical' : 'info',
        user_id: user?.id
      });

      alert('Requisição enviada com sucesso!');
      navigate('/requests');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      alert('Erro ao enviar requisição. Verifique se as colunas de OS foram adicionadas ao banco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Requisição de Materiais</h1>
        <p className="text-slate-500">Reposição de itens e solicitação de novos insumos para manutenção.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* OS Details */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary">assignment</span> Ordem de Serviço (OS)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Número da OS</label>
                <input
                  type="text"
                  value={osNumber}
                  onChange={(e) => setOsNumber(e.target.value)}
                  placeholder="Ex: OS-2024-001"
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Tipo de Intervenção</label>
                <select
                  value={osType}
                  onChange={(e) => setOsType(e.target.value)}
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                >
                  <option>Ordem Corretiva</option>
                  <option>Preventiva</option>
                  <option>Corretiva Não Planejada</option>
                  <option>Melhoria</option>
                  <option>Projeto</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Área de Aplicação</label>
                <select
                  value={usageArea}
                  onChange={(e) => setUsageArea(e.target.value)}
                  required
                  className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                >
                  <option value="">Selecione a área onde o item será aplicado...</option>
                  <option>Caldeira</option>
                  <option>ETE</option>
                  <option>ETA</option>
                  <option>Preparo de Massa</option>
                  <option>MP01</option>
                  <option>MP03</option>
                  <option>MP06</option>
                  <option>Oficina Mecânica</option>
                  <option>Oficina Elétrica</option>
                  <option>Subestação</option>
                  <option>Compressores</option>
                </select>
              </div>

              {osType === 'Projeto' && (
                <div className="md:col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black text-primary">Número do Projeto (Obrigatório para Projetos)</label>
                  <input
                    type="text"
                    value={projectNumber}
                    onChange={(e) => setProjectNumber(e.target.value)}
                    placeholder="Ex: PRJ-2024-XPTO"
                    required
                    className="w-full h-12 rounded-xl border-2 border-primary bg-primary/5 px-4 text-sm font-bold focus:ring-primary"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Item Selector */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary">add_shopping_cart</span> Selecionar Peças
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-6">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Peça</label>
                  <select
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                    value={selectedPartId}
                    onChange={(e) => setSelectedPartId(e.target.value)}
                  >
                    <option value="">Selecione para adicionar...</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Qtd</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center text-sm"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedPartId}
                    className="w-full h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Items Table */}
              {items.length > 0 && (
                <div className="mt-8 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                        <th className="px-4 py-3">Item</th>
                        <th className="px-4 py-3 text-center">Qtd</th>
                        <th className="px-4 py-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {items.map((item, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-700 dark:text-slate-200">{item.part.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{item.part.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">{item.quantity} {item.unit}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeItem(idx)}
                              className="size-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Justification & Submission */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary">edit_note</span> Observações e Envio
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Baixa', 'Normal', 'Urgente'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`p-4 rounded-xl border text-center transition-all ${priority === p
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

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Justificativa</label>
                <textarea
                  className="w-full h-32 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm focus:ring-primary"
                  placeholder="Explique a necessidade dos materiais..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-900">Cancelar</button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || items.length === 0}
                  className="px-10 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                  {isSubmitting ? 'Enviando...' : 'Finalizar Requisição'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 dark:text-white mb-4">Informações Importantes</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span>A <strong>OS</strong> é obrigatória para rastreabilidade do custo por ativo.</span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
                <span>Requisições <strong>Urgentes</strong> são enviadas imediatamente para aprovação da gerência.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequest;
