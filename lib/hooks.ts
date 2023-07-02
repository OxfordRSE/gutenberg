import { useState, useEffect } from 'react';
import { Event, EventFull } from './types';
import { GetData as UsersData } from 'pages/api/user'
import { basePath } from 'lib/basePath'
import { useSession } from 'next-auth/react';
import { data } from 'cypress/types/jquery';
import { User } from '@prisma/client';


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

  const setActiveEvent = (event: Event | EventFull | null) => {
    return event ? setActiveEventId(event.id) : setActiveEventId(null)
  }

  const activeEvent = activeEventId ? events.find(event => event.id === activeEventId) : undefined
  
  return [activeEvent, setActiveEvent];
}

export function useSidebarOpen(defaultValue: boolean): [boolean, (value: boolean) => void] {
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => {
    const store = sessionStorage.getItem('sidebarOpen')
    if (store) {
      setOpen(parseInt(store))
    } else {
      setOpen(defaultValue ? 1 : 0)
    }
  }, [])

  useEffect(() => {
    const store = open?.toString();
    if (store) {
      sessionStorage.setItem('sidebarOpen', store)
    }
  }, [open])


  const sidebarOpen = open === 1
  const setSidebarOpen = (value: boolean) => setOpen(value ? 1 : 0)

  return [sidebarOpen, setSidebarOpen];
}



