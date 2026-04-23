import React from "react"
import { HiArrowNarrowRight } from "react-icons/hi"
import { EventFull, Event } from "lib/types"
import { useSession } from "next-auth/react"
import EnrolDialog from "components/dialogs/EnrolDialog"
import { Fetcher } from "swr"
import { UserOnEvent } from "@prisma/client"
import { Button } from "flowbite-react"
import { useUserOnEvent } from "lib/hooks/useUserOnEvent"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useEvent from "lib/hooks/useEvent"
import useLearningContext from "lib/hooks/useLearningContext"

type EventActionsProps = {
  event: Event
  verbose?: boolean
}

const userOnEventFetcher: Fetcher<UserOnEvent, string> = (url) => fetch(url).then((r) => r.json())

const EventActions: React.FC<EventActionsProps> = ({ event, verbose }) => {
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const [learningContext, setLearningContext] = useLearningContext()

  const { data: session } = useSession()
  const [showEvent, setShowEvent] = React.useState<Event | null>(null)
  const { userOnEvent, error, mutate } = useUserOnEvent(event.id)

  const handleDeactivate = (event: Event) => () => {
    setActiveEvent(undefined)
    if (learningContext?.type === "event" && learningContext.id === event.id) {
      setLearningContext(undefined)
    }
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
      setLearningContext({ type: "event", id: event.id })
    }
  }

  return (
    <div className="flex flex-row gap-2">
      {isActiveEvent ? (
        <Button color="gray" className="[&>span]:items-center" onClick={handleDeactivate(event)} style={{ zIndex: 1 }}>
          {verbose ? "Deselect as active event" : "Unselect"}
          <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
      ) : isMyEvent ? (
        <Button color="gray" className="[&>span]:items-center" onClick={handleActivate(event)} style={{ zIndex: 1 }}>
          {verbose ? "Select as your active event" : "Select"}
          <HiArrowNarrowRight className="ml-2 h-3 w-3" />
        </Button>
      ) : isRequested ? (
        <>
          <Button color="gray" className="[&>span]:items-center" onClick={handleEnrol(event)} style={{ zIndex: 1 }}>
            {verbose ? "Enrolment has been requested" : "Requested"}
            <HiArrowNarrowRight className="ml-2 h-3 w-3" />
          </Button>
          <EnrolDialog event={event} show={showEvent == event} onEnrol={onEnrol} />
        </>
      ) : (
        session && (
          <>
            <Button
              color="gray"
              className="[&>span]:items-center"
              data-cy={`event-enrol-${event.id}`}
              onClick={handleEnrol(event)}
              style={{ zIndex: 1 }}
            >
              {verbose ? "Enrol onto this event" : "Enrol"}
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
