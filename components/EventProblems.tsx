import React from "react"
import { Course, Material, Section, Theme, eventItemSplit } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import { Avatar, Table } from "flowbite-react"
import { useProblems } from "lib/hooks/useProblems"
import useUsersOnEvent from "lib/hooks/useUsersOnEvent"
import Tooltip from "@mui/material/Tooltip"

type Props = {
  event: EventFull
  material: Material
}

// a table of eventItems vs users showing which users have completed which problems
const EventProblems: React.FC<Props> = ({ material, event }) => {
  const { users, error: usersError } = useUsersOnEvent(event.id)
  const { problems, error: problemsError } = useProblems(event.id)

  if (usersError || problemsError) return <div>failed to load</div>
  if (!users || !problems) return <div>loading...</div>
  const students = users.filter((user) => user.status === "STUDENT" && user.eventId === event.id)

  const userProblems: { [key: string]: Problem[] } = {}
  users.forEach((user) => {
    const filteredProblems = problems.filter((problem) => problem.userEmail === user.userEmail)
    if (filteredProblems) {
      userProblems[user.userEmail] = filteredProblems
    }
  })

  return (
    <Table className="border dark:border-gray-700">
      <Table.Head>
        <Table.HeadCell>Problem</Table.HeadCell>
        {students?.map((user) => (
          <Table.HeadCell key={user.userEmail} align="center" className="p-0">
            <Tooltip title={`${user?.user?.name} <${user?.userEmail}>`}>
              <div>
                <Avatar img={user?.user?.image || undefined} rounded={true} size="xs" />
              </div>
            </Tooltip>
          </Table.HeadCell>
        ))}
      </Table.Head>
      <Table.Body className="divide-y">
        {event.EventGroup.filter((eventGroup) => eventGroup.EventItem.length > 0).map((eventGroup) => (
          <React.Fragment key={eventGroup.id}>
            <Table.Row className="" key={eventGroup.id}>
              <Table.Cell className="">{eventGroup.name}</Table.Cell>
            </Table.Row>
            {eventGroup.EventItem.map((eventItem) => {
              const { theme, course, section, url } = eventItemSplit(eventItem, material)
              return (
                <React.Fragment key={eventItem.id}>
                  {section &&
                    section.problems.map((problem) => (
                      <React.Fragment key={problem}>
                        <Table.Row
                          className="bg-white dark:border-gray-700 dark:bg-gray-800"
                          key={`${eventGroup.id}-${eventGroup.id}-${problem}`}
                        >
                          <Table.Cell
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-white p-1 m-0"
                            key={`title-${problem}-${eventItem.section}`}
                          >
                            {url ? <a href={`${url}#${problem}`}>{problem}</a> : <span>{problem}</span>}
                          </Table.Cell>
                          {students?.map((user, i) => {
                            const problemStruct = userProblems[user.userEmail].find(
                              (p) => p.tag === problem && p.section === eventItem.section
                            )
                            const problemStr = `difficulty: ${problemStruct?.difficulty} notes: ${problemStruct?.notes}`
                            return (
                              <Table.Cell
                                key={`${user.userEmail}-${problem}-${eventItem.section}-${problem}`}
                                align="center"
                                className="whitespace-nowrap font-medium text-gray-900 dark:text-white p-0"
                              >
                                {problemStruct && problemStruct.complete ? (
                                  <Tooltip title={problemStr} placement="top">
                                    <span>✅</span>
                                  </Tooltip>
                                ) : (
                                  <span>❌</span>
                                )}
                              </Table.Cell>
                            )
                          })}
                        </Table.Row>
                      </React.Fragment>
                    ))}
                </React.Fragment>
              )
            })}
          </React.Fragment>
        ))}
      </Table.Body>
    </Table>
  )
}

export default EventProblems
