import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { Part, PurchaseRequest, User } from '../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isAdmin = user.role === 'Administrador';
  const [parts, setParts] = useState<Part[]>([]);
  const [materialRequests, setMaterialRequests] = useState<PurchaseRequest[]>([]);
  const [serviceRequests, setServiceRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const isAdmin = user.role === 'Administrador';

      // Select only needed columns for metrics and alerts
      let partsQuery = supabase
        .from('parts')
        .select('id, name, quantity, min_quantity, cost');

      // Efficiently fetch separately to ensure we get 5 of each without over-fetching
      let materialQuery = supabase
        .from('purchase_requests')
        .select('id, created_at, status, priority, part_name, sku, request_category')
        .eq('request_category', 'Material')
        .order('created_at', { ascending: false })
        .limit(5);

      let serviceQuery = supabase
        .from('purchase_requests')
        .select('id, created_at, status, priority, service_description, service_code, request_category')
        .eq('request_category', 'Serviço')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin) {
        materialQuery = materialQuery.eq('user_id', user.id);
        serviceQuery = serviceQuery.eq('user_id', user.id);
      }

      const [
        { data: partsData, error: partsError },
        { data: matData, error: matError },
        { data: servData, error: servError }
      ] = await Promise.all([
        partsQuery,
        materialQuery,
        serviceQuery
      ]);

      if (partsError) throw partsError;
      if (matError) throw matError;
      if (servError) throw servError;

      setParts(partsData as any);

      const formatRequest = (req: any) => ({
        ...req,
        date: new Date(req.created_at).toLocaleDateString('pt-BR'),
        partName: req.part_name, // Map part_name to partName
      });

      setMaterialRequests((matData || []).map(formatRequest) as any);
      setServiceRequests((servData || []).map(formatRequest) as any);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const criticalCount = parts.filter(p => (p.quantity || 0) === 0).length;
  const lowStockCount = parts.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= (p.min_quantity || 0)).length;
  const totalValue = parts.reduce((acc, part) => acc + ((part.cost || 0) * (part.quantity || 0)), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="mb-8 ">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Painel de Controle</h1>
        <p className="text-slate-500">Visão geral do sistema de manutenção e estoque.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg material-symbols-outlined">inventory_2</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Total de Peças em Reposição</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{parts.length}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg material-symbols-outlined">report_problem</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">Crítico</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Peças Zeradas</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{criticalCount}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg material-symbols-outlined">warning</span>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Alerta</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Estoque Baixo</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{lowStockCount}</p>
        </div>
        <div className="bg-white dark:bg-surface-dark p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg material-symbols-outlined">payments</span>
            <span className="text-xs font-bold text-slate-400">Total</span>
          </div>
          <p className="text-sm font-medium text-slate-500">Valor Investido</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">R$ {totalValue.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Material Purchases */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              Requisições Recentes de Material
            </h3>
            <Link to={isAdmin ? "/incoming-requests?tab=Material" : "/requests"} className="text-xs font-bold text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {materialRequests.length > 0 ? materialRequests.map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded flex items-center justify-center ${req.priority === 'Urgente' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-primary'}`}>
                      <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{req.partName || 'Item não identificado'}</p>
                      <p className="text-xs text-slate-500">#{req.sku || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${req.status === 'Aprovado' || req.status === 'Pedido de Compra Emitido' ? 'bg-green-100 text-green-700' :
                    req.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                      req.status === 'RC Emitida' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Aguardando Aprovação' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                    }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pl-11">
                  <span className="text-xs text-slate-400">{req.date}</span>
                  <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma requisição de material encontrada.</div>
            )}
          </div>
        </div>

        {/* Recent Service Purchases */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">engineering</span>
              Requisições Recentes de Serviços
            </h3>
            <Link to={isAdmin ? "/incoming-requests?tab=Serviço" : "/service-requests"} className="text-xs font-bold text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {serviceRequests.length > 0 ? serviceRequests.map(req => (
              <div key={req.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-3">
                    <div className={`size-8 rounded flex items-center justify-center ${req.priority === 'Urgente' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-primary'}`}>
                      <span className="material-symbols-outlined text-[18px]">build</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{req.service_description || 'Serviço não descrito'}</p>
                      <p className="text-xs text-slate-500">Cód: {req.service_code || 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${req.status === 'Aprovado' || req.status === 'Pedido de Compra Emitido' ? 'bg-green-100 text-green-700' :
                    req.status === 'Rejeitado' ? 'bg-red-100 text-red-700' :
                      req.status === 'RC Emitida' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'Aguardando Aprovação' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                    }`}>
                    {req.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 pl-11">
                  <span className="text-xs text-slate-400">{req.date}</span>
                  <span className="material-symbols-outlined text-[18px] text-slate-300 group-hover:text-primary transition-colors">arrow_forward</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 text-sm">Nenhuma requisição de serviço encontrada.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">

        {/* Low Stock Alert List */}
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[20px] fill">emergency</span>
              Alertas de Estoque
            </h3>
            <Link to="/alerts" className="text-xs font-bold text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {parts.filter(p => (p.quantity || 0) <= (p.min_quantity || 0)).slice(0, 5).map(part => (
              <div key={part.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded flex items-center justify-center ${part.quantity === 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                    <span className="material-symbols-outlined text-[20px]">{part.quantity === 0 ? 'error' : 'warning'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{part.name}</p>
                    <p className="text-xs text-slate-500">Qtd: {part.quantity} / Mín: {part.min_quantity}</p>
                  </div>
                </div>
                <Link to={`/part/${part.id}`} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
