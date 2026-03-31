import React, { useState, useEffect } from 'react';
import { X, UserPlus, Users, Eye, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { getUsers, createUser } from '../utils/auth';
import { User } from '../types';

interface AdminModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSwitchView: (username: string) => void;
  viewingAs: string;
}

export const AdminModal: React.FC<AdminModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchView,
  viewingAs
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
        const data = await getUsers();
        setUsers(data);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    setIsLoading(true);
    const result = await createUser(newUsername, newPassword);
    setIsLoading(false);
    
    if (result.success) {
      setMsg({ text: 'User created successfully', type: 'success' });
      setNewUsername('');
      setNewPassword('');
      loadUsers();
    } else {
      setMsg({ text: result.message || 'Error', type: 'error' });
    }
    
    setTimeout(() => setMsg({ text: '', type: '' }), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          <h2 className="text-lg font-bold text-amber-600 dark:text-amber-500 flex items-center gap-2">
            <Users size={20} /> Admin Dashboard
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-2 mb-6 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg">
             <button 
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'create' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
                Create User
             </button>
             <button 
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'list' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
             >
                View Games
             </button>
          </div>

          {activeTab === 'create' && (
            <form onSubmit={handleCreateUser} className="space-y-4">
               <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">New Username</label>
                <input
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Username"
                />
               </div>
               <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">New Password</label>
                <input
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="Password"
                    type="password"
                />
               </div>
               
               {msg.text && (
                 <div className={`text-xs p-2 rounded ${msg.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                    {msg.text}
                 </div>
               )}

               <Button className="w-full bg-amber-600 hover:bg-amber-700 focus:ring-amber-500" icon={isLoading ? <Loader2 className="animate-spin" /> : <UserPlus size={16} />} disabled={isLoading}>
                  Create User
               </Button>
            </form>
          )}

          {activeTab === 'list' && (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10">
                        <Loader2 className="animate-spin text-amber-500" />
                    </div>
                )}
                <p className="text-xs text-slate-500 mb-2">Select a user to view/manage their game:</p>
                {users.map(u => (
                    <div key={u.username} className={`flex items-center justify-between p-3 rounded-lg border ${viewingAs === u.username ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'}`}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-white uppercase">
                                {u.username.slice(0, 2)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{u.username}</div>
                                <div className="text-[10px] text-slate-500 uppercase">{u.role}</div>
                            </div>
                        </div>
                        <Button 
                            size="sm" 
                            variant={viewingAs === u.username ? 'primary' : 'secondary'}
                            onClick={() => {
                                onSwitchView(u.username);
                                onClose();
                            }}
                            icon={<Eye size={14} />}
                        >
                            {viewingAs === u.username ? 'Viewing' : 'View'}
                        </Button>
                    </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};