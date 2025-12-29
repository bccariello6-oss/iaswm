import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Alerts from './pages/Alerts';
import PartDetails from './pages/PartDetails';
import PurchaseRequest from './pages/PurchaseRequest';
import Reports from './pages/Reports';
import Users from './pages/Users';
import Login from './pages/Login';
import Register from './pages/Register';
import { User } from './types';
import { supabase } from './lib/supabase';
import { MOCK_USERS } from './data';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    // Initial check
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Initial session check failed:', err);
        setLoading(false);
      }
    };

    checkSession();

    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      clearTimeout(timer); // Clear if we get an event
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setLoading(false);
      } else if (event === 'INITIAL_SESSION' && !session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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
          email: email || data.username || '',
          role: data.role as any || 'Técnico',
          status: 'Ativo',
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
      <Layout user={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/part/:id" element={<PartDetails />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/requests" element={<PurchaseRequest />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<div className="p-10 text-center font-bold">Configurações (Em Breve)</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
