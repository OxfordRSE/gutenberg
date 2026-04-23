import React, { useEffect, useMemo, useState } from "react"
import router from "next/router"
import { Material } from "lib/material"
import { Event } from "lib/types"
import { Button, Timeline } from "flowbite-react"
import EventActions from "./EventActions"
import Link from "next/link"
import useEvents from "lib/hooks/useEvents"
import useProfile from "lib/hooks/useProfile"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { postEvent } from "lib/actions/postEvent"
import { MdContentCopy, MdDelete } from "react-icons/md"
import { useAtom } from "jotai"
import { deleteEventModalState, deleteEventIdState } from "components/dialogs/DeleteEventModal"
import { duplicateEventModalState, duplicateEventIdState } from "components/dialogs/DuplicateEventModal"
import { Tooltip } from "@mui/material"
import Stack from "components/ui/Stack"
import EventsToolbar from "components/timeline/EventsToolbar"
import CreateEventModal, { EventCreationValues } from "components/event/CreateEventModal"

type EventsProps = {
  material: Material
  events: Event[]
}

const EventsView: React.FC<EventsProps> = ({ material: _material, events }) => {
  // avoid hydration mismatch for date formatting
  const [showDateTime, setShowDateTime] = useState(false)

  // search state (raw & debounced)
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  const [activeEvent] = useActiveEvent()
  const [showDeleteEventModal, setShowDeleteEventModal] = useAtom(deleteEventModalState)
  const [deleteEventId, setDeleteEventId] = useAtom(deleteEventIdState)
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useAtom(duplicateEventModalState)
  const [duplicateEventId, setDuplicateEventId] = useAtom(duplicateEventIdState)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const { events: currentEvents } = useEvents()
  const { userProfile } = useProfile()
  const isAdmin = userProfile?.admin

  // Normalize + sort base list
  const baseEvents = useMemo(() => {
    const source = currentEvents ?? events
    const normalized = source.map((e) => ({
      ...e,
      start: new Date(e.start as any),
      end: new Date(e.end as any),
    }))
    normalized.sort((a, b) => (a.start > b.start ? -1 : a.start < b.start ? 1 : 0))
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

  // Hydration guard for date formatting, prevent dom mismatch
  useEffect(() => {
    setShowDateTime(true)
  }, [])

  const getFormattedDate = (date: Date) =>
    showDateTime ? date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : date.toUTCString()

  const createAndOpenEvent = async (payload?: { sourceCourseId?: number; startAt?: string }) => {
    try {
      setIsCreatingEvent(true)
      const event = await postEvent(payload)
      setShowCreateEventModal(false)
      router.push(`/event/${event.id}#edit`)
    } catch (err) {
      console.error("Failed to create event:", err)
    } finally {
      setIsCreatingEvent(false)
    }
  }

  const openDeleteEventModal = (eventId: number) => {
    setShowDeleteEventModal(true)
    setDeleteEventId(eventId)
  }

  const openDuplicateEventModal = (eventId: number) => {
    setShowDuplicateEventModal(true)
    setDuplicateEventId(eventId)
  }

  const handleCreateEvent = async ({ mode, startAt, courseId }: EventCreationValues) => {
    await createAndOpenEvent(mode === "course" ? { sourceCourseId: courseId, startAt } : { startAt })
  }

  return (
    <>
      <EventsToolbar query={query} onQueryChange={setQuery} onDebouncedQueryChange={setDebouncedQuery} />
      <CreateEventModal
        show={showCreateEventModal}
        isSubmitting={isCreatingEvent}
        onClose={() => setShowCreateEventModal(false)}
        onCreate={handleCreateEvent}
      />
      <Timeline>
        {/* Empty state when filter finds nothing */}
        {filteredEvents.length === 0 && (
          <div className="px-1 py-2 text-sm text-gray-500 dark:text-gray-400">No events match your filter</div>
        )}

        {/* Render the filtered list */}
        {filteredEvents.map((event) => (
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

              <Timeline.Title>
                <Link href={`/event/${event.id}`} className="hover:underline">
                  {event.name}
                </Link>
              </Timeline.Title>
              <Timeline.Body>{event.summary}</Timeline.Body>

              <EventActions event={event} />
            </Timeline.Content>
          </Timeline.Item>
        ))}

        {isAdmin && (
          <Timeline.Item>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <Button size="sm" data-cy="create-event-button" onClick={() => setShowCreateEventModal(true)}>
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
