import { Course, Section, Theme } from "lib/material"
import Link from "next/link"

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
import { useTheme } from "next-themes"
import { ThemeProvider } from "@mui/material/styles"
import { CssBaseline } from "@mui/material"
import { LightTheme, DarkTheme } from "./MuiTheme"

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
  const { systemTheme, theme: currentTheme } = useTheme()
  const [showAttribution, setShowAttribution] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)
  const sectionLinks: SectionLink[] = findLinks(material, theme, course, section, activeEvent)

  const muiTheme = React.useMemo(() => (currentTheme === "light" ? LightTheme : DarkTheme), [currentTheme])
  return (
    <RecoilRoot>
      <ThemeProvider theme={muiTheme}>
        <div className="container mx-auto">
          <Link href="#main" className="sr-only focus:not-sr-only">
            Skip to main content
          </Link>
          <Header theme={theme} course={course} pageInfo={pageInfo} />
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
    </RecoilRoot>
  )
}

export default Layout
