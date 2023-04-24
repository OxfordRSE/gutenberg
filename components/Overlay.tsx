import { basePath } from 'lib/basePath'
import { Course, Material, Section, Theme } from 'lib/material'
import { EventFull } from 'lib/types'
import { NextPage } from 'next'
import React, { useState } from 'react'
import { HiAtSymbol, HiArrowCircleLeft, HiArrowCircleRight } from 'react-icons/hi'
import AttributionDialog from './AttributionDialog'
import Sidebar from './Sidebar'

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

  const pageLabel = `${theme?.id}.${course?.id}${section ? `.${section.id}` : ''}`

  // check if this section is part of the active event
  let isInEvent = false;
  let prevUrl = null;
  let nextUrl = null;
  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = group.EventItem[i];
        if (item.section == pageLabel) {
          isInEvent = true
          if (i > 0) {
            const prevItem = group.EventItem[i - 1];
            prevUrl = prevItem.section.replaceAll('.', '/')
          }
          if (i < group.EventItem.length - 1) {
            const nextItem = group.EventItem[i + 1];
            nextUrl = nextItem.section.replaceAll('.', '/')
          }
        }
      }
    }
  }

  const attribution = section ? section.attribution : course ? course.attribution : []

  return (
    <>
      <HiAtSymbol onClick={openAttribution} className="fixed top-15 right-0 w-12 h-12 text-gray-700 hover:text-gray-600 opacity-50"/>
      <AttributionDialog citations={attribution} isOpen={showAttribution} onClose={closeAttribution} />
      {isInEvent && (
        <div className="fixed bottom-20 left-0 w-full flex justify-between px-4 py-2">
          {prevUrl && (
            <a href={`/material/${prevUrl}`} className="text-gray-700 hover:text-gray-600 opacity-50">
              <HiArrowCircleLeft className="w-14 h-14"/>
            </a>
          )}
          {nextUrl && (
            <a href={`/material/${nextUrl}`} className={`text-gray-700 hover:text-gray-600 opacity-50 ${prevUrl ? '' : 'absolute right-0 bottom-'}`}>
              <HiArrowCircleRight className="w-14 h-14"/>
            </a>
          )}
        </div>
      )}
      <Sidebar material={material} activeEvent={activeEvent}  />
    </>
  )
}

export default Overlay;