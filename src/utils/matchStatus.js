export const MATCH_STATUS = {
  completed: 'completed',
  pending: 'pending',
  scheduled: 'scheduled',
}

export const INCOMPLETE_STATUS_FILTER = 'incomplete'

export function getDateInputValue(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getTimeInputValue(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function getTodayDateInputValue() {
  return getDateInputValue(new Date())
}

export function getTodayStartDateTimeValue() {
  return `${getTodayDateInputValue()}T00:00:00`
}

export function getUnloggedMatchStatus(scheduledAt) {
  const matchDate = getDateInputValue(scheduledAt)
  if (!matchDate) return MATCH_STATUS.scheduled

  return matchDate < getTodayDateInputValue()
    ? MATCH_STATUS.pending
    : MATCH_STATUS.scheduled
}

export function getMatchScoreStatus(match) {
  if (match?.status === MATCH_STATUS.completed) return MATCH_STATUS.completed
  return getUnloggedMatchStatus(match?.scheduled_at)
}

export function isIncompleteScoreStatus(status) {
  return status === MATCH_STATUS.scheduled || status === MATCH_STATUS.pending
}
