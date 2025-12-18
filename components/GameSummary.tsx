import React, { useMemo } from 'react';
import { Player, Round } from '../types';
import { Trophy, Medal, RotateCcw } from 'lucide-react';
import { Button } from './ui/Button';
import { ScoreChart } from './ScoreChart';

interface GameSummaryProps {
  players: Player[];
  rounds: Round[];
  onStartNewGame: () => void;
  isDark: boolean;
}

export const GameSummary: React.FC<GameSummaryProps> = ({ players, rounds, onStartNewGame, isDark }) => {
  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.totalScore - a.totalScore); 
  }, [players]);

  const winner = rankedPlayers[0];

  return (
    <div className="max-w-2xl mx-auto w-full px-4 pt-10 pb-20">
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center p-4 bg-amber-500/10 rounded-full mb-4 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Trophy className="w-12 h-12 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Game Finished!</h1>
        <p className="text-slate-400">Here are the final results</p>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
        <div className="space-y-4">
            {rankedPlayers.map((player, index) => (
                <div 
                    key={player.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                        index === 0 
                            ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30' 
                            : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${
                            index === 0 ? 'bg-amber-500 text-slate-900' :
                            index === 1 ? 'bg-slate-300 text-slate-900' :
                            index === 2 ? 'bg-amber-700 text-slate-200' :
                            'bg-slate-800 text-slate-500'
                        }`}>
                            {index < 3 ? <Medal size={16} /> : index + 1}
                        </div>
                        <div>
                            <span className={`font-semibold text-lg ${index === 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                                {player.name}
                            </span>
                        </div>
                    </div>
                    <span className={`text-2xl font-bold font-mono ${index === 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {player.totalScore}
                    </span>
                </div>
            ))}
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-8">
         <h3 className="text-sm font-semibold text-slate-400 mb-4">Game Progression</h3>
         <ScoreChart players={players} rounds={rounds} isDark={isDark} />
      </div>

      <Button 
        onClick={onStartNewGame} 
        className="w-full h-14 text-lg"
        icon={<RotateCcw size={20} />}
      >
        Start New Game
      </Button>
    </div>
  );
};