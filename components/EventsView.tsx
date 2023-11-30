import React, { useEffect, useState } from 'react'
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import { Button, Timeline } from 'flowbite-react'
import EventActions from './EventActions';
import Link from 'next/link';
import useEvents from 'lib/hooks/useEvents'
import useProfile from 'lib/hooks/useProfile'
import useActiveEvent from 'lib/hooks/useActiveEvents';
import { postEvent } from 'lib/actions/postEvent';
import { MdDelete } from 'react-icons/md';
import { useRecoilState } from 'recoil';
import { deleteEventModalState, deleteEventIdState, DeleteEventModal } from 'components/deleteEventModal';


type EventsProps = {
  material: Material,
  events: Event[], 
}

const EventsView: React.FC<EventsProps> = ({ material, events }) => {
  // don't show date/time until the page is loaded (due to rehydration issues)
  const [showDateTime, setShowDateTime] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useRecoilState(deleteEventModalState);
  const [deleteEventId, setDeleteEventId] = useRecoilState(deleteEventIdState);

  useEffect(() => {
    setShowDateTime(true);
  }, []);

  const { events: currentEvents, mutate } = useEvents();
  if (currentEvents) {
    events = currentEvents;
  }
  const { userProfile } = useProfile();
  const isAdmin= userProfile?.admin;

  for (let i = 0; i < events.length; i++) {
    events[i].start = new Date(events[i].start)
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

  const openDeleteEventModal = (eventId : number) => {
    setShowDeleteEventModal(true);
    setDeleteEventId(eventId);
  }

  return (
    <Timeline>
      {events.map((event) => {
        return (
          <Timeline.Item key={event.id}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Time className='flex justify-between'>
                <Link href={`/event/${event.id}`}>{showDateTime && event.start.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short'})}</Link>
                { isAdmin && (<MdDelete className="ml-2 inline text-red-500 flex cursor-pointer"
                              data-cy={`delete-event-${event.id}`}
                              size={18} onClick={() => openDeleteEventModal(event.id)} />)}
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