-- Create players table
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  real_name TEXT NOT NULL,
  lol_name TEXT NOT NULL,
  main_champion TEXT NOT NULL,
  rank TEXT NOT NULL,
  tier TEXT NOT NULL,
  kda DECIMAL(4,2) NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view players" 
ON public.players 
FOR SELECT 
USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Authenticated users can insert players" 
ON public.players 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update players" 
ON public.players 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete players" 
ON public.players 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create function to update timestamps and user tracking
CREATE OR REPLACE FUNCTION public.update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic timestamp and user updates
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_players_updated_at();

-- Create trigger to set created_by on insert
CREATE OR REPLACE FUNCTION public.set_created_by()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_players_created_by
  BEFORE INSERT ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.set_created_by();