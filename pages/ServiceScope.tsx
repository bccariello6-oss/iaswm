import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface ScopeStep {
    id: string;
    text: string;
}

const ServiceScope: React.FC<{ user?: User }> = ({ user }) => {
    const navigate = useNavigate();

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [serviceType, setServiceType] = useState('Geral');
    const [suppliers, setSuppliers] = useState('');
    const [stepInput, setStepInput] = useState('');
    const [steps, setSteps] = useState<ScopeStep[]>([]);
    const [safetyNorms, setSafetyNorms] = useState('');
    const [documentation, setDocumentation] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // AI Insights State
    const [aiInsights, setAiInsights] = useState<string[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiQuery, setAiQuery] = useState('');

    // Simulated AI Logic
    useEffect(() => {
        if (!serviceType) return;

        setIsAiLoading(true);
        const timer = setTimeout(() => {
            let insights: string[] = [];

            switch (serviceType) {
                case 'Elétrica':
                    insights = [
                        'Sugestão: Incluir verificação de conformidade com NR-10.',
                        'Insight: Identificar se há necessidade de bloqueio de energias perigosas (LOTO).',
                        'Checklist: Verificar estado dos EPIs dielétricos.',
                        'Documentação: Anexar diagrama unifilar atualizado.'
                    ];
                    break;
                case 'Mecânica':
                    insights = [
                        'Sugestão: Descrever ferramentas de torque específicas necessárias.',
                        'Insight: Verificar se o equipamento exige lubrificação pós-serviço.',
                        'Norma: NR-12 - Segurança no Trabalho em Máquinas e Equipamentos.',
                        'Etapa: Incluir teste de vibração após montagem.'
                    ];
                    break;
                case 'Civil':
                    insights = [
                        'Sugestão: Verificar tempo de cura dos materiais utilizados.',
                        'Insight: Isolar área para evitar dispersão de poeira e resíduos.',
                        'Normas: Consultar ABNT NBR 18 para segurança na construção.',
                        'Meio Ambiente: Definir local de descarte de entulho.'
                    ];
                    break;
                default:
                    insights = [
                        'Dica: Tente ser o mais detalhado possível nas etapas para evitar retrabalho.',
                        'Lembrete: SEMPRE verifique os arredores antes de iniciar o serviço.',
                        'Insight: Considere o impacto do serviço na produção (parada total ou parcial).',
                        'Segurança: A Permissão de Trabalho (PT) é obrigatória.'
                    ];
            }

            setAiInsights(insights);
            setIsAiLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [serviceType]);

    const addStep = () => {
        if (!stepInput.trim()) return;
        setSteps([...steps, { id: Date.now().toString(), text: stepInput }]);
        setStepInput('');
    };

    const removeStep = (id: string) => {
        setSteps(steps.filter(s => s.id !== id));
    };

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            window.print();
            setIsExporting(false);
        }, 500);
    };

    const handleSaveAndPrint = async () => {
        if (!title.trim()) {
            alert('Por favor, insira um título para o escopo.');
            return;
        }

        try {
            setIsSaving(true);
            const { data, error: authError } = await supabase.auth.getUser();
            const authUser = data?.user;

            if (authError || !authUser) throw new Error('Usuário não autenticado ou sessão expirada');

            const { error } = await supabase
                .from('service_scopes')
                .insert([{
                    title,
                    date: date || null,
                    location,
                    service_type: serviceType,
                    suppliers,
                    steps,
                    safety_norms: safetyNorms,
                    documentation,
                    images,
                    user_id: authUser.id,
                    status: 'Finalizado'
                }]);

            if (error) throw error;

            alert('Escopo salvo com sucesso no banco de dados!');
            handleExport();
        } catch (err) {
            console.error('Erro ao salvar escopo:', err);
            alert('Erro ao salvar no banco de dados. Tentando imprimir apenas...');
            handleExport();
        } finally {
            setIsSaving(false);
        }
    };

    const searchAiBestPractices = async () => {
        if (!aiQuery.trim()) return;

        setIsAiLoading(true);
        // Simulating artificial intelligence "web search" delay
        setTimeout(() => {
            const query = aiQuery.toLowerCase();
            let newInsights = [...aiInsights];

            if (query.includes('rolamento')) {
                newInsights = [
                    'WEB FOUND: Utilizar aquecedor por indução para montagem.',
                    'PRÁTICA: Nunca bater diretamente no anel interno.',
                    'NORMA: Verificar folga radial conforme catálogo C3/C4.',
                    'DICA: Limpeza rigorosa do alojamento antes da instalação.'
                ];
            } else if (query.includes('solda') || query.includes('soldagem')) {
                newInsights = [
                    'WEB FOUND: AWS D1.1 - Código de Soldagem Estrutural.',
                    'PRÁTICA: Controle de temperatura de pré-aquecimento.',
                    'NORMAS: NR-18 e NR-34 para trabalhos a quente.',
                    'CHECK: Ensaio de Líquido Penetrante (LP) pós-solda.'
                ];
            } else {
                newInsights = [
                    `Resultado para "${aiQuery}":`,
                    '1. Verificar compatibilidade de materiais.',
                    '2. Isolar energias (LOTO) se aplicável.',
                    '3. Consultar manual original do fabricante.',
                    '4. Registrar fotos do "antes" e "depois".'
                ];
            }

            setAiInsights(newInsights);
            setIsAiLoading(false);
            setAiQuery('');
        }, 1500);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8 min-h-full">
            {/* Main Form Area */}
            <div className="flex-1 space-y-8 print:p-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Criar Escopo de Serviço</h1>
                        <p className="text-slate-500 mt-1 font-medium italic">Documentação técnica e planejamento de execução.</p>
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700 print:hidden"
                    >
                        <span className="material-symbols-outlined text-[20px]">print</span> Imprimir Escopo
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white dark:bg-surface-dark p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:shadow-none print:border-none">
                    {/* Header Info */}
                    <div className="md:col-span-8">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Título do Escopo / Obra</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Manutenção Preventiva Ponte Rolante 01"
                            className="w-full text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white placeholder:text-slate-200"
                        />
                    </div>
                    <div className="md:col-span-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Serviço</label>
                        <select
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value)}
                            className="w-full h-10 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold focus:ring-primary"
                        >
                            <option value="Geral">Manutenção Geral</option>
                            <option value="Elétrica">Elétrica / Instrumentação</option>
                            <option value="Mecânica">Mecânica / Hidráulica</option>
                            <option value="Civil">Civil / Estrutural</option>
                            <option value="TI">Informática / Redes</option>
                        </select>
                    </div>

                    <div className="md:col-span-4 mt-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Data Prevista</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-4 text-sm"
                        />
                    </div>
                    <div className="md:col-span-4 mt-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Local / Área</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ex: Galpão MP03"
                            className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-4 text-sm"
                        />
                    </div>
                    <div className="md:col-span-4 mt-4">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Possíveis Fornecedores</label>
                        <input
                            type="text"
                            value={suppliers}
                            onChange={(e) => setSuppliers(e.target.value)}
                            placeholder="Ex: Siemens, SKF, Local..."
                            className="w-full h-11 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-4 text-sm"
                        />
                    </div>

                    {/* Steps section */}
                    <div className="md:col-span-12 mt-10">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-primary text-[20px]">format_list_numbered</span>
                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">Etapas de Execução</h3>
                        </div>

                        <div className="flex gap-2 mb-4 print:hidden">
                            <input
                                type="text"
                                value={stepInput}
                                onChange={(e) => setStepInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addStep()}
                                placeholder="Descreva o passo..."
                                className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 text-sm"
                            />
                            <button
                                onClick={addStep}
                                className="px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:scale-[1.02] transition-transform"
                            >
                                Adicionar
                            </button>
                        </div>

                        <div className="space-y-2">
                            {steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 group">
                                    <span className="size-6 bg-primary/10 text-primary text-[10px] font-black rounded-lg flex items-center justify-center shrink-0">
                                        {idx + 1}
                                    </span>
                                    <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 font-medium">{step.text}</p>
                                    <button
                                        onClick={() => removeStep(step.id)}
                                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all print:hidden"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                            {steps.length === 0 && <p className="text-center py-8 text-slate-400 italic text-sm border-2 border-dashed border-slate-100 dark:border-slate-800/50 rounded-2xl">Nenhuma etapa adicionada.</p>}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="md:col-span-6 mt-10">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary size-5 flex items-center justify-center">shield</span> Normas de Segurança / EPIs
                        </label>
                        <textarea
                            value={safetyNorms}
                            onChange={(e) => setSafetyNorms(e.target.value)}
                            placeholder="Cite NR-10, NR-35, uso de travas, cintos..."
                            className="w-full h-32 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 text-sm"
                        />
                    </div>
                    <div className="md:col-span-6 mt-10">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary size-5 flex items-center justify-center">feed</span> Documentação Necessária
                        </label>
                        <textarea
                            value={documentation}
                            onChange={(e) => setDocumentation(e.target.value)}
                            placeholder="Certificados, permissão de trabalho, diagramas..."
                            className="w-full h-32 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 p-4 text-sm"
                        />
                    </div>

                    {/* Photo Upload Section */}
                    <div className="md:col-span-12 mt-10">
                        <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary size-5 flex items-center justify-center">photo_camera</span> Fotos e Anexos Visuais
                        </label>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                                    <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-2 right-2 size-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group print:hidden">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-[32px]">add_a_photo</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adicionar Foto</span>
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                        </div>
                        {images.length === 0 && (
                            <p className="mt-4 text-xs text-slate-400 italic">Nenhuma foto anexada ao escopo.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Side Assistant - AI Insight Sidebar */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6 print:hidden">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    {/* Animated Background Pulse */}
                    <div className="absolute -top-20 -right-20 size-64 bg-primary/20 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary text-[20px] animate-pulse">psychology</span>
                            </div>
                            <div>
                                <h3 className="text-white font-black text-xs uppercase tracking-widest">IA Assistant</h3>
                                <p className="text-slate-500 text-[10px]">Insights em Tempo Real</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* AI Search Input */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    value={aiQuery}
                                    onChange={(e) => setAiQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchAiBestPractices()}
                                    placeholder="Buscar boas práticas..."
                                    className="w-full h-10 pl-3 pr-10 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-600 focus:border-primary/50 transition-all"
                                />
                                <button
                                    onClick={searchAiBestPractices}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-white transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">search</span>
                                </button>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider mb-2">Contexto:</p>
                                <p className="text-xs text-slate-300 font-medium">Você está criando um escopo para <span className="text-white font-bold uppercase">{serviceType}</span>.</p>
                            </div>

                            <div className="space-y-3">
                                {isAiLoading ? (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <div className="size-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                        <p className="text-[10px] text-slate-500 animate-pulse font-bold uppercase">Analisando dados...</p>
                                    </div>
                                ) : (
                                    aiInsights.map((insight, idx) => (
                                        <div key={idx} className="flex gap-3 animate-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                            <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                            <p className="text-xs text-slate-400 leading-relaxed font-medium">{insight}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-[9px] text-slate-600 font-medium">As sugestões são baseadas em padrões históricos de manutenção e normas vigentes.</p>
                        </div>
                    </div>
                </div>

                {/* Global Action */}
                <button
                    onClick={handleSaveAndPrint}
                    disabled={isSaving}
                    className="w-full h-14 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 disabled:scale-100"
                >
                    <span className="material-symbols-outlined">{isSaving ? 'sync' : 'save'}</span>
                    {isSaving ? 'Salvando...' : 'Salvar Escopo e Gerar PDF'}
                </button>
            </aside>
        </div>
    );
};

export default ServiceScope;
