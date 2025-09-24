import { useState } from "react";
import { Player } from "@/types/Player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Save, X } from "lucide-react";

interface PlayerEditorProps {
  players: Player[];
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onDeletePlayer: (id: string) => void;
}

const PlayerEditor = ({ players, onUpdatePlayer, onDeletePlayer }: PlayerEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Player>>({});

  const ranks = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"];
  const tiers = ["IV", "III", "II", "I"];

  const champions = [
    "Aatrox", "Ahri", "Akali", "Ashe", "Azir", "Blitzcrank", "Caitlyn", "Darius", "Diana", "Draven",
    "Ezreal", "Fiora", "Garen", "Graves", "Irelia", "Jax", "Jinx", "Katarina", "Lee Sin", "Lux",
    "Master Yi", "Orianna", "Riven", "Soraka", "Syndra", "Thresh", "Twisted Fate", "Vayne", "Yasuo", "Zed"
  ];

  const handleEdit = (player: Player) => {
    setEditingId(player.id);
    setEditForm(player);
  };

  const handleSave = () => {
    if (editingId && editForm) {
      // Recalcular winRate se wins ou losses mudaram
      const updatedForm = { ...editForm };
      if (updatedForm.wins !== undefined && updatedForm.losses !== undefined) {
        const total = updatedForm.wins + updatedForm.losses;
        updatedForm.winRate = total > 0 ? Math.round((updatedForm.wins / total) * 100 * 10) / 10 : 0;
        updatedForm.gamesPlayed = total;
      }
      
      onUpdatePlayer(editingId, updatedForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const getRankColor = (rank: string) => {
    switch (rank?.toLowerCase()) {
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

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="text-foreground">
          Editor de Jogadores ({players.length} jogadores)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {players.map((player) => (
            <div key={player.id} className="p-4 bg-accent/30 rounded-lg border border-border/50">
              {editingId === player.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="realName">Nome Real</Label>
                      <Input
                        id="realName"
                        value={editForm.realName || ""}
                        onChange={(e) => setEditForm({ ...editForm, realName: e.target.value })}
                        placeholder="Nome real do jogador"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lolName">Nome no LoL</Label>
                      <Input
                        id="lolName"
                        value={editForm.lolName || ""}
                        onChange={(e) => setEditForm({ ...editForm, lolName: e.target.value })}
                        placeholder="Nome no League of Legends"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="mainChampion">Campeão Principal</Label>
                      <Select
                        value={editForm.mainChampion || ""}
                        onValueChange={(value) => setEditForm({ ...editForm, mainChampion: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campeão" />
                        </SelectTrigger>
                        <SelectContent>
                          {champions.map((champion) => (
                            <SelectItem key={champion} value={champion}>
                              {champion}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rank">Rank</Label>
                      <Select
                        value={editForm.rank || ""}
                        onValueChange={(value) => setEditForm({ ...editForm, rank: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o rank" />
                        </SelectTrigger>
                        <SelectContent>
                          {ranks.map((rank) => (
                            <SelectItem key={rank} value={rank}>
                              {rank}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="tier">Tier</Label>
                      <Select
                        value={editForm.tier || ""}
                        onValueChange={(value) => setEditForm({ ...editForm, tier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tier" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiers.map((tier) => (
                            <SelectItem key={tier} value={tier}>
                              {tier}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <Label htmlFor="kills">Kills</Label>
                      <Input
                        id="kills"
                        type="number"
                        min="0"
                        value={editForm.kills || ""}
                        onChange={(e) => setEditForm({ ...editForm, kills: parseInt(e.target.value) || 0 })}
                        placeholder="Kills"
                      />
                    </div>
                    <div>
                      <Label htmlFor="deaths">Deaths</Label>
                      <Input
                        id="deaths"
                        type="number"
                        min="1"
                        value={editForm.deaths || ""}
                        onChange={(e) => setEditForm({ ...editForm, deaths: parseInt(e.target.value) || 1 })}
                        placeholder="Deaths"
                      />
                    </div>
                    <div>
                      <Label htmlFor="assists">Assists</Label>
                      <Input
                        id="assists"
                        type="number"
                        min="0"
                        value={editForm.assists || ""}
                        onChange={(e) => setEditForm({ ...editForm, assists: parseInt(e.target.value) || 0 })}
                        placeholder="Assists"
                      />
                    </div>
                    <div>
                      <Label htmlFor="wins">Vitórias</Label>
                      <Input
                        id="wins"
                        type="number"
                        value={editForm.wins || ""}
                        onChange={(e) => setEditForm({ ...editForm, wins: parseInt(e.target.value) || 0 })}
                        placeholder="Vitórias"
                      />
                    </div>
                    <div>
                      <Label htmlFor="losses">Derrotas</Label>
                      <Input
                        id="losses"
                        type="number"
                        value={editForm.losses || ""}
                        onChange={(e) => setEditForm({ ...editForm, losses: parseInt(e.target.value) || 0 })}
                        placeholder="Derrotas"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lp">Liga Points</Label>
                      <Input
                        id="lp"
                        type="number"
                        value={editForm.lp || ""}
                        onChange={(e) => setEditForm({ ...editForm, lp: parseInt(e.target.value) || 0 })}
                        placeholder="LP"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm" className="bg-lol-win hover:bg-lol-win/90">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-foreground">{player.realName}</h3>
                      <Badge variant="outline" className="text-primary border-primary">
                        {player.lolName}
                      </Badge>
                      <Badge className={`${getRankColor(player.rank)} text-white text-xs`}>
                        {player.rank} {player.tier}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{player.mainChampion}</span>
                      <span>KDA: {player.kda}</span>
                      <span>{player.kills}K/{player.deaths}D/{player.assists}A</span>
                      <span>{player.wins}V/{player.losses}D</span>
                      <span>WR: {player.winRate}%</span>
                      <span>{player.lp} LP</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => handleEdit(player)} size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => onDeletePlayer(player.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerEditor;