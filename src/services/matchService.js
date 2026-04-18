import { supabase } from '../lib/supabase'

export const matchService = {
  async getMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`*, team_a:teams!team_a_id(id, team_name), team_b:teams!team_b_id(id, team_name)`)
      .order('scheduled_at', { ascending: true })
    if (error) throw error
    return data
  },
  async getMatchById(id) {
    const { data, error } = await supabase
      .from('matches')
      .select(`*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)`)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  async createMatch(matchData) {
    const { data, error } = await supabase.from('matches').insert([matchData]).select().single()
    if (error) throw error
    return data
  },
  async markPastScheduledMatchesPending(cutoffDateTime) {
    // The match_status enum in PostgreSQL does not allow 'pending'.
    // The frontend dynamically computes the 'pending' status via getUnloggedMatchStatus()
    // based on scheduled_at time, so mutating the database is unnecessary.
  },
  async updateMatch(id, matchData) {
    const { data, error } = await supabase
      .from('matches')
      .update({ ...matchData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },
  async updateScore(id, scoreData) {
    const { error } = await supabase
      .from('matches')
      .update({ ...scoreData, status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  }
}
