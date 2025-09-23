import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Users, Trophy, Swords, Settings } from "lucide-react";
import { Player, Team } from "@/types/Player";
import { toast } from "sonner";
import { useSupabasePlayerManager } from "@/hooks/useSupabasePlayerManager";
import PlayerForm from "@/components/PlayerForm";
import PlayerEditor from "@/components/PlayerEditor";
import PlayerSearch from "@/components/PlayerSearch";
import AuthDialog from "@/components/AuthDialog";

const TeamGenerator = () => {
  const {
    players,
    loading,
    user,
    isAuthenticated,
    addPlayer,
    updatePlayer,
    deletePlayer,
    signIn,
    signUp,
    signOut,
  } = useSupabasePlayerManager();
  
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [generatedTeams, setGeneratedTeams] = useState<[Team, Team] | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

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
      case "iron": return "bg-gray-600";
      case "bronze": return "bg-amber-600";
      case "silver": return "bg-gray-400";
      case "gold": return "bg-yellow-400";
      case "platinum": return "bg-cyan-400";
      case "diamond": return "bg-blue-400";
      case "master": return "bg-purple-500";
      case "grandmaster": return "bg-red-500";
      case "challenger": return "bg-gradient-gold";
      default: return "bg-gray-500";
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
            {players.length === 0 
              ? "Adicione jogadores para começar a gerar times" 
              : `Selecione 10 jogadores para gerar times balanceados`
            }
          </p>
        </div>

        {/* Controles */}
        <Card className="mb-8 bg-gradient-card border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Controle de Times
              </span>
              <div className="flex space-x-2">
                {isAuthenticated ? (
                  <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    Sair ({user?.email})
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowAuthDialog(true)}
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Login Dev
                  </Button>
                )}
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
        </Card>

        {/* Barra de Pesquisa e Seleção */}
        <div className="mb-8">
          <PlayerSearch
            players={players}
            selectedPlayers={selectedPlayers}
            onPlayerToggle={handlePlayerToggle}
            maxSelections={10}
          />
        </div>

        {/* Formulário para Adicionar Jogador - Público */}
        <div className="mb-8">
          <PlayerForm onAddPlayer={addPlayer} />
        </div>

        {/* Editor de Jogadores (apenas para devs autenticados) */}
        {isAuthenticated && players.length > 0 && (
          <div className="mb-8">
            <PlayerEditor
              players={players}
              onUpdatePlayer={updatePlayer}
              onDeletePlayer={deletePlayer}
            />
          </div>
        )}

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

        {/* Mensagem quando não há jogadores ou carregando */}
        {loading ? (
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando jogadores...</p>
            </CardContent>
          </Card>
        ) : players.length === 0 ? (
          <Card className="bg-gradient-card border-border/50 shadow-card text-center">
            <CardContent className="py-12">
              <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum jogador cadastrado
              </h3>
              <p className="text-muted-foreground mb-6">
                Adicione jogadores usando o formulário acima para começar a gerar times.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Auth Dialog */}
        <AuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          onSignIn={signIn}
          onSignUp={signUp}
        />
      </div>
    </div>
  );
};

export default TeamGenerator;