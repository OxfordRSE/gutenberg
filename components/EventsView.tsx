import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import Title from 'components/Title'
import { Button, Timeline } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'

type EventsProps = {
  material: Material,
  events: Event[], 
  myEvents: EventFull[] | undefined, 
  setActiveEvent: (event: EventFull | Event | null) => void
}

const EventsView: React.FC<EventsProps> = ({ material, events, myEvents, setActiveEvent }) => {

  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
  }

  const handleActivate = (event: Event) => () => {
    setActiveEvent(event)
  }
  
  const myEventIds = myEvents ? myEvents.map((event) => event.id) : []

  return (
    <Timeline>
      {events.map((event) => (
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
          { myEventIds.includes(event.id) && (
            <div className="flex flex-row gap-2">
              <Button color="gray" onClick={handleActivate(event)}>
                Select 
                <HiArrowNarrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          )}
        </Timeline.Content>
      </Timeline.Item>
    ))}
    </Timeline>
  )
}


export default EventsView