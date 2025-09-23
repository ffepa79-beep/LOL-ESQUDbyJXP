import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Users, Trophy, Swords } from "lucide-react";
import { allPlayers } from "@/data/mockPlayers";
import { Player, Team } from "@/types/Player";
import { toast } from "sonner";

const TeamGenerator = () => {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<[Team, Team] | null>(null);

  const handlePlayerToggle = (player: Player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else if (selectedPlayers.length < 10) {
      setSelectedPlayers([...selectedPlayers, player]);
    } else {
      toast.error("Máximo de 10 jogadores selecionados!");
    }
  };

  const generateBalancedTeams = () => {
    if (selectedPlayers.length !== 10) {
      toast.error("Selecione exatamente 10 jogadores!");
      return;
    }

    // Algoritmo de balanceamento baseado em KDA e WinRate
    const sortedPlayers = [...selectedPlayers].sort((a, b) => {
      const scoreA = (a.kda * 0.4) + (a.winRate * 0.6);
      const scoreB = (b.kda * 0.4) + (b.winRate * 0.6);
      return scoreB - scoreA;
    });

    const team1: Player[] = [];
    const team2: Player[] = [];

    // Algoritmo de distribuição alternada começando pelos mais fortes
    sortedPlayers.forEach((player, index) => {
      if (index % 2 === 0) {
        team1.push(player);
      } else {
        team2.push(player);
      }
    });

    const createTeam = (players: Player[], name: string): Team => ({
      id: Math.random().toString(),
      name,
      players,
      averageKda: players.reduce((acc, p) => acc + p.kda, 0) / players.length,
      totalWins: players.reduce((acc, p) => acc + p.wins, 0),
      averageWinRate: players.reduce((acc, p) => acc + p.winRate, 0) / players.length,
    });

    const teamA = createTeam(team1, "Time Azul");
    const teamB = createTeam(team2, "Time Vermelho");

    setGeneratedTeams([teamA, teamB]);
    toast.success("Times gerados com sucesso!");
  };

  const randomizeTeams = () => {
    if (selectedPlayers.length !== 10) {
      toast.error("Selecione exatamente 10 jogadores!");
      return;
    }

    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    const team1 = shuffled.slice(0, 5);
    const team2 = shuffled.slice(5, 10);

    const createTeam = (players: Player[], name: string): Team => ({
      id: Math.random().toString(),
      name,
      players,
      averageKda: players.reduce((acc, p) => acc + p.kda, 0) / players.length,
      totalWins: players.reduce((acc, p) => acc + p.wins, 0),
      averageWinRate: players.reduce((acc, p) => acc + p.winRate, 0) / players.length,
    });

    const teamA = createTeam(team1, "Time Azul");
    const teamB = createTeam(team2, "Time Vermelho");

    setGeneratedTeams([teamA, teamB]);
    toast.success("Times aleatórios gerados!");
  };

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

  const TeamCard = ({ team, color }: { team: Team; color: string }) => (
    <Card className={`bg-gradient-card border-border/50 shadow-card relative overflow-hidden`}>
      <div className={`absolute inset-0 ${color} opacity-5`} />
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <span className="text-foreground">{team.name}</span>
          <Badge variant="outline" className="text-primary border-primary">
            KDA: {team.averageKda.toFixed(1)}
          </Badge>
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>WR: {team.averageWinRate.toFixed(1)}%</span>
          <span>Vitórias: {team.totalWins}</span>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-3">
        {team.players.map((player) => (
          <div key={player.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
            <div>
              <div className="font-medium text-foreground">{player.realName}</div>
              <div className="text-sm text-muted-foreground">{player.lolName}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getRankColor(player.rank)} text-white text-xs`}>
                {player.rank} {player.tier}
              </Badge>
              <span className="text-sm text-primary font-medium">
                {player.kda} KDA
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Gerador de Times 5v5
          </h1>
          <p className="text-muted-foreground text-lg">
            Selecione 10 jogadores para gerar times balanceados
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-8 bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Jogadores Selecionados ({selectedPlayers.length}/10)
              </span>
              <div className="flex space-x-2">
                <Button
                  onClick={generateBalancedTeams}
                  disabled={selectedPlayers.length !== 10}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Gerar Times Balanceados
                </Button>
                <Button
                  onClick={randomizeTeams}
                  disabled={selectedPlayers.length !== 10}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Times Aleatórios
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPlayers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedPlayers.map((player) => (
                  <Badge
                    key={player.id}
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handlePlayerToggle(player)}
                  >
                    {player.realName} ({player.lolName})
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum jogador selecionado</p>
            )}
          </CardContent>
        </Card>

        {/* Times Gerados */}
        {generatedTeams && (
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <Swords className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold text-center mx-4 bg-gradient-gold bg-clip-text text-transparent">
                TIMES GERADOS
              </h2>
              <Swords className="w-8 h-8 text-primary" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TeamCard team={generatedTeams[0]} color="bg-blue-500" />
              <TeamCard team={generatedTeams[1]} color="bg-red-500" />
            </div>
          </div>
        )}

        {/* Lista de Jogadores */}
        <Card className="bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              Todos os Jogadores ({allPlayers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {allPlayers.map((player) => {
                const isSelected = selectedPlayers.find(p => p.id === player.id);
                return (
                  <div
                    key={player.id}
                    onClick={() => handlePlayerToggle(player)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/20 border-primary shadow-glow"
                        : "bg-accent/30 border-border hover:bg-accent/50 hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-foreground">{player.realName}</h3>
                      <Badge className={`${getRankColor(player.rank)} text-white text-xs`}>
                        {player.rank} {player.tier}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {player.lolName} • {player.mainChampion}
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-primary font-medium">KDA: {player.kda}</span>
                      <span className="text-lol-win">WR: {player.winRate}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamGenerator;