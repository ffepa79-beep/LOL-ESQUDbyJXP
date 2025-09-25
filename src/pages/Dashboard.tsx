import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown, Users } from "lucide-react";
import { Player } from "@/types/Player";
import { useSupabasePlayerManager } from "@/hooks/useSupabasePlayerManager";
import HallOfFame from "@/components/HallOfFame";

const Dashboard = () => {
  const { players, loading, updatePlayer, isAuthenticated } = useSupabasePlayerManager();
  
  // Organizar os dados
  const sortedByWinRate = [...players].sort((a, b) => b.winRate - a.winRate);
  const sortedByKDA = [...players].sort((a, b) => b.kda - a.kda);
  const sortedByWins = [...players].sort((a, b) => b.wins - a.wins);
  const sortedByLosses = [...players].sort((a, b) => b.losses - a.losses);
  
  const top5Winners = sortedByWinRate.slice(0, 5);
  const top5KDA = sortedByKDA.slice(0, 5);
  const top5Losers = sortedByLosses.slice(0, 5);

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case 'iron': return 'bg-gray-600';
      case 'bronze': return 'bg-amber-600';
      case 'silver': return 'bg-gray-400';
      case 'gold': return 'bg-yellow-400';
      case 'platinum': return 'bg-cyan-400';
      case 'diamond': return 'bg-blue-400';
      case 'master': return 'bg-purple-500';
      case 'grandmaster': return 'bg-red-500';
      case 'challenger': return 'bg-gradient-gold';
      default: return 'bg-gray-500';
    }
  };

  const PlayerCard = ({ player, rank, showStat, statLabel }: { 
    player: Player; 
    rank: number; 
    showStat: string | number;
    statLabel: string;
  }) => (
    <div className="flex items-center space-x-4 p-4 bg-gradient-card rounded-lg border border-border/50 hover:shadow-glow transition-all duration-300">
      <div className="flex-shrink-0">
        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-lg">
          #{rank}
        </div>
      </div>
      
      <div className="flex-grow">
        <div className="flex items-center space-x-2 mb-1">
          <h3 className="font-semibold text-foreground">{player.realName}</h3>
          <Badge variant="outline" className="text-xs">
            {player.lolName}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          <span>{player.mainChampion}</span>
          <Badge className={`${getRankColor(player.rank)} text-white text-xs`}>
            {player.rank} {player.tier}
          </Badge>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-bold text-primary">{showStat}</div>
        <div className="text-xs text-muted-foreground">{statLabel}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Dashboard dos Invocadores
          </h1>
          <p className="text-muted-foreground text-lg">
            Estatísticas completas dos {players.length} jogadores do grupo
          </p>
        </div>

        {/* Hall da Fama */}
        <HallOfFame 
          players={players} 
          onUpdatePlayer={updatePlayer}
          isAuthenticated={isAuthenticated}
        />

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="w-4 h-4 mr-2 text-primary" />
                Total de Jogadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{players.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Trophy className="w-4 h-4 mr-2 text-lol-win" />
                Média de Vitórias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-lol-win">
                {Math.round(players.reduce((acc, p) => acc + p.wins, 0) / players.length)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                KDA Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {(players.reduce((acc, p) => acc + p.kda, 0) / players.length).toFixed(1)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-primary" />
                Taxa de Vitória Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {(players.reduce((acc, p) => acc + p.winRate, 0) / players.length).toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top 5 Melhores KDA */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Trophy className="w-5 h-5 mr-2" />
                Top 5 Melhores KDA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5KDA.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  showStat={player.kda}
                  statLabel="KDA"
                />
              ))}
            </CardContent>
          </Card>

          {/* Top 5 Taxa de Vitória */}
          <Card className="bg-gradient-card border-border/50 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-lol-win">
                <TrendingUp className="w-5 h-5 mr-2" />
                Top 5 Taxa de Vitória
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {top5Winners.map((player, index) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  rank={index + 1}
                  showStat={`${player.winRate}%`}
                  statLabel={`${player.wins}V/${player.losses}D`}
                />
              ))}
            </CardContent>
          </Card>

          {/* Top 5 Perdedores */}
          <Card className="bg-gradient-card border-border/50 shadow-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-lol-loss">
              <CardTitle className="text-center text-destructive mb-4">
                <TrendingDown className="w-5 h-5 mr-2" />
                🐟 HALL DA FAMA DOS BAGRES (MAIS DERROTAS)
              </CardTitle>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {top5Losers.map((player, index) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    rank={index + 1}
                    showStat={player.losses}
                    statLabel="Derrotas"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ranking Completo */}
        <Card className="mt-8 bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-foreground">
              <Trophy className="w-5 h-5 mr-2 text-primary" />
              Ranking Completo por Taxa de Vitória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sortedByWinRate.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="w-8 text-center font-bold text-primary">#{index + 1}</span>
                    <div>
                      <span className="font-medium">{player.realName}</span>
                      <span className="text-muted-foreground ml-2">({player.lolName})</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge className={`${getRankColor(player.rank)} text-white`}>
                      {player.rank} {player.tier}
                    </Badge>
                    <span className="text-primary font-semibold">{player.winRate}%</span>
                    <span className="text-muted-foreground">{player.wins}V/{player.losses}D</span>
                    <span className="text-primary">KDA: {player.kda}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;