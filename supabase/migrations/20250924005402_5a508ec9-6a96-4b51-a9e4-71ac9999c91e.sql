-- Fix security issue: Add search_path to calculate_kda function
CREATE OR REPLACE FUNCTION public.calculate_kda()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;