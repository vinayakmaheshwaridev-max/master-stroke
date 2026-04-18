import { useCallback, useEffect, useMemo, useState } from 'react'
import { teamService } from '../../services/teamService'
import { matchService } from '../../services/matchService'
import { Button, Badge, toast } from '../../components/ui'
import { SectionLoader } from '../../components/ui/Spinner'

const DEFAULT_GROUNDS = ['Ground A - Main Pitch', 'Ground A - Turf 2', 'Ground B']

const FORMAT_OPTIONS = {
  box: { label: 'Box Cricket', duration: '70 min', slotMinutes: 90 },
  t20: { label: 'T20', duration: '3.5 hrs', slotMinutes: 240 },
  odi: { label: 'ODI', duration: '8 hrs', slotMinutes: 540 },
  test: { label: 'Test', duration: '5 days', slotMinutes: 600 },
}

const TOURNAMENT_TYPES = {
  roundRobin: {
    label: 'League (Round Robin)',
    description: 'Every team plays every other team once.',
    method: 'Circle method',
  },
  doubleRoundRobin: {
    label: 'Double Round Robin',
    description: 'Every team plays every other team twice.',
    method: 'Circle method, two legs',
  },
  knockout: {
    label: 'Knockout Only',
    description: 'Lose once and exit the tournament.',
    method: 'Bracket with byes if needed',
  },
  groupStage: {
    label: 'Group Stage Only',
    description: 'Teams are split into groups and play round robin inside each group.',
    method: 'Grouped circle method',
  },
  groupKnockout: {
    label: 'Group Stage + Knockout',
    description: 'Group league first, then qualifiers move into knockouts.',
    method: 'Groups plus bracket',
  },
}

const FIELD_CLASS =
  'w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-3 text-sm font-semibold text-on-surface outline-none transition focus:ring-4 focus:ring-primary-fixed-dim/30 disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-on-surface-variant'
const LABEL_CLASS = 'text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant'

function getDateInputValue(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(dateValue, dayOffset) {
  const date = new Date(`${dateValue}T00:00:00`)
  date.setDate(date.getDate() + dayOffset)
  return date
}

function formatDisplayDate(dateValue, dayOffset) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(addDays(dateValue, dayOffset))
}

function addMinutesToTime(timeValue, minutesToAdd) {
  const [hours, minutes] = timeValue.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + minutesToAdd
  const nextHours = Math.floor(totalMinutes / 60) % 24
  const nextMinutes = totalMinutes % 60
  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`
}

function getSlotTimes(formatKey, matchesPerGroundPerDay, firstMatchTime) {
  const format = FORMAT_OPTIONS[formatKey] || FORMAT_OPTIONS.box
  return Array.from({ length: matchesPerGroundPerDay }, (_, index) =>
    addMinutesToTime(firstMatchTime, index * format.slotMinutes)
  )
}

function normalizeTeams(teams) {
  return teams.map((team, index) => ({
    id: String(team.id ?? index + 1),
    name: team.team_name || `Team ${index + 1}`,
    placeholder: false,
  }))
}

function createPlaceholder(name) {
  return {
    id: `placeholder-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    placeholder: true,
  }
}

function getLetter(index) {
  return String.fromCharCode(65 + index)
}

