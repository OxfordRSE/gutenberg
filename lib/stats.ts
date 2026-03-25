export function mean(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function median(values: number[]): number | null {
  if (values.length === 0) return null
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) return (sorted[middle - 1] + sorted[middle]) / 2
  return sorted[middle]
}

export function round(value: number | null, digits = 1): number | null {
  if (value === null) return null
  return Number(value.toFixed(digits))
}

export function percent(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null
  return (numerator / denominator) * 100
}

export function differenceInDays(start: Date, end: Date): number {
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
}

export function formatPercent(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(1)}%`
}

export function formatDays(value: number | null): string {
  return value === null ? "N/A" : `${value.toFixed(1)} days`
}

export function formatCountWithPercent(count: number, total: number): string {
  if (total <= 0) return `${count}`
  return `${count} (${Math.round((count / total) * 100)}%)`
}
