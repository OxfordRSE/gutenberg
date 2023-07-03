import { useState, useEffect } from 'react';
import { Event, EventFull } from './types';
import { GetData as UsersData } from 'pages/api/user'
import { basePath } from 'lib/basePath'
import { useSession } from 'next-auth/react';
import { data } from 'cypress/types/jquery';
import { User } from '@prisma/client';
import { useEvent } from 'pages/api/event/[eventId]';


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
