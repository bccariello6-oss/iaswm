import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;

      if (data) {
        setUsers(data.map(profile => ({
          id: profile.id,
          name: profile.full_name || 'Usuário Sem Nome',
          email: profile.email || 'N/A',
          role: profile.role as any || 'Visualização',
          status: profile.status as any || 'Ativo',
          lastAccess: profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A',
          avatarUrl: profile.avatar_url,
          department: profile.department
        })));
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Ativo' ? 'Inativo' : 'Ativo';
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus as any } : u));
    } catch (err) {
      console.error('Erro ao alternar status:', err);
    }
  };

  const updateRole = async (id: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', id);

      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole as any } : u));
    } catch (err) {
      console.error('Erro ao atualizar cargo:', err);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o usuário "${name}"? Esta ação removerá o acesso e excluirá todos os dados do perfil permanentemente.`)) return;

    try {
      setLoading(true);
      // Call Edge Function to delete from Auth
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { userId: id }
      });

      if (error) {
        console.error('Edge Function Error Object:', error);
        throw new Error(error.message || 'Erro desconhecido na Edge Function');
      }

      setUsers(prev => prev.filter(u => u.id !== id));
      alert(`Usuário ${name} excluído com sucesso.`);
    } catch (err: any) {
      console.error('Erro detalhado ao excluir usuário:', err);
      const errorMsg = err.message || 'Erro desconhecido';
      alert(`Erro ao excluir usuário: ${errorMsg}\n\n(Verifique o console para mais detalhes técnicos)`);
    } finally {
      setLoading(false);
    }
  };

  const handleManage = (name: string) => {
    alert(`Gerenciamento avançado para ${name} (Configurações de segurança e logs) em desenvolvimento.`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-2">Controle de acesso e permissões da equipe de manutenção.</p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2 group"
        >
          <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}>sync</span> Sincronizar
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário Real (Supabase)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Acesso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Última Ativ.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-700" style={{ backgroundImage: `url("${user.avatarUrl}")` }} />
                      ) : (
                        <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center ring-2 ring-slate-100 dark:ring-slate-700">
                          <span className="material-symbols-outlined text-slate-400 text-[20px]">person</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className={`text-[10px] font-bold uppercase rounded px-2 py-1 bg-transparent border-0 cursor-pointer focus:ring-0 ${user.role === 'Administrador' ? 'text-primary' : user.role === 'Edição' ? 'text-blue-600' : 'text-slate-500'
                        }`}
                    >
                      <option value="Administrador">Administrador</option>
                      <option value="Edição">Edição</option>
                      <option value="Visualização">Visualização</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Técnico">Técnico</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus(user.id, user.status)}
                        className={`w-10 h-5 rounded-full relative transition-all ${user.status === 'Ativo' ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`size-4 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${user.status === 'Ativo' ? 'left-[22px]' : 'left-0.5'}`} />
                      </button>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{user.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.lastAccess}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleManage(user.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                        title="Gerenciar Conta"
                      >
                        <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id, user.name)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Excluir Perfil"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
