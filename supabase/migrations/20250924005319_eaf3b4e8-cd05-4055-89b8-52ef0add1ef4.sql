-- Add kills, deaths, and assists columns to players table
ALTER TABLE public.players 
ADD COLUMN kills integer NOT NULL DEFAULT 0,
ADD COLUMN deaths integer NOT NULL DEFAULT 0,
ADD COLUMN assists integer NOT NULL DEFAULT 0;

-- Create function to calculate KDA automatically
CREATE OR REPLACE FUNCTION public.calculate_kda()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate KDA as (kills + assists) / deaths
  IF NEW.deaths > 0 THEN
    NEW.kda = ROUND((NEW.kills + NEW.assists)::DECIMAL / NEW.deaths, 2);
  ELSE
    -- If no deaths, KDA is just kills + assists (perfect KDA)
    NEW.kda = NEW.kills + NEW.assists;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate KDA when kills, deaths, or assists change
CREATE TRIGGER calculate_kda_trigger
  BEFORE INSERT OR UPDATE OF kills, deaths, assists ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_kda();

-- Update existing players to have default values and recalculate KDA
UPDATE public.players SET 
  kills = CASE WHEN kda > 0 THEN ROUND(kda * GREATEST(deaths, 1)) ELSE 0 END,
  deaths = CASE WHEN deaths = 0 AND kda > 0 THEN 1 ELSE GREATEST(deaths, 1) END,
  assists = 0
WHERE TRUE;