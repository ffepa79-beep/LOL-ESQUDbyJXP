-- Add avatar_url column to players table for custom profile images
ALTER TABLE public.players 
ADD COLUMN avatar_url TEXT;