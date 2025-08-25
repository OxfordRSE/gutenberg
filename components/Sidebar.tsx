import React, { useEffect, useRef } from "react"
import { Material } from "lib/material"
import type { EventFull } from "lib/types"
import EventSwitcher from "./EventSwitcher"
import { Fetcher } from "swr"
import EventView from "./EventView"
import { MdKeyboardArrowLeft } from "react-icons/md"

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
      {sidebarOpen && (
        <div className="pointer-events-auto fixed top-0 pl-2 h-screen overflow-x-hidden border top-15 left-0 text-gray-700 border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 w-96">
          <div id="sidebar" ref={sidebarRef} className="p-1 overflow-y-auto h-full">
            <EventSwitcher />

            {activeEvent ? (
              <EventView material={material} event={activeEvent} />
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">No active event selected</div>
            )}

            <button
              onClick={handleClose}
              aria-label="Close sidebar"
              data-cy="close-sidebar"
              className="absolute top-1 right-0 z-50 text-gray-500 hover:text-gray-400 opacity-50 w-10 h-10"
            >
              <MdKeyboardArrowLeft className="w-full h-full" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default MySidebar
