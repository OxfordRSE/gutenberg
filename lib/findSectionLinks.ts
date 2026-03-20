import { SectionLink } from "components/ui/LinkedSection"
import { Material, MaterialTheme, MaterialCourse, MaterialSection } from "./material"
import { sectionSplit } from "./material"
import { EventFull } from "lib/types"
import type { CourseByExternal } from "pages/api/course/byExternal/[externalId]"

export const findLinks = (
  material: Material,
  theme?: MaterialTheme,
  course?: MaterialCourse,
  section?: MaterialSection,
  activeEvent?: EventFull | undefined,
  activeCourse?: CourseByExternal | undefined
): SectionLink[] => {
  const pageLabel = `${theme?.repo}.${theme?.id}.${course?.id}${section ? `.${section.id}` : ""}`

  const findChildren = (): String[] | undefined => {
    const children: string[] = []
    const pageLabelShort = pageLabel.split(".").slice(1, pageLabel.split(".").length).join(".")
    material.themes.map((th) => {
      if (th.courses != undefined) {
        th.courses.map((c) => {
          if (c.dependsOn.includes(pageLabelShort)) {
            children.push([th.repo, th.id, c.id].join("."))
          }
          if (c.sections != undefined) {
            c.sections.map((sec) => {
              sec.dependsOn.map((dep) => {
                if (dep == pageLabelShort) {
                  children.push([th.repo, th.id, c.id, sec.id].join("."))
                }
              })
            })
          }
        })
      }
    })
    if (children.length == 0) {
      return undefined
    }
    return children
  }
  // check if this section is part of the active event
  let sectionLinks: SectionLink[] = []

  const addCourseLinks = () => {
    if (!activeCourse || !theme || !course || !section) return

    const orderedRootItems = [...activeCourse.CourseItem].sort((a, b) => a.order - b.order)
    const orderedGroupItems = [...activeCourse.CourseGroup]
      .sort((a, b) => a.order - b.order)
      .flatMap((group) => [...group.CourseItem].sort((a, b) => a.order - b.order))
    const orderedItems = [...orderedRootItems, ...orderedGroupItems]
    if (orderedItems.length === 0) return

    const currentIndex = orderedItems.findIndex((item) => item.section === pageLabel)
    if (currentIndex === -1) return

    if (currentIndex > 0) {
      const prevItem = orderedItems[currentIndex - 1]
      const { theme: themeLink, course: courseLink, section: sectionLink, url } = sectionSplit(`${prevItem.section}`, material)
      if (url) {
        sectionLinks.push({
          linkedType: "course",
          direction: "prev",
          url,
          section: sectionLink?.name,
          course: courseLink?.name,
          theme: themeLink?.name,
          tags: sectionLink?.tags,
        } as SectionLink)
      }
    }

    if (currentIndex < orderedItems.length - 1) {
      const nextItem = orderedItems[currentIndex + 1]
      const { theme: themeLink, course: courseLink, section: sectionLink, url } = sectionSplit(`${nextItem.section}`, material)
      if (url) {
        sectionLinks.push({
          linkedType: "course",
          direction: "next",
          url,
          section: sectionLink?.name,
          course: courseLink?.name,
          theme: themeLink?.name,
          tags: sectionLink?.tags,
        } as SectionLink)
      }
      return
    }

    sectionLinks.push({
      linkedType: "course",
      direction: "next",
      url: `/courses/${activeCourse.id}`,
      section: "Return to course",
      course: activeCourse.name,
    } as SectionLink)
  }

  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      let orderedEvents = [...group.EventItem]
      orderedEvents.sort((a, b) => a.order - b.order)
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = orderedEvents[i]
        if (item.section == pageLabel) {
          if (i > 0) {
            const prevItem = orderedEvents[i - 1]
            const {
              theme: themeLink,
              course: courseLink,
              section: sectionLink,
              url,
            } = sectionSplit(`${prevItem.section}`, material)
            sectionLinks.push({
              linkedType: "event",
              direction: "prev",
              url: url,
              section: sectionLink?.name,
              course: courseLink?.name,
              theme: themeLink?.name,
              tags: sectionLink?.tags,
            } as SectionLink)
          }
          if (i < group.EventItem.length - 1) {
            const nextItem = orderedEvents[i + 1]
            const {
              theme: themeLink,
              course: courseLink,
              section: sectionLink,
              url,
            } = sectionSplit(`${nextItem.section}`, material)
            sectionLinks.push({
              linkedType: "event",
              direction: "next",
              url: url,
              section: sectionLink?.name,
              course: courseLink?.name,
              theme: themeLink?.name,
              tags: sectionLink?.tags,
            } as SectionLink)
          }
        }
      }
    }
  }
  addCourseLinks()
  // We also can generate links for all dependents
  section?.dependsOn.map((dep) => {
    const {
      theme: themeLink,
      course: courseLink,
      section: sectionLink,
      url,
    } = sectionSplit(`${theme?.repo}.${dep}`, material)
    sectionLinks.push({
      linkedType: courseLink?.id == course?.id ? "internal" : "external",
      direction: "prev",
      url: url,
      section: sectionLink?.name,
      course: courseLink?.name,
      theme: themeLink?.name,
      tags: sectionLink?.tags,
    } as SectionLink)
  })
  if (section) {
    const parents = findChildren()
    if (parents) {
      for (const parent of parents) {
        const { theme: themeLink, course: courseLink, section: sectionLink, url } = sectionSplit(parent, material)

        sectionLinks.push({
          // if the section shares the same course we set linkedType to internal, else external
          linkedType: courseLink?.id == course?.id ? "internal" : "external",
          direction: "next",
          url: url,
          section: sectionLink?.name,
          course: courseLink?.name,
          theme: themeLink?.name,
          tags: sectionLink?.tags,
        } as SectionLink)
      }
    }
  }
  return sectionLinks
}
