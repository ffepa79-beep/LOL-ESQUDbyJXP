import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RIOT_API_KEY = Deno.env.get('RIOT_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Initialize Supabase client with service role for full access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface RiotSummonerData {
  id: string
  accountId: string
  puuid: string
  name: string
  profileIconId: number
  summonerLevel: number
}

interface RiotRankedData {
  leagueId: string
  queueType: string
  tier: string
  rank: string
  summonerId: string
  summonerName: string
  leaguePoints: number
  wins: number
  losses: number
}

interface RiotMatchData {
  matchId: string
  gameCreation: number
  gameDuration: number
  participants: Array<{
    puuid: string
    championName: string
    kills: number
    deaths: number
    assists: number
    win: boolean
  }>
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Riot-Token': RIOT_API_KEY!
        }
      })
      
      if (response.status === 429) {
        // Rate limited, wait and retry
        const retryAfter = parseInt(response.headers.get('Retry-After') || '1')
        console.log(`Rate limited, waiting ${retryAfter} seconds...`)
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
        continue
      }
      
      return response
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error)
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

async function getSummonerByName(summonerName: string, region: string = 'br1'): Promise<RiotSummonerData | null> {
  try {
    const url = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encodeURIComponent(summonerName)}`
    console.log(`Fetching summoner data for: ${summonerName} in region ${region}`)
    
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch summoner: ${response.status} - ${response.statusText}`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching summoner:', error)
    return null
  }
}

async function getRankedData(summonerId: string, region: string = 'br1'): Promise<RiotRankedData[]> {
  try {
    const url = `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`
    console.log(`Fetching ranked data for summoner: ${summonerId}`)
    
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch ranked data: ${response.status} - ${response.statusText}`)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching ranked data:', error)
    return []
  }
}

async function getRecentMatches(puuid: string, region: string = 'br1', count: number = 10): Promise<string[]> {
  try {
    const regionalEndpoint = region === 'br1' ? 'americas' : 'americas' // Map to regional routing
    const url = `https://${regionalEndpoint}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=${count}`
    console.log(`Fetching recent matches for PUUID: ${puuid}`)
    
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch matches: ${response.status} - ${response.statusText}`)
      return []
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}

async function getMatchDetails(matchId: string, region: string = 'br1'): Promise<RiotMatchData | null> {
  try {
    const regionalEndpoint = region === 'br1' ? 'americas' : 'americas'
    const url = `https://${regionalEndpoint}.api.riotgames.com/lol/match/v5/matches/${matchId}`
    
    const response = await fetchWithRetry(url)
    
    if (!response.ok) {
      console.error(`Failed to fetch match details: ${response.status} - ${response.statusText}`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching match details:', error)
    return null
  }
}

async function updatePlayerData(playerId: string, lolName: string, region: string = 'br1') {
  console.log(`Starting update for player ${playerId} (${lolName})`)
  
  // Get summoner data
  const summonerData = await getSummonerByName(lolName, region)
  if (!summonerData) {
    console.error(`Could not find summoner: ${lolName}`)
    return { success: false, error: `Summoner ${lolName} not found` }
  }
  
  // Get ranked data
  const rankedData = await getRankedData(summonerData.id, region)
  const soloQueueData = rankedData.find(entry => entry.queueType === 'RANKED_SOLO_5x5')
  
  // Get recent matches
  const matchIds = await getRecentMatches(summonerData.puuid, region, 10)
  const matchHistory = []
  
  // Calculate KDA from recent matches
  let totalKills = 0, totalDeaths = 0, totalAssists = 0, recentWins = 0, recentLosses = 0
  
  for (const matchId of matchIds.slice(0, 5)) { // Process last 5 matches for KDA
    const matchDetails = await getMatchDetails(matchId, region)
    if (matchDetails) {
      const participant = matchDetails.participants.find(p => p.puuid === summonerData.puuid)
      if (participant) {
        totalKills += participant.kills
        totalDeaths += participant.deaths  
        totalAssists += participant.assists
        
        if (participant.win) recentWins++
        else recentLosses++
        
        matchHistory.push({
          matchId,
          champion: participant.championName,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          win: participant.win,
          gameCreation: matchDetails.gameCreation
        })
      }
    }
    
    // Rate limiting - small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  const averageKDA = totalDeaths > 0 ? 
    parseFloat(((totalKills + totalAssists) / totalDeaths).toFixed(2)) : 
    totalKills + totalAssists
  
  // Update player in database
  const updateData = {
    puuid: summonerData.puuid,
    summoner_id: summonerData.id,
    account_id: summonerData.accountId,
    profile_icon_id: summonerData.profileIconId,
    summoner_level: summonerData.summonerLevel,
    tier: soloQueueData?.tier || 'UNRANKED',
    tier_roman: soloQueueData?.rank || '',
    division: soloQueueData?.rank || '',
    league_points: soloQueueData?.leaguePoints || 0,
    wins: soloQueueData?.wins || 0,
    losses: soloQueueData?.losses || 0,
    kda: averageKDA,
    region: region.toUpperCase(),
    last_updated: new Date().toISOString(),
    match_history: matchHistory,
    current_season_stats: {
      totalKills,
      totalDeaths,
      totalAssists,
      recentWins,
      recentLosses,
      lastUpdateKDA: averageKDA
    }
  }
  
  const { error } = await supabase
    .from('players')
    .update(updateData)
    .eq('id', playerId)
  
  if (error) {
    console.error('Database update error:', error)
    return { success: false, error: error.message }
  }
  
  console.log(`Successfully updated player ${lolName}`)
  return { success: true, data: updateData }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const { action, playerId, lolName, region = 'br1' } = await req.json()
    
    if (!RIOT_API_KEY) {
      throw new Error('RIOT_API_KEY not configured')
    }
    
    switch (action) {
      case 'update_single':
        if (!playerId || !lolName) {
          throw new Error('playerId and lolName are required for update_single')
        }
        
        const result = await updatePlayerData(playerId, lolName, region)
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        })
      
      case 'update_all':
        // Get all players with auto_update enabled
        const { data: players, error } = await supabase
          .from('players')
          .select('id, lol_name, region, auto_update_enabled')
          .eq('auto_update_enabled', true)
        
        if (error) {
          throw new Error(`Database error: ${error.message}`)
        }
        
        const results = []
        
        for (const player of players || []) {
          const result = await updatePlayerData(player.id, player.lol_name, player.region || 'br1')
          results.push({ playerId: player.id, ...result })
          
          // Rate limiting between players
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          updated: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          results 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      
      default:
        throw new Error('Invalid action. Use "update_single" or "update_all"')
    }
    
  } catch (error) {
    console.error('Error in riot-api-sync:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})