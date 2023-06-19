import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Course, Theme, Material, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import { remove } from 'cypress/types/lodash'
import Content from 'components/Content'
import NavDiagram from 'components/NavDiagram'
import Title from 'components/Title'
import { Event, EventFull } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import { useActiveEvent } from 'lib/hooks'

type CourseComponentProps = {
  theme: Theme, 
  course: Course,
  material: Material,
  events: Event[],
}

const myEventsFetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const CourseComponent: NextPage<CourseComponentProps> = ({theme, course, material, events}: CourseComponentProps) => {

  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])

  return (
    <Layout theme={theme} course={course} events={events} material={material} activeEvent={activeEvent}>
      <Title text={course.name} />
      <NavDiagram material={material} theme={theme} course={course} />
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
        params: { themeId: `${theme.id}`, courseId: `${course.id}`}
      })
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
  const material = await getMaterial()
  const theme = material.themes.find(t => t.id === themeId);
  if (!theme) {
    return { notFound: true }
  }
  const course = theme.courses.find(c => c.id === courseId);
  if (!course) {
    return { notFound: true }
  }
  remove_markdown(material, course);
  return { props: makeSerializable({ theme, course, material, events }) }
}

export default CourseComponent 
