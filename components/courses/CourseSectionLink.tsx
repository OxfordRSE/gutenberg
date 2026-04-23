import Link from "next/link"
import { Material, sectionSplit } from "lib/material"
import { formatTagLabel } from "lib/tagLabels"
import TagChip from "components/ui/TagChip"

type Depth = "theme" | "course" | "section"

type Props = {
  material: Material
  sectionRef: string
  depth?: Depth
  showTags?: boolean
  className?: string
}

const CourseSectionLink: React.FC<Props> = ({
  material,
  sectionRef,
  depth = "section",
  showTags = true,
  className,
}) => {
  const { section, course, theme, url } = sectionSplit(sectionRef, material)

  const parts: string[] = []
  if (depth === "theme") {
    if (theme?.name) parts.push(theme.name)
    if (course?.name) parts.push(course.name)
    if (section?.name) parts.push(section.name)
  } else if (depth === "course") {
    if (course?.name) parts.push(course.name)
    if (section?.name) parts.push(section.name)
  } else {
    if (section?.name) parts.push(section.name)
  }

  const label = parts.length > 0 ? parts.join(" - ") : sectionRef
  const tagLabels = showTags && section?.tags?.length ? section.tags.map((tag) => formatTagLabel(String(tag))) : []
  const content = (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>{label}</span>
      {tagLabels.length > 0 && (
        <span className="flex flex-wrap gap-1" data-cy="course-section-link-tags">
          {tagLabels.map((tag) => (
            <TagChip key={tag} tag={tag} variant="subtle" />
          ))}
        </span>
      )}
    </span>
  )

  if (url) {
    return (
      <Link href={url} className={className ? `${className} hover:underline` : "hover:underline"}>
        {content}
      </Link>
    )
  }

  return <span className={className}>{content}</span>
}

export default CourseSectionLink
