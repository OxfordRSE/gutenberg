import { SectionLink, LinkedSection } from "components/ui/LinkedSection"
import { getExcludes } from "lib/material"
import { Material, Theme, Course, Section } from "./material"
import { sectionSplit } from "./material"
import { EventFull } from "lib/types"

export const findLinks = (
  material: Material,
  theme?: Theme,
  course?: Course,
  section?: Section,
  activeEvent?: EventFull | undefined
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
  let isInEvent = false
  let sectionLinks: SectionLink[] = []

  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      let orderedEvents = [...group.EventItem]
      orderedEvents.sort((a, b) => a.order - b.order)
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = orderedEvents[i]
        if (item.section == pageLabel) {
          isInEvent = true
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
