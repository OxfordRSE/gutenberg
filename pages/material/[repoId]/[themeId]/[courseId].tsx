import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Course, Theme, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import Title from "components/ui/Title"
import { Event } from "lib/types"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import CourseGrid from "components/navdiagram/CourseGrid"
import LearningOutcomes from "components/content/LearningOutcomes"
import Link from "next/link"
import SubTitle from "components/ui/SubTitle"

type CourseComponentProps = {
  theme: Theme
  course: Course
  material: Material
  events: Event[]
  pageInfo: PageTemplate
}

const CourseComponent: NextPage<CourseComponentProps> = ({
  theme,
  course,
  material,
  events,
  pageInfo,
}: CourseComponentProps) => {
  const pageTitle = pageInfo?.title ? `${course.name}: ${pageInfo.title}` : course.name
  return (
    <Layout theme={theme} course={course} material={material} pageInfo={pageInfo} pageTitle={pageTitle}>
      <Title text={course.name} style={{ marginBottom: "0px" }} />
      <Link className="text-blue-500 italic" href={`/material/${theme.repo}/${theme.id}/${course.id}/diagram`}>
        <SubTitle text="View Course Diagram" />
      </Link>
      <LearningOutcomes learningOutcomes={course.learningOutcomes} />
      <CourseGrid course={course} theme={theme} />
      <Content markdown={course.markdown} theme={theme} course={course} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial()
  let paths = []
  for (const theme of material.themes) {
    for (const course of theme.courses) {
      paths.push({
        params: { repoId: `${theme.repo}`, themeId: `${theme.id}`, courseId: `${course.id}` },
      })
    }
  }
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = loadPageTemplate()
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => {
      return []
    })
  const themeId = context?.params?.themeId
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true }
  }
  const courseId = context?.params?.courseId
  if (!courseId || Array.isArray(courseId)) {
    return { notFound: true }
  }
  const material = await getMaterial()
  const theme = material.themes.find((t) => t.id === themeId)
  if (!theme) {
    return { notFound: true }
  }
  const course = theme.courses.find((c) => c.id === courseId)
  if (!course) {
    return { notFound: true }
  }
  removeMarkdown(material, course)
  return {
    props: makeSerializable({ theme, course, material, events, pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default CourseComponent
