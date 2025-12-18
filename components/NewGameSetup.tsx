import React, { useState } from 'react';
import { ChevronLeft, Play, UserPlus, Users } from 'lucide-react';
import { RosterPlayer } from '../types';
import { Button } from './ui/Button';
import { MIN_PLAYERS, MAX_PLAYERS } from '../constants';

interface NewGameSetupProps {
  roster: RosterPlayer[];
  onStart: (selectedPlayerIds: string[]) => void;
  onBack: () => void;
  onManagePlayers: () => void;
}

export const NewGameSetup: React.FC<NewGameSetupProps> = ({ 
  roster, 
  onStart, 
  onBack,
  onManagePlayers
}) => {
  const [numPlayers, setNumPlayers] = useState(MIN_PLAYERS);
  // Array of selected roster IDs
  const [selections, setSelections] = useState<string[]>(Array(MAX_PLAYERS).fill(""));

  const handleSelectionChange = (index: number, value: string) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);
  };

  const isValid = () => {
    // Check if we have enough selections for the chosen number of players
    const activeSelections = selections.slice(0, numPlayers);
    // All must be selected (not empty string)
    if (activeSelections.some(s => s === "")) return false;
    // All must be unique
    const unique = new Set(activeSelections);
    return unique.size === activeSelections.length;
  };

  const handleStart = () => {
    if (isValid()) {
        onStart(selections.slice(0, numPlayers));
    }
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 pt-4 pb-10 flex flex-col h-full animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-900 dark:text-slate-100">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">New Game Setup</h1>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Number of Players
        </label>
        <div className="flex gap-2">
            {[2, 3, 4].map(num => (
                <button
                    key={num}
                    onClick={() => {
                        setNumPlayers(num);
                        // Reset selections slightly if reducing count to avoid hidden state issues
                        if (num < numPlayers) {
                             const newSelections = [...selections];
                             for(let i = num; i < MAX_PLAYERS; i++) newSelections[i] = "";
                             setSelections(newSelections);
                        }
                    }}
                    className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all ${
                        numPlayers === num 
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                >
                    {num}
                </button>
            ))}
        </div>
      </div>

      <div className="space-y-4 mb-8">
         <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Select Players
             </label>
             <button onClick={onManagePlayers} className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1">
                <UserPlus size={14} /> Add New
             </button>
         </div>

         {roster.length < MIN_PLAYERS ? (
             <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-center">
                 <p className="text-amber-600 dark:text-amber-200 mb-2">Not enough players in roster.</p>
                 <Button size="sm" onClick={onManagePlayers}>Add Players</Button>
             </div>
         ) : (
             Array.from({ length: numPlayers }).map((_, idx) => (
                <div key={idx} className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Users size={18} />
                    </div>
                    <select
                        value={selections[idx]}
                        onChange={(e) => handleSelectionChange(idx, e.target.value)}
                        className={`w-full appearance-none bg-white dark:bg-slate-900 border rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                            selections[idx] === "" ? 'text-slate-500 border-slate-200 dark:border-slate-700' : 'text-slate-900 dark:text-white border-slate-300 dark:border-slate-600'
                        }`}
                    >
                        <option value="">Select Player {idx + 1}...</option>
                        {roster.map(p => {
                            // Only show if not selected in OTHER dropdowns
                            const isSelectedElsewhere = selections.some((selId, selIdx) => selId === p.id && selIdx !== idx && selIdx < numPlayers);
                            
                            if (isSelectedElsewhere) return null;

                            return (
                                <option 
                                    key={p.id} 
                                    value={p.id}
                                >
                                    {p.name}
                                </option>
                            );
                        })}
                    </select>
                </div>
             ))
         )}
      </div>

      <div className="mt-auto">
        <Button 
            onClick={handleStart} 
            disabled={!isValid()} 
            className="w-full h-14 text-lg font-bold"
            icon={<Play size={20} />}
        >
            Start Game
        </Button>
      </div>
    </div>
  );
};