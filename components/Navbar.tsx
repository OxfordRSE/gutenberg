import { Avatar, Button, Dropdown, Tooltip } from "flowbite-react"
import { Course, Material, Section, Theme, getExcludes, Excludes } from "lib/material"
import { Event, EventFull } from "lib/types"
import { signIn, signOut, useSession } from "next-auth/react"
import Link from "next/link"
import React, { useState, useRef, useEffect } from "react"
import { RxGithubLogo } from "react-icons/rx"
import { HiAtSymbol, HiCalendar, HiSearchCircle } from "react-icons/hi"
import { searchQueryState } from "components/SearchDialog"
import { useRecoilState } from "recoil"
import { enableSearch } from "lib/search/enableSearch"
import NavDiagramPopover from "./dialogs/navDiagramPop"
import ThemeCardsPopover from "./dialogs/themeCardPop"

interface Props {
  material: Material
  theme?: Theme
  course?: Course
  section?: Section
  activeEvent: EventFull | undefined
  setShowAttribution: (show: boolean) => void
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
  showAttribution: boolean
  repoUrl?: string
  excludes?: Excludes
}

const Navbar: React.FC<Props> = ({
  theme,
  course,
  section,
  material,
  activeEvent,
  setShowAttribution,
  setSidebarOpen,
  sidebarOpen,
  showAttribution,
  repoUrl,
  excludes,
}) => {
  const [showSearch, setShowSearch] = useRecoilState(searchQueryState)
  const [showNavDiagram, setShowNavDiagram] = useState(false)
  const [isPopoverHovered, setIsPopoverHovered] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [itemHovered, setItemHovered] = useState("")
  const { data: session } = useSession()
  const ref1 = useRef<HTMLLIElement>(null)
  const ref2 = useRef<HTMLLIElement>(null)
  const ref3 = useRef<HTMLLIElement>(null)
  let enterTimer: NodeJS.Timeout
  let leaveTimer: NodeJS.Timeout

  const openAttribution = () => {
    setShowAttribution(true)
  }

  const openSearch = () => {
    setShowSearch(true)
  }

  const handleToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSignout = () => {
    signOut()
  }

  const handleSignin = () => {
    signIn()
  }

  useEffect(() => {
    if (isHovered || isPopoverHovered) {
      enterTimer = setTimeout(() => {
        setShowNavDiagram(true)
      }, 500)
    } else {
      leaveTimer = setTimeout(() => {
        clearTimeout(enterTimer)
        clearTimeout(leaveTimer)
        setShowNavDiagram(false)
      }, 500)
    }
  }, [isHovered, isPopoverHovered])

  const handleIsHovered = (hovered: string) => {
    clearTimeout(leaveTimer)
    setItemHovered(hovered)
    setIsHovered(true)
  }

  const handleIsNotHovered = () => {
    clearTimeout(enterTimer)
    setIsHovered(false)
  }

  const handlePopoverHovered = () => {
    clearTimeout(leaveTimer)
    setIsPopoverHovered(true)
  }

  const handlePopoverNotHovered = () => {
    clearTimeout(enterTimer)
    setIsPopoverHovered(false)
  }

  return (
    <div className="z-10 flex p-2 mx-2 mt-2 mb-4 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
      <nav className="w-full inline-flex" aria-label="Breadcrumb">
        <ol className="z-10 list-none inline-flex items-center space-x-1 md:space-x-3">
          {activeEvent && (
            <>
              <HiCalendar
                className="pointer-events-auto cursor-pointer text-gray-500 hover:text-gray-400 w-10 h-10"
                onClick={handleToggle}
              />
              <div className="h-full border-r border-gray-500"></div>
            </>
          )}
          <li className="inline-flex items-center">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
              </svg>
              Home
            </Link>
          </li>
          {theme && (
            <li ref={ref1} onMouseEnter={() => handleIsHovered("theme")} onMouseLeave={handleIsNotHovered}>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className={showNavDiagram && itemHovered === "theme" ? "expanded" : "collapsed"}
                    style={{ transformOrigin: "50% 50%" }}
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <Link
                  href={`/material`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  Material
                </Link>
                {showNavDiagram && itemHovered === "theme" && (
                  <ThemeCardsPopover
                    material={material}
                    excludes={excludes}
                    onMouseEnter={handlePopoverHovered}
                    onMouseLeave={handlePopoverNotHovered}
                    target={ref1?.current || undefined}
                  />
                )}
              </div>
            </li>
          )}
          {theme && (
            <li ref={ref2} onMouseEnter={() => handleIsHovered("course")} onMouseLeave={handleIsNotHovered}>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className={showNavDiagram && itemHovered === "course" ? "expanded" : "collapsed"}
                    style={{ transformOrigin: "50% 50%" }}
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <Link
                  aria-current={!course ? "page" : undefined}
                  href={`/material/${theme.repo}/${theme.id}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  {theme.name}
                </Link>
                {showNavDiagram && itemHovered === "course" && (
                  <NavDiagramPopover
                    material={material}
                    theme={theme}
                    excludes={excludes}
                    target={ref2?.current || undefined}
                    onMouseEnter={handlePopoverHovered}
                    onMouseLeave={handlePopoverNotHovered}
                  />
                )}
              </div>
            </li>
          )}{" "}
          {theme && course && (
            <li ref={ref3} onMouseEnter={() => handleIsHovered("section")} onMouseLeave={handleIsNotHovered}>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    className={showNavDiagram && itemHovered === "section" ? "expanded" : "collapsed"}
                    style={{ transformOrigin: "50% 50%" }}
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <Link
                  aria-current={!section ? "page" : undefined}
                  href={`/material/${theme.repo}/${theme.id}/${course.id}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white"
                >
                  {course.name}
                </Link>
                {showNavDiagram && itemHovered === "section" && (
                  <NavDiagramPopover
                    material={material}
                    theme={theme}
                    course={course}
                    excludes={excludes}
                    target={ref3?.current || undefined}
                    onMouseEnter={handlePopoverHovered}
                    onMouseLeave={handlePopoverNotHovered}
                  />
                )}
              </div>
            </li>
          )}{" "}
          {section && (
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  {section.name}
                </span>
              </div>
            </li>
          )}
        </ol>
      </nav>
      <ul aria-label="Page tools" className="gap-1 relative flex list-none items-center">
        {theme && course && section && (
          <li className="inline-flex">
            <Link
              passHref={true}
              href={`${repoUrl}/edit/main/${theme.id}/${course.id}/${section.id}.md`}
              className="text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <Tooltip content="Edit Source">
                <RxGithubLogo
                  role="img"
                  aria-label="Edit Source"
                  className="m-0 pointer-events-auto cursor-pointer w-8 h-8 text-gray-500 hover:text-gray-400"
                />
              </Tooltip>
            </Link>
          </li>
        )}
        {enableSearch && (
          <li>
            <Tooltip content="Search Material">
              <button
                aria-label="Search Material"
                onClick={openSearch}
                style={{
                  appearance: "none",
                  display: "flex",
                }}
              >
                <HiSearchCircle
                  style={{ verticalAlign: "bottom'" }}
                  className="pointer-events-auto cursor-pointer w-10 h-10 text-gray-500 hover:text-gray-400"
                />
              </button>
            </Tooltip>
          </li>
        )}

        <li aria-label={session ? session.user?.name || "Account details" : "Sign in"}>
          <Dropdown
            label={
              <span className="inline-flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white w-10 h-10">
                {session ? (
                  <Avatar
                    role="img"
                    img={session.user?.image ? session.user?.image : undefined}
                    className="w-8 h-8"
                    size="sm"
                    rounded={true}
                    data-cy={`avatar-${session.user?.email}`}
                  />
                ) : (
                  <Avatar role="img" className="w-8 h-8" size="sm" rounded={true} data-cy={`avatar-not-signed-in`} />
                )}
              </span>
            }
            arrowIcon={false}
            inline={true}
          >
            {session ? (
              <Dropdown.Header>
                <Link href="/profile">
                  <span className="block text-sm">{session.user?.name}</span>
                  <span className="block truncate text-sm font-medium">{session.user?.email}</span>
                </Link>
              </Dropdown.Header>
            ) : (
              <Dropdown.Header>
                <>
                  <div className="w-24 text-sm">Not signed in</div>
                </>
              </Dropdown.Header>
            )}

            {session ? (
              <Dropdown.Item onClick={handleSignout}>Sign out</Dropdown.Item>
            ) : (
              <Dropdown.Item onClick={handleSignin}>Sign in</Dropdown.Item>
            )}
          </Dropdown>
        </li>
        <li className="h-full border-l border-gray-500 ps-1">
          <Tooltip content="Licensing and Attribution">
            <button
              aria-label="Licensing and Attribution"
              onClick={openAttribution}
              style={{
                appearance: "none",
                display: "flex",
              }}
            >
              <HiAtSymbol className="pointer-events-auto cursor-pointer w-10 h-10 text-gray-500 hover:text-gray-400" />
            </button>
          </Tooltip>
        </li>
      </ul>
    </div>
  )
}

export default Navbar
