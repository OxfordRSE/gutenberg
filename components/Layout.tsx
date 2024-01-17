import { Course, Section, Theme } from "lib/material"

import { useRouter } from "next/router"
import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import React, { ReactNode } from "react"
import Footer from "./Footer"
import Header from "./Header"
import { Material } from "lib/material"
import Overlay from "./Overlay"
import Navbar from "./Navbar"
import { useSidebarOpen } from "lib/hooks/useSidebarOpen"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { RecoilRoot } from "recoil"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"

type Props = {
  material: Material
  theme?: Theme
  course?: Course
  section?: Section
  children: ReactNode
  pageInfo?: PageTemplate
  repoUrl?: string
}

const Layout: React.FC<Props> = ({ material, theme, course, section, children, pageInfo, repoUrl }) => {
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const router = useRouter()
  const { data: session } = useSession()

  const [showAttribution, setShowAttribution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)

  const pageLabel = `${theme?.id}.${course?.id}${section ? `.${section.id}` : ""}`

  // check if this section is part of the active event
  let isInEvent = false
  let prevUrl = undefined
  let nextUrl = undefined

  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      let orderedEvents = [...group.EventItem]
      orderedEvents.sort((a, b) => a.order - b.order)
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = orderedEvents[i]
        if (item.section == pageLabel) {
          isInEvent = true
          if (i > 0) {
            const prevItem = orderedEvents[i - 1]
            prevUrl = prevItem.section.replaceAll(".", "/")
          }
          if (i < group.EventItem.length - 1) {
            const nextItem = orderedEvents[i + 1]
            nextUrl = nextItem.section.replaceAll(".", "/")
          }
        }
      }
    }
  }

  return (
    <RecoilRoot>
      <div className="container mx-auto">
        <Header theme={theme} course={course} pageInfo={pageInfo} />
        <main>
          <Navbar
            material={material}
            theme={theme}
            course={course}
            section={section}
            activeEvent={activeEvent}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showAttribution={showAttribution}
            setShowAttribution={setShowAttribution}
            repoUrl={repoUrl}
          />
          <Overlay
            material={material}
            course={course}
            theme={theme}
            activeEvent={activeEvent}
            section={section}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            showAttribution={showAttribution}
            setShowAttribution={setShowAttribution}
            prevUrl={prevUrl}
            nextUrl={nextUrl}
          />
          {children}
        </main>
        <Footer pageInfo={pageInfo} />
      </div>
    </RecoilRoot>
  )
}

export default Layout
