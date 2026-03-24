import React, { useState } from "react"
import Link from "next/link"
import { useMyEvents } from "lib/hooks/useMyEvents"
import useActiveEvent from "lib/hooks/useActiveEvents"
import useActiveCourse from "lib/hooks/useActiveCourse"
import useLearningContext from "lib/hooks/useLearningContext"
import { CheckCircle } from "@mui/icons-material"
import { Box } from "@mui/material"
import { HiSwitchHorizontal } from "react-icons/hi"
import { GoArrowRight } from "react-icons/go"
import { PageTemplate } from "lib/pageTemplate"
import useSWR, { Fetcher } from "swr"
import { basePath } from "lib/basePath"
import type { Course, Data as CoursesData } from "pages/api/course"
import { CourseStatus } from "@prisma/client"

const coursesFetcher: Fetcher<CoursesData, string> = (url) => fetch(url).then((r) => r.json())

interface EventSwitcherProps {
  pageInfo: PageTemplate
}

const EventSwitcher: React.FC<EventSwitcherProps> = ({ pageInfo }) => {
  const [editMode, setEditMode] = useState(false)
  const { events, isLoading } = useMyEvents()
  const [activeEvent, setActiveEvent] = useActiveEvent()
  const [activeCourseId, setActiveCourseId] = useActiveCourse()
  const [learningContext, setLearningContext] = useLearningContext()
  const { data: coursesData, isLoading: isCoursesLoading } = useSWR(`${basePath}/api/course`, coursesFetcher)

  const myCourses =
    coursesData?.courses?.filter((course) => {
      const status = course.UserOnCourse?.[0]?.status
      return status === CourseStatus.ENROLLED || status === CourseStatus.COMPLETED
    }) ?? []
  const activeCourse = myCourses.find((course) => course.externalId === activeCourseId)
  const currentContextLabel =
    learningContext?.type === "event" && activeEvent
      ? activeEvent.name
      : learningContext?.type === "course" && activeCourse
        ? activeCourse.name
        : "No active learning context"
  const buttonTargetLabel = learningContext?.type === "event" ? "Event" : "Course"

  if (isLoading || isCoursesLoading || !events || !coursesData?.courses) return null

  return (
    <Box
      component="section"
      aria-label="Active learning context selection"
      className="px-3 py-2 pr-12 border-b border-gray-300 dark:border-gray-600"
    >
      {editMode ? (
        <div className="space-y-4" data-cy="learning-context-options">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Events
            </div>
            <div className="mt-2 space-y-2">
              {events.length > 0 ? (
                <>
                  {events.map((event) => {
                    const isSelected = learningContext?.type === "event" && learningContext.id === event.id
                    const date = new Date(event.start).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })

                    return (
                      <button
                        key={event.id}
                        type="button"
                        data-cy={`context-event-option-${event.id}`}
                        onClick={() => {
                          setActiveEvent(event)
                          setLearningContext({ type: "event", id: event.id })
                          setEditMode(false)
                        }}
                        className="flex w-full items-center justify-between rounded border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <span className="truncate">
                          {event.name} - {date}
                        </span>
                        {isSelected && <CheckCircle className="ml-2 text-green-500" fontSize="small" />}
                      </button>
                    )
                  })}
                </>
              ) : (
                <Link href="/events" className="text-sm text-blue-600 hover:underline">
                  Browse events
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Courses
            </div>
            <div className="mt-2 space-y-2">
              {myCourses.length > 0 ? (
                <>
                  {myCourses.map((course) => {
                    const isSelected =
                      learningContext?.type === "course" && learningContext.externalId === course.externalId
                    return (
                      <button
                        key={course.id}
                        type="button"
                        data-cy={`context-course-option-${course.id}`}
                        onClick={() => {
                          setActiveCourseId(course.externalId)
                          setLearningContext({ type: "course", externalId: course.externalId })
                          setEditMode(false)
                        }}
                        className="flex w-full items-center justify-between rounded border border-gray-200 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <span className="truncate">{course.name}</span>
                        {isSelected && <CheckCircle className="ml-2 text-green-500" fontSize="small" />}
                      </button>
                    )
                  })}
                </>
              ) : (
                <Link href="/courses" data-cy="browse-courses-link" className="text-sm text-blue-600 hover:underline">
                  Browse courses
                </Link>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              data-cy="clear-learning-context"
              onClick={() => {
                setLearningContext(undefined)
                setEditMode(false)
              }}
              className="w-full rounded border border-dashed border-gray-300 px-3 py-2 text-left text-sm italic text-gray-500 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Set no active context
            </button>
          </div>
        </div>
      ) : (
        <Box className="flex items-center w-full">
          <button
            type="button"
            data-cy="toggle-learning-context"
            onClick={() => setEditMode(true)}
            aria-label={`Change ${buttonTargetLabel.toLowerCase()}`}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {learningContext ? (
              <HiSwitchHorizontal className="w-5 h-5 flex-shrink-0" />
            ) : (
              <GoArrowRight className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="flex flex-col text-xs text-left leading-tight">
              <span>Change</span>
              <span>{buttonTargetLabel}</span>
            </span>
          </button>
          <div className="flex-1 px-3">
            <div className="truncate text-sm text-gray-800 dark:text-gray-200" data-cy="learning-context-summary">
              {currentContextLabel}
            </div>
          </div>
          <div className="flex justify-end">
            <Link href="/" className="hover:opacity-80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pageInfo.logo.src} alt={pageInfo.logo.alt} className="h-8 w-auto" />
            </Link>
          </div>
        </Box>
      )}
    </Box>
  )
}

export default EventSwitcher
