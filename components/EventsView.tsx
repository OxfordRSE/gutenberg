import React from 'react'
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import { Button, Timeline } from 'flowbite-react'
import EventActions from './EventActions';
import Link from 'next/link';
import useEvents from 'lib/hooks/useEvents'
import useProfile from 'lib/hooks/useProfile'
import useActiveEvent from 'lib/hooks/useActiveEvents';
import { postEvent } from 'lib/actions/postEvent';


type EventsProps = {
  material: Material,
  events: Event[], 
}

const EventsView: React.FC<EventsProps> = ({ material, events }) => {
  const { events: currentEvents, mutate } = useEvents();
  if (currentEvents) {
    events = currentEvents;
  }
  const { userProfile } = useProfile();
  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
  }

  const handleCreateEvent = () => {
    postEvent().then((event) => mutate([...(currentEvents || []), event]))
  }

  return (
    <Timeline>
      {events.map((event) => {
        return (
          <Timeline.Item key={event.id}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Time>
                <Link href={`/event/${event.id}`}>{event.start.toUTCString()}</Link>
              </Timeline.Time>
              <Timeline.Title>
                <Link href={`/event/${event.id}`}>{event.name}</Link>
              </Timeline.Title>
              <Timeline.Body>
                <Link href={`/event/${event.id}`}>{event.summary}</Link>
              </Timeline.Body>
              <EventActions event={event} />
            </Timeline.Content>
          </Timeline.Item>
        )}
      )}
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