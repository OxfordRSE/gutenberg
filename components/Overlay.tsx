import { basePath } from "lib/basePath"
import { Course, Material, Section, Theme } from "lib/material"
import { EventFull } from "lib/types"
import { NextPage } from "next"
import React, { useEffect, useState } from "react"
import { HiAtSymbol, HiArrowCircleLeft, HiArrowCircleRight, HiCalendar } from "react-icons/hi"
import AttributionDialog from "./AttributionDialog"
import Sidebar from "./Sidebar"
import { SearchDialog, searchQueryState } from "components/SearchDialog"
import { useRecoilState } from "recoil"
import { DeleteEventModal, deleteEventModalState } from "components/deleteEventModal"
import { DuplicateEventModal, duplicateEventModalState } from "components/DuplicateEventModal"

interface Props {
  material: Material
  theme?: Theme
  course?: Course
  section?: Section
  activeEvent: EventFull | undefined
  showAttribution: boolean
  setShowAttribution: (show: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  prevUrl?: string
  nextUrl?: string
}

const Overlay: NextPage<Props> = ({
  material,
  theme,
  course,
  section,
  activeEvent,
  showAttribution,
  setShowAttribution,
  sidebarOpen,
  setSidebarOpen,
  prevUrl,
  nextUrl,
}: Props) => {
  const [showSearch, setShowSearch] = useRecoilState(searchQueryState)
  const [showTopButtons, setShowTopButtons] = useState(false)
  const [showDeleteEventModal, setShowDeleteEventModal] = useRecoilState(deleteEventModalState)
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useRecoilState(duplicateEventModalState)

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 200 // Adjust this value to your desired threshold
      const shouldFix = window.scrollY > scrollThreshold
      setShowTopButtons(shouldFix)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openAttribution = () => setShowAttribution(true)
  const closeAttribution = () => setShowAttribution(false)

  const closeSearch = () => {
    setShowSearch(false)
  }

  const closeDeleteEvent = () => {
    setShowDeleteEventModal(false)
  }

  const closeDuplicateEvent = () => {
    setShowDuplicateEventModal(false)
  }

  const handleClose = () => {
    setSidebarOpen(false)
  }

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const attribution = section ? section.attribution : course ? course.attribution : []

  return (
    <div className="z-10 pointer-events-none fixed top-0 container mx-auto">
      <div className="pointer-events-none h-screen w-full flex-col content-between">
        {activeEvent && showTopButtons && (
          <HiCalendar
            className="pointer-events-auto absolute top-0 left-0 cursor-pointer opacity-50 text-gray-600 hover:text-gray-500 w-12 h-12"
            onClick={handleToggle}
          />
        )}
        {showTopButtons && (
          <HiAtSymbol
            onClick={openAttribution}
            className="pointer-events-auto absolute top-0 right-0 cursor-pointer w-12 h-12 text-gray-600 hover:text-gray-500 opacity-50"
          />
        )}
        {prevUrl && (
          <a
            href={`/material/${prevUrl}`}
            className="pointer-events-auto absolute bottom-20 left-0 text-gray-600 hover:text-gray-500 opacity-50"
          >
            <HiArrowCircleLeft className="w-14 h-14" />
          </a>
        )}
        {nextUrl && (
          <a
            href={`/material/${nextUrl}`}
            className="pointer-events-auto absolute bottom-20 right-0 text-gray-600 hover:text-gray-500 opacity-50"
          >
            <HiArrowCircleRight className="w-14 h-14" />
          </a>
        )}
        <AttributionDialog citations={attribution} isOpen={showAttribution} onClose={closeAttribution} />
        <SearchDialog onClose={closeSearch} />
        <DeleteEventModal onClose={closeDeleteEvent} />
        <DuplicateEventModal onClose={closeDuplicateEvent} />
        <Sidebar material={material} activeEvent={activeEvent} sidebarOpen={sidebarOpen} handleClose={handleClose} />
      </div>
    </div>
  )
}

export default Overlay