function generateRoundRobinRounds(teams, options = {}) {
  const { doubleLeg = false, stage = 'League', groupLabel = '' } = options
  const participants = teams.length % 2 === 0 ? [...teams] : [...teams, null]
  const size = participants.length
  const rounds = []
  let rotation = [...participants]

  for (let roundIndex = 0; roundIndex < size - 1; roundIndex += 1) {
    const fixtures = []
    const byes = []

    for (let pairIndex = 0; pairIndex < size / 2; pairIndex += 1) {
      const left = rotation[pairIndex]
      const right = rotation[size - 1 - pairIndex]

      if (!left || !right) {
        const restingTeam = left || right
        if (restingTeam) byes.push(restingTeam.name)
      } else {
        const shouldSwap = roundIndex % 2 === 1
        fixtures.push({
          teamA: shouldSwap ? right : left,
          teamB: shouldSwap ? left : right,
          stage,
          round: `${groupLabel ? `${groupLabel} ` : ''}Round ${roundIndex + 1}`,
          detail: groupLabel || 'League',
        })
      }
    }

    rounds.push({
      name: `${groupLabel ? `${groupLabel} ` : ''}Round ${roundIndex + 1}`,
      fixtures,
      byes,
    })

    rotation = [rotation[0], rotation[size - 1], ...rotation.slice(1, size - 1)]
  }

  if (!doubleLeg) return rounds

  const reverseRounds = rounds.map((round, index) => ({
    name: `Leg 2 Round ${index + 1}`,
    fixtures: round.fixtures.map((fixture) => ({
      ...fixture,
      teamA: fixture.teamB,
      teamB: fixture.teamA,
      round: `Leg 2 Round ${index + 1}`,
      detail: 'League Leg 2',
    })),
    byes: round.byes,
  }))

  return [...rounds, ...reverseRounds]
}

function getKnockoutStageName(participantCount) {
  if (participantCount === 2) return 'Final'
  if (participantCount === 4) return 'Semifinal'
  if (participantCount === 8) return 'Quarterfinal'
  if (participantCount === 16) return 'Round of 16'
  return `${participantCount}-Team Round`
}

function getStageCode(stageName) {
  if (stageName === 'Final') return 'Final'
  if (stageName === 'Semifinal') return 'SF'
  if (stageName === 'Quarterfinal') return 'QF'
  if (stageName === 'Preliminary') return 'Prelim'
  if (stageName === 'Round of 16') return 'R16'
  return 'Round'
}

function generateKnockoutRounds(participants) {
  if (participants.length < 2) return []

  const rounds = []
  const nextPowerOfTwo = 2 ** Math.ceil(Math.log2(participants.length))
  let currentParticipants = participants

  if (participants.length !== nextPowerOfTwo) {
    const byeCount = nextPowerOfTwo - participants.length
    const seededByes = participants.slice(0, byeCount)
    const playInPool = participants.slice(byeCount)
    const preliminaryFixtures = []

    for (let leftIndex = 0, rightIndex = playInPool.length - 1; leftIndex < rightIndex; leftIndex += 1, rightIndex -= 1) {
      preliminaryFixtures.push({
        teamA: playInPool[leftIndex],
        teamB: playInPool[rightIndex],
        stage: 'Preliminary',
        round: 'Preliminary',
        detail: 'Knockout',
      })
    }

    rounds.push({
      name: 'Preliminary',
      fixtures: preliminaryFixtures,
      byes: seededByes.map((team) => team.name),
    })

    const winners = preliminaryFixtures.map((_, index) => createPlaceholder(`Winner Preliminary ${index + 1}`))
    currentParticipants = []
    const maxLength = Math.max(seededByes.length, winners.length)

    for (let index = 0; index < maxLength; index += 1) {
      if (seededByes[index]) currentParticipants.push(seededByes[index])
      if (winners[index]) currentParticipants.push(winners[index])
    }
  }

  while (currentParticipants.length >= 2) {
    const stageName = getKnockoutStageName(currentParticipants.length)
    const fixtures = []

    for (let leftIndex = 0, rightIndex = currentParticipants.length - 1; leftIndex < rightIndex; leftIndex += 1, rightIndex -= 1) {
      fixtures.push({
        teamA: currentParticipants[leftIndex],
        teamB: currentParticipants[rightIndex],
        stage: stageName,
        round: stageName,
        detail: 'Knockout',
      })
    }

    rounds.push({
      name: stageName,
      fixtures,
      byes: [],
    })

    currentParticipants = fixtures.map((_, index) => createPlaceholder(`Winner ${getStageCode(stageName)} ${index + 1}`))
  }

  return rounds
}

