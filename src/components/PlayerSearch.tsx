import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Player } from "@/types/Player";

interface PlayerSearchProps {
  players: Player[];
  selectedPlayers: Player[];
  onPlayerToggle: (player: Player) => void;
  maxSelections?: number;
}

const PlayerSearch = ({ 
  players, 
  selectedPlayers, 
  onPlayerToggle, 
  maxSelections = 10 
}: PlayerSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return players.filter(player => 
      player.realName.toLowerCase().includes(lowercaseSearch) ||
      player.lolName.toLowerCase().includes(lowercaseSearch) ||
      player.mainChampion.toLowerCase().includes(lowercaseSearch) ||
      player.rank.toLowerCase().includes(lowercaseSearch)
    );
  }, [players, searchTerm]);

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

  const clearSelection = () => {
    selectedPlayers.forEach(player => onPlayerToggle(player));
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-primary" />
            Pesquisar Jogadores ({selectedPlayers.length}/{maxSelections})
          </span>
          {selectedPlayers.length > 0 && (
            <Button
              onClick={clearSelection}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Seleção
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar por nome real, nome no LoL, campeão ou rank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedPlayers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Jogadores Selecionados:</h4>
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map((player) => (
                <Badge
                  key={player.id}
                  variant="secondary"
                  className="px-3 py-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  onClick={() => onPlayerToggle(player)}
                >
                  {player.realName} ({player.lolName})
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredPlayers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {searchTerm ? "Nenhum jogador encontrado" : "Nenhum jogador disponível"}
            </p>
          ) : (
            filteredPlayers.map((player) => {
              const isSelected = selectedPlayers.find(p => p.id === player.id);
              const canSelect = selectedPlayers.length < maxSelections || isSelected;
              
              return (
                <div
                  key={player.id}
                  onClick={() => canSelect && onPlayerToggle(player)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/20 border-primary shadow-glow"
                      : canSelect
                      ? "bg-accent/30 border-border hover:bg-accent/50 hover:border-primary/50"
                      : "bg-accent/10 border-border opacity-50 cursor-not-allowed"
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
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSearch;