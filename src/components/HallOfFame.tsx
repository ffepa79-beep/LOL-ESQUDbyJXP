import { useState } from "react";
import { Player } from "@/types/Player";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Trophy, Medal, Award } from "lucide-react";
import { toast } from "sonner";

interface HallOfFameProps {
  players: Player[];
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  isAuthenticated: boolean;
}

const HallOfFame = ({ players, onUpdatePlayer, isAuthenticated }: HallOfFameProps) => {
  const [editingAvatar, setEditingAvatar] = useState<string | null>(null);
  const [newAvatarUrl, setNewAvatarUrl] = useState("");

  const topPlayers = [...players]
    .filter(player => player.kda > 0 && player.gamesPlayed > 0)
    .sort((a, b) => b.kda - a.kda)
    .slice(0, 3);

  const handleAvatarUpdate = async (playerId: string) => {
    if (!newAvatarUrl.trim()) {
      toast.error("Por favor, insira uma URL válida");
      return;
    }

    try {
      await onUpdatePlayer(playerId, { avatarUrl: newAvatarUrl });
      setEditingAvatar(null);
      setNewAvatarUrl("");
      toast.success("Avatar atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar avatar");
    }
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getPositionStyle = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-400/50 bg-gradient-to-br from-yellow-400/10 to-amber-600/10 shadow-[0_0_20px_rgba(251,191,36,0.3)]";
      case 1:
        return "border-gray-300/50 bg-gradient-to-br from-gray-300/10 to-slate-400/10 shadow-[0_0_15px_rgba(203,213,225,0.2)]";
      case 2:
        return "border-amber-600/50 bg-gradient-to-br from-amber-600/10 to-orange-700/10 shadow-[0_0_15px_rgba(217,119,6,0.2)]";
      default:
        return "";
    }
  };

  if (topPlayers.length === 0) {
    return (
      <div className="mb-8">
        <Card className="border-primary/20 bg-gradient-card">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-primary mb-2">Hall da Fama - KDA</h2>
            <p className="text-muted-foreground">Nenhum jogador com KDA válido ainda</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <Card className="border-primary/20 bg-gradient-card">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
              🏆 Hall da Fama - KDA 🏆
            </h2>
            <p className="text-muted-foreground">Os melhores jogadores por KDA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPlayers.map((player, index) => (
              <Card 
                key={player.id} 
                className={`relative border-2 ${getPositionStyle(index)} transition-all duration-300 hover:scale-105`}
              >
                <CardContent className="p-6 text-center">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-background border border-border rounded-full p-2">
                    {getPositionIcon(index)}
                  </div>

                  <div className="mt-4 mb-4">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 mx-auto mb-3 border-2 border-primary/30">
                        <AvatarImage src={player.avatarUrl} alt={player.realName} />
                        <AvatarFallback className="text-xl font-bold">
                          {player.realName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      {isAuthenticated && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            setEditingAvatar(player.id);
                            setNewAvatarUrl(player.avatarUrl || "");
                          }}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {editingAvatar === player.id && (
                      <div className="space-y-2 mt-3">
                        <Input
                          placeholder="URL da imagem"
                          value={newAvatarUrl}
                          onChange={(e) => setNewAvatarUrl(e.target.value)}
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAvatarUpdate(player.id)}
                            className="flex-1"
                          >
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAvatar(null)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-lg mb-1">{player.realName}</h3>
                  <p className="text-sm text-muted-foreground mb-3">@{player.lolName}</p>
                  
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-1">
                        {player.kda.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">KDA</div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-semibold text-green-400">{player.kills}</div>
                        <div className="text-muted-foreground">K</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-red-400">{player.deaths}</div>
                        <div className="text-muted-foreground">D</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-400">{player.assists}</div>  
                        <div className="text-muted-foreground">A</div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/30">
                      <div className="text-xs text-muted-foreground">
                        {player.rank} • {player.winRate.toFixed(0)}% WR
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {topPlayers.length < 3 && (
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Adicione mais jogadores para completar o pódium!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HallOfFame;