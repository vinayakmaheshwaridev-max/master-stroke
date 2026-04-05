import { supabase } from '../lib/supabase'

export const teamService = {
  async getTeams(status = 'approved') {
    let query = supabase.from('teams').select('*')
    if (status !== 'all') {
      query = query.eq('status', status)
    }
    const { data, error } = await query.order('team_name')
    if (error) throw error
    return data
  },
  async registerTeam(teamData) {
    const { data, error } = await supabase.from('teams').insert([teamData]).select().single()
    if (error) throw error
    return data
  },
  async checkTeamNameExists(name) {
    const { data, error } = await supabase.from('teams').select('id').eq('team_name', name).maybeSingle()
    if (error) throw error
    return !!data
  },
  async getTeamByAuthId(authId) {
    const { data, error } = await supabase.from('teams').select('*').eq('auth_user_id', authId).maybeSingle()
    if (error) throw error
    return data
  },
  async updateTeam(id, updates) {
    const { data, error } = await supabase.from('teams').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  }
}
