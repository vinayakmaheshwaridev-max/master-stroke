import { supabase } from '../lib/supabase'

export const settingsService = {
  async getRegistrationStatus() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'registration_open').single()
    if (error) return true
    return data.value === 'true'
  },
  async setRegistrationStatus(isOpen) {
    const { error } = await supabase.from('settings').update({ value: String(isOpen), updated_at: new Date().toISOString() }).eq('key', 'registration_open')
    if (error) throw error
  }
}
