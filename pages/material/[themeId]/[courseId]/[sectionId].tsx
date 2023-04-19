import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Course, Theme, Material, Section, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import Content from 'components/Content'
import Title from 'components/Title'
import { Event } from 'lib/types'

type SectionComponentProps = {
  theme: Theme, 
  course: Course,
  section: Section,
  material: Material,
  events: Event[],
}

const SectionComponent: NextPage<SectionComponentProps> = ({theme, course, section, events, material}: SectionComponentProps) => {
  return (
    <Layout theme={theme} course={course} section={section} events={events} material={material}>
      <Title text={section.name} />
      <Content markdown={section.markdown} />
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
          params: { themeId: `${theme.id}`, courseId: `${course.id}`, sectionId: `${section.id}`}
        })
      }
    }
  }
  return {
    paths,
    fallback: false,
  };
}


export const getStaticProps: GetStaticProps = async (context) => {
  const events = await prisma.event.findMany().catch((e) => {
    console.log(e)
    return []
  });
  const themeId = context?.params?.themeId
  if (!themeId || Array.isArray(themeId)) {
    return { notFound: true }
  }
  const courseId = context?.params?.courseId
  if (!courseId || Array.isArray(courseId)) {
    return { notFound: true }
  }
  const sectionId = context?.params?.sectionId;
  if (!sectionId || Array.isArray(sectionId)) {
    return { notFound: true }
  }
  const material = await getMaterial()
  const theme = material.themes.find(t => t.id === themeId);
  if (!theme) {
    return { notFound: true }
  }
  const course = theme.courses.find(c => c.id === courseId);
  if (!course) {
    return { notFound: true }
  }
  const section = course.sections.find(s => s.id === sectionId);
  if (!section) {
    return { notFound: true }
  }
  remove_markdown(material, section);
  return { props: makeSerializable({ theme, course, section, events, material }) }
}

export default SectionComponent 
