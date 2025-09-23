import { useState, useEffect } from "react";
import { User, Session } from '@supabase/supabase-js';
import { Player } from "@/types/Player";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useSupabasePlayerManager = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch players from Supabase
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      
      if (user) {
        // Authenticated users can see full data including real names
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        const formattedPlayers: Player[] = data?.map(player => ({
          id: player.id,
          realName: player.real_name,
          lolName: player.lol_name,
          mainChampion: player.main_champion,
          rank: player.rank,
          tier: player.tier,
          kda: parseFloat(player.kda.toString()),
          wins: player.wins,
          losses: player.losses,
          winRate: parseFloat(player.win_rate.toString()),
          gamesPlayed: player.wins + player.losses,
          lp: 0
        })) || [];

        setPlayers(formattedPlayers);
      } else {
        // Public users get limited data without real names
        const { data, error } = await supabase.rpc('get_players_public');

        if (error) throw error;

        const formattedPlayers: Player[] = data?.map(player => ({
          id: player.id,
          realName: player.lol_name, // Use LoL name as display name for public
          lolName: player.lol_name,
          mainChampion: player.main_champion,
          rank: player.rank,
          tier: player.tier,
          kda: parseFloat(player.kda.toString()),
          wins: player.wins,
          losses: player.losses,
          winRate: parseFloat(player.win_rate.toString()),
          gamesPlayed: player.wins + player.losses,
          lp: 0
        })) || [];

        setPlayers(formattedPlayers);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Erro ao carregar jogadores');
    } finally {
      setLoading(false);
    }
  };

  // Load players on mount and when auth state changes
  useEffect(() => {
    fetchPlayers();
  }, [user]); // Re-fetch when user auth state changes

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('players-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        () => {
          fetchPlayers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addPlayer = async (player: Omit<Player, "id">) => {
    try {
      const winRate = player.wins + player.losses > 0 
        ? (player.wins / (player.wins + player.losses)) * 100 
        : 0;

      const { error } = await supabase
        .from('players')
        .insert({
          real_name: player.realName,
          lol_name: player.lolName,
          main_champion: player.mainChampion,
          rank: player.rank,
          tier: player.tier,
          kda: player.kda,
          wins: player.wins,
          losses: player.losses,
          win_rate: winRate
        });

      if (error) throw error;
      toast.success('Jogador adicionado com sucesso!');
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Erro ao adicionar jogador');
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    try {
      const updateData: any = {};
      
      if (updates.realName) updateData.real_name = updates.realName;
      if (updates.lolName) updateData.lol_name = updates.lolName;
      if (updates.mainChampion) updateData.main_champion = updates.mainChampion;
      if (updates.rank) updateData.rank = updates.rank;
      if (updates.tier) updateData.tier = updates.tier;
      if (updates.kda !== undefined) updateData.kda = updates.kda;
      if (updates.wins !== undefined) updateData.wins = updates.wins;
      if (updates.losses !== undefined) updateData.losses = updates.losses;

      // Recalculate win rate
      if (updates.wins !== undefined || updates.losses !== undefined) {
        const currentPlayer = players.find(p => p.id === id);
        if (currentPlayer) {
          const newWins = updates.wins !== undefined ? updates.wins : currentPlayer.wins;
          const newLosses = updates.losses !== undefined ? updates.losses : currentPlayer.losses;
          const newWinRate = newWins + newLosses > 0 ? (newWins / (newWins + newLosses)) * 100 : 0;
          updateData.win_rate = newWinRate;
        }
      }

      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      toast.success('Jogador atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Erro ao atualizar jogador');
    }
  };

  const deletePlayer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Jogador removido com sucesso!');
    } catch (error) {
      console.error('Error deleting player:', error);
      toast.error('Erro ao remover jogador');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      toast.success('Login realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error(error.message || 'Erro ao fazer login');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      if (error) throw error;
      toast.success('Conta criada com sucesso! Verifique seu email.');
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error(error.message || 'Erro ao criar conta');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  return {
    players,
    loading,
    user,
    session,
    isAuthenticated: !!user,
    addPlayer,
    updatePlayer,
    deletePlayer,
    signIn,
    signUp,
    signOut,
  };
};