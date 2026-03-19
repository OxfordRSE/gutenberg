import React from "react"
import Link from "next/link"
import useSWR, { Fetcher } from "swr"
import { Timeline } from "flowbite-react"
import { Material } from "lib/material"
import { basePath } from "lib/basePath"
import CourseSectionLink from "components/courses/CourseSectionLink"
import type { Data } from "pages/api/course/by-external/[externalId]"

type Props = {
  material: Material
  externalId: string
}

const courseFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

const CourseView: React.FC<Props> = ({ material, externalId }) => {
  const { data } = useSWR(`${basePath}/api/course/by-external/${externalId}`, courseFetcher)
  const course = data?.course

  if (!course) {
    return (
      <div data-cy="course-sidebar-view" className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading course...
      </div>
    )
  }

  return (
    <div data-cy="course-sidebar-view">
      <Link
        href={`${basePath}/courses/${course.id}`}
        className="w-full text-2xl font-bold text-gray-800 hover:underline dark:text-gray-300"
      >
        {course.name}
      </Link>
      {course.summary && (
        <p className="mb-3 text-lg font-normal text-gray-700 dark:text-gray-400">
          <span className="font-bold">Description:</span> {course.summary}
        </p>
      )}

      {course.CourseGroup.length > 0 ? (
        <Timeline>
          {course.CourseGroup.map((group) => (
            <Timeline.Item key={group.id}>
              <Timeline.Point />
              <Timeline.Content>
                <Timeline.Title>{group.name}</Timeline.Title>
                <Timeline.Body>
                  {group.summary && <p className="text-gray-700 dark:text-gray-400">{group.summary}</p>}
                  {group.CourseItem.length > 0 && (
                    <ul className="ml-4 mt-2 list-disc space-y-1">
                      {group.CourseItem.map((item) => (
                        <li key={item.id}>
                          <CourseSectionLink material={material} sectionRef={item.section} depth="section" />
                        </li>
                      ))}
                    </ul>
                  )}
                </Timeline.Body>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : course.CourseItem.length > 0 ? (
        <div className="mt-3">
          <p className="font-bold text-gray-800 dark:text-gray-300">Material</p>
          <ul className="ml-4 mt-2 list-disc space-y-1">
            {course.CourseItem.map((item) => (
              <li key={item.id}>
                <CourseSectionLink material={material} sectionRef={item.section} depth="section" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">No course material is linked yet.</div>
      )}
    </div>
  )
}

export default CourseView
