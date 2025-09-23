import { useState, useEffect } from "react";
import { Player } from "@/types/Player";
import { allPlayers } from "@/data/mockPlayers";

const STORAGE_KEY = "lol-team-manager-players";

export const usePlayerManager = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isDevMode, setIsDevMode] = useState(false);

  // Carregar dados do localStorage ou usar dados mockados
  useEffect(() => {
    const savedPlayers = localStorage.getItem(STORAGE_KEY);
    const savedDevMode = localStorage.getItem(`${STORAGE_KEY}-dev-mode`);
    
    if (savedPlayers) {
      try {
        setPlayers(JSON.parse(savedPlayers));
      } catch (error) {
        console.error("Erro ao carregar jogadores:", error);
        setPlayers(allPlayers);
      }
    } else {
      setPlayers(allPlayers);
    }

    setIsDevMode(savedDevMode === "true");
  }, []);

  // Salvar no localStorage sempre que os jogadores mudarem
  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players]);

  // Salvar modo dev
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-dev-mode`, isDevMode.toString());
  }, [isDevMode]);

  const addPlayer = (player: Omit<Player, "id">) => {
    const newPlayer: Player = {
      ...player,
      id: Date.now().toString(),
    };
    setPlayers(prev => [...prev, newPlayer]);
  };

  const updatePlayer = (id: string, updates: Partial<Player>) => {
    setPlayers(prev => 
      prev.map(player => 
        player.id === id ? { ...player, ...updates } : player
      )
    );
  };

  const deletePlayer = (id: string) => {
    setPlayers(prev => prev.filter(player => player.id !== id));
  };

  const resetToDefault = () => {
    setPlayers(allPlayers);
    localStorage.removeItem(STORAGE_KEY);
  };

  const clearAllPlayers = () => {
    setPlayers([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportPlayers = () => {
    const dataStr = JSON.stringify(players, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lol-players.json";
    link.click();
  };

  const importPlayers = (jsonData: string) => {
    try {
      const importedPlayers = JSON.parse(jsonData);
      if (Array.isArray(importedPlayers)) {
        setPlayers(importedPlayers);
      }
    } catch (error) {
      console.error("Erro ao importar jogadores:", error);
      throw new Error("Arquivo JSON inválido");
    }
  };

  return {
    players,
    isDevMode,
    setIsDevMode,
    addPlayer,
    updatePlayer,
    deletePlayer,
    resetToDefault,
    clearAllPlayers,
    exportPlayers,
    importPlayers,
  };
};