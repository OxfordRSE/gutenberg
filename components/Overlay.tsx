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
import { LinkedSection, SectionLink } from "./ui/LinkedSection"
import { Stack } from "@mui/material"
import useWindowSize from "lib/hooks/useWindowSize"
import DeleteUserOnEventModal, { deleteUserOnEventModalState } from "./dialogs/deleteUserOnEventModal"

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
  sectionLinks?: SectionLink[]
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
  sectionLinks,
}: Props) => {
  const [showSearch, setShowSearch] = useRecoilState(searchQueryState)
  const [showTopButtons, setShowTopButtons] = useState(false)
  const [showDeleteEventModal, setShowDeleteEventModal] = useRecoilState(deleteEventModalState)
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useRecoilState(duplicateEventModalState)
  const [showDeleteUserOnEventModal, setShowDeleteUserOnEventModal] = useRecoilState(deleteUserOnEventModalState)
  const windowSize = useWindowSize()
  // remove duplicate links in case activeevent includes the same section as dependsOn, reverse so AE comes first
  sectionLinks = sectionLinks
    ?.filter((item, index, array) => array.findIndex((other) => other.url === item.url) === index)
    .reverse()

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

  const closeDeleteUserOnEvent = () => {
    setShowDeleteUserOnEventModal(false)
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
        {(windowSize?.width ?? 1024) >= 1024 && (
          <>
            <Stack direction="column" className="absolute bottom-20 left-0 ">
              {sectionLinks &&
                sectionLinks.filter((link) => link.direction === "prev").map((link) => LinkedSection(link))}
            </Stack>
            <Stack direction="column" className="absolute bottom-20 right-0 ">
              {sectionLinks &&
                sectionLinks.filter((link) => link.direction === "next").map((link) => LinkedSection(link))}
            </Stack>
          </>
        )}
        <AttributionDialog citations={attribution} isOpen={showAttribution} onClose={closeAttribution} />
        <SearchDialog onClose={closeSearch} />
        <DeleteEventModal onClose={closeDeleteEvent} />
        <DeleteUserOnEventModal onClose={closeDeleteUserOnEvent} />
        <DuplicateEventModal onClose={closeDuplicateEvent} />
        <Sidebar material={material} activeEvent={activeEvent} sidebarOpen={sidebarOpen} handleClose={handleClose} />
      </div>
    </div>
  )
}

export default Overlay
