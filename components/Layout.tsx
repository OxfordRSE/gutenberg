import { Course, Section, Theme } from 'lib/material'

import { useRouter } from 'next/router'
import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'
import { useState, useEffect, useLayoutEffect } from 'react'
import React,{ ReactNode } from 'react'
import Footer from './Footer'
import Header from './Header'
import { Dropdown } from "flowbite-react"
import { EventFull, Event } from 'lib/types' 
import {AiOutlineUser} from 'react-icons/ai'
import {FaUser} from 'react-icons/fa'
import { Avatar } from 'flowbite-react'
import { basePath } from 'lib/basePath'
import { Material } from 'lib/material'
import EventView from './EventView'
import Overlay from './Overlay'
import Navbar from './Navbar'
import { useSidebarOpen } from 'lib/hooks'


type Props = {
  material: Material,
  theme?: Theme,
  course?: Course,
  section?: Section,
  children: ReactNode,
  activeEvent: EventFull | undefined
}

const Layout: React.FC<Props> = ({ material, theme, course, section, children, activeEvent }) => {
  const router = useRouter()
  const { data: session } = useSession()

  const [showAttribution, setShowAttribution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)

  const pageLabel = `${theme?.id}.${course?.id}${section ? `.${section.id}` : ''}`

  // check if this section is part of the active event
  let isInEvent = false;
  let prevUrl = undefined;
  let nextUrl = undefined;

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

  return (
  <div className="container mx-auto">
    <Header theme={theme} course={course}/>
    <main>
      <Navbar material={material} theme={theme} course={course} section={section} activeEvent={activeEvent} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} showAttribution={showAttribution} setShowAttribution={setShowAttribution} />  
      <Overlay material={material} course={course} theme={theme} activeEvent={activeEvent} section={section} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}  showAttribution={showAttribution} setShowAttribution={setShowAttribution} prevUrl={prevUrl} nextUrl={nextUrl} />
      {children}
    </main>
    <Footer />
  </div>
  )
}

export default Layout;
