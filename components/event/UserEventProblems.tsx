import React, { useMemo, useState } from "react"
import { Material, eventItemSplit } from "lib/material"
import { EventFull, Problem } from "lib/types"
import { Table } from "flowbite-react"
import { Tooltip } from "@mui/material"
import { ProblemForm } from "lib/types"
import ProblemViewModal from "components/dialogs/ProblemViewModal"
import useWindowSize from "lib/hooks/useWindowSize"

// some fixed formatting to make Cells less all over the place
const CELL = "problem-cell p-0 text-center align-middle"
const HIT = "inline-flex items-center justify-center w-6 h-6 leading-none"
const BTN = "p-0 m-0 bg-transparent border-0 outline-none hover:bg-gray-100 dark:hover:bg-gray-700 rounded"

type Props = {
  userProblems: Problem[]
  event: EventFull
  material: Material
}

const UserEventProblems: React.FC<Props> = ({ userProblems, event, material }) => {
  // Modal state (unchanged)
  const [open, setOpen] = useState(false)
  const [selectedTitle, setSelectedTitle] = useState<string>("")
  const [selectedProblem, setSelectedProblem] = useState<ProblemForm | null>(null)
  const [selectedUrl, setSelectedUrl] = useState<string>("")

  const { width } = useWindowSize()

  const colsForWidth = (w?: number, minCellPx = 56, gutterPx = 8) => {
    if (!w) return 12
    const usable = Math.max(0, w - 48)
    const perCol = minCellPx + gutterPx
    return Math.max(6, Math.floor(usable / perCol))
  }

  const MAX_COLS_PER_ROW = colsForWidth(width)

  const sectionsFlat = useMemo(() => {
    const out: Array<{
      eventGroupId: number
      eventGroupName: string
      sectionId: string
      theme: string
      url: string
      problems: string[]
    }> = []

    const sortedGroups = [...event.EventGroup].sort((a, b) => a.id - b.id)
    sortedGroups.forEach((group) => {
      if (group.EventItem.length === 0) return
      group.EventItem.forEach((item) => {
        const { section, url } = eventItemSplit(item, material)
        if (!section) return
        out.push({
          eventGroupId: group.id,
          eventGroupName: group.name,
          sectionId: section.id,
          theme: section.theme,
          url: url ?? "",
          problems: section.problems,
        })
      })
    })
    return out
  }, [event, material])

  const chunks = useMemo(() => {
    const rows: Array<{
      sections: typeof sectionsFlat
      groupColspans: Record<number, { name: string; span: number }>
      totalCols: number
    }> = []

    let current: (typeof rows)[number] | null = null

    sectionsFlat.forEach((s) => {
      const sectionCols = s.problems.length
      if (!current || current.totalCols + sectionCols > MAX_COLS_PER_ROW) {
        current = { sections: [], groupColspans: {}, totalCols: 0 }
        rows.push(current)
      }
      current.sections.push(s)
      current.totalCols += sectionCols
      const gc = current.groupColspans[s.eventGroupId] || { name: s.eventGroupName, span: 0 }
      gc.span += sectionCols
      current.groupColspans[s.eventGroupId] = gc
    })
    return rows
  }, [sectionsFlat, MAX_COLS_PER_ROW])

  const openModalFor = (p: Problem, title: string, url: string) => {
    setSelectedProblem({
      tag: p.tag,
      section: p.section,
      complete: p.complete,
      solution: p.solution ?? "",
      difficulty: typeof p.difficulty === "number" ? p.difficulty : 5,
      notes: p.notes ?? "",
    })
    setSelectedTitle(title)
    setSelectedUrl(url)
    setOpen(true)
  }

  const cleanIdString = (id: string) => id.replace(/_/g, " ").replace(/-/g, " ").toLowerCase()

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="text-sm">
          <Table.Body className="divide-y">
            {chunks.map((chunk, idx) => (
              <React.Fragment key={`chunk-${idx}`}>
                <Table.Row>
                  {Object.entries(chunk.groupColspans).map(([groupId, { name, span }], i, arr) => (
                    <Table.Cell
                      key={`hdr-${idx}-${groupId}`}
                      colSpan={span}
                      align="center"
                      className={`${i < arr.length - 1 ? "border-r" : ""} font-semibold`}
                    >
                      <a href={`/event/${event.id}/${groupId}`}>{name}</a>
                    </Table.Cell>
                  ))}
                </Table.Row>

                {/* problems */}
                <Table.Row>
                  {chunk.sections.flatMap((s) =>
                    s.problems.map((problemTag) => {
                      const p = userProblems.find(
                        (up) =>
                          up.tag === problemTag && up.section.includes(s.sectionId) && up.section.includes(s.theme)
                      )
                      const displayTitle = `${cleanIdString(s.sectionId)} - ${cleanIdString(problemTag)}`
                      if (p && p.complete) {
                        const tooltipText = `${problemTag} — difficulty: ${p.difficulty}  notes: ${p.notes || "—"}`
                        return (
                          <Table.Cell className={CELL} align="center" key={`x-${idx}-${s.sectionId}-${problemTag}`}>
                            <Tooltip title={tooltipText} placement="top">
                              <button
                                type="button"
                                className={BTN}
                                onClick={() => openModalFor(p, displayTitle, `${s.url}#${problemTag}`)}
                                aria-label={`View submission for ${problemTag}`}
                              >
                                <span className={HIT} role="img" aria-hidden>
                                  ✅
                                </span>
                              </button>
                            </Tooltip>
                          </Table.Cell>
                        )
                      }

                      return (
                        <Table.Cell className={CELL} align="center" key={`x-${idx}-${s.sectionId}-${problemTag}`}>
                          <Tooltip title={problemTag} placement="top">
                            <a href={`${s.url}#${problemTag}`} className={HIT} aria-label={`Go to ${problemTag}`}>
                              ❌
                            </a>
                          </Tooltip>
                        </Table.Cell>
                      )
                    })
                  )}
                </Table.Row>
              </React.Fragment>
            ))}
          </Table.Body>
        </Table>
      </div>

      {/* ProblemViewModal */}
      {selectedProblem && (
        <ProblemViewModal
          show={open}
          onClose={() => setOpen(false)}
          values={selectedProblem}
          title={`${selectedTitle}`}
          url={selectedUrl}
        />
      )}
    </>
  )
}

export default UserEventProblems
