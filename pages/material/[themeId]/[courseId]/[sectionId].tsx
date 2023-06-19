import type { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import prisma from 'lib/prisma'
import { getMaterial, Course, Theme, Material, Section, remove_markdown } from 'lib/material'
import Layout from 'components/Layout'
import { makeSerializable } from 'lib/utils'
import Content from 'components/Content'
import Title from 'components/Title'
import { Event, EventFull } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import { basePath } from 'lib/basePath'
import { useActiveEvent } from 'lib/hooks'
import { HiArrowCircleRight, HiAtSymbol } from 'react-icons/hi'
import { HiArrowCircleLeft } from 'react-icons/hi'
import { Tooltip } from 'flowbite-react'
import Link from 'next/link'
import AttributionDialog from 'components/AttributionDialog'
import { useEffect, useState } from 'react'

type SectionComponentProps = {
  theme: Theme, 
  course: Course,
  section: Section,
  material: Material,
  events: Event[],
}

const myEventsFetcher: Fetcher<EventFull[], string> = url => fetch(url).then(r => r.json())

const SectionComponent: NextPage<SectionComponentProps> = ({theme, course, section, events, material}: SectionComponentProps) => {
  const { data: myEvents, error } = useSWR(`${basePath}/api/eventFull`, myEventsFetcher)
  const [activeEvent , setActiveEvent] = useActiveEvent(myEvents ? myEvents : [])

  const [showAttribution, setShowAttribution] = useState(false)
  const openAttribution = () => setShowAttribution(true)
  const closeAttribution = () => setShowAttribution(false)


  // check if this section is part of the active event
  let isInEvent = false;
  let prevUrl = null;
  let nextUrl = null;
  if (activeEvent) {
    for (const group of activeEvent.EventGroup) {
      for (let i = 0; i < group.EventItem.length; i++) {
        const item = group.EventItem[i];
        if (item.section == `${theme.id}.${course.id}.${section.id}`) {
          isInEvent = true
          if (i > 0) {
            const prevItem = group.EventItem[i - 1];
            prevUrl = prevItem.section.replaceAll('.', '/')
          }
          if (i < group.EventItem.length - 1) {
            const nextItem = group.EventItem[i + 1];
            nextUrl = nextItem.section.replaceAll('.', '/')
          }
        }
      }
    }
  }

  return (
    <Layout theme={theme} course={course} section={section} material={material} activeEvent={activeEvent}>
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
