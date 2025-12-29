
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';
// @ts-ignore
import swmLogo from '../assets/swm_logo.jpg';
// @ts-ignore
import logoSvg from '../assets/logo.svg';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
    { label: 'Inventário', icon: 'inventory_2', path: '/inventory' },
    { label: 'Alertas', icon: 'notifications_active', path: '/alerts' },
    { label: 'Requisições', icon: 'assignment', path: '/requests' },
    { label: 'Relatórios', icon: 'description', path: '/reports' },
    { label: 'Usuários', icon: 'group', path: '/users' },
    { label: 'Configurações', icon: 'settings', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-display overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area & User Welcome */}
          <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 gap-3">
            <img src={swmLogo} alt="SWM Logo" className="h-16 w-auto object-contain" />
            <div className="text-center">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Bem-vindo,</p>
              <p className="text-sm font-black text-slate-700 dark:text-slate-200 leading-tight">{user.name}</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-primary/10 text-primary font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                `}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive(item.path) ? 'fill-1' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.label}</span>
                {isActive(item.path) && (
                  <span className="ml-auto size-1.5 rounded-full bg-primary"></span>
                )}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
            <button
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="text-sm font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 h-20 flex items-center justify-between px-8 gap-4 shrink-0 z-40 shadow-sm">
          {/* Mobile Toggle */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-400">
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>

          {/* Spacer / Breadcrumbs (Placeholder) */}
          <div className="hidden md:block text-slate-400 text-sm">
            {/* Pode adicionar breadcrumbs aqui no futuro */}
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Bell */}
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
              <span className="material-symbols-outlined text-[24px]">notifications</span>
              <span className="absolute top-2 right-2 size-2.5 bg-red-500 border-2 border-white dark:border-surface-dark rounded-full"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>

            {/* SWM Logo (Secondary placement if requested by "add to top right") */}
            {/* Keeping it subtle or user might mean the sidebar one. I'll add the user profile here mostly. */}

            {/* App Interaction: Nova Solicitação */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95">
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span className="text-sm font-black uppercase tracking-wide">Nova Solicitação</span>
            </button>

            {/* Extra SWM Logo as requested "canto superior direito" */}
            <img src={swmLogo} alt="SWM" className="h-8 w-auto object-contain hidden lg:block" />

          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
