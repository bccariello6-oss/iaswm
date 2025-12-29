
import React, { useState } from 'react';
import { MOCK_USERS } from '../data';
import { User } from '../types';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  const toggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u
    ));
  };

  return (
    <div className="container mx-auto p-6 md:p-8 lg:p-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Gestão de Usuários</h1>
          <p className="text-slate-500 mt-2">Controle de acesso e permissões da equipe de manutenção.</p>
        </div>
        <button className="h-11 px-5 rounded-xl bg-primary font-bold text-sm text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span> Adicionar Usuário
        </button>
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Função</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Último Acesso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-cover bg-center ring-2 ring-slate-100 dark:ring-slate-700" style={{ backgroundImage: `url("${user.avatarUrl}")` }} />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono uppercase">ID: {user.id.padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      user.role === 'Admin' ? 'bg-blue-50 text-blue-700' : user.role === 'Gerente' ? 'bg-purple-50 text-purple-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => toggleStatus(user.id)}
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
                        <button className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
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
