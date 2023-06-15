import React from 'react'
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import { Timeline } from 'flowbite-react'
import EventActions from './EventActions';
import Link from 'next/link';


type EventsProps = {
  material: Material,
  events: Event[], 
  myEvents: EventFull[] | undefined, 
  activeEvent: EventFull | undefined,
  setActiveEvent: (event: EventFull | Event | null) => void
}

const EventsView: React.FC<EventsProps> = ({ material, events, myEvents, activeEvent, setActiveEvent }) => {
  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
  }
  return (
    <Timeline>
      {events.map((event) => {
        return (
          <Timeline.Item key={event.id}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Time>
                {event.start.toUTCString()}
              </Timeline.Time>
              <Timeline.Title>
                <Link href={`/event/${event.id}`}>{event.name}</Link>
              </Timeline.Title>
              <Timeline.Body>
                {event.summary}
              </Timeline.Body>
              <EventActions activeEvent={activeEvent} setActiveEvent={setActiveEvent} event={event} myEvents={myEvents} material={material} />
            </Timeline.Content>
          </Timeline.Item>
        )}
      )}
    </Timeline>
  )
}


export default EventsView