
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts';

const Reports: React.FC = () => {
  const costData = [
    { month: 'Jan', value: 35000 },
    { month: 'Fev', value: 42000 },
    { month: 'Mar', value: 38000 },
    { month: 'Abr', value: 48000 },
    { month: 'Mai', value: 45000 },
    { month: 'Jun', value: 52000 },
  ];

  const categoryConsumption = [
    { name: 'Mecânica', value: 12450, color: '#135bec' },
    { name: 'Elétrica', value: 8230, color: '#4c669a' },
    { name: 'Hidráulica', value: 6100, color: '#0ea5e9' },
    { name: 'Transmissão', value: 4500, color: '#6366f1' },
    { name: 'Insumos', value: 2100, color: '#94a3b8' },
  ];

  const handleExportCsv = () => {
    const content = [
      ['Relatório de Consolidação SWM'],
      [''],
      ['Evolução de Custos'],
      ['Mês', 'Valor (R$)'],
      ...costData.map(d => [d.month, d.value]),
      [''],
      ['Consumo por Categoria'],
      ['Categoria', 'Valor (R$)'],
      ...categoryConsumption.map(d => [d.name, d.value]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_consolidado_swm_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Relatórios de Manutenção</h1>
          <p className="text-slate-500 mt-2">Visão geral do consumo de peças, custos e tendências operacionais.</p>
        </div>
        <div className="flex gap-3">
          <button className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-50 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">print</span> Imprimir
          </button>
          <button
            onClick={handleExportCsv}
            className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span> Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Cost Evolution Chart */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Evolução de Custos (R$)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#135bec" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Consumption */}
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Consumo por Categoria</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[250px] w-[250px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryConsumption}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryConsumption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-4 w-full">
              {categoryConsumption.map(item => (
                <div key={item.name} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-500">{item.name}</span>
                    <span className="text-slate-900 dark:text-white">R$ {item.value.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(item.value / 12450) * 100}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table Placeholder */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Top 10 Itens Mais Caros</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Peça</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3">Última Compra</th>
                <th className="px-6 py-3 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-bold">Motor Trifásico WEG 5CV</td>
                <td className="px-6 py-4">Mecânica</td>
                <td className="px-6 py-4 text-slate-500">12/06/2024</td>
                <td className="px-6 py-4 text-right font-bold text-primary">R$ 5.000,00</td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-bold">Óleo Hidráulico ISO 68</td>
                <td className="px-6 py-4">Lubrificantes</td>
                <td className="px-6 py-4 text-slate-500">08/06/2024</td>
                <td className="px-6 py-4 text-right font-bold text-primary">R$ 740,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
