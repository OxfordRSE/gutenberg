import { useState, useEffect } from 'react';
import { Event } from './types';

export function useActiveEvent(events: Event[]): [Event | null, (event: Event) => void] {
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

  const setActiveEvent = (event: Event) => setActiveEventId(event.id)

  const activeEvent = events.find(event => event.id === activeEventId)
  
  return [activeEvent, setActiveEvent];
}