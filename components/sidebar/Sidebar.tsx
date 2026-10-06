import React, { useEffect, useRef, useState, useCallback } from "react"
import { Material } from "lib/material"
import type { EventFull } from "lib/types"
import EventSwitcher from "./EventSwitcher"
import EventView from "./EventView"
import CourseView from "./CourseView"
import { MdKeyboardArrowLeft } from "react-icons/md"
import type { PageTemplate } from "lib/pageTemplate"
import useLearningContext from "lib/hooks/useLearningContext"

type SidebarProps = {
  material: Material
  activeEvent: EventFull | undefined
  sidebarOpen: boolean
  handleClose: () => void
  pageInfo: PageTemplate
}

const MIN_WIDTH = 200
const MAX_WIDTH = 480
const DEFAULT_WIDTH = 320 // matches previous w-80
const WIDTH_STORAGE_KEY = "sidebarWidth"

const MySidebar: React.FC<SidebarProps> = ({
  material,
  activeEvent,
  sidebarOpen,
  handleClose,
  pageInfo,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [learningContext] = useLearningContext()

  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const isResizing = useRef(false)

  // Load persisted width on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(WIDTH_STORAGE_KEY)
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10)
      if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
        setWidth(parsed)
      }
    }
  }, [])

  const startResizing = useCallback(() => {
    isResizing.current = true
  }, [])

  const stopResizing = useCallback(() => {
    if (isResizing.current) {
      localStorage.setItem(WIDTH_STORAGE_KEY, width.toString())
    }
    isResizing.current = false
  }, [width])

  const resize = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return
    const newWidth = e.clientX
    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      setWidth(newWidth)
    }
  }, [])

  useEffect(() => {
    window.addEventListener("mousemove", resize)
    window.addEventListener("mouseup", stopResizing)
    return () => {
      window.removeEventListener("mousemove", resize)
      window.removeEventListener("mouseup", stopResizing)
    }
  }, [resize, stopResizing])

  // Existing scroll-position persistence for the inner scrollable panel
  useEffect(() => {
    const componentId = "sidebar"
    const sidebarElement = sidebarRef.current

    const saveScrollPosition = () => {
      localStorage.setItem(
        `scrollPosition_${componentId}`,
        sidebarElement?.scrollTop.toString() || "0"
      )
    }

    const loadScrollPosition = () => {
      const scrollPosition = localStorage.getItem(`scrollPosition_${componentId}`)
      if (scrollPosition && sidebarElement) {
        sidebarElement.scrollTo(0, parseInt(scrollPosition))
      }
    }

    loadScrollPosition()
    window.addEventListener("beforeunload", saveScrollPosition)

    return () => {
      window.removeEventListener("beforeunload", saveScrollPosition)
    }
  }, [])

  return (
    <div
      style={{ width: sidebarOpen ? width : 0 }}
      className="relative h-[calc(100vh-64px)] border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 overflow-hidden transition-[width] duration-200 flex-shrink-0"
    >
      <div
        id="sidebar"
        ref={sidebarRef}
        className="relative p-2 overflow-y-auto h-full"
        style={{ width: `${width}px` }}
      >
        <EventSwitcher pageInfo={pageInfo} />

        {learningContext?.type === "event" && activeEvent ? (
          <EventView material={material} event={activeEvent} />
        ) : learningContext?.type === "course" ? (
          <CourseView
            material={material}
            externalId={learningContext.externalId}
          />
        ) : (
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            No active learning context
          </div>
        )}

        <button
          onClick={handleClose}
          aria-label="Close sidebar"
          data-cy="close-sidebar"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <MdKeyboardArrowLeft className="w-7 h-7" />
        </button>
      </div>

      {sidebarOpen && (
        <div
          onMouseDown={startResizing}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 z-10"
        />
      )}
    </div>
  )
}

export default MySidebar