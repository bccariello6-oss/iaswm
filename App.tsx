import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { User } from './types';
import { supabase } from './lib/supabase';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Alerts = lazy(() => import('./pages/Alerts'));
const PartDetails = lazy(() => import('./pages/PartDetails'));
const PurchaseRequest = lazy(() => import('./pages/PurchaseRequest'));
const ServiceRequest = lazy(() => import('./pages/ServiceRequest'));
const ServiceScope = lazy(() => import('./pages/ServiceScope'));
const Reports = lazy(() => import('./pages/Reports'));
const Users = lazy(() => import('./pages/Users'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const IncomingRequests = lazy(() => import('./pages/IncomingRequests'));

const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register'>('login');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    let mounted = true;

    // Monitor connectivity
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session) {
        // Optimistic update: set user with email immediately to speed up UI transition
        if (!currentUser || currentUser.id !== session.user.id) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.email?.split('@')[0] || 'Usuário',
            email: session.user.email || '',
            role: 'Técnico', // Default role until profile is loaded
            status: 'Ativo',
            lastAccess: 'Agora',
            avatarUrl: ''
          });

          // Fetch full profile in background
          fetchProfile(session.user.id, session.user.email);
        }
      } else {
        setCurrentUser(null);
        setLoading(false);
      }

      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Connection status banner component
  const ConnectionStatus = () => {
    if (isOnline) return null;
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500/50 backdrop-blur-sm">
          <span className="material-symbols-outlined animate-pulse">cloud_off</span>
          <div>
            <p className="text-sm font-black uppercase tracking-wider">Modo Offline</p>
            <p className="text-[10px] opacity-80">Tentando reconectar ao Supabase...</p>
          </div>
        </div>
      </div>
    );
  };

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.full_name || data.username || 'Usuário',
          email: data.email || email || data.username || '',
          role: data.role as any || 'Visualização',
          status: data.status as any || 'Ativo',
          lastAccess: 'Agora',
          avatarUrl: data.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Fallback
      setCurrentUser({
        id: userId,
        name: 'Usuário',
        email: email || '',
        role: 'Técnico',
        status: 'Ativo',
        lastAccess: 'Agora',
        avatarUrl: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentUser) {
    return view === 'login' ? (
      <Login onLogin={() => { }} onShowRegister={() => setView('register')} />
    ) : (
      <Register onBackToLogin={() => setView('login')} />
    );
  }

  return (
    <Router>
      <ConnectionStatus />
      <Layout user={currentUser} onLogout={handleLogout}>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/escopo" element={<ServiceScope user={currentUser} />} />
            <Route path="/" element={<Dashboard user={currentUser} />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/part/:id" element={<PartDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/requests" element={<PurchaseRequest />} />
            <Route path="/service-requests" element={<ServiceRequest />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/incoming-requests" element={<IncomingRequests />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
};

export default App;
