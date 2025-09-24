-- Drop the existing function and recreate it with real_name included
DROP FUNCTION IF EXISTS public.get_players_public();

CREATE OR REPLACE FUNCTION public.get_players_public()
 RETURNS TABLE(id uuid, real_name text, lol_name text, main_champion text, rank text, tier text, kda numeric, wins integer, losses integer, win_rate numeric, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.real_name,
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
$function$;