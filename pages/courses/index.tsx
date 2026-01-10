import type { NextPage, GetServerSideProps } from "next"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Card } from "flowbite-react"
import { Prisma } from "@prisma/client"
import CourseGrid from "components/courses/CourseGrid"

type Course = Prisma.CourseGetPayload<{}>

type CoursesProps = {
  material: Material
  courses: Course[]
  pageInfo: PageTemplate
}

const Courses: NextPage<CoursesProps> = ({ material, courses, pageInfo }) => {
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`Courses: ${pageInfo.title}`}>
      <Title text="Courses" className="text-3xl font-bold text-center p-3" style={{ marginBottom: "0px" }} />
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        {courses.length === 0 ? (
          <Card>
            <p className="text-gray-700 dark:text-gray-300">No courses are available yet.</p>
          </Card>
        ) : (
          <CourseGrid courses={courses} />
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const pageInfo = loadPageTemplate()
  let material = await getMaterial()
  removeMarkdown(material, material)

  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return {
    props: makeSerializable({ material, courses, pageInfo }),
  }
}

export default Courses
