import React from "react"
import { Material } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import { basePath } from "lib/basePath"
import { EventItem } from "@prisma/client"
import { useSession } from "next-auth/react"

type EventItemProps = {
  material: Material
  item: EventItem
  problems?: Problem[]
}

const EventItemView: React.FC<EventItemProps> = ({ material, item, problems }) => {
  const split = item.section.split(".")
  let url = ""
  let name = `Error: ${item.section}`
  let key = item.id
  let indent = 0
  let itemProblems: string[] = []
  if (split.length === 4) {
    const [repo, theme, course, section] = split
    const themeData = material.themes.find((t) => t.id === theme)
    const courseData = themeData?.courses.find((c) => c.id === course)
    const sectionData = courseData?.sections.find((s) => s.id === section)
    url = `${basePath}/material/${repo}/${theme}/${course}/${section}`
    name = sectionData?.name || `Error: ${item.section}`
    indent = 6
    itemProblems = sectionData?.problems || []
  } else if (split.length === 3) {
    const [repo, theme, course] = split
    const themeData = material.themes.find((t) => t.id === theme)
    const courseData = themeData?.courses.find((c) => c.id === course)
    url = `${basePath}/material/${repo}/${theme}/${course}`
    name = courseData?.name || `Error: ${item.section}`
    indent = 4
  } else if (split.length === 2) {
    const [repo, theme] = split
    const themeData = material.themes.find((t) => t.id === theme)
    url = `${basePath}/material/${repo}/${theme}`
    name = themeData?.name || `Error: ${item.section}`
    indent = 2
  }
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
    uniqueUsersCount = Math.max(1, uniqueUsers.size) // to deal with =0
    // instructors see total completed by all students / total problems available to all students
    completedLabel = `[${completedProblems.length}/${itemProblems.length * uniqueUsersCount}]`
    isCompleted = completedProblems.length === itemProblems.length * uniqueUsersCount
  }

  return (
    <li key={key} className={`${isCompleted ? "text-green-500" : "text-inherit"} ml-${indent}`}>
      {completedLabel}{" "}
      <a href={url} className={`hover:underline`}>
        {name}
      </a>
    </li>
  )
}

export default EventItemView
