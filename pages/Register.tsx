import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
// @ts-ignore
import swmLogo from '../assets/swm_logo_final.jpg';
// @ts-ignore
import factoryHero from '../assets/factory_hero.jpg';

interface RegisterProps {
    onBackToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (signUpError) throw signUpError;

            setSuccess(true);
            // Profile usually created via DB Trigger in Supabase
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 text-center">
                <div className="max-w-md">
                    <span className="material-symbols-outlined text-[64px] text-green-500 mb-4">check_circle</span>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Cadastro Realizado!</h2>
                    <p className="text-slate-500 mb-8">Verifique seu e-mail para confirmar a conta (ou tente o login se a confirmação estiver desativada).</p>
                    <button onClick={onBackToLogin} className="w-full py-4 bg-[#0018a8] text-white font-black rounded-xl">VOLTAR PARA LOGIN</button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-row font-display">
            <div className="flex w-full flex-col justify-center bg-white dark:bg-surface-dark px-6 py-12 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24 shadow-xl z-10">
                <div className="mx-auto w-full max-w-sm lg:w-[440px]">
                    <div className="mb-8 flex flex-col items-start w-full">
                        <img src={swmLogo} alt="SWM Logo" className="h-20 w-auto object-contain" />
                    </div>

                    <p className="text-lg font-black text-[#0018a8] tracking-[0.2em] mb-4 uppercase">NOVO CADASTRO</p>
                    <p className="text-sm text-slate-500 mb-8 font-medium">Preencha os dados abaixo para solicitar acesso ao portal.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                                {error}
                            </div>
                        )}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="block w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="Seu nome completo"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">E-mail Corporativo</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="exemplo@swm.com"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Senha</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full h-12 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 flex w-full justify-center items-center gap-2 rounded-xl bg-primary py-4 text-sm font-black text-white shadow-xl shadow-primary/30 hover:bg-blue-800 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? 'CADASTRANDO...' : 'CRIAR MINHA CONTA'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                        <button onClick={onBackToLogin} className="text-xs font-black text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                            Voltar para o Login
                        </button>
                    </div>
                </div>
            </div>

            <div className="relative hidden w-0 flex-1 lg:block">
                <div className="absolute inset-0 bg-blue-900/40 z-10"></div>
                <img className="absolute inset-0 h-full w-full object-cover" src={factoryHero} alt="SWM Industrial" />
            </div>
        </div>
    );
};

export default Register;
