import React, { useState, useEffect, useMemo } from "react"
import { Material, sectionSplit } from "lib/material"
import { EventFull } from "lib/types"
import { Avatar } from "flowbite-react"
import Link from "next/link"
import useCommentThreads from "lib/hooks/useCommentThreads"
import { useTheme } from "next-themes"
import useUsersList from "lib/hooks/useUsersList"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material"
import LinkIcon from "@mui/icons-material/Link"
import Stack from "./ui/Stack"
import Thread from "./content/Thread"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { CommentThread } from "pages/api/commentThread/[commentThreadId]"

const noSectionKey = "No Section found (material changed?)"

// group threads by section
const groupThreadsBySection = (threads: CommentThread[], material: Material) => {
  const grouped: { [key: string]: CommentThread[] } = {}
  threads.forEach((thread: CommentThread) => {
    const { section } = sectionSplit(thread.section, material)
    if (section && "name" in section) {
      if (!grouped[section.name]) {
        grouped[section.name] = []
      }
      grouped[section.name].push(thread)
    } else {
      if (!grouped[noSectionKey]) {
        grouped[noSectionKey] = []
      }
      grouped[noSectionKey].push(thread)
    }
  })
  return grouped
}

type Props = {
  event: EventFull
  material: Material
}

const EventCommentThreads: React.FC<Props> = ({ material, event }) => {
  const [activeThreadId, setActiveThreadId] = useState<number | undefined>(undefined)
  const { commentThreads, error: threadsError, isLoading: threadsIsLoading } = useCommentThreads(event.id)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const { theme: currentTheme } = useTheme()

  // Memoize the emails array to prevent unnecessary re-renders
  const emails = useMemo(() => {
    return commentThreads?.map((thread) => thread.createdByEmail) || []
  }, [commentThreads])

  const { users, error: usersError } = useUsersList(emails)

  useEffect(() => {
    if (commentThreads) {
      const unresolvedSectionNames = Object.keys(groupedUnresolvedThreads)
      const resolvedSectionNames = Object.keys(groupedResolvedThreads)

      const initialExpandedState: { [key: string]: boolean } = {}

      unresolvedSectionNames.forEach((sectionName) => {
        if (sectionName !== noSectionKey) {
          initialExpandedState[sectionName] = true
        }
      })

      resolvedSectionNames.forEach((sectionName) => {
        initialExpandedState[sectionName] = true
      })

      // ensure noSectionKey is collapsed
      initialExpandedState[noSectionKey] = false

      setExpandedSections(initialExpandedState)
    }
  }, [commentThreads]) // Only run when commentThreads change

  if (threadsIsLoading) return <div>Loading...</div>
  if (!commentThreads) return <div>Failed to load</div>

  const unresolvedThreads = commentThreads.filter((thread) => !thread.resolved)
  const resolvedThreads = commentThreads.filter((thread) => thread.resolved)

  const groupedUnresolvedThreads: { [key: string]: typeof unresolvedThreads } = groupThreadsBySection(
    unresolvedThreads,
    material
  )
  const groupedResolvedThreads: { [key: string]: typeof resolvedThreads } = groupThreadsBySection(
    resolvedThreads,
    material
  )

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prevState) => ({
      ...prevState,
      [sectionName]: !prevState[sectionName],
    }))
  }

  return (
    <div>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Unresolved Comment Threads</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table aria-label="unresolved threads table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body1" fontWeight="bold">
                      Section
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(groupedUnresolvedThreads).map((sectionName) => {
                  const isExpanded = expandedSections[sectionName] || false
                  const firstThread = groupedUnresolvedThreads[sectionName][0]
                  const { url } = sectionSplit(firstThread.section, material)

                  return (
                    <React.Fragment key={sectionName}>
                      <TableRow onClick={() => toggleSection(sectionName)} style={{ cursor: "pointer" }}>
                        <TableCell
                          colSpan={3}
                          sx={{
                            backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#000000" : "#e5e7eb"),
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} {sectionName}
                            <LinkIcon
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click event from firing
                                window.open(url, "_blank") // Open the link in a new tab
                              }}
                              style={{ marginLeft: 8, cursor: "pointer" }} // Adjust styling as needed
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <>
                          <TableRow>
                            <TableCell sx={{ width: "25%" }}>
                              <strong>Created By</strong>
                            </TableCell>
                            <TableCell sx={{ width: "75%" }}>
                              <strong>Comment</strong>
                            </TableCell>
                            <TableCell sx={{ width: "10%" }}>
                              <strong>Expand</strong>
                            </TableCell>
                          </TableRow>
                          {groupedUnresolvedThreads[sectionName].map((thread) => {
                            const urlWithAnchor = url + `#comment-thread-${thread.id}`

                            const commentText =
                              thread.Comment &&
                              thread.Comment.length > 0 &&
                              typeof thread.Comment[0].markdown === "string"
                                ? thread.Comment[0].markdown
                                : "[Invalid Content]"

                            return (
                              <TableRow key={thread.id}>
                                <TableCell sx={{ width: "25%" }}>
                                  <Stack direction="row" spacing={1}>
                                    <Avatar
                                      className="pr-2"
                                      size="xs"
                                      rounded
                                      img={users[thread.createdByEmail]?.image || undefined}
                                    />
                                    <>{thread.createdByEmail}</>
                                  </Stack>
                                </TableCell>
                                <TableCell sx={{ width: "75%" }}>
                                  <Link href={urlWithAnchor}>
                                    <Typography variant="body1">
                                      <Tooltip title="Go to comment thread">
                                        <span>{commentText}</span>
                                      </Tooltip>
                                    </Typography>
                                  </Link>
                                </TableCell>
                                <TableCell sx={{ width: "25%" }}>
                                  <Thread
                                    key={thread.id}
                                    thread={thread.id}
                                    active={activeThreadId === thread.id}
                                    setActive={(active: boolean) =>
                                      active ? setActiveThreadId(thread.id) : setActiveThreadId(undefined)
                                    }
                                    finaliseThread={() => {}}
                                    onDelete={() => {}}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Resolved Comment Threads</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table aria-label="resolved threads table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body1" fontWeight="bold">
                      Section Name
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(groupedResolvedThreads).map((sectionName) => {
                  const isExpanded = expandedSections[sectionName] || false
                  const firstThread = groupedResolvedThreads[sectionName][0]
                  const { url } = sectionSplit(firstThread.section, material)

                  return (
                    <React.Fragment key={sectionName}>
                      <TableRow onClick={() => toggleSection(sectionName)} style={{ cursor: "pointer" }}>
                        <TableCell
                          colSpan={3}
                          sx={{
                            backgroundColor: (theme) => (theme.palette.mode === "dark" ? "#000000" : "#e5e7eb"),
                          }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />} {sectionName}
                            <LinkIcon
                              onClick={(e) => {
                                e.stopPropagation() // Prevent row click event from firing
                                window.open(url, "_blank") // Open the link in a new tab
                              }}
                              style={{ marginLeft: 8, cursor: "pointer" }} // Adjust styling as needed
                            />
                          </Typography>
                        </TableCell>
                      </TableRow>

                      {isExpanded && (
                        <>
                          <TableRow>
                            <TableCell sx={{ width: "25%" }}>
                              <strong>Created By</strong>
                            </TableCell>
                            <TableCell sx={{ width: "75%" }}>
                              <strong>Comment</strong>
                            </TableCell>
                            <TableCell sx={{ width: "10%" }}>
                              <strong>Expand</strong>
                            </TableCell>
                          </TableRow>
                          {groupedResolvedThreads[sectionName].map((thread) => {
                            const urlWithAnchor = url + `#comment-thread-${thread.id}`

                            const commentText =
                              thread.Comment &&
                              thread.Comment.length > 0 &&
                              typeof thread.Comment[0].markdown === "string"
                                ? thread.Comment[0].markdown
                                : "[Invalid Content]"

                            return (
                              <TableRow key={thread.id}>
                                <TableCell sx={{ width: "25%" }}>
                                  <Stack direction="row" spacing={1}>
                                    <Avatar
                                      className="pr-2"
                                      size="xs"
                                      rounded
                                      img={users[thread.createdByEmail]?.image || undefined}
                                    />
                                    <>{thread.createdByEmail}</>
                                  </Stack>
                                </TableCell>
                                <TableCell sx={{ width: "75%" }}>
                                  <Link href={urlWithAnchor}>
                                    <Typography variant="body1">
                                      <Tooltip title={`Go to comment thread: ${thread.textRef}`}>
                                        <span>{commentText}</span>
                                      </Tooltip>
                                    </Typography>
                                  </Link>
                                </TableCell>
                                <TableCell sx={{ width: "10%" }}>
                                  <Thread
                                    key={thread.id}
                                    thread={thread.id}
                                    active={activeThreadId === thread.id}
                                    setActive={(active: boolean) =>
                                      active ? setActiveThreadId(thread.id) : setActiveThreadId(undefined)
                                    }
                                    finaliseThread={() => {}}
                                    onDelete={() => {}}
                                  />
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </>
                      )}
                    </React.Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

export default EventCommentThreads
