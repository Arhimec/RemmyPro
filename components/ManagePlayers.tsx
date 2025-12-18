import React, { useState } from 'react';
import { ChevronLeft, Plus, Trash2, User } from 'lucide-react';
import { RosterPlayer } from '../types';
import { Button } from './ui/Button';
import { v4 as uuidv4 } from 'uuid';

interface ManagePlayersProps {
  roster: RosterPlayer[];
  onUpdateRoster: (newRoster: RosterPlayer[]) => void;
  onBack: () => void;
}

export const ManagePlayers: React.FC<ManagePlayersProps> = ({ roster, onUpdateRoster, onBack }) => {
  const [name, setName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Check duplicates
    if (roster.some(p => p.name.toLowerCase() === name.trim().toLowerCase())) {
        alert('Player already exists!');
        return;
    }

    const newPlayer: RosterPlayer = { id: uuidv4(), name: name.trim() };
    onUpdateRoster([...roster, newPlayer]);
    setName('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this player from your roster?')) {
        onUpdateRoster(roster.filter(p => p.id !== id));
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-4 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-4 mb-6 flex-shrink-0">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-100">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Manage Players</h1>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6 flex-shrink-0">
        <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <User size={18} />
            </div>
            <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player Name"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors"
            />
        </div>
        <Button type="submit" icon={<Plus size={20} />} disabled={!name.trim()}>
            Add
        </Button>
      </form>

      <div className="space-y-2 overflow-y-auto flex-1 pb-4">
        {roster.length === 0 && (
            <div className="text-center text-slate-500 py-10 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                No players in roster.
            </div>
        )}
        {roster.map(player => (
            <div key={player.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
                <span className="font-medium text-slate-900 dark:text-slate-200">{player.name}</span>
                <button 
                    type="button"
                    onClick={() => handleDelete(player.id)}
                    className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 rounded-lg transition-colors cursor-pointer"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};