import { useState } from "react";
import { Player } from "@/types/Player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

interface PlayerFormProps {
  onAddPlayer: (player: Omit<Player, "id">) => void;
}

const PlayerForm = ({ onAddPlayer }: PlayerFormProps) => {
  const [form, setForm] = useState({
    realName: "",
    lolName: "",
    mainChampion: "",
    rank: "Iron",
    tier: "IV",
    kills: 0,
    deaths: 1,
    assists: 0,
    wins: 0,
    losses: 0,
    lp: 0,
  });

  const ranks = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master", "Grandmaster", "Challenger"];
  const tiers = ["IV", "III", "II", "I"];

  const champions = [
    "Aatrox", "Ahri", "Akali", "Ashe", "Azir", "Blitzcrank", "Caitlyn", "Darius", "Diana", "Draven",
    "Ezreal", "Fiora", "Garen", "Graves", "Irelia", "Jax", "Jinx", "Katarina", "Lee Sin", "Lux",
    "Master Yi", "Orianna", "Riven", "Soraka", "Syndra", "Thresh", "Twisted Fate", "Vayne", "Yasuo", "Zed"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.realName.trim() || !form.lolName.trim()) {
      toast.error("Nome real e nome no LoL são obrigatórios!");
      return;
    }

    const total = form.wins + form.losses;
    const winRate = total > 0 ? Math.round((form.wins / total) * 100 * 10) / 10 : 0;

    // KDA será calculado automaticamente pelo trigger do banco de dados
    const newPlayer: Omit<Player, "id"> = {
      ...form,
      kda: 0, // Será calculado pelo trigger
      winRate,
      gamesPlayed: total,
      championImageUrl: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${form.mainChampion.replace(/\s/g, "")}.png`
    };

    onAddPlayer(newPlayer);
    
    // Reset form
    setForm({
      realName: "",
      lolName: "",
      mainChampion: "",
      rank: "Iron",
      tier: "IV",
      kills: 0,
      deaths: 1,
      assists: 0,
      wins: 0,
      losses: 0,
      lp: 0,
    });

    toast.success("Jogador adicionado com sucesso!");
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <UserPlus className="w-5 h-5 mr-2" />
          Adicionar Novo Jogador
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="realName">Nome Real *</Label>
              <Input
                id="realName"
                value={form.realName}
                onChange={(e) => setForm({ ...form, realName: e.target.value })}
                placeholder="Digite o nome real"
                required
              />
            </div>
            <div>
              <Label htmlFor="lolName">Nome no LoL *</Label>
              <Input
                id="lolName"
                value={form.lolName}
                onChange={(e) => setForm({ ...form, lolName: e.target.value })}
                placeholder="Digite o nome no League of Legends"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="mainChampion">Campeão Principal</Label>
              <Select
                value={form.mainChampion}
                onValueChange={(value) => setForm({ ...form, mainChampion: value })}
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
                value={form.rank}
                onValueChange={(value) => setForm({ ...form, rank: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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
                value={form.tier}
                onValueChange={(value) => setForm({ ...form, tier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
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

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="kills">Kills</Label>
              <Input
                id="kills"
                type="number"
                min="0"
                value={form.kills}
                onChange={(e) => setForm({ ...form, kills: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="deaths">Deaths</Label>
              <Input
                id="deaths"
                type="number"
                min="1"
                value={form.deaths}
                onChange={(e) => setForm({ ...form, deaths: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </div>
            <div>
              <Label htmlFor="assists">Assists</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                value={form.assists}
                onChange={(e) => setForm({ ...form, assists: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="wins">Vitórias</Label>
              <Input
                id="wins"
                type="number"
                min="0"
                value={form.wins}
                onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="losses">Derrotas</Label>
              <Input
                id="losses"
                type="number"
                min="0"
                value={form.losses}
                onChange={(e) => setForm({ ...form, losses: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="lp">Liga Points</Label>
              <Input
                id="lp"
                type="number"
                min="0"
                value={form.lp}
                onChange={(e) => setForm({ ...form, lp: parseInt(e.target.value) || 0 })}
                placeholder="1200"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-glow">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Jogador
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PlayerForm;