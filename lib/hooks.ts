import { useState, useEffect } from 'react';
import { Event, EventFull } from './types';


export function useActiveEvent(events: EventFull[]): [EventFull | undefined, (event: Event | EventFull | null) => void] {
  const [activeEventId, setActiveEventId] = useState<number | null>(null)

  useEffect(() => {
    const store = sessionStorage.getItem('activeEvent')
    if (store) {
      setActiveEventId(parseInt(store))
    }
  }, [])

  useEffect(() => {
    const store = activeEventId?.toString();
    if (store) {
      sessionStorage.setItem('activeEvent', store)
    }
  }, [activeEventId])

  const setActiveEvent = (event: Event | EventFull | null) => event ? setActiveEventId(event.id) : setActiveEventId(null)

  const activeEvent = events.find(event => event.id === activeEventId)
  
  return [activeEvent, setActiveEvent];
}