import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event, Problem } from 'lib/types'
import useSWR, { Fetcher } from 'swr'
import Title from 'components/Title'
import { Button, Timeline } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { MdClose } from 'react-icons/md'
import Link from 'next/link';
import { EventItem } from '@prisma/client';

type EventItemProps = {
  material: Material,
  event: EventFull, 
  item: EventItem,
  problems: Problem[] | undefined,
}


const EventView: React.FC<EventItemProps> = ({ material, event, item, problems }) => {
  const split = item.section.split('.')
  let url = ''
  let name = `Error: ${item.section}`
  let key = item.id
  let indent = 0

  let itemProblems: string[] = []
  if (split.length === 3) {
    const [theme, course, section] = split;
    const themeData = material.themes.find((t) => t.id === theme)
    const courseData = themeData?.courses.find((c) => c.id === course)
    const sectionData = courseData?.sections.find((s) => s.id === section)
    url = `${basePath}/material/${theme}/${course}/${section}`
    name = sectionData?.name || `Error: ${item.section}`
    indent = 6 
    itemProblems = sectionData?.problems || []
  } else if (split.length === 2) {
    const [theme, course] = split;
    const themeData = material.themes.find((t) => t.id === theme)
    const courseData = themeData?.courses.find((c) => c.id === course)
    url = `${basePath}/material/${theme}/${course}`
    name = courseData?.name || `Error: ${item.section}`
    indent = 4
  } else if (split.length === 1) {
    const [theme] = split;
    const themeData = material.themes.find((t) => t.id === theme)
    url = `${basePath}/material/${theme}`
    name = themeData?.name || `Error: ${item.section}`
    indent = 2
  }
  let isCompleted = false;
  let completedLabel = '';
  if (problems !== undefined && itemProblems.length > 0) {
    const completedProblems = problems.filter((p) => p.section === item.section && itemProblems.includes(p.tag) && p.complete);
    completedLabel = `[${completedProblems.length}/${itemProblems.length}]`;
    isCompleted = completedProblems.length === itemProblems.length;
  }


  return (
    <li key={key} className={`${isCompleted ? "text-green-500" : "text-inherit"} ml-${indent}`} >
        {completedLabel} <a href={url} className={`hover:underline`}>{name}</a>
    </li>
  )
}

export default EventView
