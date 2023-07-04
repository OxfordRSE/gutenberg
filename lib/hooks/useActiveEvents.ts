import { useState, useEffect } from 'react';
import { basePath } from 'lib/basePath'
import { useSession } from 'next-auth/react';
import { data } from 'cypress/types/jquery';
import { User } from '@prisma/client';
import { EventFull, Event } from 'lib/types';
import useEvent from './useEvent';


function useActiveEvent(): [EventFull | undefined, (event: Event | EventFull | null) => void] {
  const [activeEventId, setActiveEventId] = useState<number | null>(null)
  const { event: activeEvent } = useEvent(activeEventId || undefined)

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

  const setActiveEvent = (event: Event | EventFull | null) => {
    return event ? setActiveEventId(event.id) : setActiveEventId(null)
  }

  
  return [activeEvent, setActiveEvent];
}

export default useActiveEvent;