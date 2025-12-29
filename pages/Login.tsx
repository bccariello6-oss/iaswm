import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
// @ts-ignore
import swmLogo from '../assets/swm_logo_final.jpg';
// @ts-ignore
import factoryHero from '../assets/factory_hero.jpg';

interface LoginProps {
  onLogin: (email: string) => void;
  onShowRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // Redirection is handled by onAuthStateChange in App.tsx
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-row font-display">
      {/* Lado Esquerdo: Formulário */}
      <div className="flex w-full flex-col justify-center bg-white dark:bg-surface-dark px-6 py-12 lg:w-1/2 lg:flex-none lg:px-20 xl:px-24 shadow-xl z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[440px]">


          {/* Logo SWM - Oficial */}
          <div className="mb-8 flex flex-col items-start w-full">
            <img src={swmLogo} alt="SWM Logo" className="h-24 w-auto object-contain" />
          </div>

          <div>
            <p className="text-lg font-black text-[#0018a8] tracking-[0.2em] mb-8 uppercase">CSM SWM BRASIL</p>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2" htmlFor="email">E-mail ou Matrícula</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">person</span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-12 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="exemplo@swm.com"
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2" htmlFor="password">Senha</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">lock</span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-12 pr-12 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600">
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox" className="size-4 rounded border-slate-300 text-primary focus:ring-primary" />
                  <label htmlFor="remember-me" className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-400">Manter conectado</label>
                </div>
                <button type="button" className="text-xs font-bold text-primary hover:underline">Esqueci minha senha</button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center gap-2 rounded-xl bg-[#0018a8] py-4 text-sm font-black text-white shadow-xl shadow-blue-900/30 hover:bg-blue-800 active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'ACESSANDO...' : 'ENTRAR NO PORTAL'}
                {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 text-center">
              <p className="text-xs text-slate-400 font-medium">Não tem uma conta?</p>
              <button
                onClick={onShowRegister}
                className="text-xs font-black text-primary hover:underline transition-colors uppercase tracking-widest"
              >
                Novo Cadastro
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito: Imagem da Fábrica (Contexto SWM) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0018a8]/90 via-black/40 to-black/20 z-10"></div>
        {/* Usando uma imagem industrial que evoca o complexo da SWM */}
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src={factoryHero}
          alt="Complexo Industrial SWM Brasil"
        />
        <div className="absolute bottom-0 left-0 right-0 z-20 p-20 text-white">
          <div className="max-w-xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-white/20">
              Operação Brasil
            </span>
            <h2 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Inovação e Qualidade em Papéis.</h2>
            <p className="text-lg text-slate-100/90 leading-relaxed font-medium">
              Garantindo a eficiência operacional através da gestão moderna de ativos e materiais.
            </p>

            <div className="mt-10 flex gap-10 border-t border-white/10 pt-10">
              <div>
                <p className="text-4xl font-black tracking-tighter">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Disponibilidade</p>
              </div>
              <div>
                <p className="text-4xl font-black tracking-tighter">+500</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Colaboradores</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
