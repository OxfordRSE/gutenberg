import { Badge } from "flowbite-react"

const levelLabels: Record<string, { color: string; label: string }> = {
  beginner: { color: "success", label: "Beginner" },
  intermediate: { color: "warning", label: "Intermediate" },
  advanced: { color: "failure", label: "Advanced" },
}

type Props = {
  level?: string | null
}

const CourseLevelBadge: React.FC<Props> = ({ level }) => {
  if (!level) return null
  const normalized = level.trim().toLowerCase()
  const entry = levelLabels[normalized]
  if (!entry) {
    return <Badge color="info">{level}</Badge>
  }
  return <Badge color={entry.color as any}>{entry.label}</Badge>
}

export default CourseLevelBadge
