import { Course, Section, Theme } from "lib/material"
import Link from "next/link"

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
import { Provider } from "jotai"
import { PageTemplate } from "lib/pageTemplate"
import { SectionLink } from "./ui/LinkedSection"
import { findLinks } from "lib/findSectionLinks"
import PlausibleProvider from "next-plausible"
import { useTheme } from "next-themes"
import { ThemeProvider } from "@mui/material/styles"
import { LightTheme, DarkTheme } from "./MuiTheme"
import plausibleHost from "lib/plausibleHost"

type Props = {
  material: Material
  theme?: Theme
  course?: Course
  section?: Section
  children: ReactNode
  pageInfo?: PageTemplate
  pageTitle?: string
  repoUrl?: string
  excludes?: Excludes
}

const Layout: React.FC<Props> = ({
  material,
  theme,
  course,
  section,
  children,
  pageInfo,
  pageTitle,
  repoUrl,
  excludes,
}) => {
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const { data: session } = useSession()
  const { theme: currentTheme } = useTheme()
  const [showAttribution, setShowAttribution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)
  const sectionLinks: SectionLink[] = findLinks(material, theme, course, section, activeEvent)

  const muiTheme = React.useMemo(() => (currentTheme === "light" ? LightTheme : DarkTheme), [currentTheme])
  return (
    <Provider>
      <ThemeProvider theme={muiTheme}>
        <div className="container mx-auto">
          <Link href="#main" className="sr-only focus:not-sr-only">
            Skip to main content
          </Link>
          <Header pageInfo={pageInfo} pageTitle={pageTitle} />
          <header>
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
          </header>
          <main id="main">
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
              customDomain={plausibleHost}
              enabled={true}
              trackLocalhost={true}
              trackOutboundLinks={true}
            >
              <div data-testid="plausible-provider">{children}</div>
            </PlausibleProvider>
          </main>
          <Footer pageInfo={pageInfo} />
        </div>
      </ThemeProvider>
    </Provider>
  )
}

export default Layout
