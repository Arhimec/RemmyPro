import React, { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronUp, Clock, Trophy, Lock, Zap } from 'lucide-react';
import { CompletedGame } from '../types';

interface LeaderboardProps {
  history: CompletedGame[];
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ history, onBack }) => {
  // Sort by timestamp desc
  const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);

  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedGameId(prev => prev === id ? null : id);
  };

  return (
    <div className="max-w-lg mx-auto w-full px-4 pt-4 pb-10 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-100">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
      </div>

      <div className="space-y-4 overflow-y-auto pb-8">
        {sortedHistory.length === 0 && (
            <div className="text-center text-slate-500 py-12">
                <Trophy size={48} className="mx-auto mb-4 opacity-20" />
                No games played yet.
            </div>
        )}

        {sortedHistory.map(game => {
            // Lowest score wins in Rummy
            const winner = [...game.players].sort((a, b) => a.totalScore - b.totalScore)[0];
            const isExpanded = expandedGameId === game.id;

            return (
                <div key={game.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
                    {/* Header Card */}
                    <div 
                        onClick={() => toggleExpand(game.id)}
                        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-amber-100 dark:bg-amber-500/10 w-10 h-10 rounded-full flex items-center justify-center border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-500 font-bold">
                                {winner.name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    {winner.name} <span className="text-amber-600 dark:text-amber-500 text-xs px-1.5 py-0.5 bg-amber-100 dark:bg-amber-500/10 rounded-full">WINNER</span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                    <Clock size={12} />
                                    {new Date(game.timestamp).toLocaleDateString()} • {new Date(game.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                        <div className="text-slate-400 dark:text-slate-500">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                        <div className="bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 p-4 animate-fade-in transition-colors">
                            {/* Final Scores */}
                            <div className="mb-4">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Final Scores</h4>
                                <div className="space-y-1">
                                    {[...game.players].sort((a, b) => a.totalScore - b.totalScore).map((p, idx) => (
                                        <div key={p.id} className="flex justify-between text-sm">
                                            <span className={`${idx === 0 ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-slate-700 dark:text-slate-300'}`}>{idx+1}. {p.name}</span>
                                            <span className={`font-mono ${
                                                p.totalScore < 0
                                                    ? 'text-emerald-500 dark:text-emerald-400'
                                                    : 'text-slate-500 dark:text-slate-400'
                                            }`}>
                                                {p.totalScore}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Rounds Table */}
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Round History</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                                <th className="py-1">Rnd</th>
                                                {game.players.map(p => (
                                                    <th key={p.id} className="py-1 px-2 font-normal truncate max-w-[60px]">{p.name}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {game.rounds.map((round, rIdx) => (
                                                <tr key={round.id} className="border-b border-slate-200 dark:border-slate-800/50 last:border-0">
                                                    <td className="py-2 text-slate-500 dark:text-slate-600 font-mono">
                                                        <div className="flex flex-col items-center">
                                                            {rIdx + 1}
                                                            {round.isDouble && <span className="text-[8px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-1 rounded">x2</span>}
                                                        </div>
                                                    </td>
                                                    {game.players.map(p => (
                                                        <td key={p.id} className="py-2 px-2 font-mono align-top">
                                                            <div className="flex flex-col items-start gap-0.5">
                                                                <span className={
                                                                    round.scores[p.id] < 0
                                                                        ? 'text-rose-500 dark:text-rose-400'
                                                                        : round.scores[p.id] === 0
                                                                            ? 'text-slate-400 dark:text-slate-500'
                                                                            : 'text-slate-700 dark:text-slate-300'
                                                                }>
                                                                    {round.scores[p.id]}
                                                                </span>
                                                                <div className="flex gap-0.5">
                                                                     {round.atuPlayerId === p.id && <Zap size={8} className="text-blue-500 dark:text-blue-400" />}
                                                                     {round.closedPlayerId === p.id && <Lock size={8} className="text-emerald-500 dark:text-emerald-400" />}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
};
