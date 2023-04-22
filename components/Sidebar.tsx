import React, { useState } from 'react'
import Image from 'next/image'
import { Material } from 'lib/material';
import { Event, EventFull } from 'lib/types';
import { basePath } from 'lib/basePath'
import { useActiveEvent, useSidebarOpen } from 'lib/hooks'
import useSWR, { Fetcher } from 'swr'
import { Button, Sidebar } from 'flowbite-react';
import EventView from './EventView';
import EventsView from './EventsView';
import { MdClose } from 'react-icons/md';
import { HiArrowNarrowRight, HiCalendar, HiMenuAlt1, HiXCircle } from 'react-icons/hi';
import { HiArrowNarrowLeft } from 'react-icons/hi';


type SidebarProps = {
  material: Material,
  events: Event[], 
}

const fetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const MySidebar: React.FC<SidebarProps> = ({ material, events }) => {
  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, fetcher)

  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)

  console.log('sidebar activeEvent: ', activeEvent)

  const handleDeactivate = () => {
    setActiveEvent(null)
  }
  const handleClose = () => {
    setSidebarOpen(false)
  }

  const handleOpen = () => {
    setSidebarOpen(true)
  }

  const eventsWithMyEvents = events.concat(myEvents ? myEvents : []);

  return (
    <>
    {sidebarOpen && activeEvent ? (
      <div className="fixed pl-2 h-full overflow-x-hidden rounded top-0 left-0 z-40 bg-white dark:bg-slate-900 w-96">
        <HiXCircle className="absolute top-2 right-4 z-50 text-gray-500 hover:text-gray-400 opacity-50 w-10 h-10" onClick={handleClose}/>
        <div className="p-1 overflow-y-auto h-full">
          <p className="w-full text-2xl font-bold" >{activeEvent.name}</p>
          <EventView material={material} event={activeEvent}/>
        </div>
      </div>
    ) : activeEvent && (
      <div className="fixed top-0 left-0 z-40 m-2">
        <HiCalendar className="opacity-50 text-gray-700 hover:text-gray-600 w-10 h-10" onClick={handleOpen}/>
      </div>
    )}
    </>
  )
}

export default MySidebar 

