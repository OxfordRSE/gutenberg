import React, { useEffect, useMemo, useState, useRef } from "react"
import { Material } from "lib/material"
import { Event } from "lib/types"
import { Button, Timeline } from "flowbite-react"
import { BiArrowToBottom, BiArrowToTop } from "react-icons/bi"
import EventActions from "./EventActions"
import Link from "next/link"
import useEvents from "lib/hooks/useEvents"
import useProfile from "lib/hooks/useProfile"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { postEvent } from "lib/actions/postEvent"
import { MdContentCopy, MdDelete } from "react-icons/md"
import { useAtom } from "jotai"
import { deleteEventModalState, deleteEventIdState } from "components/dialogs/deleteEventModal"
import { duplicateEventModalState, duplicateEventIdState } from "components/dialogs/DuplicateEventModal"
import { Tooltip } from "@mui/material"
import Stack from "components/ui/Stack"
import EventsToolbar from "components/timeline/EventsToolbar"

type EventsProps = {
  material: Material
  events: Event[]
}

const EventsView: React.FC<EventsProps> = ({ material, events }) => {
  // avoid hydration mismatch for date formatting
  const [showDateTime, setShowDateTime] = useState(false)

  // search state (raw & debounced)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  const [oldEvents, setOldEvents] = useState(0)
  const [newEvents, setNewEvents] = useState(0)
  const [activeEvent] = useActiveEvent()
  const [showDeleteEventModal, setShowDeleteEventModal] = useAtom(deleteEventModalState)
  const [deleteEventId, setDeleteEventId] = useAtom(deleteEventIdState)
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useAtom(duplicateEventModalState)
  const [duplicateEventId, setDuplicateEventId] = useAtom(duplicateEventIdState)
  const { events: currentEvents, mutate } = useEvents()
  const { userProfile } = useProfile()

  const initializedRef = useRef(false)

  const isAdmin = userProfile?.admin
  const baseEvents = useMemo(() => {
    const source = currentEvents ?? events
    const normalized = source.map((e) => ({
      ...e,
      start: new Date(e.start as any),
      end: new Date(e.end as any),
    }))
    normalized.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0))
    return normalized
  }, [currentEvents, events])

  // Filter against debounced query
  const filteredEvents = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    if (!q) return baseEvents
    return baseEvents.filter((e) => {
      if (e.id === activeEvent?.id) return true
      const name = e.name?.toLowerCase() ?? ""
      const summary = e.summary?.toLowerCase() ?? ""
      const idStr = String(e.id ?? "")
      return name.includes(q) || summary.includes(q) || idStr.includes(q)
    })
  }, [baseEvents, debouncedQuery, activeEvent?.id])

  // Recompute counts from *filtered* with 2-month cutoff
  useEffect(() => {
    setShowDateTime(true)
    const cutOffDate = new Date()
    cutOffDate.setMonth(cutOffDate.getMonth() - 2)

    const olderCount = filteredEvents.filter((e) => e.start < cutOffDate).length
    const newerCount = filteredEvents.length - olderCount

    setNewEvents(newerCount)

    if (!initializedRef.current) {
      // On first run, hide all older by default (original behavior)
      setOldEvents(olderCount)
      initializedRef.current = true
    } else {
      // On subsequent runs (e.g., query changes), clamp within bounds
      setOldEvents((prev) => Math.min(prev, olderCount))
    }
  }, [filteredEvents])

  // Recompute counts based on *filtered* list with a 2-month cutoff
  useEffect(() => {
    setShowDateTime(true)
    const cutOffDate = new Date()
    cutOffDate.setMonth(cutOffDate.getMonth() - 2)

    const olderCount = filteredEvents.filter((e) => e.start < cutOffDate).length
    const newerCount = filteredEvents.length - olderCount

    setNewEvents(newerCount)
    setOldEvents((prev) => Math.min(prev, olderCount)) // keep within bounds after filter changes
  }, [filteredEvents])

  const getFormattedDate = (date: Date) =>
    showDateTime ? date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : date.toUTCString()

  const handleCreateEvent = () => {
    postEvent().then((event) => mutate([...(currentEvents || []), event]))
  }

  const openDeleteEventModal = (eventId: number) => {
    setShowDeleteEventModal(true)
    setDeleteEventId(eventId)
  }

  const openDuplicateEventModal = (eventId: number) => {
    setShowDuplicateEventModal(true)
    setDuplicateEventId(eventId)
  }

  const loadMoreEvents = () => {
    setOldEvents(Math.max(oldEvents - 3, 0))
  }

  const hideMoreEvents = () => {
    setOldEvents(Math.min(oldEvents + 3, events.length - newEvents))
  }

  return (
    <>
      <EventsToolbar
        oldEvents={oldEvents}
        newEvents={newEvents}
        filteredLength={filteredEvents.length}
        query={query}
        onQueryChange={setQuery}
        onDebouncedQueryChange={setDebouncedQuery}
        onLoadMore={loadMoreEvents}
        onHideMore={hideMoreEvents}
      />
      <Timeline>
        {/* Empty state when filter finds nothing */}
        {filteredEvents.length === 0 && (
          <div className="px-1 py-2 text-sm text-gray-500 dark:text-gray-400">No events match your filter</div>
        )}

        {/* Render the filtered list */}
        {filteredEvents.map((event, idx) => {
          if (idx - oldEvents >= 0 || event.id === activeEvent?.id) {
            return (
              <Timeline.Item key={event.id}>
                <Timeline.Point />
                <Timeline.Content>
                  <div className="flex justify-between">
                    <Link href={`/event/${event.id}`} className="text-gray-600 dark:text-gray-200">
                      <Timeline.Time dateTime={event.start.toISOString()}>
                        {getFormattedDate(event.start as unknown as Date)}
                      </Timeline.Time>
                    </Link>

                    {isAdmin && (
                      <Stack direction="row">
                        <Tooltip id={`duplicate-event-${event.id}`} title={`Duplicate Event: ${event.id}`}>
                          <MdContentCopy
                            role="button"
                            tabIndex={0}
                            aria-labelledby={`duplicate-event-${event.id}`}
                            className="ml-2 flex cursor-pointer"
                            data-cy={`duplicate-event-${event.id}`}
                            size={18}
                            onClick={() => openDuplicateEventModal(event.id)}
                          />
                        </Tooltip>
                        <Tooltip id={`delete-event-${event.id}`} title={`Delete Event: ${event.id}`}>
                          <MdDelete
                            role="button"
                            tabIndex={0}
                            aria-labelledby={`delete-event-${event.id}`}
                            className="ml-2 text-red-500 flex cursor-pointer"
                            data-cy={`delete-event-${event.id}`}
                            size={18}
                            onClick={() => openDeleteEventModal(event.id)}
                          />
                        </Tooltip>
                      </Stack>
                    )}
                  </div>

                  <Link href={`/event/${event.id}`}>
                    <Timeline.Title>{event.name}</Timeline.Title>
                    <Timeline.Body>{event.summary}</Timeline.Body>
                  </Link>

                  <EventActions event={event} />
                </Timeline.Content>
              </Timeline.Item>
            )
          }
          return null
        })}

        {isAdmin && (
          <Timeline.Item>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <Button size="sm" onClick={handleCreateEvent}>
                  Create new Event
                </Button>
              </Timeline.Title>
            </Timeline.Content>
          </Timeline.Item>
        )}
      </Timeline>
    </>
  )
}

export default EventsView