function splitIntoGroups(teams, groupCount) {
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    name: `Group ${getLetter(index)}`,
    teams: [],
  }))

  teams.forEach((team, index) => {
    groups[index % groupCount].teams.push(team)
  })

  return groups
}

function generateGroupRounds(teams, groupCount) {
  const groups = splitIntoGroups(teams, groupCount)
  const groupRounds = groups.map((group) => ({
    ...group,
    rounds: generateRoundRobinRounds(group.teams, {
      stage: group.name,
      groupLabel: group.name,
    }),
  }))
  const maxRounds = Math.max(...groupRounds.map((group) => group.rounds.length), 0)
  const rounds = []

  for (let roundIndex = 0; roundIndex < maxRounds; roundIndex += 1) {
    const fixtures = []
    const byes = []

    groupRounds.forEach((group) => {
      const round = group.rounds[roundIndex]
      if (!round) return
      fixtures.push(...round.fixtures)
      byes.push(...round.byes.map((teamName) => `${teamName} (${group.name})`))
    })

    rounds.push({
      name: `Group Round ${roundIndex + 1}`,
      fixtures,
      byes,
    })
  }

  return { rounds, groups }
}

function generateGroupQualifierParticipants(groups, qualifiersPerGroup) {
  return groups.flatMap((group) =>
    Array.from({ length: Math.min(qualifiersPerGroup, group.teams.length) }, (_, index) =>
      createPlaceholder(`${group.name} Rank ${index + 1}`)
    )
  )
}

function canTeamPlay(team, dayIndex, lastPlayedDayByTeam, restDays) {
  if (!team || team.placeholder) return true
  const lastPlayedDay = lastPlayedDayByTeam.get(team.id)
  return lastPlayedDay === undefined || dayIndex - lastPlayedDay > restDays
}

function findSlot({ fixture, searchStartDay, usedSlots, lastPlayedDayByTeam, restDays, grounds, slotTimes, maxDays }) {
  for (let dayIndex = searchStartDay; dayIndex < maxDays; dayIndex += 1) {
    if (
      !canTeamPlay(fixture.teamA, dayIndex, lastPlayedDayByTeam, restDays) ||
      !canTeamPlay(fixture.teamB, dayIndex, lastPlayedDayByTeam, restDays)
    ) {
      continue
    }

    for (const ground of grounds) {
      for (let slotIndex = 0; slotIndex < slotTimes.length; slotIndex += 1) {
        const slotKey = `${dayIndex}-${ground}-${slotIndex}`
        if (!usedSlots.has(slotKey)) {
          usedSlots.add(slotKey)
          return { dayIndex, ground, time: slotTimes[slotIndex] }
        }
      }
    }
  }

  return null
}

function buildScheduledPreview({ rounds, startDate, grounds, matchesPerGroundPerDay, restDays, formatKey, firstMatchTime }) {
  const usedSlots = new Set()
  const lastPlayedDayByTeam = new Map()
  const slotTimes = getSlotTimes(formatKey, matchesPerGroundPerDay, firstMatchTime)
  const matches = []
  const byes = []
  let searchStartDay = 0
  const maxDays = 1200

  rounds.forEach((round) => {
    let roundLastDay = searchStartDay

    round.fixtures.forEach((fixture) => {
      const slot = findSlot({
        fixture,
        searchStartDay,
        usedSlots,
        lastPlayedDayByTeam,
        restDays,
        grounds,
        slotTimes,
        maxDays,
      })

      if (!slot) return

      const matchNumber = matches.length + 1
      matches.push({
        id: `preview-match-${matchNumber}`,
        matchNumber,
        dayIndex: slot.dayIndex,
        dayLabel: `Day ${slot.dayIndex + 1}`,
        dateLabel: formatDisplayDate(startDate, slot.dayIndex),
        time: slot.time,
        ground: slot.ground,
        stage: fixture.stage,
        round: fixture.round,
        detail: fixture.detail,
        teamA: fixture.teamA.name,
        teamB: fixture.teamB.name,
      })

      if (!fixture.teamA.placeholder) lastPlayedDayByTeam.set(fixture.teamA.id, slot.dayIndex)
      if (!fixture.teamB.placeholder) lastPlayedDayByTeam.set(fixture.teamB.id, slot.dayIndex)
      roundLastDay = Math.max(roundLastDay, slot.dayIndex)
    })

    if (round.byes.length > 0) {
      byes.push({
        round: round.name,
        dayLabel: `Day ${searchStartDay + 1}`,
        teams: round.byes,
      })
    }

    searchStartDay = roundLastDay + restDays + 1
  })

  return { matches, byes }
}

