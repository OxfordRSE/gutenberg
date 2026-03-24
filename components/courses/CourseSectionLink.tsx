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
  const tagLabels = showTags && section?.tags?.length ? section.tags.map((tag) => formatTagLabel(String(tag))) : []
  const content = (
    <span className="inline-flex flex-wrap items-center gap-1">
      <span>{label}</span>
      {tagLabels.length > 0 && (
        <span className="flex flex-wrap gap-1" data-cy="course-section-link-tags">
          {tagLabels.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-300/80 bg-white/70 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-700 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200"
            >
              {tag}
            </span>
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
