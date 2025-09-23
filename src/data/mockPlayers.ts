import { Player } from "@/types/Player";

// Mock data para demonstração - 72 jogadores
export const mockPlayers: Player[] = [
  {
    id: "1",
    realName: "João Silva",
    lolName: "DragonSlayer",
    mainChampion: "Yasuo",
    kda: 2.8,
    wins: 145,
    losses: 98,
    winRate: 59.7,
    gamesPlayed: 243,
    rank: "Diamond",
    tier: "II",
    lp: 1847,
    championImageUrl: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Yasuo.png"
  },
  {
    id: "2",
    realName: "Maria Santos",
    lolName: "ShadowQueen",
    mainChampion: "Jinx",
    kda: 3.2,
    wins: 167,
    losses: 89,
    winRate: 65.2,
    gamesPlayed: 256,
    rank: "Diamond",
    tier: "I",
    lp: 2156,
    championImageUrl: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Jinx.png"
  },
  {
    id: "3",
    realName: "Pedro Costa",
    lolName: "IronFist",
    mainChampion: "Darius",
    kda: 2.1,
    wins: 134,
    losses: 112,
    winRate: 54.5,
    gamesPlayed: 246,
    rank: "Platinum",
    tier: "I",
    lp: 1654,
    championImageUrl: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Darius.png"
  },
  {
    id: "4",
    realName: "Ana Oliveira",
    lolName: "MysticMage",
    mainChampion: "Ahri",
    kda: 2.9,
    wins: 156,
    losses: 94,
    winRate: 62.4,
    gamesPlayed: 250,
    rank: "Diamond",
    tier: "III",
    lp: 1789,
    championImageUrl: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Ahri.png"
  },
  {
    id: "5",
    realName: "Carlos Mendes",
    lolName: "ThunderStorm",
    mainChampion: "Thresh",
    kda: 1.8,
    wins: 145,
    losses: 105,
    winRate: 58.0,
    gamesPlayed: 250,
    rank: "Platinum",
    tier: "II",
    lp: 1543,
    championImageUrl: "https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/Thresh.png"
  }
  // Adicione mais 67 jogadores similares aqui...
];

// Gerar jogadores adicionais para completar 72
const additionalPlayers: Player[] = Array.from({ length: 67 }, (_, index) => {
  const names = [
    "Lucas", "Fernanda", "Rafael", "Camila", "Bruno", "Leticia", "Diego", "Amanda",
    "Thiago", "Beatriz", "Gabriel", "Juliana", "Felipe", "Mariana", "Rodrigo", "Larissa",
    "Vitor", "Natalia", "Gustavo", "Patricia", "Henrique", "Carla", "Leonardo", "Vanessa",
    "Marcelo", "Priscila", "Eduardo", "Renata", "Alexandre", "Cristina", "Roberto", "Monica",
    "Fabio", "Adriana", "André", "Silvia", "Sergio", "Luciana", "Daniel", "Tatiana",
    "Ricardo", "Simone", "Antonio", "Claudia", "José", "Sandra", "Francisco", "Regina",
    "Paulo", "Vera", "Marco", "Eliane", "Luiz", "Rosana", "Jorge", "Denise", "Claudio",
    "Angela", "Roberto", "Lucia", "Fernando", "Solange", "Marcos", "Marlene", "Alberto",
    "Teresa", "Edson", "Fatima", "Nelson", "Celia", "Raul", "Ines", "Oscar"
  ];
  
  const lolNames = [
    "NightHunter", "FlashMaster", "CriticalHit", "SoulReaper", "BladeRunner", "PhoenixWing",
    "FrostBite", "LightBringer", "DarkKnight", "StormBreaker", "FireStorm", "IceQueen",
    "BloodMoon", "StarGazer", "WolfPack", "DragonHeart", "SkyWalker", "DeathWish",
    "GhostRider", "ThunderBolt", "MoonLight", "SunRise", "WarLord", "PeaceMaker"
  ];
  
  const champions = [
    "Zed", "Lux", "Garen", "Katarina", "Lee Sin", "Ezreal", "Ashe", "Blitzcrank",
    "Annie", "Master Yi", "Soraka", "Jinx", "Graves", "Caitlyn", "Vayne", "Riven",
    "Fiora", "Azir", "Syndra", "Orianna", "Twisted Fate", "Gangplank", "Irelia"
  ];
  
  const ranks = ["Iron", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Master"];
  const tiers = ["IV", "III", "II", "I"];
  
  const wins = Math.floor(Math.random() * 200) + 50;
  const losses = Math.floor(Math.random() * 150) + 30;
  const winRate = (wins / (wins + losses)) * 100;
  
  return {
    id: (index + 6).toString(),
    realName: names[index % names.length] + " " + names[(index + 1) % names.length],
    lolName: lolNames[index % lolNames.length] + (index > 23 ? (index - 23) : ""),
    mainChampion: champions[index % champions.length],
    kda: Math.round((Math.random() * 3 + 0.5) * 10) / 10,
    wins,
    losses,
    winRate: Math.round(winRate * 10) / 10,
    gamesPlayed: wins + losses,
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    tier: tiers[Math.floor(Math.random() * tiers.length)],
    lp: Math.floor(Math.random() * 2000) + 100,
    championImageUrl: `https://ddragon.leagueoflegends.com/cdn/13.24.1/img/champion/${champions[index % champions.length].replace(/\s/g, '')}.png`
  };
});

export const allPlayers = [...mockPlayers, ...additionalPlayers];