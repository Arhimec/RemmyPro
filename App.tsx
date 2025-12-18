import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { LogOut, Settings, Sun, Moon, Loader2 } from 'lucide-react';
import { usePersistedState } from './hooks/usePersistedState';
import { GamePhase } from './components/GamePhase';
import { Login } from './components/Login';
import { AdminModal } from './components/AdminModal';
import { Button } from './components/ui/Button';
import { Dashboard } from './components/Dashboard';
import { NewGameSetup } from './components/NewGameSetup';
import { ManagePlayers } from './components/ManagePlayers';
import { Leaderboard } from './components/Leaderboard';
import { GameState, GameStatus, Player, Round, User, CompletedGame, RosterPlayer } from './types';
import { PLAYER_COLORS, STORAGE_KEY_PREFIX, ROSTER_KEY_PREFIX } from './constants';

const INITIAL_GAME_STATE: GameState = {
  players: [],
  rounds: [],
  status: GameStatus.SETUP, 
  history: []
};

type ViewState = 'dashboard' | 'new-game' | 'manage-players' | 'leaderboard';

// Game Container handles the logic for a specific user
const GameContainer: React.FC<{ 
  storageKey: string,
  rosterKey: string,
  userTitle: string,
  isDark: boolean,
}> = ({ storageKey, rosterKey, userTitle, isDark }) => {
  const [gameState, setGameState, isGameLoading] = usePersistedState<GameState>(INITIAL_GAME_STATE, storageKey);
  const [roster, setRoster, isRosterLoading] = usePersistedState<RosterPlayer[]>([], rosterKey);
  
  const [view, setView] = useState<ViewState>('dashboard');
  
  // Show loader while fetching data from backend
  if (isGameLoading || isRosterLoading) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">Loading game data...</p>
          </div>
      );
  }

  const activeView = gameState.status === GameStatus.PLAYING ? 'playing' : view;

  // -- Roster Logic --
  const updateRoster = (newRoster: RosterPlayer[]) => {
    setRoster(newRoster);
  };

  // -- Game Logic --
  const handleStartGame = useCallback((selectedPlayerIds: string[]) => {
    const selectedPlayers = roster.filter(p => selectedPlayerIds.includes(p.id));
    
    // Create Game Players from Roster Players
    const newGamePlayers: Player[] = selectedPlayers.map((p, idx) => ({
        id: p.id,
        name: p.name,
        totalScore: 0,
        color: PLAYER_COLORS[idx % PLAYER_COLORS.length]
    }));

    setGameState(prev => ({
      ...prev,
      players: newGamePlayers,
      rounds: [],
      status: GameStatus.PLAYING,
    }));
  }, [roster, setGameState]);

  const handleAddRound = useCallback((
    scores: Record<string, number>, 
    baseScores: Record<string, number>, 
    metadata: { isDouble: boolean, atuPlayerId: string | null, closedPlayerId: string | null }
  ) => {
    setGameState(prev => {
      const newRound: Round = {
        id: uuidv4(),
        scores, // Final scores
        baseScores, // Metadata for history/recalc
        timestamp: Date.now(),
        ...metadata
      };

      const updatedPlayers = prev.players.map(player => ({
        ...player,
        totalScore: player.totalScore + (scores[player.id] || 0)
      }));

      return {
        ...prev,
        players: updatedPlayers,
        rounds: [...prev.rounds, newRound],
      };
    });
  }, [setGameState]);

  const handleFinishGame = useCallback(() => {
    setGameState(prev => {
        const completedGame: CompletedGame = {
            id: uuidv4(),
            timestamp: Date.now(),
            players: prev.players,
            rounds: prev.rounds
        };

        return {
            ...prev,
            status: GameStatus.SETUP,
            players: [],
            rounds: [],
            history: [...(prev.history || []), completedGame]
        };
    });
    setView('dashboard');
  }, [setGameState]);

  // -- Render Logic --

  if (activeView === 'playing') {
      return (
        <>
            <div className="absolute top-4 left-4 z-10 hidden md:block">
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest border border-slate-200 dark:border-slate-800 px-2 py-1 rounded">
                Game: {userTitle}
                </span>
            </div>
            <GamePhase
                players={gameState.players}
                rounds={gameState.rounds}
                onAddRound={handleAddRound}
                onFinishGame={handleFinishGame}
                isDark={isDark}
            />
        </>
      );
  }

  // Dashboard Navigation Views
  switch (view) {
      case 'new-game':
          return (
              <NewGameSetup 
                  roster={roster} 
                  onStart={handleStartGame} 
                  onBack={() => setView('dashboard')}
                  onManagePlayers={() => setView('manage-players')}
              />
          );
      case 'manage-players':
          return (
              <ManagePlayers 
                  roster={roster} 
                  onUpdateRoster={updateRoster} 
                  onBack={() => setView('dashboard')} 
              />
          );
      case 'leaderboard':
          return (
              <Leaderboard 
                  history={gameState.history || []} 
                  onBack={() => setView('dashboard')} 
              />
          );
      case 'dashboard':
      default:
          return (
              <Dashboard 
                  onNewGame={() => setView('new-game')}
                  onManagePlayers={() => setView('manage-players')}
                  onLeaderboard={() => setView('leaderboard')}
              />
          );
  }
};

