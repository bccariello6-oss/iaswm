
import React from 'react';
import { Part, PartStatus } from '../types';
import { useNavigate } from 'react-router-dom';

interface InventoryTableProps {
  parts: Part[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ parts }) => {
  const navigate = useNavigate();

  const getStatusInfo = (part: Part) => {
    if (part.quantity === 0) return { label: PartStatus.CRITICAL, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500', pulse: true };
    if (part.quantity <= part.minQuantity) return { label: PartStatus.LOW_STOCK, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50', pulse: false };
    return { label: PartStatus.IN_STOCK, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', pulse: false };
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
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
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{part.name}</span>
                      <span className="text-xs text-slate-500">{part.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-bold ${part.quantity <= part.minQuantity ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {part.quantity}{part.unit === 'L' ? 'L' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {part.location}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {part.minQuantity}
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
    </div>
  );
};

export default InventoryTable;
