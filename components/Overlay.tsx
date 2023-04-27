import { basePath } from 'lib/basePath'
import { Course, Material, Section, Theme } from 'lib/material'
import { EventFull } from 'lib/types'
import { NextPage } from 'next'
import React, { useState } from 'react'
import { HiAtSymbol, HiArrowCircleLeft, HiArrowCircleRight, HiCalendar } from 'react-icons/hi'
import AttributionDialog from './AttributionDialog'
import Sidebar from './Sidebar'
import { useSidebarOpen } from 'lib/hooks'

interface Props {
  material: Material,
  theme?: Theme,
  course?: Course,
  section?: Section,
  activeEvent: EventFull | undefined
}


const Overlay: NextPage<Props> = ({material, theme, course, section, activeEvent }: Props) => {

  const [showAttribution, setShowAttribution] = useState(false)
  const openAttribution = () => setShowAttribution(true)
  const closeAttribution = () => setShowAttribution(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)

  const handleClose = () => {
    setSidebarOpen(false)
  }

  const handleToggle= () => {
    setSidebarOpen(!sidebarOpen)
  }

  const pageLabel = `${theme?.id}.${course?.id}${section ? `.${section.id}` : ''}`

  // check if this section is part of the active event
  let isInEvent = false;
  let prevUrl = null;
  let nextUrl = null;

  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      let orderedEvents = [...group.EventItem];
      orderedEvents.sort((a, b) => a.order - b.order);
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = orderedEvents[i];
        if (item.section == pageLabel) {
          isInEvent = true
          if (i > 0) {
            const prevItem = orderedEvents[i - 1];
            prevUrl = prevItem.section.replaceAll('.', '/')
          }
          if (i < group.EventItem.length - 1) {
            const nextItem = orderedEvents[i + 1];
            nextUrl = nextItem.section.replaceAll('.', '/')
          }
        }
      }
    }
  }

  const attribution = section ? section.attribution : course ? course.attribution : []

  return (
    <div className="fixed container mx-auto">
       <div className="relative h-screen w-full flex-col content-between">
        {activeEvent && (
        <HiCalendar className="absolute top-0 left-0 cursor-pointer opacity-50 text-gray-700 hover:text-gray-600 w-12 h-12" onClick={handleToggle}/>
        )}
        <HiAtSymbol onClick={openAttribution} className="absolute top-0 right-0 cursor-pointer w-12 h-12 text-gray-700 hover:text-gray-600 opacity-50"/>
      {prevUrl && (
        <a href={`/material/${prevUrl}`} className="absolute bottom-40 left-0 text-gray-700 hover:text-gray-600 opacity-50">
          <HiArrowCircleLeft className="w-14 h-14"/>
        </a>
      )}
      {nextUrl && (
        <a href={`/material/${nextUrl}`} className="absolute bottom-40 right-0 text-gray-700 hover:text-gray-600 opacity-50">
          <HiArrowCircleRight className="w-14 h-14"/>
        </a>
      )}
      <AttributionDialog citations={attribution} isOpen={showAttribution} onClose={closeAttribution} />
      <Sidebar material={material} activeEvent={activeEvent} sidebarOpen={sidebarOpen} handleClose={handleClose} />
      </div>
    </div>
  )
}

export default Overlay;