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
  activeEvent: EventFull | undefined,
  sidebarOpen: boolean,
  handleClose: () => void
}

const fetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const MySidebar: React.FC<SidebarProps> = ({ material, activeEvent, sidebarOpen, handleClose }) => {


  return (
    <>
    {sidebarOpen && activeEvent ? (
      <div className="fixed pl-2 h-full overflow-x-hidden rounded border top-15 left-0 z-40 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-96">
        <HiXCircle className="absolute top-1 right-2 z-50 text-gray-500 hover:text-gray-400 opacity-50 w-10 h-10" onClick={handleClose}/>
        <div className="p-1 overflow-y-auto h-full">
          <p className="w-full text-2xl text-gray-800 dark:text-gray-300 font-bold" >{activeEvent.name}</p>
          <EventView material={material} event={activeEvent}/>
        </div>
      </div>
    ) : activeEvent && (
      <div className="fixed top-15 left-0 z-40 m-2">
      </div>
    )}
    </>
  )
}

export default MySidebar 

