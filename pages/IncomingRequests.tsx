import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PurchaseRequest } from '../types';

import { useLocation } from 'react-router-dom';

const IncomingRequests: React.FC = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get('tab') as 'Material' | 'Serviço' | null;

    const [requests, setRequests] = useState<PurchaseRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'Material' | 'Serviço'>(initialTab || 'Material');
    const [statusFilter, setStatusFilter] = useState('Todos');

    // Update activeTab if URL changes
    useEffect(() => {
        const tab = queryParams.get('tab') as 'Material' | 'Serviço' | null;
        if (tab && (tab === 'Material' || tab === 'Serviço')) {
            setActiveTab(tab);
        }
    }, [location.search]);

    // Modal State for RC
    const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [erpNumber, setErpNumber] = useState('');
    const [newStatus, setNewStatus] = useState<PurchaseRequest['status']>('RC Emitida');

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('purchase_requests')
                .select('*')
                .eq('request_category', activeTab)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map DB snake_case to CamelCase Interface
            const formattedData = (data || []).map((item: any) => ({
                ...item,
                date: item.created_at, // Map created_at to date
                partName: item.part_name, // Map part_name to partName
                partId: item.part_id,
                erp_request_number: item.erp_request_number // Explicitly keep this
            }));

            setRequests(formattedData as PurchaseRequest[]);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (req: PurchaseRequest) => {
        setSelectedRequest(req);
        setErpNumber(req.erp_request_number || '');
        setNewStatus(req.status === 'Pendente' ? 'Aguardando RC' : req.status);
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedRequest) return;

        try {
            const { error } = await supabase
                .from('purchase_requests')
                .update({
                    status: newStatus,
                    erp_request_number: erpNumber
                })
                .eq('id', selectedRequest.id);

            if (error) throw error;

            // Notify User (Optional - could add a notification insert here)
            await supabase.from('notifications').insert({
                title: `Atualização de Status: ${newStatus}`,
                message: `Sua requisição de ${activeTab} foi atualizada para: ${newStatus}. ${erpNumber ? `Nº RC/Pedido: ${erpNumber}` : ''}`,
                type: 'info',
                user_id: (selectedRequest as any).user_id // Assuming user_id is in the object
            });

            alert('Requisição atualizada com sucesso!');
            setIsModalOpen(false);
            fetchRequests();
        } catch (error) {
            alert('Erro ao atualizar requisição.');
            console.error(error);
        }
    };

    const filteredRequests = requests.filter(req => {
        if (statusFilter === 'Todos') return true;
        return req.status === statusFilter;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pendente': return 'bg-slate-100 text-slate-600';
            case 'Aguardando RC': return 'bg-yellow-100 text-yellow-700';
            case 'RC Emitida': return 'bg-blue-100 text-blue-700';
            case 'Aguardando Aprovação': return 'bg-purple-100 text-purple-700';
            case 'Aprovada': return 'bg-green-100 text-green-700';
            case 'Aguardando Pedido': return 'bg-orange-100 text-orange-700';
            case 'Pedido de Compra Emitido': return 'bg-emerald-100 text-emerald-700';
            case 'Rejeitado': return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-600';
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
                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Recebimento de Requisições</h1>
                <p className="text-slate-500 mt-2">Central de processamento de solicitações de compras e serviços.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('Material')}
                    className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Material' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Materiais
                </button>
                <button
                    onClick={() => setActiveTab('Serviço')}
                    className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'Serviço' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Serviços
                </button>
            </div>

            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">filter_list</span>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Filtros:</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-4 focus:ring-primary"
                    >
                        <option value="Todos">Todos os Status</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Aguardando RC">Aguardando RC</option>
                        <option value="RC Emitida">RC Emitida</option>
                        <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                        <option value="Aprovada">Aprovada</option>
                        <option value="Aguardando Pedido">Aguardando Pedido</option>
                        <option value="Pedido de Compra Emitido">Pedido Emitido</option>
                        <option value="Rejeitado">Rejeitado</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">{activeTab === 'Material' ? 'Item / SKU' : 'Descrição / Código'}</th>
                                <th className="px-6 py-4 text-center">Prioridade</th>
                                <th className="px-6 py-4">Status Atual</th>
                                <th className="px-6 py-4">Nº RC / Pedido</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(req.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {activeTab === 'Material' ? req.partName : req.service_description}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono mt-1">
                                            {activeTab === 'Material' ? req.sku : req.service_code}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${req.priority === 'Urgente' ? 'bg-red-100 text-red-700' :
                                            req.priority === 'Baixa' ? 'bg-slate-100 text-slate-600' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {req.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                                        {req.erp_request_number || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleOpenModal(req)}
                                            className="px-4 py-2 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors shadow-sm"
                                        >
                                            Processar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        Nenhuma requisição encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Processing Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-lg p-6 border border-slate-200 dark:border-slate-800 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Processar Requisição</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Item Solicitado</label>
                                <p className="font-bold text-slate-900 dark:text-white text-lg">
                                    {activeTab === 'Material' ? selectedRequest.partName : selectedRequest.service_description}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Novo Status</label>
                                <select
                                    value={newStatus}
                                    onChange={(e: any) => setNewStatus(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:ring-primary"
                                >
                                    <option value="Aguardando RC">Aguardando RC</option>
                                    <option value="RC Emitida">RC Emitida</option>
                                    <option value="Aguardando Aprovação">Aguardando Aprovação</option>
                                    <option value="Aprovada">Aprovada</option>
                                    <option value="Aguardando Pedido">Aguardando Pedido</option>
                                    <option value="Pedido de Compra Emitido">Pedido de Compra Emitido</option>
                                    <option value="Rejeitado">Rejeitado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Nº do Registro ERP (RC / Pedido)</label>
                                <input
                                    type="text"
                                    value={erpNumber}
                                    onChange={(e) => setErpNumber(e.target.value)}
                                    placeholder="Ex: RC-12345 ou PED-987"
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 font-medium focus:ring-primary"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Informe o número gerado no sistema ERP para rastreabilidade.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomingRequests;