export default function App() {
  // Initialize user from localStorage
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('remmy_pro_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminModalOpen, setAdminModalOpen] = useState(false);
  
  // Initialize viewingAsUser from localStorage or fallback to logged in user
  const [viewingAsUser, setViewingAsUser] = useState<string>(() => {
    try {
      const savedView = localStorage.getItem('remmy_pro_viewing_as');
      if (savedView) return savedView;
      const savedUser = localStorage.getItem('remmy_pro_user');
      return savedUser ? JSON.parse(savedUser).username : '';
    } catch {
      return '';
    }
  });
  
  // Theme State - defaults to Dark (true) until loaded
  const [isDark, setIsDark, isThemeLoading] = usePersistedState<boolean>(true, 'remmy_pro_theme');

  useEffect(() => {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setViewingAsUser(loggedInUser.username);
    localStorage.setItem('remmy_pro_user', JSON.stringify(loggedInUser));
    localStorage.setItem('remmy_pro_viewing_as', loggedInUser.username);
  };

  const handleLogout = () => {
    setUser(null);
    setViewingAsUser('');
    setAdminModalOpen(false);
    localStorage.removeItem('remmy_pro_user');
    localStorage.removeItem('remmy_pro_viewing_as');
  };

  const handleSwitchView = (username: string) => {
    setViewingAsUser(username);
    localStorage.setItem('remmy_pro_viewing_as', username);
  };

  const activeStorageKey = useMemo(() => `${STORAGE_KEY_PREFIX}${viewingAsUser}`, [viewingAsUser]);
  const activeRosterKey = useMemo(() => `${ROSTER_KEY_PREFIX}${viewingAsUser}`, [viewingAsUser]);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      {/* Top Bar - Minimal */}
      <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm z-50 transition-colors">
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${user.role === 'admin' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                {user.username} {viewingAsUser !== user.username && <span className="text-slate-500">({viewingAsUser})</span>}
            </span>
        </div>
        <div className="flex gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDark(!isDark)}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            {user.role === 'admin' && (
                <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setAdminModalOpen(true)}
                    icon={<Settings size={16} />}
                >
                    Admin
                </Button>
            )}
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout}
            >
                <LogOut size={18} />
            </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <GameContainer 
            key={activeStorageKey} 
            storageKey={activeStorageKey}
            rosterKey={activeRosterKey}
            userTitle={viewingAsUser}
            isDark={isDark}
        />
      </div>

      {user.role === 'admin' && (
        <AdminModal 
            currentUser={user}
            isOpen={isAdminModalOpen}
            onClose={() => setAdminModalOpen(false)}
            onSwitchView={handleSwitchView}
            viewingAs={viewingAsUser}
        />
      )}
    </div>
  );
}