export interface Player {
  id: string;
  realName: string;
  lolName: string;
  mainChampion: string;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  wins: number;
  losses: number;
  winRate: number;
  gamesPlayed: number;
  rank: string;
  tier: string;
  lp: number;
  avatarUrl?: string;
  championImageUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  averageKda: number;
  totalWins: number;
  averageWinRate: number;
}