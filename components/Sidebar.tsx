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
  const { data: myEvents, error } = useSWR(`${basePath}/api/events`, fetcher)

  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(false)

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
    {sidebarOpen ? (
      <Sidebar style={{width: 400 }} className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0">
        { activeEvent ? (
          <>
          <div className="flex justify-between">
          <p className="w-full text-2xl font-bold" >{activeEvent.name}</p>
          <Button className="mr-2" size="xs" color="gray" pill={true} onClick={handleDeactivate}>
            <MdClose className="h-6 w-6" />
          </Button>
          <Button size="xs" color="gray" pill={true} onClick={handleClose}>
            <HiArrowNarrowLeft className="h-6 w-6" />
          </Button>
          </div>
          <EventView material={material} event={activeEvent}/>
          </>
        ) : ( 
          <>
          <div className="flex justify-between mb-2">
          <p className="w-full text-2xl font-bold" >Available Courses</p>
          <Button size="xs" color="gray" pill={true} onClick={handleClose}>
            <HiArrowNarrowLeft className="h-6 w-6" />
          </Button>
          </div>
          <EventsView material={material} events={events} myEvents={myEvents} setActiveEvent={setActiveEvent} />
          </>
        )}
      </Sidebar>
    ) : (
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

