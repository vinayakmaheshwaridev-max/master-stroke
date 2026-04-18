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
  async markAsRead(notification) {
    if (!notification.team_id) return; // Prevent updating global notifications to avoid RLS/CORS errors
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', notification.id)
      if (error) console.error(error)
    } catch(err) {
      console.warn('Supabase update failed for markAsRead (CORS/RLS block):', err)
    }
  },
  async markAllAsRead(teamId) {
    if (!teamId) return;
    try {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('team_id', teamId).eq('is_read', false)
      if (error) console.error(error)
    } catch(err) {
      console.warn('Supabase update failed for markAllAsRead (CORS/RLS block):', err)
    }
  },
  async sendNotification(message, type = 'info', teamId = null) {
    const { data, error } = await supabase.from('notifications').insert([{ message, type, team_id: teamId }]).select().single()
    if (error) throw error
    return data
  }
}
