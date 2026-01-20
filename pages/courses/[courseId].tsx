import type { NextPage, GetServerSideProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown, sectionSplit } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Prisma } from "@prisma/client"
import Link from "next/link"
import { Card, Badge } from "flowbite-react"
import CourseLevelBadge from "components/courses/CourseLevelBadge"

type CourseFull = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
  }
}>

type CourseDetailProps = {
  material: Material
  course: CourseFull
  pageInfo: PageTemplate
}

const CourseDetail: NextPage<CourseDetailProps> = ({ material, course, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`${course.name}: ${pageInfo.title}`}>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <Title text={course.name || "Untitled course"} className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CourseLevelBadge level={course.level} />
          {course.tags.map((tag) => (
            <Badge key={tag} color="gray">
              {tag}
            </Badge>
          ))}
        </div>
        {course.summary && <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{course.summary}</p>}
        {course.outcomes.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Outcomes:</span>{" "}
            {course.outcomes.join(", ")}
          </div>
        )}
        {course.prerequisites.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Prerequisites:</span>{" "}
            {course.prerequisites.join(", ")}
          </div>
        )}
      </div>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {course.CourseGroup
            .sort((a, b) => a.order - b.order)
            .map((group) => (
              <Card key={group.id}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name || "Untitled group"}</h2>
                {group.summary && <p className="text-gray-700 dark:text-gray-300">{group.summary}</p>}
                <ul className="mt-2 space-y-1">
                  {group.CourseItem.sort((a, b) => a.order - b.order).map((item) => {
                    const { section, course: matCourse, theme, url } = sectionSplit(item.section, material)
                    const label = section?.name || matCourse?.name || theme?.name || item.section
                    return (
                      <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                        {url ? (
                          <Link href={url} className="hover:underline">
                            {label}
                          </Link>
                        ) : (
                          label
                        )}
                      </li>
                    )
                  })}
                </ul>
              </Card>
            ))}
          {course.CourseItem.filter((item) => item.groupId == null).length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ungrouped</h2>
              <ul className="mt-2 space-y-1">
                {course.CourseItem.filter((item) => item.groupId == null)
                  .sort((a, b) => a.order - b.order)
                  .map((item) => {
                    const { section, course: matCourse, theme, url } = sectionSplit(item.section, material)
                    const label = section?.name || matCourse?.name || theme?.name || item.section
                    return (
                      <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                        {url ? (
                          <Link href={url} className="hover:underline">
                            {label}
                          </Link>
                        ) : (
                          label
                        )}
                      </li>
                    )
                  })}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageInfo = loadPageTemplate()
  const courseId = parseInt(context?.params?.courseId as string, 10)

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      CourseGroup: { include: { CourseItem: true } },
      CourseItem: true,
    },
  })

  if (!course || course.hidden) {
    return { notFound: true }
  }

  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, course, pageInfo }),
  }
}

export default CourseDetail
