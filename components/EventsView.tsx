import React, { useEffect, useState } from "react"
import { Material } from "lib/material"
import { EventFull, Event } from "lib/types"
import { Button, Timeline } from "flowbite-react"
import { BiArrowToBottom, BiArrowToTop } from "react-icons/bi"
import EventActions from "./EventActions"
import Link from "next/link"
import useEvents from "lib/hooks/useEvents"
import useProfile from "lib/hooks/useProfile"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { postEvent } from "lib/actions/postEvent"
import { MdContentCopy, MdDelete } from "react-icons/md"
import { useRecoilState } from "recoil"
import { deleteEventModalState, deleteEventIdState } from "components/deleteEventModal"
import { duplicateEventModalState, duplicateEventIdState } from "components/DuplicateEventModal"
import { Tooltip } from "@mui/material"
import Stack from "./ui/Stack"

type EventsProps = {
  material: Material
  events: Event[]
}

const EventsView: React.FC<EventsProps> = ({ material, events }) => {
  // don't show date/time until the page is loaded (due to rehydration issues)
  const [showDateTime, setShowDateTime] = useState(false)
  const [oldEvents, setOldEvents] = useState(0)
  const [newEvents, setNewEvents] = useState(0)
  const [activeEvent] = useActiveEvent()
  const [showDeleteEventModal, setShowDeleteEventModal] = useRecoilState(deleteEventModalState)
  const [deleteEventId, setDeleteEventId] = useRecoilState(deleteEventIdState)
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useRecoilState(duplicateEventModalState)
  const [duplicateEventId, setDuplicateEventId] = useRecoilState(duplicateEventIdState)

  useEffect(() => {
    setShowDateTime(true)
    var cutOffDate = new Date()
    // we automatically hide events older than 2 months
    cutOffDate.setMonth(cutOffDate.getMonth() - 2)
    setOldEvents(events.filter((event) => event.start < cutOffDate).length)
    setNewEvents(events.filter((event) => event.start >= cutOffDate).length)
  }, [events])

  const { events: currentEvents, mutate } = useEvents()
  if (currentEvents) {
    events = currentEvents
  }
  const { userProfile } = useProfile()
  const isAdmin = userProfile?.admin

  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
    events[i].end = new Date(events[i].end)
  }

  // sort events by start date
  events.sort((a, b) => {
    if (a.start < b.start) {
      return -1
    }
    if (a.start > b.start) {
      return 1
    }
    return 0
  })

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
    <Timeline>
      <Stack direction="row" className="mb-4">
        {oldEvents > 0 ? (
          <Timeline.Item>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <Tooltip title="Show older events">
                  <Button color="gray" size="xs" onClick={loadMoreEvents} data-cy="load-more-events">
                    <BiArrowToTop />
                  </Button>
                </Tooltip>
              </Timeline.Title>
            </Timeline.Content>
          </Timeline.Item>
        ) : (
          <Timeline.Item>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <div style={{ width: "34px", height: "20px" }}></div>
              </Timeline.Title>
            </Timeline.Content>
          </Timeline.Item>
        )}
        {oldEvents < events.length - newEvents && (
          <Timeline.Item>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <Tooltip title="Hide older events">
                  <Button color="gray" size="xs" onClick={hideMoreEvents}>
                    <BiArrowToBottom />
                  </Button>
                </Tooltip>
              </Timeline.Title>
            </Timeline.Content>
          </Timeline.Item>
        )}
      </Stack>
      {events.map((event, idx) => {
        // only show events that are not older than 2 months unless they are the active event
        if (idx - oldEvents >= 0 || event.id === activeEvent?.id) {
          return (
            <Timeline.Item key={event.id}>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Time className="flex justify-between">
                  <Link href={`/event/${event.id}`}>
                    {showDateTime && event.start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </Link>
                  {isAdmin && (
                    <Stack direction="row">
                      <Tooltip title="Duplicate Event">
                        <MdContentCopy
                          className="ml-2 inline flex cursor-pointer"
                          data-cy={`duplicate-event-${event.id}`}
                          size={18}
                          onClick={() => openDuplicateEventModal(event.id)}
                        />
                      </Tooltip>
                      <Tooltip title="Delete Event">
                        <MdDelete
                          className="ml-2 inline text-red-500 flex cursor-pointer"
                          data-cy={`delete-event-${event.id}`}
                          size={18}
                          onClick={() => openDeleteEventModal(event.id)}
                        />
                      </Tooltip>
                    </Stack>
                  )}
                </Timeline.Time>
                <Link href={`/event/${event.id}`}>
                  <Timeline.Title>{event.name}</Timeline.Title>
                  <Timeline.Body>{event.summary}</Timeline.Body>
                </Link>
                <EventActions event={event} />
              </Timeline.Content>
            </Timeline.Item>
          )
        }
      })}
      {userProfile?.admin && (
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
  )
}

export default EventsView
