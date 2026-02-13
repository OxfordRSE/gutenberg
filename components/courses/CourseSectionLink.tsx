import Link from "next/link"
import { Material, sectionSplit } from "lib/material"
import { formatTagLabel } from "lib/tagLabels"

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
  const tagSuffix = showTags && section?.tags?.length ? ` [${section.tags.map(formatTagLabel).join(", ")}]` : ""

  if (url) {
    return (
      <Link href={url} className={className ? `${className} hover:underline` : "hover:underline"}>
        {label}
        {tagSuffix}
      </Link>
    )
  }

  return (
    <span className={className}>
      {label}
      {tagSuffix}
    </span>
  )
}

export default CourseSectionLink
