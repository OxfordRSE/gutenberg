import React from "react"
import { EventItem } from "@prisma/client"
import CourseSectionLink from "components/courses/CourseSectionLink"
import { Material, sectionSplit } from "lib/material"
import { Problem } from "lib/types"

type EventItemProps = {
  material: Material
  item: EventItem
  problems?: Problem[]
}

const indentByDepth: Record<number, string> = {
  2: "ml-2",
  3: "ml-4",
  4: "ml-6",
}

const depthByLength: Record<number, "theme" | "course" | "section"> = {
  2: "theme",
  3: "course",
  4: "section",
}

const EventItemView: React.FC<EventItemProps> = ({ material, item, problems }) => {
  const split = item.section.split(".")
  const indentClass = indentByDepth[split.length] ?? "ml-0"
  const depth = depthByLength[split.length] ?? "section"
  const { section } = sectionSplit(item.section, material)
  const itemProblems = section?.problems ?? []

  let isCompleted = false
  let completedLabel = ""
  const uniqueUsers = new Set()
  let uniqueUsersCount = 0
  if (problems !== undefined && itemProblems.length > 0) {
    problems.forEach((problem) => {
      uniqueUsers.add(problem.userEmail)
    })
    const completedProblems = problems.filter(
      (p) => p.section === item.section && itemProblems.includes(p.tag) && p.complete
    )
    uniqueUsersCount = Math.max(1, uniqueUsers.size)
    completedLabel = `[${completedProblems.length}/${itemProblems.length * uniqueUsersCount}]`
    isCompleted = completedProblems.length === itemProblems.length * uniqueUsersCount
  }

  return (
    <li className={`${isCompleted ? "text-green-500" : "text-inherit"} ${indentClass}`}>
      {completedLabel && <span className="mr-1">{completedLabel}</span>}
      <CourseSectionLink material={material} sectionRef={item.section} depth={depth} />
    </li>
  )
}

export default EventItemView
