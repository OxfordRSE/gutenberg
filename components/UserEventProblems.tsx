import React, { useMemo } from "react"
import { Course, Material, Section, Theme, eventItemSplit } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import { Table } from "flowbite-react"
import { Tab, Tooltip } from "@mui/material"

type Props = {
  userProblems: Problem[]
  event: EventFull
  material: Material
}

const UserEventProblems: React.FC<Props> = ({ userProblems, event, material }) => {
  const memoizedData = useMemo(() => {
    const problems: { [key: string]: string[] } = {}
    const sections: Section[] = []
    const eventGroupLength: { [key: string]: number } = {}
    let eventGroupsWithProblems = 0
    let sum = 0

    const eventGroups = event.EventGroup.sort((a, b) => a.id - b.id)
    eventGroups
      .filter((eventGroup) => eventGroup.EventItem.length > 0)
      .forEach((eventGroup) => {
        eventGroupsWithProblems++
        let currentTotal = 0
        eventGroup.EventItem.forEach((eventItem) => {
          const { section } = eventItemSplit(eventItem, material)
          if (section) {
            currentTotal += section.problems.length
            sections.push(section)
            problems[section.id] = section?.problems
          }
        })
        eventGroupLength[eventGroup.id] = currentTotal
        sum += currentTotal
      })

    return { problems, sections, eventGroupLength, sum, eventGroupsWithProblems, eventGroups }
  }, [event, material])

  const { problems, sections, eventGroupLength, sum, eventGroupsWithProblems, eventGroups } = memoizedData

  return (
    <Table className="">
      <Table.Head>
        {eventGroups
          .filter((eventGroup) => eventGroup.EventItem.length > 0)
          .map((eventGroup, index) => (
            <Table.HeadCell
              className={index === eventGroupsWithProblems - 1 ? "" : "border-r"}
              colSpan={eventGroupLength[eventGroup.id]}
              style={{ width: `${(eventGroupLength[eventGroup.id] / sum) * 100}%` }}
              key={`${event.id}: ${eventGroup.id}`}
              align="center"
            >
              {" "}
              <a href={`/event/${event.id}/${eventGroup.id}`}>{eventGroup.name}</a>
            </Table.HeadCell>
          ))}
      </Table.Head>
      <Table.Body className="divide-y">
        <Table.Row>
          <>
            {eventGroups.flatMap((eventGroup) =>
              eventGroup.EventItem.flatMap((eventItem) => {
                const { section, url } = eventItemSplit(eventItem, material)
                if (section) {
                  return problems[section.id].map((problem) => {
                    const matchingUserProblem = userProblems.find(
                      (userProblem) =>
                        userProblem.tag === problem &&
                        userProblem.section.includes(section.id) &&
                        userProblem.section.includes(section.theme)
                    )
                    if (matchingUserProblem && matchingUserProblem.complete) {
                      const problemStr = `${problem} - difficulty: ${matchingUserProblem?.difficulty} notes: ${matchingUserProblem?.notes}`
                      return (
                        <Table.Cell
                          className="py-0"
                          key={`complete: ${event.id}-${eventGroup.id}-${section.id}-${problem}`}
                          align="center"
                        >
                          <a href={`${url}#${problem}`}>
                            <Tooltip title={problemStr} placement="top">
                              <span className="p-0">✅</span>
                            </Tooltip>
                          </a>
                        </Table.Cell>
                      )
                    } else {
                      return (
                        <Table.Cell
                          className="py-0"
                          key={`incomplete: ${event.id}-${eventGroup.id}-${section.id}-${problem}`}
                          align="center"
                        >
                          <a href={`${url}#${problem}`}>
                            <Tooltip title={problem} placement="top">
                              <span className="w-20 h-20">❌</span>
                            </Tooltip>
                          </a>
                        </Table.Cell>
                      )
                    }
                  })
                }
                return null
              })
            )}
          </>
        </Table.Row>
      </Table.Body>
    </Table>
  )
}

export default UserEventProblems
