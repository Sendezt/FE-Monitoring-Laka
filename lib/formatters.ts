export function formatIndonesianDate(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function getWeekday(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(new Date(`${value}T00:00:00`))
}
