import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Part, PurchaseRequest } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend
} from 'recharts';

const Reports: React.FC = () => {
  const [parts, setParts] = useState<Part[]>([]);
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partsRes, requestsRes] = await Promise.all([
        supabase.from('parts').select('*'),
        supabase.from('purchase_requests').select('*')
      ]);

      if (partsRes.error) throw partsRes.error;
      if (requestsRes.error) throw requestsRes.error;

      setParts(partsRes.data as any);
      setRequests(requestsRes.data as any);
    } catch (error) {
      console.error('Error fetching data for reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryConsumption = useMemo(() => {
    const categories: Record<string, { value: number, color: string }> = {
      'Mecânica': { value: 0, color: '#135bec' },
      'Elétrica': { value: 0, color: '#4c669a' },
      'Hidráulica': { value: 0, color: '#0ea5e9' },
      'Transmissão': { value: 0, color: '#6366f1' },
      'Lubrificantes': { value: 0, color: '#f59e0b' },
      'Insumos': { value: 0, color: '#94a3b8' },
    };

    parts.forEach(part => {
      const cost = parseFloat(part.cost as any || 0) * (part.quantity || 0);
      if (categories[part.category]) {
        categories[part.category].value += cost;
      } else {
        categories[part.category] = { value: cost, color: '#CBD5E1' };
      }
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      ...data
    })).filter(c => c.value > 0);
  }, [parts]);

  const osTypeDistribution = useMemo(() => {
    const types: Record<string, { value: number, color: string }> = {
      'Ordem Corretiva': { value: 0, color: '#ef4444' },
      'Preventiva': { value: 0, color: '#22c55e' },
      'Corretiva Não Planejada': { value: 0, color: '#f59e0b' },
      'Melhoria': { value: 0, color: '#3b82f6' },
      'Projeto': { value: 0, color: '#a855f7' },
    };

    requests.forEach(req => {
      const type = req.os_type || 'Outros';
      if (types[type]) {
        types[type].value += 1;
      } else {
        if (!types['Outros']) types['Outros'] = { value: 0, color: '#94a3b8' };
        types['Outros'].value += 1;
      }
    });

    return Object.entries(types).map(([name, data]) => ({
      name,
      ...data
    })).filter(t => t.value > 0);
  }, [requests]);

  const topExpensiveItems = useMemo(() => {
    return [...parts]
      .sort((a, b) => (parseFloat(b.cost as any) * b.quantity) - (parseFloat(a.cost as any) * a.quantity))
      .slice(0, 10);
  }, [parts]);

  const costData = [
    { month: 'Jan', value: 35000 },
    { month: 'Fev', value: 42000 },
    { month: 'Mar', value: 38000 },
    { month: 'Abr', value: 48000 },
    { month: 'Mai', value: 45000 },
    { month: 'Jun', value: 52000 },
  ];

  const handleExportCsv = () => {
    const content = [
      ['Relatório de Consolidação SWM'],
      [''],
      ['Consumo por Categoria'],
      ['Categoria', 'Valor Total em Estoque (R$)'],
      ...categoryConsumption.map(d => [d.name, d.value.toFixed(2)]),
      [''],
      ['Top 10 Itens Mais Caros'],
      ['Peça', 'Categoria', 'Qtd', 'Custo Unitário', 'Valor Total'],
      ...topExpensiveItems.map(d => [d.name, d.category, d.quantity, d.cost, (parseFloat(d.cost as any) * d.quantity).toFixed(2)]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_swm_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          aside, header, .no-print, button {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .container {
            max-width: 100% !important;
            padding: 0 !important;
          }
          .grid {
            display: block !important;
          }
          .grid > div {
            break-inside: avoid;
            margin-bottom: 2rem;
            border: 1px solid #e2e8f0 !important;
          }
          body {
            background: white !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Relatórios de Manutenção</h1>
          <p className="text-slate-500 mt-2">Visão geral do consumo de peças, custos e tendências operacionais.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
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
        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Evolução de Custos (Estimado)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none' }}
                  formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']}
                />
                <Bar dataKey="value" fill="#135bec" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Consumo por Categoria</h3>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="h-[250px] w-[250px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryConsumption} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {categoryConsumption.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
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
                      style={{ width: `${Math.min(100, (item.value / Math.max(...categoryConsumption.map(c => c.value))) * 100)}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8 text-white">
        <div className="lg:col-span-12 bg-white dark:bg-surface-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 font-black">Requisições por Tipo de OS</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={osTypeDistribution}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {osTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}`, 'Quantidade']} />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">Top 10 Itens Mais Valiosos em Estoque</h3>
        </div>
        <div className="overflow-x-auto text-white">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Peça</th>
                <th className="px-6 py-3">Categoria</th>
                <th className="px-6 py-3 text-right">Quantidade</th>
                <th className="px-6 py-3 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {topExpensiveItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-slate-500">{item.category}</td>
                  <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300 font-medium">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4 text-right font-bold text-primary">R$ {(item.cost * item.quantity).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
