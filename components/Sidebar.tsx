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
import { HiArrowNarrowRight } from 'react-icons/hi';
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
      <Sidebar style={{width: 400 }} className="fixed h-screen top-0 left-0 z-40">
        <Button className="absolute top-4 right-6 z-50" size="xs" color="gray" pill={true} onClick={handleClose}>
          <HiArrowNarrowLeft className="h-6 w-6" />
        </Button>
        <div className="p-1 overflow-y-auto h-full">
          <p className="w-full text-2xl font-bold" >{activeEvent.name}</p>
          <EventView material={material} event={activeEvent}/>
        </div>
      </Sidebar>
    ) : activeEvent && (
      <div className="fixed top-0 left-0 z-40 m-2">
        <Button size="xs" color="gray" pill={true} onClick={handleOpen}>
          <HiArrowNarrowRight className="h-6 w-6" />
        </Button>
      </div>
    )}
    </>
  )
}

export default MySidebar 

