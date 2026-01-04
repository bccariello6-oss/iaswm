import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { generateRequestExcel } from '../lib/excel';

interface ServiceItem {
    code: string;
    description: string;
    quantity: number;
    unit: string;
    estimatedValue: number;
}

const ServiceRequest: React.FC = () => {
    const navigate = useNavigate();

    // Header state
    const [osNumber, setOsNumber] = useState('');
    const [osType, setOsType] = useState('Ordem Corretiva');
    const [usageArea, setUsageArea] = useState('');
    const [projectNumber, setProjectNumber] = useState('');
    const [assetNumber, setAssetNumber] = useState('');
    const [priority, setPriority] = useState<'Baixa' | 'Normal' | 'Urgente'>('Normal');
    const [justification, setJustification] = useState('');

    // Service Builder state
    const [currentCode, setCurrentCode] = useState('2014160');
    const [currentDescription, setCurrentDescription] = useState('');
    const [currentQuantity, setCurrentQuantity] = useState(1);
    const [currentUnit, setCurrentUnit] = useState('UN');
    const [currentEstimatedValue, setCurrentEstimatedValue] = useState<number>(0);

    // List state
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addService = () => {
        if (!currentDescription.trim()) {
            alert('Por favor, descreva o serviço antes de adicionar.');
            return;
        }

        setServices([...services, {
            code: currentCode,
            description: currentDescription,
            quantity: currentQuantity,
            unit: currentUnit,
            estimatedValue: currentEstimatedValue
        }]);

        // Reset builder fields
        setCurrentDescription('');
        setCurrentQuantity(1);
        setCurrentEstimatedValue(0);
    };

    const removeService = (index: number) => {
        setServices(services.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (services.length === 0) {
            alert('Adicione pelo menos um serviço na lista antes de enviar.');
            return;
        }
        if (!usageArea) {
            alert('Por favor, selecione a Área de Aplicação.');
            return;
        }
        if (osType === 'Projeto' && !projectNumber) {
            alert('Por favor, informe o Número do Projeto.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Calculate total estimated value from items
            const totalEstimatedValue = services.reduce((sum, srv) => sum + (srv.estimatedValue || 0), 0);

            // Generate Excel File
            generateRequestExcel({
                osNumber,
                osType,
                usageArea,
                projectNumber,
                assetNumber,
                estimatedValue: totalEstimatedValue,
                priority,
                justification,
                items: services.map(srv => ({
                    code: srv.code,
                    description: srv.description,
                    quantity: srv.quantity,
                    unit: srv.unit,
                    estimatedValue: srv.estimatedValue
                }))
            }, 'Serviço');

            const requests = services.map(srv => ({
                request_category: 'Serviço',
                service_code: srv.code,
                service_description: srv.description,
                quantity: srv.quantity,
                unit: srv.unit,
                priority,
                justification,
                user_id: user?.id,
                status: 'Pendente',
                os_number: osNumber,
                os_type: osType,
                usage_area: usageArea,
                project_number: osType === 'Projeto' ? projectNumber : null,
                asset_number: assetNumber,
                estimated_value: srv.estimatedValue
            }));

            const { error } = await supabase
                .from('purchase_requests')
                .insert(requests);

            if (error) throw error;

            // Create notification for the service request
            await supabase.from('notifications').insert({
                title: services.length === 1 ? 'Nova Requisição de Serviço' : 'Nova Requisição de Serviço em Lote',
                message: services.length === 1
                    ? `Solicitação de ${services[0].description} (OS: ${osNumber || 'N/A'}) enviada.`
                    : `Solicitação em lote de ${services.length} serviços (OS: ${osNumber || 'N/A'}) enviada.`,
                type: priority === 'Urgente' ? 'critical' : 'info',
                user_id: user?.id
            });

            alert(`Solicitação processada e Excel gerado! Envie para bcariello@swmintl.com`);
            navigate('/');
        } catch (error) {
            console.error('Error submitting services:', error);
            alert('Erro ao enviar solicitação.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Requisição de Serviço</h1>
                <p className="text-slate-500 mt-2 font-medium">Abertura de chamados e solicitações de serviços especializados.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
                    {/* OS & Metadata Section */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                            <span className="material-symbols-outlined text-primary text-[28px]">assignment_ind</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dados da Ordem de Serviço</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Número da OS</label>
                                <input
                                    type="text"
                                    value={osNumber}
                                    onChange={(e) => setOsNumber(e.target.value)}
                                    placeholder="Ex: OS-2024-001"
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Tipo de Intervenção</label>
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
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Área de Aplicação</label>
                                <select
                                    value={usageArea}
                                    onChange={(e) => setUsageArea(e.target.value)}
                                    required
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                                >
                                    <option value="">Selecione a área onde o serviço será realizado...</option>
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
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black text-primary uppercase">Número do Projeto (Obrigatório)</label>
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

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Nº do Ativo</label>
                                <input
                                    type="text"
                                    value={assetNumber}
                                    onChange={(e) => setAssetNumber(e.target.value)}
                                    placeholder="Ex: MAQ-001"
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Service Builder */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 dark:border-slate-800/50">
                            <span className="material-symbols-outlined text-primary text-[28px]">add_task</span>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Adicionar Serviços na Lista</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Código</label>
                                <select
                                    value={currentCode}
                                    onChange={(e) => setCurrentCode(e.target.value)}
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:ring-primary"
                                >
                                    <option value="2014160">2014160 - Especializado</option>
                                </select>
                            </div>

                            <div className="md:col-span-5">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Qtd / Unidade / Valor</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                                        min="1"
                                        className="w-20 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                                    />
                                    <select
                                        value={currentUnit}
                                        onChange={(e) => setCurrentUnit(e.target.value)}
                                        className="w-24 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                                    >
                                        <option>UN</option>
                                        <option>H</option>
                                        <option>M2</option>
                                        <option>GLOBAL</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={currentEstimatedValue}
                                        onChange={(e) => setCurrentEstimatedValue(parseFloat(e.target.value) || 0)}
                                        placeholder="Valor R$"
                                        step="0.01"
                                        className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 flex items-end">
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="w-full h-12 bg-slate-900 dark:bg-primary text-white rounded-xl font-bold hover:scale-[1.05] transition-transform flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[20px]">add</span> Add
                                </button>
                            </div>

                            <div className="md:col-span-12">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Descrição do Serviço</label>
                                <textarea
                                    value={currentDescription}
                                    onChange={(e) => setCurrentDescription(e.target.value)}
                                    placeholder="Descreva aqui o serviço que precisa ser realizado..."
                                    className="w-full h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm p-4 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Service Table Summary */}
                        {services.length > 0 && (
                            <div className="mt-8 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Serviço</th>
                                            <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-center">Quantidade</th>
                                            <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-center">Valor Est.</th>
                                            <th className="px-4 py-3 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {services.map((srv, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{srv.description}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">CÓD: {srv.code}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center font-black text-primary">{srv.quantity} {srv.unit}</td>
                                                <td className="px-4 py-3 text-center font-bold text-emerald-600">{srv.estimatedValue > 0 ? `R$ ${srv.estimatedValue.toFixed(2)}` : '-'}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeService(idx)}
                                                        className="size-8 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
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

                    {/* Priority & Justification (Global for the batch) */}
                    <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Prioridade Geral</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary font-bold"
                                >
                                    <option value="Baixa">Baixa</option>
                                    <option value="Normal">Normal</option>
                                    <option value="Urgente">Urgente</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-black uppercase tracking-wider">Justificativa da Necessidade</label>
                                <input
                                    type="text"
                                    value={justification}
                                    onChange={(e) => setJustification(e.target.value)}
                                    placeholder="Ex: Quebra de equipamento, parada programada..."
                                    required
                                    className="w-full h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || services.length === 0}
                        className="w-full h-16 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                        {isSubmitting ? (
                            <div className="size-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="material-symbols-outlined">rocket_launch</span>
                        )}
                        {isSubmitting ? 'Enviando...' : `Finalizar Requisição (${services.length} itens)`}
                    </button>
                </form>

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
                                <span>Todos os campos devem ser preenchidos para garantir agilidade para o setor de suprimentos.</span>
                            </li>
                            <li className="flex gap-3 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">contact_support</span>
                                <span className="text-xs italic">Em caso de dúvidas, procurar por <strong>Bruno Cariello</strong></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceRequest;
