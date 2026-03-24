import { MaterialCourse, MaterialSection, MaterialTheme } from "lib/material"
import Link from "next/link"

import { useSession } from "next-auth/react"
import { useState } from "react"
import React, { ReactNode } from "react"
import Footer from "./Footer"
import Header from "./Header"
import { Material, Excludes } from "lib/material"
import Overlay from "./Overlay"
import Navbar from "./navbar/Navbar"
import { useSidebarOpen } from "lib/hooks/useSidebarOpen"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useActiveCourse from "lib/hooks/useActiveCourse"
import { Provider } from "jotai"
import { PageTemplate } from "lib/pageTemplate"
import { SectionLink } from "./ui/LinkedSection"
import { findLinks } from "lib/findSectionLinks"
import PlausibleProvider from "next-plausible"
import { useTheme } from "next-themes"
import { ThemeProvider } from "@mui/material/styles"
import useSWR, { Fetcher } from "swr"
import { LightTheme, DarkTheme } from "./MuiTheme"
import plausibleHost from "lib/plausibleHost"
import { BreadcrumbItem } from "lib/breadcrumbs"
import { basePath } from "lib/basePath"
import type { Data as ActiveCourseData } from "pages/api/course/byExternal/[externalId]"

const activeCourseFetcher: Fetcher<ActiveCourseData, string> = (url) => fetch(url).then((r) => r.json())

type Props = {
  material: Material
  theme?: MaterialTheme
  course?: MaterialCourse
  section?: MaterialSection
  children: ReactNode
  pageInfo: PageTemplate
  pageTitle?: string
  breadcrumbs?: BreadcrumbItem[]
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
  breadcrumbs,
  repoUrl,
  excludes,
}) => {
  const [activeEvent] = useActiveEvent()
  const [activeCourseExternalId] = useActiveCourse()
  useSession()
  const { theme: currentTheme } = useTheme()
  const [showAttribution, setShowAttribution] = useState(false)
  const { data: activeCourseData } = useSWR(
    activeCourseExternalId ? `${basePath}/api/course/byExternal/${activeCourseExternalId}` : undefined,
    activeCourseFetcher
  )
  const [sidebarOpen, setSidebarOpen] = useSidebarOpen(true)
  const sectionLinks: SectionLink[] = findLinks(material, theme, course, section, activeEvent, activeCourseData?.course)

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
              pageInfo={pageInfo}
              breadcrumbs={breadcrumbs}
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
              pageInfo={pageInfo}
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
