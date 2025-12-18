export type Player = {
  id: string;
  name: string;
  totalScore: number;
  color: string;
};

export type RosterPlayer = {
  id: string;
  name: string;
};

export type Round = {
  id: string;
  scores: Record<string, number>; // Map of playerID -> FINAL calculated score
  baseScores: Record<string, number>; // Map of playerID -> Raw input score
  timestamp: number;
  isDouble: boolean;
  atuPlayerId: string | null;
  closedPlayerId: string | null;
};

export enum GameStatus {
  SETUP = 'SETUP',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export type CompletedGame = {
  id: string;
  timestamp: number;
  players: Player[];
  rounds: Round[];
};

export type GameState = {
  players: Player[];
  rounds: Round[];
  status: GameStatus;
  history: CompletedGame[];
};

export type UserRole = 'admin' | 'user';

export type User = {
  username: string;
  password?: string; // stored in localstorage mock db
  role: UserRole;
};