import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Notification } from '../types';
import { supabase } from '../lib/supabase';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('notifications_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setNotifications(data);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { label: 'Dashboard', icon: 'dashboard', path: '/' },
    { label: 'Inventário', icon: 'inventory_2', path: '/inventory' },
    { label: 'Alertas', icon: 'notifications', path: '/alerts' },
    { label: 'Requisições de Material', icon: 'description', path: '/requests' },
    { label: 'Requisições de Serviço', icon: 'engineering', path: '/service-requests' },
    { label: 'Escopo de Serviço', icon: 'assignment_turned_in', path: '/service-scope' },
    { label: 'Relatórios', icon: 'insert_chart', path: '/reports' },
    { label: 'Usuários', icon: 'group', path: '/users' },
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
          <div className="p-8 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-800 gap-4">
            <div className="flex flex-col items-center gap-1">
              <img src={swmLogo} alt="SWM Logo" className="h-20 w-auto object-contain" />
              <p className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">CSM SWM STN - BRASIL</p>
            </div>
            <div className="text-center mt-2">
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

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative group mx-4">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
            <input
              type="text"
              placeholder="Buscar materiais, ordens ou serviços..."
              className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-sm focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-800">CTRL</span>
              <span className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-bold bg-white dark:bg-slate-800">K</span>
            </div>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center gap-6 ml-auto">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              >
                <span className="material-symbols-outlined text-[24px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 size-2.5 bg-red-500 border-2 border-white dark:border-surface-dark rounded-full animate-pulse"></span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 dark:text-white">Notificações</h4>
                      <button onClick={markAllAsRead} className="text-xs text-primary font-bold hover:underline">Limpar tudo</button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <span className="material-symbols-outlined text-4xl mb-2">notifications_none</span>
                          <p className="text-sm">Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            onClick={() => markAsRead(notif.id)}
                            className={`p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${!notif.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'critical' ? 'bg-red-100 text-red-600' :
                                notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                  'bg-primary/10 text-primary'
                                }`}>
                                <span className="material-symbols-outlined text-[20px]">
                                  {notif.type === 'critical' ? 'emergency' : notif.type === 'warning' ? 'warning' : 'info'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-bold truncate ${notif.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>{notif.title}</p>
                                <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{notif.message}</p>
                                <p className="text-[10px] text-slate-400 mt-2">{new Date(notif.created_at).toLocaleString('pt-BR')}</p>
                              </div>
                              {!notif.read && <div className="size-2 rounded-full bg-primary mt-1 shrink-0"></div>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center">
                      <Link to="/alerts" onClick={() => setIsNotifOpen(false)} className="text-xs font-bold text-slate-500 hover:text-primary">Ver todos os alertas</Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <div className="flex items-center gap-3">
              <Link to="/requests" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white shadow-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all active:scale-95 group">
                <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-white transition-colors">inventory_2</span>
                <span className="text-[11px] font-black uppercase tracking-widest">Novo Material</span>
              </Link>
              <Link to="/service-requests" className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 group">
                <span className="material-symbols-outlined text-[18px] group-hover:rotate-12 transition-transform">engineering</span>
                <span className="text-[11px] font-black uppercase tracking-widest">Novo Serviço</span>
              </Link>
            </div>
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
