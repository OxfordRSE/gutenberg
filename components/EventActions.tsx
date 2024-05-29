import React from "react"
import { HiArrowNarrowRight } from "react-icons/hi"
import { Material } from "lib/material"
import { EventFull, Event } from "lib/types"
import Title from "components/ui/Title"
import { basePath } from "lib/basePath"
import { useSession } from "next-auth/react"
import EnrolDialog from "components/EnrolDialog"
import useSWR, { Fetcher } from "swr"
import { UserOnEvent } from "@prisma/client"
import { Button } from "flowbite-react"
import { useUserOnEvent } from "lib/hooks/useUserOnEvent"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useEvent from "lib/hooks/useEvent"

type EventActionsProps = {
  event: Event
}

const userOnEventFetcher: Fetcher<UserOnEvent, string> = (url) => fetch(url).then((r) => r.json())

const EventActions: React.FC<EventActionsProps> = ({ event }) => {
  const [activeEvent, setActiveEvent] = useActiveEvent()

  const { data: session } = useSession()
  const [showEvent, setShowEvent] = React.useState<Event | null>(null)
  const { userOnEvent, error, mutate } = useUserOnEvent(event.id)

  const handleDeactivate = (event: Event) => () => {
    setActiveEvent(undefined)
  }
  const handleEnrol = (event: Event) => () => {
    setShowEvent(event)
  }

  const setShow = (show: boolean) => {
    setShowEvent(show ? showEvent : null)
  }

  const onEnrol = (userOnEvent: UserOnEvent | undefined) => {
    if (userOnEvent) {
      mutate({ userOnEvent })
    }
    setShowEvent(null)
  }

  const isMyEvent = userOnEvent && (userOnEvent.status == "STUDENT" || userOnEvent.status == "INSTRUCTOR")
  const isRequested = userOnEvent ? userOnEvent.eventId == event.id && userOnEvent.status == "REQUEST" : false
  const isActiveEvent = activeEvent ? activeEvent.id == event.id : false

  const { event: eventData } = useEvent(isMyEvent ? event.id : undefined)
  const handleActivate = (event: Event) => () => {
    if (eventData) {
      setActiveEvent(eventData)
    }
  }

  return (
    <div className="flex flex-row gap-2">
      {isActiveEvent ? (
        <Button color="gray" onClick={handleDeactivate(event)} style={{ zIndex: 1 }}>
          Unselect
          <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
      ) : isMyEvent ? (
        <Button color="gray" onClick={handleActivate(event)} style={{ zIndex: 1 }}>
          Select
          <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
      ) : isRequested ? (
        <Button color="gray" style={{ zIndex: 1 }} disabled>
          Requested
        </Button>
      ) : (
        session && (
          <>
            <Button color="gray" data-cy={`event-enrol-${event.id}`} onClick={handleEnrol(event)} style={{ zIndex: 1 }}>
              Enrol
              <HiArrowNarrowRight className="ml-2 h-3 w-3" />
            </Button>
            <EnrolDialog event={event} show={showEvent == event} onEnrol={onEnrol} />
          </>
        )
      )}
    </div>
  )
}

export default EventActions
