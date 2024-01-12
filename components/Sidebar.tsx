import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Material } from "lib/material"
import { Event, EventFull } from "lib/types"
import { basePath } from "lib/basePath"
import useSWR, { Fetcher } from "swr"
import { Button, Sidebar } from "flowbite-react"
import EventView from "./EventView"
import EventsView from "./EventsView"
import { MdClose } from "react-icons/md"
import { HiArrowNarrowRight, HiCalendar, HiMenuAlt1, HiXCircle } from "react-icons/hi"
import { HiArrowNarrowLeft } from "react-icons/hi"

type SidebarProps = {
  material: Material
  activeEvent: EventFull | undefined
  sidebarOpen: boolean
  handleClose: () => void
}

const fetcher: Fetcher<EventFull[], string> = (url) => fetch(url).then((r) => r.json())

const MySidebar: React.FC<SidebarProps> = ({ material, activeEvent, sidebarOpen, handleClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const componentId = "sidebar" // Unique identifier for this component

    const sidebarElement = sidebarRef.current

    const saveScrollPosition = () => {
      localStorage.setItem(`scrollPosition_${componentId}`, sidebarElement?.scrollTop.toString() || "0")
    }

    const loadScrollPosition = () => {
      const scrollPosition = localStorage.getItem(`scrollPosition_${componentId}`)
      if (scrollPosition && sidebarElement) {
        sidebarElement.scrollTo(0, parseInt(scrollPosition))
      }
    }

    // Save scroll position when the component is unmounted
    window.addEventListener("beforeunload", saveScrollPosition)

    // Load scroll position when the component is mounted
    loadScrollPosition()

    return () => {
      // Clean up the event listener when the component is unmounted
      window.removeEventListener("beforeunload", saveScrollPosition)
    }
  }, [])

  return (
    <>
      {sidebarOpen && activeEvent ? (
        <div className="pointer-events-auto fixed top-0 pl-2 h-screen overflow-x-hidden rounded border top-15 left-0 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-96">
          <HiXCircle
            className="absolute top-1 right-2 z-50 text-gray-500 hover:text-gray-400 opacity-50 w-10 h-10"
            onClick={handleClose}
          />
          <div id="sidebar" ref={sidebarRef} className="p-1 overflow-y-auto h-full">
            <EventView material={material} event={activeEvent} />
          </div>
        </div>
      ) : (
        activeEvent && <div className="fixed top-15 left-0 m-2"></div>
      )}
    </>
  )
}

export default MySidebar
