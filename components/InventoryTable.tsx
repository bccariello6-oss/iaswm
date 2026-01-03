import React, { useState } from 'react';
import { Part, PartStatus } from '../types';
import { useNavigate } from 'react-router-dom';

interface InventoryTableProps {
  parts: Part[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ parts }) => {
  const navigate = useNavigate();
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const getStatusInfo = (part: Part) => {
    if (part.quantity === 0) return { label: PartStatus.CRITICAL, color: 'text-red-700 dark:text-red-400', bg: 'bg-red-500', pulse: true };
    if (part.quantity <= part.min_quantity) return { label: PartStatus.LOW_STOCK, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50', pulse: false };
    return { label: PartStatus.IN_STOCK, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-500', pulse: false };
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
                  <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); setZoomedImage(part.image_url || `https://picsum.photos/seed/${part.id}/600/600`); }}>
                    <div className="size-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:scale-110 transition-transform cursor-zoom-in group-hover:border-primary/50">
                      <img
                        src={part.image_url || `https://picsum.photos/seed/${part.id}/100/100`}
                        alt={part.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
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
                    <span className={`text-sm font-bold ${part.quantity <= part.min_quantity ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                      {part.quantity}{part.unit === 'L' ? 'L' : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                    {part.location}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-500">
                    {part.min_quantity}
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
