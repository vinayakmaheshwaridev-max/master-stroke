import { supabase } from '../lib/supabase'

export const notificationService = {
  async getNotifications(teamId = null) {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (teamId) {
      query = query.or(`team_id.eq.${teamId},team_id.is.null`)
    } else {
      query = query.is('team_id', null)
    }
    const { data, error } = await query
    if (error) throw error
    return data
  },
  async markAsRead(id) {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    if (error) throw error
  },
  async sendNotification(message, type = 'info', teamId = null) {
    const { data, error } = await supabase.from('notifications').insert([{ message, type, team_id: teamId }]).select().single()
    if (error) throw error
    return data
  }
}
