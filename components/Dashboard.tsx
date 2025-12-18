import React from 'react';
import { Play, Users, Trophy, LogOut } from 'lucide-react';
import { Button } from './ui/Button';

interface DashboardProps {
  onNewGame: () => void;
  onManagePlayers: () => void;
  onLeaderboard: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNewGame, 
  onManagePlayers, 
  onLeaderboard 
}) => {
  return (
    <div className="max-w-md mx-auto w-full px-4 pt-8 pb-10 flex flex-col h-full animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <Trophy className="w-10 h-10 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Remmy Pro</h1>
        <p className="text-slate-500 dark:text-slate-400">Premium Scorekeeper</p>
      </div>

      <div className="space-y-4 flex-1">
        <button 
            onClick={onNewGame}
            className="w-full bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:bg-emerald-700 text-white p-6 rounded-2xl flex items-center gap-4 transition-all shadow-xl shadow-emerald-900/20 dark:shadow-emerald-900/20 group border border-emerald-500/20"
        >
            <div className="bg-emerald-500/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                <Play size={32} />
            </div>
            <div className="text-left">
                <div className="text-xl font-bold">New Game</div>
                <div className="text-emerald-100 dark:text-emerald-200 text-sm">Start a fresh match</div>
            </div>
        </button>

        <button 
            onClick={onLeaderboard}
            className="w-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-750 text-slate-900 dark:text-white p-6 rounded-2xl flex items-center gap-4 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
            <div className="bg-amber-100 dark:bg-slate-700 p-3 rounded-xl">
                <Trophy size={28} className="text-amber-500 dark:text-amber-400" />
            </div>
            <div className="text-left">
                <div className="text-lg font-bold">Leaderboard</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">View past games & stats</div>
            </div>
        </button>

        <button 
            onClick={onManagePlayers}
            className="w-full bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-slate-100 dark:active:bg-slate-750 text-slate-900 dark:text-white p-6 rounded-2xl flex items-center gap-4 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        >
            <div className="bg-blue-100 dark:bg-slate-700 p-3 rounded-xl">
                <Users size={28} className="text-blue-500 dark:text-blue-400" />
            </div>
            <div className="text-left">
                <div className="text-lg font-bold">Manage Players</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">Manage your roster</div>
            </div>
        </button>
      </div>
      
      <div className="text-center mt-8 text-xs text-slate-500 dark:text-slate-600">
        v1.2.1 • Mobile Optimized
      </div>
    </div>
  );
};