import { Avatar, Dropdown } from 'flowbite-react'
import { Course, Material, Section, Theme } from 'lib/material'
import { Event, EventFull } from 'lib/types'
import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'
import { HiAtSymbol, HiCalendar } from 'react-icons/hi'

interface Props {
  material: Material,
  theme?: Theme,
  course?: Course,
  section?: Section,
  events: Event[],
  activeEvent: EventFull | undefined
  setShowAttribution: (show: boolean) => void
  setSidebarOpen: (open: boolean) => void
  sidebarOpen: boolean
  showAttribution: boolean
}

const Navbar: React.FC<Props> = ({ theme, course, section, material, activeEvent, setShowAttribution, setSidebarOpen, sidebarOpen, showAttribution }) => {
  const { data: session } = useSession()

  const openAttribution = () => {
    setShowAttribution(true)
  }

  const handleToggle= () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  const handleSignout = () => {
    signOut();
  }
  
  const handleSignin = () => {
    signIn();
  }
  
  return (
    <nav className="z-10 flex px-5 py-3 mt-1 mb-5 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700" aria-label="Breadcrumb">
      <ol className="z-10 list-none inline-flex items-center w-full space-x-1 md:space-x-3">
        { activeEvent && (
          <>
            <HiCalendar className="pointer-events-auto cursor-pointer text-gray-500 hover:text-gray-400 w-10 h-10" onClick={handleToggle} />
            <div className="h-full border-r border-gray-500"></div>
          </>
        )}
        <li className="inline-flex items-center">
          <Link href="/">
            <a className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
              Home
            </a>
          </Link>
        </li>
        {theme && 
          <li>
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
              <Link href={`/material/${theme.id}`}>
                <a className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white">
                  {theme.name}
                </a>
              </Link>
            </div>
          </li>
        } {course && 
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
              <Link href={`/material/${theme?.id}/${course.id}`}>
                <a className="ml-1 text-sm font-medium text-gray-700 hover:text-gray-900 md:ml-2 dark:text-gray-400 dark:hover:text-white">
                  {course.name}
                </a>
              </Link>
            </div>
          </li>
        } { section && 
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                {section.name}
              </span>
            </div>
          </li>
        }
      </ol>
      <div className="relative flex items-center">
        <div className="mr-2 h-full border-r border-gray-500"></div>
        <HiAtSymbol onClick={openAttribution} className="pointer-events-auto cursor-pointer w-10 h-10 text-gray-500 hover:text-gray-400"/>
        <Dropdown
          label={
          <div className="inline-flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            {session ? (
              <Avatar
                  img={session.user?.image ? session.user?.image : undefined}
                  rounded={true}
                  size="sm"
                />
              
            ) : (
              <Avatar
                  rounded={true}
                  size="sm"
                />

            )
          }
          </div>
          }
          arrowIcon={false}
          inline={true}
        >
          { session ? (
          <Dropdown.Header>
              <>
              <span className="block text-sm">
                {session.user?.name}
              </span>
              <span className="block truncate text-sm font-medium">
                {session.user?.email}
              </span>
              </>
          </Dropdown.Header>
          ) : (
          <Dropdown.Header>
              <>
              <div className="w-24 text-sm">
                Not signed in 
              </div>
              </>
          </Dropdown.Header>
          )}
        
          { session ? (
            <Dropdown.Item onClick={handleSignout}>
              Sign out
            </Dropdown.Item>
            ) : (
            <Dropdown.Item onClick={handleSignin}>
              Sign in 
            </Dropdown.Item>
            )}
        </Dropdown>
      </div>
      </nav>
  )
}

export default Navbar;

