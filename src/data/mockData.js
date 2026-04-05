// Mock data for development — replaces Supabase queries until backend is connected

export const mockTeams = [
  { id: '1', team_name: 'Royal Challengers', captain_name: 'Arjun Sharma', mobile: '9876543210', email: 'arjun@email.com', age: 24, status: 'approved', payment_done: true, created_at: '2024-10-01T10:00:00Z' },
  { id: '2', team_name: 'Desert Lions', captain_name: 'Rahul Verma', mobile: '9876543211', email: 'rahul@email.com', age: 28, status: 'approved', payment_done: true, created_at: '2024-10-01T11:00:00Z' },
  { id: '3', team_name: 'Coastal Giants', captain_name: 'Neha Patil', mobile: '9876543212', email: 'neha@email.com', age: 26, status: 'pending', payment_done: false, created_at: '2024-10-02T09:00:00Z' },
  { id: '4', team_name: 'Mountain Warriors', captain_name: 'Vikram Singh', mobile: '9876543213', email: 'vikram@email.com', age: 30, status: 'approved', payment_done: true, created_at: '2024-10-02T14:00:00Z' },
  { id: '5', team_name: 'Thunder Strikers', captain_name: 'Priya Nair', mobile: '9876543214', email: 'priya@email.com', age: 22, status: 'pending', payment_done: false, created_at: '2024-10-03T08:00:00Z' },
  { id: '6', team_name: 'Phoenix Rising', captain_name: 'Aditya Kapoor', mobile: '9876543215', email: 'aditya@email.com', age: 25, status: 'rejected', payment_done: false, created_at: '2024-10-03T10:00:00Z' },
  { id: '7', team_name: 'City Blazers', captain_name: 'Sanjay Kumar', mobile: '9876543216', email: 'sanjay@email.com', age: 29, status: 'approved', payment_done: true, created_at: '2024-10-04T12:00:00Z' },
  { id: '8', team_name: 'River Hawks', captain_name: 'Meera Joshi', mobile: '9876543217', email: 'meera@email.com', age: 23, status: 'approved', payment_done: false, created_at: '2024-10-04T15:00:00Z' },
]

export const mockMatches = [
  { id: '1', match_number: 1, team_a_id: '1', team_b_id: '2', scheduled_at: '2024-10-12T09:00:00Z', venue: 'Ground A - Main Pitch', notes: 'Opening match', status: 'completed', runs_a: 184, wickets_a: 4, overs_a: 20.0, runs_b: 142, wickets_b: 8, overs_b: 20.0, result: 'team_a', man_of_match: 'Arjun Sharma', summary: 'Royal Challengers won by 42 runs' },
  { id: '2', match_number: 2, team_a_id: '4', team_b_id: '7', scheduled_at: '2024-10-12T14:30:00Z', venue: 'Ground A - Turf 2', notes: '', status: 'completed', runs_a: 156, wickets_a: 8, overs_a: 20.0, runs_b: 144, wickets_b: 10, overs_b: 18.4, result: 'team_a', man_of_match: 'Vikram Singh', summary: 'Mountain Warriors won by 12 runs' },
  { id: '3', match_number: 3, team_a_id: '1', team_b_id: '4', scheduled_at: '2024-10-13T10:00:00Z', venue: 'Ground A - Main Pitch', notes: '', status: 'completed', runs_a: 198, wickets_a: 3, overs_a: 20.0, runs_b: 165, wickets_b: 7, overs_b: 20.0, result: 'team_a', man_of_match: 'Arjun Sharma', summary: 'Royal Challengers won by 33 runs' },
  { id: '4', match_number: 4, team_a_id: '2', team_b_id: '7', scheduled_at: '2024-10-14T09:00:00Z', venue: 'Ground A - Turf 2', notes: 'Report 30 min early', status: 'scheduled', runs_a: null, wickets_a: null, overs_a: null, runs_b: null, wickets_b: null, overs_b: null, result: null, man_of_match: null, summary: null },
  { id: '5', match_number: 5, team_a_id: '8', team_b_id: '1', scheduled_at: '2024-10-15T14:30:00Z', venue: 'Ground A - Main Pitch', notes: '', status: 'scheduled', runs_a: null, wickets_a: null, overs_a: null, runs_b: null, wickets_b: null, overs_b: null, result: null, man_of_match: null, summary: null },
  { id: '6', match_number: 6, team_a_id: '4', team_b_id: '2', scheduled_at: '2024-10-16T10:00:00Z', venue: 'Ground A - Turf 2', notes: '', status: 'scheduled', runs_a: null, wickets_a: null, overs_a: null, runs_b: null, wickets_b: null, overs_b: null, result: null, man_of_match: null, summary: null },
]

export const mockNotifications = [
  { id: '1', team_id: null, message: 'Welcome to Master Stroke Box Cricket Season 2024! Please check your match schedules.', type: 'info', is_read: false, created_at: '2024-10-10T08:00:00Z' },
  { id: '2', team_id: '1', message: 'Your match against Desert Lions is scheduled for Oct 12 at 9 AM at Ground A.', type: 'reminder', is_read: false, created_at: '2024-10-11T18:00:00Z' },
  { id: '3', team_id: '1', message: 'Congratulations! You won the match against Desert Lions by 42 runs.', type: 'result', is_read: true, created_at: '2024-10-12T13:00:00Z' },
  { id: '4', team_id: null, message: 'Important: All captains must attend the briefing on Oct 13 at 8 AM.', type: 'important', is_read: false, created_at: '2024-10-12T20:00:00Z' },
]

export const mockSettings = {
  registration_open: true,
}

// Helper to get team by ID
export function getTeamById(id) {
  return mockTeams.find(t => t.id === id)
}

// Helper to get team name by ID
export function getTeamName(id) {
  return mockTeams.find(t => t.id === id)?.team_name || 'Unknown'
}

// Compute points table from matches
export function computePointsTable() {
  const teamStats = {}
  
  mockTeams.filter(t => t.status === 'approved').forEach(team => {
    teamStats[team.id] = {
      id: team.id,
      team_name: team.team_name,
      played: 0, won: 0, lost: 0, tied: 0,
      points: 0, nrr: 0,
      runs_scored: 0, overs_faced: 0,
      runs_conceded: 0, overs_bowled: 0,
    }
  })

  mockMatches.filter(m => m.status === 'completed').forEach(match => {
    const a = teamStats[match.team_a_id]
    const b = teamStats[match.team_b_id]
    if (!a || !b) return

    a.played++
    b.played++
    a.runs_scored += match.runs_a || 0
    a.overs_faced += match.overs_a || 0
    a.runs_conceded += match.runs_b || 0
    a.overs_bowled += match.overs_b || 0
    b.runs_scored += match.runs_b || 0
    b.overs_faced += match.overs_b || 0
    b.runs_conceded += match.runs_a || 0
    b.overs_bowled += match.overs_a || 0

    if (match.result === 'team_a') {
      a.won++; a.points += 2
      b.lost++
    } else if (match.result === 'team_b') {
      b.won++; b.points += 2
      a.lost++
    } else if (match.result === 'tie') {
      a.tied++; a.points += 1
      b.tied++; b.points += 1
    }
  })

  // Calculate NRR
  Object.values(teamStats).forEach(team => {
    if (team.overs_faced > 0 && team.overs_bowled > 0) {
      team.nrr = (team.runs_scored / team.overs_faced) - (team.runs_conceded / team.overs_bowled)
    }
  })

  return Object.values(teamStats)
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr)
    .map((team, i) => ({ ...team, rank: i + 1 }))
}
