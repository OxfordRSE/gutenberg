import React from 'react'
import { HiArrowNarrowRight } from 'react-icons/hi';
import { Material } from 'lib/material'
import { EventFull, Event } from 'lib/types'
import Title from 'components/Title'
import { Button, Timeline } from 'flowbite-react'
import { ListGroup } from 'flowbite-react';
import { basePath } from 'lib/basePath'
import { MdClose } from 'react-icons/md'

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
      <p className="mb-3 text-lg font-normal text-gray-500 dark:text-gray-400">
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
            {group.name}
          </Timeline.Title>
          <Timeline.Body>
            <div className="ml-5">
            <p><span className="font-bold">Description:</span> {group.summary}</p>
            <p><span className="font-bold">Location:</span> {group.location}</p>
            {group.EventItem.length > 0 && (
            <>
            <p><span className="font-bold">Material:</span></p>
            <div className="flex">
            <ListGroup className="ml-20">
            {group.EventItem.map((item) => {
              const split = item.section.split('.')
              if (split.length !== 3) {
                return  (
                  <ListGroup.Item key={item.id} href={item.section}>
                    Error:{item.section}
                  </ListGroup.Item>
                )
              }
              const [theme, course, section] = split;
              const url = `${basePath}/material/${theme}/${course}/${section}`
              const themeData = material.themes.find((t) => t.id === theme)
              const courseData = themeData?.courses.find((c) => c.id === course)
              const sectionData = courseData?.sections.find((s) => s.id === section)
              return (
               <ListGroup.Item href={url} key={item.id}>
                  {sectionData?.name}
                </ListGroup.Item>
              )
            })}
            </ListGroup>
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