function getRoundsForForm({ tournamentType, teams, groupCount, qualifiersPerGroup }) {
  if (tournamentType === 'knockout') {
    return {
      rounds: generateKnockoutRounds(teams),
      groups: [],
      method: TOURNAMENT_TYPES.knockout.method,
    }
  }

  if (tournamentType === 'groupStage' || tournamentType === 'groupKnockout') {
    const groupResult = generateGroupRounds(teams, groupCount)
    const rounds = [...groupResult.rounds]

    if (tournamentType === 'groupKnockout') {
      const qualifierParticipants = generateGroupQualifierParticipants(groupResult.groups, qualifiersPerGroup)
      rounds.push(...generateKnockoutRounds(qualifierParticipants))
    }

    return {
      rounds,
      groups: groupResult.groups,
      method: TOURNAMENT_TYPES[tournamentType].method,
    }
  }

  return {
    rounds: generateRoundRobinRounds(teams, {
      doubleLeg: tournamentType === 'doubleRoundRobin',
      stage: 'League',
    }),
    groups: [],
    method: TOURNAMENT_TYPES[tournamentType].method,
  }
}

function getPreviewSummary({ matches, byes, teams, grounds, form, method }) {
  const lastDayIndex = matches.reduce((maxDay, match) => Math.max(maxDay, match.dayIndex), 0)

  return {
    method,
    totalTeams: teams.length,
    totalGrounds: grounds.length,
    totalMatches: matches.length,
    totalByes: byes.reduce((total, bye) => total + bye.teams.length, 0),
    totalDays: matches.length > 0 ? lastDayIndex + 1 : 0,
    formatLabel: FORMAT_OPTIONS[form.matchFormat]?.label || FORMAT_OPTIONS.box.label,
    duration: FORMAT_OPTIONS[form.matchFormat]?.duration || FORMAT_OPTIONS.box.duration,
  }
}

function groupMatchesByDay(matches) {
  const grouped = new Map()

  matches.forEach((match) => {
    if (!grouped.has(match.dayIndex)) grouped.set(match.dayIndex, [])
    grouped.get(match.dayIndex).push(match)
  })

  return Array.from(grouped.entries())
    .sort(([leftDay], [rightDay]) => leftDay - rightDay)
    .map(([dayIndex, dayMatches]) => ({
      dayIndex,
      dayLabel: `Day ${dayIndex + 1}`,
      dateLabel: dayMatches[0]?.dateLabel || '',
      matches: dayMatches.sort((left, right) =>
        left.time.localeCompare(right.time) || left.ground.localeCompare(right.ground)
      ),
    }))
}

function SchedulerStat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-4">
      <span className="material-symbols-outlined text-lg text-primary">{icon}</span>
      <p className="mt-3 text-2xl font-black tracking-tight text-on-surface">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">{label}</p>
    </div>
  )
}

