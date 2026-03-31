import React, { useState } from 'react';
import { Plus, User, Trash2, Play, Trophy, Medal } from 'lucide-react';
import { Player, CompletedGame } from '../types';
import { MAX_PLAYERS } from '../constants';
import { Button } from './ui/Button';

interface SetupPhaseProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (id: string) => void;
  onStartGame: () => void;
  lastGame?: CompletedGame;
}

export const SetupPhase: React.FC<SetupPhaseProps> = ({
  players,
  onAddPlayer,
  onRemovePlayer,
  onStartGame,
  lastGame
}) => {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() && players.length < MAX_PLAYERS) {
      onAddPlayer(newName.trim());
      setNewName('');
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pb-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <Trophy className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Remmy Pro</h1>
        <p className="text-slate-400">Score keeper with auto-save</p>
      </div>

      {/* Last Game Results Section */}
      {lastGame && (
        <div className="bg-gradient-to-br from-amber-500/10 to-slate-900/50 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-xl mb-6 animate-fade-in">
             <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Medal size={16} /> Last Game Results
             </h3>
             <div className="space-y-3">
                {/* Lowest score wins in Rummy */}
                {[...lastGame.players].sort((a, b) => a.totalScore - b.totalScore).map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                        <div className="flex items-center gap-3">
                             <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                i === 0 ? 'bg-amber-500 text-slate-950' : 
                                i === 1 ? 'bg-slate-400 text-slate-900' :
                                i === 2 ? 'bg-amber-800 text-slate-200' :
                                'bg-slate-800 text-slate-500'
                             }`}>
                                {i + 1}
                             </div>
                             <span className={`font-medium ${i === 0 ? 'text-amber-200' : 'text-slate-300'}`}>{p.name}</span>
                        </div>
                        <span className={`font-mono font-bold ${
                            i === 0
                                ? 'text-amber-400'
                                : p.totalScore < 0
                                    ? 'text-emerald-400'
                                    : 'text-slate-400'
                        }`}>
                            {p.totalScore}
                        </span>
                    </div>
                ))}
             </div>
             <div className="mt-3 text-right">
                <span className="text-[10px] text-slate-500">
                    Finished at {new Date(lastGame.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
             </div>
        </div>
      )}

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
        <form onSubmit={handleSubmit} className="mb-6 relative">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Add Players ({players.length}/{MAX_PLAYERS})
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter player name"
                    className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    autoFocus
                />
                <Button 
                    type="submit" 
                    disabled={!newName.trim() || players.length >= MAX_PLAYERS}
                    icon={<Plus size={18} />}
                >
                    Add
                </Button>
            </div>
        </form>

        <div className="space-y-2">
            {players.length === 0 && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                    No players added yet
                </div>
            )}
            {players.map((player) => (
                <div 
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50 group hover:border-slate-600 transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-950 font-bold text-sm"
                            style={{ backgroundColor: player.color }}
                        >
                            {player.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-slate-200">{player.name}</span>
                    </div>
                    <button 
                        onClick={() => onRemovePlayer(player.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
      </div>

      <Button
        onClick={onStartGame}
        disabled={players.length < 2}
        className="w-full h-12 text-lg"
        icon={<Play size={20} />}
      >
        Start New Game
      </Button>

      {players.length > 0 && players.length < 2 && (
         <p className="text-center text-slate-500 text-sm mt-4">Need at least 2 players to start</p>
      )}
    </div>
  );
};
