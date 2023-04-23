import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import Title from 'components/Title'
import { Button, Timeline } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { useActiveEvent } from 'lib/hooks';
import { useSession } from 'next-auth/react';
import EnrolDialog from 'components/EnrolDialog';
import useSWR, { Fetcher } from 'swr'
import { UserOnEvent } from '@prisma/client';


type EventsProps = {
  material: Material,
  events: Event[], 
  myEvents: EventFull[] | undefined, 
  activeEvent: EventFull | undefined,
  setActiveEvent: (event: EventFull | Event | null) => void
}

const userOnEventFetcher: Fetcher<UserOnEvent[], string> = url => fetch(url).then(r => r.json())

const EventsView: React.FC<EventsProps> = ({ material, events, myEvents, activeEvent, setActiveEvent }) => {
  const [showEvent, setShowEvent] = React.useState<Event | null>(null)
  const { data: userOnEvents, error, mutate } = useSWR(`${basePath}/api/userOnEvent`, userOnEventFetcher)

  const { data: session } = useSession()

  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
  }

  const handleActivate = (event: Event) => () => {
    setActiveEvent(event)
  }
  const handleDeactivate = (event: Event) => () => {
    setActiveEvent(null)
  }
  const handleEnrol = (event: Event) => () => {
    setShowEvent(event)
  }
  
  const setShow = (show: boolean) => {
    setShowEvent(show ? showEvent : null)
  }
  
  const myEventIds = myEvents ? myEvents.map((event) => event.id) : []
  
  const onEnrol = (userOnEvent: UserOnEvent | null) => {
    if (userOnEvents && userOnEvent) {
      mutate([...userOnEvents, userOnEvent])
    }
    setShowEvent(null)
  }

  return (
    <Timeline>
      {events.map((event) => {
        const isMyEvent = myEventIds.includes(event.id);
        const isRequested = userOnEvents ? userOnEvents.some((userOnEvent) => userOnEvent.eventId == event.id && userOnEvent.status == 'REQUEST') : false
        const isActiveEvent = activeEvent ? activeEvent.id == event.id : false
        return (
          <Timeline.Item key={event.id}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Time>
                {event.start.toUTCString()}
              </Timeline.Time>
              <Timeline.Title>
                {event.name}
              </Timeline.Title>
              <Timeline.Body>
                {event.summary}
              </Timeline.Body>
              <div className="flex flex-row gap-2">
              { isActiveEvent ? (
                  <Button color="gray" onClick={handleDeactivate(event)}>
                    Unselect 
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                  </Button>
              ): isMyEvent ? (
                  <Button color="gray" onClick={handleActivate(event)}>
                    Select 
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                  </Button>
              ): isRequested ? (
                  <Button color="gray" disabled>
                    Requested
                  </Button>
              ): session && (
                <>
                  <Button color="gray" onClick={handleEnrol(event)}>
                    Enroll 
                    <HiArrowNarrowRight className="ml-2 h-3 w-3" />
                  </Button>
                  <EnrolDialog event={event} show={showEvent == event} onEnrol={onEnrol} />
                </>
              )}
              </div>
            </Timeline.Content>
          </Timeline.Item>
        )}
      )}
    </Timeline>
  )
}


export default EventsView