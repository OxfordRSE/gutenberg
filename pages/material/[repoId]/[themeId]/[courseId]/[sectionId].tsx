import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import {
  getMaterial,
  Course,
  Theme,
  Material,
  Section,
  removeMarkdown,
  getRepoUrl,
  getExcludes,
  Excludes,
} from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import Title from "components/ui/Title"
import { Event } from "lib/types"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"
import excludeVariablesFromRoot from "@mui/material/styles/excludeVariablesFromRoot"

type SectionComponentProps = {
  theme: Theme
  course: Course
  section: Section
  material: Material
  events: Event[]
  pageInfo?: PageTemplate
  repoUrl?: string
  excludes?: Excludes
}

const SectionComponent: NextPage<SectionComponentProps> = ({
  theme,
  course,
  section,
  events,
  material,
  pageInfo,
  repoUrl,
  excludes,
}: SectionComponentProps) => {
  return (
    <Layout
      theme={theme}
      course={course}
      section={section}
      material={material}
      pageInfo={pageInfo}
      repoUrl={repoUrl}
      excludes={excludes}
    >
      <Title text={section.name} />
      <Content markdown={section.markdown} theme={theme} course={course} section={section} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const material = await getMaterial()
  let paths = []
  for (const theme of material.themes) {
    for (const course of theme.courses) {
      for (const section of course.sections) {
        paths.push({
          params: {
            repoId: `${theme.repo}`,
            themeId: `${theme.id}`,
            courseId: `${course.id}`,
            sectionId: `${section.id}`,
          },
        })
      }
    }
  }
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
  const repoId = context?.params?.repoId
  const excludes = getExcludes(repoId as string)
  const repoUrl = getRepoUrl(repoId as string)
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
  const sectionId = context?.params?.sectionId
  if (!sectionId || Array.isArray(sectionId)) {
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
  const section = course.sections.find((s) => s.id === sectionId)
  if (!section) {
    return { notFound: true }
  }
  removeMarkdown(material, section)
  return { props: makeSerializable({ theme, course, section, events, material, pageInfo, repoUrl }) }
}

export default SectionComponent
