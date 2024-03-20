import { Course, Section, Theme } from "lib/material"

import { useRouter } from "next/router"
import { useSession } from "next-auth/react"
import { useState } from "react"
import React, { ReactNode } from "react"
import Footer from "./Footer"
import Header from "./Header"
import { Material, Excludes } from "lib/material"
import Overlay from "./Overlay"
import Navbar from "./Navbar"
import { useSidebarOpen } from "lib/hooks/useSidebarOpen"
import useActiveEvent from "lib/hooks/useActiveEvents"
import { RecoilRoot } from "recoil"
import { PageTemplate } from "lib/pageTemplate"
import { SectionLink } from "./ui/LinkedSection"
import { findLinks } from "lib/findSectionLinks"
import PlausibleProvider from "next-plausible"

type Props = {
  material: Material
  theme?: Theme
  course?: Course
  section?: Section
  children: ReactNode
  pageInfo?: PageTemplate
  repoUrl?: string
  excludes?: Excludes
}

const Layout: React.FC<Props> = ({ material, theme, course, section, children, pageInfo, repoUrl, excludes }) => {
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const router = useRouter()
  const { data: session } = useSession()

  const [showAttribution, setShowAttribution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)
  const sectionLinks: SectionLink[] = findLinks(material, theme, course, section, activeEvent)
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
            excludes={excludes}
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
            sectionLinks={sectionLinks}
          />
          <PlausibleProvider
            domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? ""}
            enabled={true}
            trackLocalhost={true}
            trackOutboundLinks={true}
          >
            <div data-testid="plausible-provider">{children}</div>
          </PlausibleProvider>
        </main>
        <Footer pageInfo={pageInfo} />
      </div>
    </RecoilRoot>
  )
}

export default Layout
