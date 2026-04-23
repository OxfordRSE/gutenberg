import type { NextPage, GetStaticProps } from "next"
import React from "react"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import { Material, getMaterial, removeMarkdown } from "lib/material"
import { Event } from "lib/types"
import { loadPageTemplate, PageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import Title from "components/ui/Title"
import type { Course } from "pages/api/course"
import HomeCoursesPanel from "components/home/HomeCoursesPanel"
import HomeEventsPanel from "components/home/HomeEventsPanel"
import HomeCourseMaterialPanel from "components/home/HomeCourseMaterialPanel"
import { hasBuildDatabase, runBuildPrismaQuery } from "lib/buildPrisma"

type HomeProps = {
  material: Material
  events: Event[]
  courses: Course[]
  pageInfo: PageTemplate
}

const Home: NextPage<HomeProps> = ({ material, events, courses, pageInfo }) => {
  const intro = pageInfo.frontpage.intro
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={pageInfo.title}>
      <div className="flex items-center justify-center gap-3 p-3">
        {/* Using img instead of next/image due to unknown aspect ratio */}
        <img src={pageInfo.logo.src} alt={pageInfo.logo.alt} className="h-10 w-auto" />
        <Title text={pageInfo.title} className="text-3xl font-bold text-center" style={{ marginBottom: "0px" }} />
      </div>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32 grid grid-cols-1 gap-4 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <HomeEventsPanel events={events} />
          <HomeCoursesPanel initialCourses={courses} />
        </div>
        <HomeCourseMaterialPanel intro={intro} />
      </div>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const pageInfo = loadPageTemplate()

  let material = await getMaterial()
  removeMarkdown(material, material)

  if (!hasBuildDatabase()) {
    return {
      props: {
        material: makeSerializable(material),
        events: [],
        courses: [],
        pageInfo: makeSerializable(pageInfo),
      },
      revalidate: revalidateTimeout,
    }
  }

  const events = await runBuildPrismaQuery("pages/index.tsx events", [], (prisma) =>
    prisma.event.findMany({
      where: { hidden: false },
    })
  )

  const courses = await runBuildPrismaQuery("pages/index.tsx courses", [], (prisma) =>
    prisma.course.findMany({
      where: { hidden: false },
    })
  ).then((courses) => courses.map((course) => ({ ...course, UserOnCourse: [] })))

  return {
    props: {
      material: makeSerializable(material),
      events: makeSerializable(events),
      courses: makeSerializable(courses),
      pageInfo: makeSerializable(pageInfo),
    },
    revalidate: revalidateTimeout,
  }
}

export default Home
