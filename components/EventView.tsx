import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import Title from 'components/Title'
import { Button, Timeline } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { MdClose } from 'react-icons/md'
import Link from 'next/link';

type EventsProps = {
  material: Material,
  event: EventFull, 
}

const EventView: React.FC<EventsProps> = ({ material, event }) => {

  for (let i = 0; i < event.EventGroup.length; i++) {
    event.EventGroup[i].start = new Date(event.EventGroup[i].start)
    event.EventGroup[i].end = new Date(event.EventGroup[i].end)
    event.EventGroup[i].EventItem.sort((a, b) => {
      return a.order - b.order
    })
  }
  event.EventGroup.sort((a, b) => {
    return a.start > b.start ? 1 : -1
  });



  return (
    <div>
      <a href={`${basePath}/event/${event.id}`} className="w-full text-2xl text-gray-800 dark:text-gray-300 font-bold hover:underline" >
        {event.name}
      </a>
      <p className="mb-3 text-lg font-normal text-gray-700 dark:text-gray-400">
        <span className="font-bold">Description:</span> {event.summary}
      </p>
      <Timeline>
      {event.EventGroup.map((group) => (
      <Timeline.Item key={group.id}>
        <Timeline.Point />
        <Timeline.Content>
          <Timeline.Time>
            {new Date(group.start).toUTCString()}
          </Timeline.Time>
          <Timeline.Title>
            <a href={`${basePath}/event/${event.id}/${group.id}`}  className="font-bold text-gray-800 dark:text-gray-300 hover:underline">
              {group.name}
            </a>
          </Timeline.Title>
          <Timeline.Body>
            <div className="ml-5">
            <p className="text-gray-700 dark:text-gray-400"><span className="font-bold">Description:</span> {group.summary}</p>
            <p className="text-gray-700 dark:text-gray-400"><span className="font-bold">Location:</span> {group.location}</p>
            {group.EventItem.length > 0 && (
            <>
            <p><span className="font-bold">Material:</span></p>
            <div className="flex">
            <ul>
            {group.EventItem.map((item) => {
              const split = item.section.split('.')
              let url = ''
              let name = `Error: ${item.section}`
              let key = item.id
              let indent = 0

              if (split.length === 3) {
                const [theme, course, section] = split;
                const themeData = material.themes.find((t) => t.id === theme)
                const courseData = themeData?.courses.find((c) => c.id === course)
                const sectionData = courseData?.sections.find((s) => s.id === section)
                url = `${basePath}/material/${theme}/${course}/${section}`
                name = sectionData?.name || `Error: ${item.section}`
                indent = 6 
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
              return  (
                <li key={key} className={`ml-${indent}`} >
                  <a href={url} className="hover:underline">{name}</a>
                </li>
              )
            })}
            </ul>
            </div>
            </>
            )}
            </div>
          </Timeline.Body>
        </Timeline.Content>
      </Timeline.Item>
      ))}
      </Timeline>
    </div>
  )
}

export default EventView
