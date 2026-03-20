type TagColor = {
  background: string
  text: string
}

const palette = [
  "#0ea5e9", // sky
  "#22c55e", // green
  "#f97316", // orange
  "#e11d48", // rose
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // violet
  "#06b6d4", // cyan
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getTextColor(background: string): string {
  const hex = background.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.6 ? "#111827" : "#ffffff"
}

export function getTagColor(tag: string): TagColor {
  const index = hashString(tag.trim().toLowerCase()) % palette.length
  const background = palette[index]
  return { background, text: getTextColor(background) }
}
