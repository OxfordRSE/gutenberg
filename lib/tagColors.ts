type TagColor = {
  background: string
  border?: string
  text: string
}

type SubtleTagColor = {
  background: string
  border: string
  text: string
  darkText: string
}

const palette = [
  { solid: "#0369a1", subtle: "#075985", subtleDark: "#7dd3fc" }, // sky
  { solid: "#15803d", subtle: "#166534", subtleDark: "#86efac" }, // green
  { solid: "#c2410c", subtle: "#9a3412", subtleDark: "#fdba74" }, // orange
  { solid: "#be123c", subtle: "#9f1239", subtleDark: "#fda4af" }, // rose
  { solid: "#4338ca", subtle: "#3730a3", subtleDark: "#a5b4fc" }, // indigo
  { solid: "#0f766e", subtle: "#115e59", subtleDark: "#5eead4" }, // teal
  { solid: "#b45309", subtle: "#92400e", subtleDark: "#fcd34d" }, // amber
  { solid: "#047857", subtle: "#065f46", subtleDark: "#6ee7b7" }, // emerald
  { solid: "#6d28d9", subtle: "#5b21b6", subtleDark: "#c4b5fd" }, // violet
  { solid: "#0e7490", subtle: "#155e75", subtleDark: "#67e8f9" }, // cyan
]

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getPaletteEntry(tag: string) {
  return palette[hashString(tag.trim().toLowerCase()) % palette.length]
}

export function getTagColor(tag: string): TagColor {
  return { background: getPaletteEntry(tag).solid, text: "#ffffff" }
}

export function getSubtleTagColor(tag: string): SubtleTagColor {
  const { solid, subtle, subtleDark } = getPaletteEntry(tag)
  return {
    background: `${solid}1A`,
    border: `${solid}55`,
    text: subtle,
    darkText: subtleDark,
  }
}
