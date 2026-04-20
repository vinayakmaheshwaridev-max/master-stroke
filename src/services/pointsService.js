export function computePointsTable(teams, matches) {
  const teamStats = {}

  teams.forEach(team => {
    teamStats[team.id] = {
      id: team.id,
      team_name: team.team_name,
      played: 0, won: 0, lost: 0, tied: 0, no_result: 0,
      points: 0, nrr: 0,
      runs_scored: 0, overs_faced: 0,
      runs_conceded: 0, overs_bowled: 0,
    }
  })

  matches.filter(m => m.status === 'completed').forEach(match => {
    const a = teamStats[match.team_a_id]
    const b = teamStats[match.team_b_id]
    if (!a || !b) return

    a.played++
    b.played++

    // Convert overs to balls safely (e.g. 5.3 overs -> 33 balls)
    const getBalls = (ov) => {
      const full = Math.floor(ov)
      const partial = Math.round((ov - full) * 10)
      return (full * 6) + partial
    }

    const aBalls = getBalls(match.overs_a || 0)
    const bBalls = getBalls(match.overs_b || 0)

    a.runs_scored += match.runs_a || 0
    a.overs_faced += aBalls / 6
    a.runs_conceded += match.runs_b || 0
    a.overs_bowled += bBalls / 6

    b.runs_scored += match.runs_b || 0
    b.overs_faced += bBalls / 6
    b.runs_conceded += match.runs_a || 0
    b.overs_bowled += aBalls / 6

    if (match.result === 'team_a') {
      a.won++; a.points += 2
      b.lost++
    } else if (match.result === 'team_b') {
      b.won++; b.points += 2
      a.lost++
    } else if (match.result === 'tie') {
      a.tied++; a.points += 1
      b.tied++; b.points += 1
    } else if (match.result === 'no_result') {
      a.no_result++; a.points += 1
      b.no_result++; b.points += 1
    }
  })

  // NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
  Object.values(teamStats).forEach(team => {
    team.nrr = (team.overs_faced > 0 ? team.runs_scored / team.overs_faced : 0)
      - (team.overs_bowled > 0 ? team.runs_conceded / team.overs_bowled : 0)
    // Round to 3 decimal places
    team.nrr = parseFloat(team.nrr.toFixed(3))
  })

  return Object.values(teamStats)
    .sort((a, b) => b.points - a.points || b.nrr - a.nrr)
    .map((team, i) => ({ ...team, rank: i + 1 }))
}