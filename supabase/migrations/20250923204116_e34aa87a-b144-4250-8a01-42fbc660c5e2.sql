-- Fix security vulnerability: Restrict personal information access
-- Update the SELECT policy to require authentication
DROP POLICY IF EXISTS "Anyone can view players" ON public.players;

CREATE POLICY "Authenticated users can view all player data" 
ON public.players 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a function to get public player data (safe for anonymous users)
CREATE OR REPLACE FUNCTION public.get_players_public()
RETURNS TABLE (
  id UUID,
  lol_name TEXT,
  main_champion TEXT,
  rank TEXT,
  tier TEXT,
  kda DECIMAL(4,2),
  wins INTEGER,
  losses INTEGER,
  win_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.lol_name,
    p.main_champion,
    p.rank,
    p.tier,
    p.kda,
    p.wins,
    p.losses,
    p.win_rate,
    p.created_at
  FROM public.players p
  ORDER BY p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;