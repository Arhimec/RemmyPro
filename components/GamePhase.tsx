import React, { useState, useMemo } from 'react';
import { Flag, Plus, History, Crown, TrendingUp, AlertCircle, Zap, Lock, Hash } from 'lucide-react';
import { Player, Round } from '../types';
import { Button } from './ui/Button';
import { ScoreChart } from './ScoreChart';

interface GamePhaseProps {
  players: Player[];
  rounds: Round[];
  onAddRound: (scores: Record<string, number>, baseScores: Record<string, number>, metadata: { isDouble: boolean, atuPlayerId: string | null, closedPlayerId: string | null }) => void;
  onFinishGame: () => void;
  isDark: boolean;
}

export const GamePhase: React.FC<GamePhaseProps> = ({
  players,
  rounds,
  onAddRound,
  onFinishGame,
  isDark
}) => {
  const [currentScores, setCurrentScores] = useState<Record<string, string>>({});
  const [view, setView] = useState<'input' | 'history' | 'chart'>('input');
  const [error, setError] = useState<string | null>(null);

  // Round modifiers
  const [isDouble, setIsDouble] = useState(false);
  const [atuPlayer, setAtuPlayer] = useState<string | null>(null);
  const [closedPlayer, setClosedPlayer] = useState<string | null>(null);

  // Calculate ranks
  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => a.totalScore - b.totalScore);
  }, [players]);

  const leaderId = rankedPlayers[0]?.id;

  const handleScoreChange = (playerId: string, value: string) => {
    setError(null);
    if (value === '' || /^-?\d*$/.test(value)) {
      setCurrentScores(prev => ({ ...prev, [playerId]: value }));
    }
  };

  const toggleAtu = (playerId: string) => {
    if (atuPlayer === playerId) {
      setAtuPlayer(null);
    } else {
      setAtuPlayer(playerId);
    }
  };

  const toggleClosed = (playerId: string) => {
    if (closedPlayer === playerId) {
      setClosedPlayer(null);
    } else {
      setClosedPlayer(playerId);
    }
  };

  const submitRound = (e: React.FormEvent) => {
    e.preventDefault();
    const finalScores: Record<string, number> = {};
    const baseScores: Record<string, number> = {};
    let hasInput = false;
    let validationError = null;

    // Validation: Exactly one player must close
    if (!closedPlayer) {
        setError("One player must have the 'Inchidere' (Closed) status.");
        return;
    }

    players.forEach(p => {
      const val = currentScores[p.id];
      // Default to 0 if empty
      let baseVal = (val && val !== '-' && val !== '') ? parseInt(val, 10) : 0;
      
      // Validation: Base scores must be multiples of 5
      if (baseVal % 5 !== 0) {
          validationError = `Score for ${p.name} must be a multiple of 5`;
      }

      baseScores[p.id] = baseVal;
      
      // --- CALCULATION LOGIC ---
      // 1. Joc Dublu doubles the BASE points
      let calculatedScore = baseVal * (isDouble ? 2 : 1);

      // 2. Atu adds 50 points (not doubled)
      if (atuPlayer === p.id) {
        calculatedScore += 50;
      }

      // 3. Inchidere adds 50 points (not doubled)
      if (closedPlayer === p.id) {
        calculatedScore += 50;
      }

      finalScores[p.id] = calculatedScore;
      if (val) hasInput = true;
    });

    if (validationError) {
        setError(validationError);
        return;
    }

    // Allow submission even if 0s, provided user clicked save (implicit 0s)
    onAddRound(finalScores, baseScores, {
      isDouble,
      atuPlayerId: atuPlayer,
      closedPlayerId: closedPlayer
    });

    // Reset Form
    setCurrentScores({});
    setIsDouble(false);
    setAtuPlayer(null);
    setClosedPlayer(null);
    setView('input');
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 pb-20">
      {/* Header / Leaderboard Preview */}
      <div className="sticky top-0 z-30 pt-4 pb-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-2">
          <Button variant="danger" size="sm" onClick={onFinishGame} icon={<Flag size={16} />}>
            Finish Game
          </Button>
          <div className="text-center">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Round {rounds.length + 1}</h2>
          </div>
          <div className="w-[100px]">{/* Spacer to balance the header flex layout since undo is gone */}</div>
        </div>

        {/* Scores Grid - Replaces Horizontal Scroll */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
          {rankedPlayers.map((player) => (
            <div 
              key={player.id} 
              className={`
                p-2 rounded-lg border flex flex-col items-center relative transition-colors
                ${player.id === leaderId 
                    ? 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}
              `}
            >
              {player.id === leaderId && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-emerald-500 text-white dark:text-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg shadow-emerald-500/20">
                    <Crown size={8} />
                </div>
              )}
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate w-full text-center">{player.name}</span>
              <span className={`text-xl font-bold font-mono ${player.id === leaderId ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                {player.totalScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center my-6">
        <div className="bg-white dark:bg-slate-900 p-1 rounded-lg inline-flex border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-lg transition-colors">
            <button 
                onClick={() => setView('input')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'input' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                Enter Scores
            </button>
            <button 
                onClick={() => setView('chart')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'chart' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} /> Chart
                </div>
            </button>
            <button 
                onClick={() => setView('history')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'history' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <div className="flex items-center gap-2">
                    <History size={14} /> History
                </div>
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-fade-in">
        {view === 'input' && (
            <form onSubmit={submitRound} className="space-y-6">
                
                {/* Global Modifiers */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setIsDouble(!isDouble)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all font-bold ${
                            isDouble 
                                ? 'bg-amber-100 dark:bg-amber-500 text-amber-900 dark:text-slate-900 border-amber-300 dark:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <Hash size={18} />
                        JOC DUBLU (x2)
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {players.map(player => (
                        <div key={player.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-colors">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">{player.name}</label>
                                {isDouble && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded uppercase">x2 Active</span>}
                            </div>
                            
                            <div className="flex gap-3">
                                {/* Score Input */}
                                <div className="flex-1">
                                    <input
                                        inputMode="decimal"
                                        pattern="[0-9-]*"
                                        value={currentScores[player.id] || ''}
                                        onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                        placeholder="0"
                                        className="w-full h-12 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-4 text-lg font-mono text-center focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
                                    />
                                </div>
                                
                                {/* Modifiers */}
                                <div className="flex gap-2">
                                    {/* Atu Button */}
                                    <button
                                        type="button"
                                        onClick={() => toggleAtu(player.id)}
                                        className={`h-12 w-12 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                            atuPlayer === player.id
                                                ? 'bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/20'
                                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                                        }`}
                                        title="Atu (+50)"
                                    >
                                        <Zap size={18} fill={atuPlayer === player.id ? "currentColor" : "none"} />
                                        <span className="text-[9px] font-bold mt-0.5">+50</span>
                                    </button>

                                    {/* Inchidere Button */}
                                    <button
                                        type="button"
                                        onClick={() => toggleClosed(player.id)}
                                        className={`h-12 w-12 rounded-lg border flex flex-col items-center justify-center transition-all ${
                                            closedPlayer === player.id
                                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                                                : 'bg-slate-50 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900'
                                        }`}
                                        title="Inchidere (+50)"
                                    >
                                        <Lock size={16} />
                                        <span className="text-[9px] font-bold mt-0.5">+50</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10 p-3 rounded-lg border border-red-200 dark:border-red-400/20 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        className="w-full h-14 text-lg font-bold shadow-emerald-500/10" 
                        icon={<Plus size={20} />}
                    >
                        Save Round
                    </Button>
                </div>
            </form>
        )}

        {view === 'chart' && (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-2">Score Trajectory</h3>
                <ScoreChart players={players} rounds={rounds} isDark={isDark} />
            </div>
        )}

        {view === 'history' && (
            <div className="space-y-4">
                {rounds.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">No rounds played yet.</div>
                ) : (
                    [...rounds].reverse().map((round, idx) => (
                        <div key={round.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 transition-colors">
                            <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-800 pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Round {rounds.length - idx}</span>
                                    {round.isDouble && <span className="text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-500 px-1.5 py-0.5 rounded uppercase font-bold">x2 Double</span>}
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-600 font-mono">
                                    {new Date(round.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {players.map(p => (
                                    <div key={p.id} className="bg-slate-50 dark:bg-slate-950/50 rounded p-2 border border-slate-100 dark:border-slate-800/50 relative overflow-hidden transition-colors">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate mr-2">{p.name}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="flex gap-1">
                                                {round.atuPlayerId === p.id && <Zap size={12} className="text-blue-500 dark:text-blue-400" />}
                                                {round.closedPlayerId === p.id && <Lock size={12} className="text-emerald-500 dark:text-emerald-400" />}
                                            </div>
                                            <span className={`text-sm font-mono font-bold ${round.scores[p.id] > 0 ? 'text-slate-700 dark:text-slate-200' : round.scores[p.id] < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                                {round.scores[p.id]}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};