export default function AiSchedulerPage() {
  const [teams, setTeams] = useState([])
  const [grounds, setGrounds] = useState(DEFAULT_GROUNDS)
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState({ matches: [], byes: [], summary: null, groups: [] })
  const [form, setForm] = useState({
    tournamentType: 'roundRobin',
    matchFormat: 'box',
    matchesPerGroundPerDay: 1,
    restDays: 1,
    startDate: getDateInputValue(),
    firstMatchTime: '09:00',
    groupCount: 2,
    qualifiersPerGroup: 2,
  })

  const teamOptions = useMemo(() => normalizeTeams(teams), [teams])
  const groupedMatches = useMemo(() => groupMatchesByDay(preview.matches), [preview.matches])
  const isGroupMode = form.tournamentType === 'groupStage' || form.tournamentType === 'groupKnockout'
  const isGroupKnockout = form.tournamentType === 'groupKnockout'
  const maxGroupCount = Math.max(1, Math.floor(Math.max(teamOptions.length, 2) / 2))

  const fetchSchedulerInputs = useCallback(async () => {
    setLoading(true)
    try {
      const [approvedTeams, scheduledMatches] = await Promise.all([
        teamService.getTeams('approved'),
        matchService.getMatches(),
      ])
      const venueNames = Array.from(
        new Set((scheduledMatches || []).map((match) => match.venue).filter(Boolean))
      )

      setTeams(approvedTeams || [])
      setGrounds(venueNames.length > 0 ? venueNames : DEFAULT_GROUNDS)
    } catch (err) {
      console.error('Error loading AI scheduler inputs:', err)
      toast.error('Failed to load teams and grounds for AI Scheduler')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedulerInputs()
  }, [fetchSchedulerInputs])

  const updateForm = (key, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [key]: value,
    }))
  }

  const generatePreview = (event) => {
    event.preventDefault()

    if (teamOptions.length < 2) {
      toast.error('Approve at least two teams before generating a schedule')
      return
    }

    const matchesPerGroundPerDay = Math.max(1, Number(form.matchesPerGroundPerDay) || 1)
    const restDays = Math.max(0, Number(form.restDays) || 0)
    const groupCount = Math.min(maxGroupCount, Math.max(1, Number(form.groupCount) || 1))
    const qualifiersPerGroup = Math.max(1, Number(form.qualifiersPerGroup) || 1)
    const { rounds, groups, method } = getRoundsForForm({
      tournamentType: form.tournamentType,
      teams: teamOptions,
      groupCount,
      qualifiersPerGroup,
    })
    const { matches, byes } = buildScheduledPreview({
      rounds,
      startDate: form.startDate,
      grounds,
      matchesPerGroundPerDay,
      restDays,
      formatKey: form.matchFormat,
      firstMatchTime: form.firstMatchTime,
    })
    const normalizedForm = {
      ...form,
      matchesPerGroundPerDay,
      restDays,
      groupCount,
      qualifiersPerGroup,
    }

    setForm(normalizedForm)
    setPreview({
      matches,
      byes,
      groups,
      summary: getPreviewSummary({
        matches,
        byes,
        teams: teamOptions,
        grounds,
        form: normalizedForm,
        method,
      }),
    })
    toast.success('Schedule preview generated')
  }

  if (loading) {
    return <SectionLoader message="Loading AI Scheduler..." />
  }

  return (
    <div className="flex min-h-screen flex-col p-6 md:p-8 xl:p-10">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge status="info" className="mb-3">Preview Only</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-background md:text-4xl">AI Scheduler</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-on-surface-variant">
            Build a fixture preview from approved teams and existing grounds. Nothing is saved to Supabase.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchSchedulerInputs}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh Inputs
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="rounded-[1.5rem] bg-surface-container-low p-5 xl:col-span-5">
          <div className="mb-5">
            <h2 className="text-xl font-black tracking-tight text-on-surface">Create Your Tournament</h2>
            <p className="mt-1 text-sm text-on-surface-variant">Counts come from Supabase. The rest stays here as a preview.</p>
          </div>

          <form className="space-y-5" onSubmit={generatePreview}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Number of Teams</span>
                <input value={teamOptions.length} disabled className={FIELD_CLASS} />
              </label>
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Number of Grounds</span>
                <input value={grounds.length} disabled className={FIELD_CLASS} />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Match Format</span>
                <select
                  value={form.matchFormat}
                  onChange={(event) => updateForm('matchFormat', event.target.value)}
                  className={FIELD_CLASS}
                >
                  {Object.entries(FORMAT_OPTIONS).map(([key, option]) => (
                    <option key={key} value={key}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className={LABEL_CLASS}>First Match Time</span>
                <input
                  type="time"
                  value={form.firstMatchTime}
                  onChange={(event) => updateForm('firstMatchTime', event.target.value)}
                  className={FIELD_CLASS}
                />
              </label>
            </div>

            <fieldset className="space-y-3">
              <legend className={LABEL_CLASS}>Tournament Type</legend>
              <div className="grid gap-2">
                {Object.entries(TOURNAMENT_TYPES).map(([key, option]) => (
                  <label
                    key={key}
                    className={`flex cursor-pointer gap-3 rounded-2xl border p-3 transition ${
                      form.tournamentType === key
                        ? 'border-primary/30 bg-surface-container-lowest text-on-surface'
                        : 'border-outline-variant/20 bg-surface-container-low/40 text-on-surface-variant hover:bg-surface-container-lowest'
                    }`}
                  >
                    <input
                      type="radio"
                      name="tournamentType"
                      value={key}
                      checked={form.tournamentType === key}
                      onChange={(event) => updateForm('tournamentType', event.target.value)}
                      className="mt-1 h-4 w-4 text-primary focus:ring-primary/20"
                    />
                    <span>
                      <span className="block text-sm font-black">{option.label}</span>
                      <span className="mt-0.5 block text-xs leading-5">{option.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Matches Per Ground Per Day</span>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={form.matchesPerGroundPerDay}
                  onChange={(event) => updateForm('matchesPerGroundPerDay', event.target.value)}
                  className={FIELD_CLASS}
                />
              </label>
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Rest Days Between Matches</span>
                <select
                  value={form.restDays}
                  onChange={(event) => updateForm('restDays', event.target.value)}
                  className={FIELD_CLASS}
                >
                  <option value="0">No rest day</option>
                  <option value="1">1 day</option>
                  <option value="2">2 days</option>
                  <option value="3">3 days</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2">
                <span className={LABEL_CLASS}>Start Date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => updateForm('startDate', event.target.value)}
                  className={FIELD_CLASS}
                />
              </label>
              {isGroupMode && (
                <label className="space-y-2">
                  <span className={LABEL_CLASS}>Number of Groups</span>
                  <input
                    type="number"
                    min="1"
                    max={maxGroupCount}
                    value={form.groupCount}
                    onChange={(event) => updateForm('groupCount', event.target.value)}
                    className={FIELD_CLASS}
                  />
                </label>
              )}
              {isGroupKnockout && (
                <label className="space-y-2 sm:col-span-2">
                  <span className={LABEL_CLASS}>Qualifiers Per Group</span>
                  <select
                    value={form.qualifiersPerGroup}
                    onChange={(event) => updateForm('qualifiersPerGroup', event.target.value)}
                    className={FIELD_CLASS}
                  >
                    <option value="1">Top 1</option>
                    <option value="2">Top 2</option>
                    <option value="3">Top 3</option>
                  </select>
                </label>
              )}
            </div>

            <div className="rounded-2xl bg-surface-container-lowest p-4">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant">Grounds Used</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {grounds.map((ground) => (
                  <span key={ground} className="rounded-full bg-secondary-container px-3 py-1 text-[11px] font-bold text-on-secondary-container">
                    {ground}
                  </span>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth size="lg" icon="auto_awesome">
              Generate Schedule Preview
            </Button>
          </form>
        </section>

        <section className="flex min-h-[640px] flex-col rounded-[1.5rem] bg-surface-container-low/70 p-5 xl:col-span-7">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-on-surface">Generated Match Schedule</h2>
              <p className="mt-1 text-sm text-on-surface-variant">This list is only a UI preview. Use the manual Scheduler tab to save final fixtures.</p>
            </div>
            {preview.summary && (
              <Badge status="scheduled">{preview.summary.method}</Badge>
            )}
          </div>

          {preview.summary ? (
            <>
              <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SchedulerStat icon="groups" label="Teams" value={preview.summary.totalTeams} />
                <SchedulerStat icon="sports_cricket" label="Matches" value={preview.summary.totalMatches} />
                <SchedulerStat icon="event" label="Days" value={preview.summary.totalDays} />
                <SchedulerStat icon="stadium" label="Grounds" value={preview.summary.totalGrounds} />
              </div>

              <div className="mb-4 grid gap-3 rounded-2xl bg-surface-container-lowest p-4 text-sm text-on-surface-variant md:grid-cols-3">
                <p><span className="font-black text-on-surface">Format:</span> {preview.summary.formatLabel}</p>
                <p><span className="font-black text-on-surface">Duration:</span> {preview.summary.duration}</p>
                <p><span className="font-black text-on-surface">Byes:</span> {preview.summary.totalByes}</p>
              </div>

              {preview.groups.length > 0 && (
                <div className="mb-4 rounded-2xl bg-surface-container-lowest p-4">
                  <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant">Groups</p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {preview.groups.map((group) => (
                      <div key={group.name} className="rounded-xl bg-surface-container-low p-3">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-on-surface">{group.name}</p>
                        <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                          {group.teams.map((team) => team.name).join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {groupedMatches.map((day) => (
                  <div key={day.dayIndex} className="rounded-2xl bg-surface-container-lowest p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/20 pb-3">
                      <div>
                        <p className="text-base font-black text-on-surface">{day.dayLabel}</p>
                        <p className="text-xs font-semibold text-on-surface-variant">{day.dateLabel}</p>
                      </div>
                      <Badge status="info">{day.matches.length} matches</Badge>
                    </div>
                    <div className="divide-y divide-outline-variant/15">
                      {day.matches.map((match) => (
                        <article key={match.id} className="grid gap-3 py-3 md:grid-cols-[76px_1fr_auto] md:items-center">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-on-surface-variant">Match</p>
                            <p className="text-xl font-black text-on-surface">#{match.matchNumber}</p>
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-on-surface">{match.teamA}</span>
                              <span className="rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-black text-on-surface-variant">VS</span>
                              <span className="font-black text-on-surface">{match.teamB}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold text-on-surface-variant">
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">emoji_events</span>
                                {match.round}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">schedule</span>
                                {match.time}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {match.ground}
                              </span>
                            </div>
                          </div>
                          <Badge status={match.detail === 'Knockout' ? 'pending' : 'scheduled'}>{match.stage}</Badge>
                        </article>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {preview.byes.length > 0 && (
                <div className="mt-4 rounded-2xl bg-surface-container-lowest p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-on-surface-variant">Bye / Rest Notes</p>
                  <div className="mt-3 space-y-2">
                    {preview.byes.map((bye) => (
                      <p key={`${bye.round}-${bye.teams.join('-')}`} className="text-xs font-semibold text-on-surface-variant">
                        <span className="font-black text-on-surface">{bye.round}:</span> {bye.teams.join(', ')}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-outline-variant/40 bg-surface-container-lowest p-8 text-center">
              <div>
                <span className="material-symbols-outlined text-5xl text-primary">auto_awesome</span>
                <h3 className="mt-4 text-xl font-black text-on-surface">Generate a preview</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-on-surface-variant">
                  Choose the tournament type, rest gap, and start date. The generated matches will appear here on the right.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
