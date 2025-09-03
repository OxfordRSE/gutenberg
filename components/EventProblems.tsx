import React, { useState } from "react"
import { Course, Material, Section, Theme, eventItemSplit } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import { Table } from "flowbite-react"
import Avatar from "@mui/material/Avatar"
import { useProblems } from "lib/hooks/useProblems"
import useUsersOnEvent from "lib/hooks/useUsersOnEvent"
import Tooltip from "@mui/material/Tooltip"
import { ProblemForm } from "lib/types"
import ProblemViewModal from "components/dialogs/ProblemViewModal"

type Props = {
  event: EventFull
  material: Material
}

// a table of eventItems vs users showing which users have completed which problems
const EventProblems: React.FC<Props> = ({ material, event }) => {
  const { users, error: usersError } = useUsersOnEvent(event.id)
  const { problems, error: problemsError } = useProblems(event.id)
  const [selectedTitle, setSelectedTitle] = useState<string>("")
  const [selectedProblem, setSelectedProblem] = useState<ProblemForm | null>(null)
  const [open, setOpen] = useState(false)

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

  const openModalFor = (opts: {
    userEmail: string
    userName?: string | null
    sectionId: string
    problemTag: string
  }) => {
    const { userEmail, userName, sectionId, problemTag } = opts
    const existing = userProblems[userEmail]?.find((p) => p.tag === problemTag && p.section === sectionId)

    const payload = existing
      ? {
          tag: existing.tag,
          section: existing.section,
          complete: existing.complete,
          solution: existing.solution ?? "",
          difficulty: typeof existing.difficulty === "number" ? existing.difficulty : 5,
          notes: existing.notes ?? "",
        }
      : {
          tag: problemTag,
          section: sectionId,
          complete: false,
          solution: "",
          difficulty: 5,
          notes: "",
        }

    setSelectedProblem(payload)
    setSelectedTitle(`${userName ?? userEmail} • ${problemTag}`)
    setOpen(true)
  }

  return (
    <>
      <Table className="border dark:border-gray-700">
        <Table.Head>
          <Table.HeadCell>Problem</Table.HeadCell>
          {students.map((user) => (
            <Table.HeadCell key={user.userEmail} align="center" className="p-0">
              <Tooltip title={`${user?.user?.name} <${user?.userEmail}>`}>
                <div>
                  <Avatar src={user?.user?.image || undefined} />
                </div>
              </Tooltip>
            </Table.HeadCell>
          ))}
        </Table.Head>

        <Table.Body className="divide-y">
          {event.EventGroup.filter((g) => g.EventItem.length > 0).map((group) => (
            <React.Fragment key={group.id}>
              <Table.Row>
                <Table.Cell colSpan={1 + students.length} className="font-semibold">
                  {group.name}
                </Table.Cell>
              </Table.Row>

              {group.EventItem.map((item) => {
                const { section, url } = eventItemSplit(item, material)
                if (!section) return null

                return section.problems.map((problemTag) => {
                  const rowKey = `${item.id}-${problemTag}`

                  return (
                    <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={rowKey}>
                      {/* Problem title cell */}
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white p-1 m-0">
                        {url ? <a href={`${url}#${problemTag}`}>{problemTag}</a> : <span>{problemTag}</span>}
                      </Table.Cell>

                      {/* Status cells per student */}
                      {students.map((user) => {
                        const p = userProblems[user.userEmail]?.find(
                          (pp) => pp.tag === problemTag && pp.section === item.section
                        )
                        const tooltipText = p ? `difficulty: ${p.difficulty}  notes: ${p.notes}` : "No submission yet"

                        return (
                          <Table.Cell
                            key={`${user.userEmail}-${rowKey}`}
                            align="center"
                            className="whitespace-nowrap font-medium text-gray-900 dark:text-white p-0"
                          >
                            <Tooltip title={tooltipText} placement="top">
                              <button
                                type="button"
                                className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                                onClick={() =>
                                  openModalFor({
                                    userEmail: user.userEmail,
                                    userName: user.user?.name,
                                    sectionId: item.section,
                                    problemTag,
                                  })
                                }
                                aria-label={`View ${user.user?.name ?? user.userEmail}'s submission for ${problemTag}`}
                              >
                                <span role="img" aria-hidden>
                                  {p && p.complete ? "✅" : "❌"}
                                </span>
                              </button>
                            </Tooltip>
                          </Table.Cell>
                        )
                      })}
                    </Table.Row>
                  )
                })
              })}
            </React.Fragment>
          ))}
        </Table.Body>
      </Table>

      {/* ProblemViewModal */}
      {selectedProblem && (
        <ProblemViewModal
          show={open}
          onClose={() => setOpen(false)}
          values={selectedProblem}
          title={`${selectedTitle}`}
        />
      )}
    </>
  )
}

export default EventProblems
