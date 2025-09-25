-- Create storage bucket for match replays and images
INSERT INTO storage.buckets (id, name, public) VALUES ('match-replays', 'match-replays', false);

-- Create storage policies for authenticated users to upload and view their own files
CREATE POLICY "Authenticated users can upload match replays" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'match-replays' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view their own match replays" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'match-replays' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update their own match replays" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'match-replays' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete their own match replays" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'match-replays' AND auth.uid() IS NOT NULL);

-- Create a table to store AI analysis results
CREATE TABLE public.match_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  analysis_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  winner_team TEXT,
  loser_team TEXT,
  best_play JSONB,
  player_stats JSONB,
  confidence_score DECIMAL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on match_analysis
ALTER TABLE public.match_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for match_analysis
CREATE POLICY "Authenticated users can view their own analysis" 
ON public.match_analysis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own analysis" 
ON public.match_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own analysis" 
ON public.match_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete their own analysis" 
ON public.match_analysis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_match_analysis_updated_at
BEFORE UPDATE ON public.match_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_players_updated_at();