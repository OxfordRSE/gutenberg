import { Prisma } from "@prisma/client"

export type CourseBlueprint = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
  }
}>

export function buildEventCreateDataFromCourse(
  course: CourseBlueprint,
  startAt: Date = new Date()
): Prisma.EventCreateInput {
  const eventStart = startAt
  const eventEnd = startAt

  const groupedEventGroups = [...course.CourseGroup]
    .sort((a, b) => a.order - b.order)
    .map((group) => ({
      name: group.name,
      summary: group.summary,
      content: "",
      location: "",
      start: eventStart,
      end: eventEnd,
      EventItem: {
        create: [...group.CourseItem]
          .sort((a, b) => a.order - b.order)
          .map((item, index) => ({
            order: index + 1,
            section: item.section,
          })),
      },
    }))

  const ungroupedItems = [...course.CourseItem]
    .filter((item) => item.groupId === null)
    .sort((a, b) => a.order - b.order)

  if (ungroupedItems.length > 0) {
    groupedEventGroups.push({
      name: "Additional material",
      summary: "Ungrouped material copied from the course blueprint.",
      content: "",
      location: "",
      start: eventStart,
      end: eventEnd,
      EventItem: {
        create: ungroupedItems.map((item, index) => ({
          order: index + 1,
          section: item.section,
        })),
      },
    })
  }

  return {
    name: course.name,
    summary: course.summary,
    start: eventStart,
    end: eventEnd,
    EventGroup: {
      create: groupedEventGroups,
    },
  }
}
