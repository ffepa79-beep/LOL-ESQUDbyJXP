-- Expand players table with Riot API data
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS puuid TEXT,
ADD COLUMN IF NOT EXISTS summoner_id TEXT,
ADD COLUMN IF NOT EXISTS account_id TEXT,
ADD COLUMN IF NOT EXISTS profile_icon_id INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS summoner_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS tier_roman TEXT,
ADD COLUMN IF NOT EXISTS division TEXT,
ADD COLUMN IF NOT EXISTS league_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS region TEXT DEFAULT 'BR1',
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS auto_update_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS match_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS current_season_stats JSONB DEFAULT '{}'::jsonb;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_players_puuid ON public.players(puuid);
CREATE INDEX IF NOT EXISTS idx_players_summoner_id ON public.players(summoner_id);
CREATE INDEX IF NOT EXISTS idx_players_region ON public.players(region);
CREATE INDEX IF NOT EXISTS idx_players_last_updated ON public.players(last_updated);

-- Create function to update win rate automatically
CREATE OR REPLACE FUNCTION public.calculate_win_rate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wins + NEW.losses > 0 THEN
    NEW.win_rate = ROUND((NEW.wins::DECIMAL / (NEW.wins + NEW.losses)) * 100, 2);
  ELSE
    NEW.win_rate = 0;
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic win rate calculation
DROP TRIGGER IF EXISTS trigger_calculate_win_rate ON public.players;
CREATE TRIGGER trigger_calculate_win_rate
  BEFORE INSERT OR UPDATE OF wins, losses ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_win_rate();