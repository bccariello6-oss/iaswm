import React, { useState } from 'react';
import { Part, PartStatus } from '../types';
import { useNavigate } from 'react-router-dom';

interface InventoryTableProps {
  parts: Part[];
  sortConfig?: { column: string; direction: 'asc' | 'desc' };
  onSort?: (column: string) => void;
  onUpdatePart?: (partId: string, field: 'quantity' | 'min_quantity', newValue: number) => Promise<void>;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ parts, sortConfig, onSort, onUpdatePart }) => {
  const navigate = useNavigate();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'quantity' | 'min_quantity' | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const getStatusInfo = (part: Part) => {
    if (part.quantity === 0) return { label: PartStatus.CRITICAL, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500', pulse: true };
    if (part.quantity <= part.min_quantity) return { label: PartStatus.LOW_STOCK, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50', pulse: false };
    return { label: PartStatus.IN_STOCK, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', pulse: false };
  };

  const handleStartEdit = (part: Part, field: 'quantity' | 'min_quantity', e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(part.id);
    setEditingField(field);
    setEditValue(field === 'quantity' ? part.quantity : part.min_quantity);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingField(null);
    setEditValue(0);
  };

  const handleSave = async (partId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdatePart || !editingField) return;

    setSaving(true);
    try {
      await onUpdatePart(partId, editingField, editValue);
      setEditingId(null);
      setEditingField(null);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Foto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome/Código</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qtd</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Localização</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Mínimo</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {parts.map((part) => {
              const status = getStatusInfo(part);
              return (
                <tr
                  key={part.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/part/${part.id}`)}
                >
                  <td className="px-6 py-4" onClick={(e) => {
                    e.stopPropagation();
                    if (part.image_url) setZoomedImage(part.image_url);
                  }}>
                    <div className={`size-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center ${part.image_url ? 'cursor-zoom-in hover:scale-110' : ''} transition-transform group-hover:border-primary/50`}>
                      {part.image_url ? (
                        <img
                          src={part.image_url}
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-slate-400 text-2xl">image</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{part.name}</span>
                      {part.sku && part.sku !== part.name && (
                        <span className="text-xs text-slate-500">{part.sku}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {editingId === part.id && editingField === 'quantity' ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center text-sm font-bold border border-primary rounded-lg focus:ring-primary bg-white dark:bg-slate-800"
                          min="0"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => handleSave(part.id, e)}
                          disabled={saving}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                          title="Salvar"
                        >
                          <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'check'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Cancelar"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end group/qty">
                        <span className={`text-sm font-bold ${part.quantity <= part.min_quantity ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                          {part.quantity}{part.unit === 'L' ? 'L' : ''}
                        </span>
                        {onUpdatePart && (
                          <button
                            onClick={(e) => handleStartEdit(part, 'quantity', e)}
                            className="p-1 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover/qty:opacity-100"
                            title="Editar quantidade"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {part.location}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    {editingId === part.id && editingField === 'min_quantity' ? (
                      <div className="flex items-center gap-1 justify-end">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                          className="w-16 h-8 text-center text-sm font-bold border border-primary rounded-lg focus:ring-primary bg-white dark:bg-slate-800"
                          min="0"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => handleSave(part.id, e)}
                          disabled={saving}
                          className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
                          title="Salvar"
                        >
                          <span className="material-symbols-outlined text-[18px]">{saving ? 'sync' : 'check'}</span>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Cancelar"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 justify-end group/min">
                        <span className="text-sm text-slate-500">
                          {part.min_quantity}
                        </span>
                        {onUpdatePart && (
                          <button
                            onClick={(e) => handleStartEdit(part, 'min_quantity', e)}
                            className="p-1 rounded-lg text-slate-300 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover/min:opacity-100"
                            title="Editar mínimo"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${status.bg} ${status.pulse ? 'animate-pulse' : ''}`} />
                      <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="text-slate-400 hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={(e) => { e.stopPropagation(); navigate(`/part/${part.id}`); }}
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl w-full aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-scale-in">
            <img src={zoomedImage} alt="Zoom" className="w-full h-full object-contain bg-slate-900" />
            <button
              className="absolute top-6 right-6 size-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all"
              onClick={() => setZoomedImage(null)}
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
