import { supabase, supabaseAdminAuth, supabaseServiceRole } from '../lib/supabase'

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
  },
  async approveTeam(team, generatedPassword) {
    if (!supabaseServiceRole) {
      throw new Error("Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env file. The admin portal requires this to bypass email rate limits.")
    }

    const loginEmail = team.email || `${team.mobile}@masterstroke.com`
    let authUserId = team.auth_user_id

    if (authUserId) {
      // Team already has an auth account linked locally. Just update the password directly.
      const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(authUserId, { 
        password: generatedPassword, 
        email_confirm: true 
      })
      if (updateError) throw updateError
    } else {
      // We don't have a local link yet. Instead of blindly trying to create and relying on an error callback (anti-pattern), 
      // we check explicitly using our lightning-fast RPC if they exist in the secure auth schema.
      const { data: rpcUserId, error: rpcError } = await supabaseServiceRole.rpc('get_user_id_by_email', { 
        target_email: loginEmail.trim().toLowerCase() 
      })

      if (!rpcError && rpcUserId) {
        // User already exists in GoTrue! We just need to update their password.
        authUserId = rpcUserId
        const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(authUserId, { 
          password: generatedPassword, 
          email_confirm: true 
        })
        if (updateError) throw updateError
      } else {
        // User genuinely does not exist. Now we safely call createUser.
        const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
          email: loginEmail,
          password: generatedPassword,
          email_confirm: true 
        })
        if (authError) throw authError
        authUserId = authData?.user?.id
      }
    }

    // 2. Update the teams table with status and Auth ID ONLY
    const { data, error } = await supabase.from('teams').update({
      status: 'approved',
      auth_user_id: authUserId || team.auth_user_id
    }).eq('id', team.id).select().single()

    if (error) throw error

    // Attach the generated password transiently for the immediate UI modal, 
    // but it is deliberately NOT saved in the database.
    return { ...data, _tempPassword: generatedPassword }
  },
  async updateTeamPassword(team, newPassword) {
    if (!supabaseServiceRole) {
      throw new Error("Missing VITE_SUPABASE_SERVICE_ROLE_KEY in .env file. Admin cannot force password changes without it.")
    }

    let authUserId = team.auth_user_id
    const loginEmail = team.email || `${team.mobile}@masterstroke.com`

    if (!authUserId) {
      // Instead of relying on an error to guess if they exist, check explicitly via RPC first.
      const { data: rpcUserId, error: rpcError } = await supabaseServiceRole.rpc('get_user_id_by_email', { 
        target_email: loginEmail.trim().toLowerCase() 
      })

      if (!rpcError && rpcUserId) {
        // They exist in GoTrue, just never linked to the local table.
        authUserId = rpcUserId
        const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(authUserId, { 
          password: newPassword, 
          email_confirm: true 
        })
        if (updateError) throw updateError
      } else {
        // They genuinely don't exist yet, we can safely invoke the creation endpoint.
        const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
          email: loginEmail,
          password: newPassword,
          email_confirm: true
        })
        if (authError) throw authError
        authUserId = authData?.user?.id
      }

      if (authUserId) {
        // Link the newly determined auth_user_id to the team
        await supabase.from('teams').update({ auth_user_id: authUserId }).eq('id', team.id)
      }
    } else {
      // Securely update the existing user's password directly in GoTrue Auth
      const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.updateUserById(
        authUserId,
        { password: newPassword }
      )
      if (authError) throw authError
    }

    // Do NOT update plain text passwords anywhere in the 'teams' table.
    // We just return the team object with a transient _tempPassword attached so the UI can copy it once.
    return { ...team, auth_user_id: authUserId || team.auth_user_id, _tempPassword: newPassword }
  }
}
