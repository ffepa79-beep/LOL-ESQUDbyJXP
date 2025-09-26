import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, analysisType = 'full' } = await req.json();
    
    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No files provided for analysis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Starting AI analysis for ${files.length} files`);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Analyze files with OpenAI Vision API
    const analysisResults = [];
    
    for (const file of files) {
      try {
        let prompt = '';
        
        if (analysisType === 'kda') {
          prompt = `Analyze this League of Legends screenshot/video and extract:
          1. KDA (Kills/Deaths/Assists) for each visible player
          2. Player names and champions
          3. Team compositions
          
          Return the data in JSON format with player stats.`;
        } else if (analysisType === 'match_result') {
          prompt = `Analyze this League of Legends match image/video and determine:
          1. Which team won and which team lost
          2. Final score if visible
          3. Match duration
          4. Key events that led to victory
          
          Return results in JSON format.`;
        } else {
          prompt = `Analyze this League of Legends gameplay image/video and provide a comprehensive analysis including:
          1. Match result (winner/loser teams)
          2. Individual player KDA stats
          3. Best play of the match with timestamp and description
          4. Team compositions and key champions
          5. Performance ratings for visible players
          
          Focus on extracting concrete statistics and identifying standout moments. Return structured JSON data.`;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'system',
                content: 'You are an expert League of Legends analyst. Analyze gameplay footage and screenshots to extract accurate match data, player statistics, and identify key moments.'
              },
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  { 
                    type: 'image_url', 
                    image_url: { 
                      url: file.base64_url || file.url 
                    } 
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.1
          }),
        });

        if (!response.ok) {
          console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
          continue;
        }

        const aiResponse = await response.json();
        const analysisText = aiResponse.choices[0]?.message?.content;
        
        if (!analysisText) {
          console.warn(`No analysis content returned for file: ${file.name}`);
          continue;
        }

        // Try to parse JSON from AI response
        let structuredData = {};
        try {
          // Extract JSON from the response if it's wrapped in text
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            structuredData = JSON.parse(jsonMatch[0]);
          } else {
            // If no JSON found, create basic structure from text
            structuredData = {
              raw_analysis: analysisText,
              confidence: 0.7,
              analysis_type: analysisType
            };
          }
        } catch (parseError) {
          console.warn('Failed to parse AI response as JSON:', parseError);
          structuredData = {
            raw_analysis: analysisText,
            confidence: 0.6,
            analysis_type: analysisType
          };
        }

        analysisResults.push({
          file_name: file.name,
          file_type: file.type,
          analysis: structuredData,
          timestamp: new Date().toISOString()
        });

        console.log(`Completed analysis for file: ${file.name}`);

      } catch (fileError) {
        console.error(`Error analyzing file ${file.name}:`, fileError);
        analysisResults.push({
          file_name: file.name,
          file_type: file.type,
          error: fileError instanceof Error ? fileError.message : String(fileError),
          timestamp: new Date().toISOString()
        });
      }
    }

    // Save analysis results to database
    const { data: savedAnalysis, error: dbError } = await supabase
      .from('match_analysis')
      .insert({
        user_id: user.id,
        file_path: `analysis_${Date.now()}`,
        file_type: 'multiple',
        analysis_result: analysisResults,
        confidence_score: analysisResults.length > 0 ? 0.8 : 0.0
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save analysis to database' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Analysis completed and saved to database');

    return new Response(
      JSON.stringify({
        success: true,
        analysis_id: savedAnalysis.id,
        results: analysisResults,
        total_files: files.length,
        successful_analyses: analysisResults.filter(r => !r.error).length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-match-analysis function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});