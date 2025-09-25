import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    console.log('Starting daily Riot API update...')
    
    // Call the riot-api-sync function to update all players
    const { data: functionResponse, error: functionError } = await supabase.functions.invoke('riot-api-sync', {
      body: { action: 'update_all' }
    })
    
    if (functionError) {
      console.error('Error calling riot-api-sync:', functionError)
      throw functionError
    }
    
    console.log('Daily update completed:', functionResponse)
    
    // Log the update to a history table (optional - could create this table later)
    const updateLog = {
      update_type: 'daily_auto',
      completed_at: new Date().toISOString(),
      results: functionResponse,
      success: functionResponse?.success || false
    }
    
    console.log('Update summary:', updateLog)
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Daily Riot API update completed',
      summary: functionResponse
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error in daily-riot-update:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})