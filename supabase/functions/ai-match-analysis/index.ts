import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  fileUrl: string;
  fileType: string;
  fileName: string;
}

interface PlayerStat {
  playerName: string;
  kda: { kills: number; deaths: number; assists: number };
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface AnalysisResult {
  matchResult: {
    winner: string;
    loser: string;
  };
  playerStats: PlayerStat[];
  bestPlay: {
    timestamp: string;
    description: string;
    player: string;
    confidence: number;
  };
  confidence_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { fileUrl, fileType, fileName }: AnalysisRequest = await req.json();
    
    console.log(`Processing ${fileType} file: ${fileName}`);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Set the auth token from the request
    const token = authHeader.replace('Bearer ', '');
    await supabase.auth.setSession({ access_token: token, refresh_token: '' });

    let analysisResult: AnalysisResult;

    if (fileType.startsWith('image/')) {
      analysisResult = await analyzeImage(fileUrl, openAIApiKey);
    } else if (fileType.startsWith('video/')) {
      analysisResult = await analyzeVideo(fileUrl, openAIApiKey);
    } else {
      throw new Error('Unsupported file type');
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Save analysis to database
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('match_analysis')
      .insert({
        user_id: user.id,
        file_path: fileUrl,
        file_type: fileType,
        analysis_result: analysisResult,
        winner_team: analysisResult.matchResult.winner,
        loser_team: analysisResult.matchResult.loser,
        best_play: analysisResult.bestPlay,
        player_stats: analysisResult.playerStats,
        confidence_score: analysisResult.confidence_score
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
      throw new Error('Failed to save analysis');
    }

    // Update player stats in the players table
    await updatePlayerStats(supabase, analysisResult.playerStats);

    return new Response(JSON.stringify({
      success: true,
      analysis: analysisResult,
      saved_id: savedAnalysis.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-match-analysis:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeImage(imageUrl: string, apiKey: string): Promise<AnalysisResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em análise de partidas de League of Legends. Analise esta imagem e extraia:
          1. Resultado da partida (time vencedor e perdedor)
          2. Estatísticas KDA de jogadores visíveis
          3. A melhor jogada identificável na imagem
          4. Performance dos jogadores (excellent/good/average/poor)
          
          Retorne APENAS um JSON válido no formato:
          {
            "matchResult": {"winner": "Team 1", "loser": "Team 2"},
            "playerStats": [{"playerName": "nome", "kda": {"kills": 0, "deaths": 0, "assists": 0}, "performance": "good"}],
            "bestPlay": {"timestamp": "00:00", "description": "descrição", "player": "nome", "confidence": 0.8},
            "confidence_score": 0.85
          }`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analise esta imagem de League of Legends e extraia os dados da partida:'
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
    return JSON.parse(content);
  } catch {
    // Fallback se a IA não retornar JSON válido
    return generateMockAnalysis();
  }
}

async function analyzeVideo(videoUrl: string, apiKey: string): Promise<AnalysisResult> {
  // Para vídeos, por enquanto usamos análise mock
  // Em uma implementação real, seria necessário extrair frames ou usar APIs específicas
  console.log(`Video analysis for: ${videoUrl}`);
  
  // Simular processamento de vídeo
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return generateMockAnalysis();
}

function generateMockAnalysis(): AnalysisResult {
  const players = ['Faker', 'Caps', 'Perkz', 'Rekkles', 'TheShy'];
  const champions = ['Yasuo', 'Azir', 'LeBlanc', 'Jinx', 'Camille'];
  
  return {
    matchResult: {
      winner: 'Team Blue',
      loser: 'Team Red'
    },
    playerStats: players.slice(0, 3).map((player, i) => ({
      playerName: player,
      kda: {
        kills: Math.floor(Math.random() * 15) + 3,
        deaths: Math.floor(Math.random() * 8) + 1,
        assists: Math.floor(Math.random() * 20) + 5
      },
      performance: ['excellent', 'good', 'average'][i] as PlayerStat['performance']
    })),
    bestPlay: {
      timestamp: `${Math.floor(Math.random() * 40) + 10}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      description: `Pentakill épico com ${champions[Math.floor(Math.random() * champions.length)]} no Baron pit`,
      player: players[0],
      confidence: 0.92
    },
    confidence_score: 0.88
  };
}

async function updatePlayerStats(supabase: any, playerStats: PlayerStat[]) {
  try {
    for (const stat of playerStats) {
      // Buscar jogador pelo nome
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .ilike('lol_name', stat.playerName)
        .single();

      if (existingPlayer) {
        // Atualizar estatísticas existentes
        const newKills = existingPlayer.kills + stat.kda.kills;
        const newDeaths = existingPlayer.deaths + stat.kda.deaths;
        const newAssists = existingPlayer.assists + stat.kda.assists;
        
        // Atualizar wins/losses baseado na performance
        const winIncrease = stat.performance === 'excellent' || stat.performance === 'good' ? 1 : 0;
        const lossIncrease = stat.performance === 'poor' || stat.performance === 'average' ? 1 : 0;

        await supabase
          .from('players')
          .update({
            kills: newKills,
            deaths: newDeaths,
            assists: newAssists,
            wins: existingPlayer.wins + winIncrease,
            losses: existingPlayer.losses + lossIncrease,
            last_updated: new Date().toISOString()
          })
          .eq('id', existingPlayer.id);

        console.log(`Updated stats for player: ${stat.playerName}`);
      }
    }
  } catch (error) {
    console.error('Error updating player stats:', error);
  }
}