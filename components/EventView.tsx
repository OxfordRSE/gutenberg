import React from "react"
import { HiArrowNarrowRight } from "react-icons/hi"
import { Material } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import useSWR, { Fetcher } from "swr"
import Title from "components/ui/Title"
import { Button, Timeline } from "flowbite-react"
import { ListGroup } from "flowbite-react"
import { basePath } from "lib/basePath"
import { MdClose } from "react-icons/md"
import Link from "next/link"
import EventItemView from "./EventItemView"

type EventsProps = {
  material: Material
  event: EventFull
}

type Data = {
  problems: Problem[]
}

const problemsFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

const EventView: React.FC<EventsProps> = ({ material, event }) => {
  const { data, error, mutate } = useSWR(`${basePath}/api/event/${event.id}/problems`, problemsFetcher)
  const problems = data?.problems

  for (let i = 0; i < event.EventGroup.length; i++) {
    event.EventGroup[i].start = new Date(event.EventGroup[i].start)
    event.EventGroup[i].end = new Date(event.EventGroup[i].end)
    event.EventGroup[i].EventItem.sort((a, b) => {
      return a.order - b.order
    })
  }
  event.EventGroup.sort((a, b) => {
    return a.start > b.start ? 1 : -1
  })

  return (
    <div>
      <a
        href={`${basePath}/event/${event.id}`}
        className="w-full text-2xl text-gray-800 dark:text-gray-300 font-bold hover:underline"
      >
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
                {new Date(group.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </Timeline.Time>
              <Timeline.Title>
                <a
                  href={`${basePath}/event/${event.id}/${group.id}`}
                  className="font-bold text-gray-800 dark:text-gray-300 hover:underline"
                >
                  {group.name}
                </a>
              </Timeline.Title>
              <Timeline.Body>
                <div className="ml-5">
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Description:</span> {group.summary}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">
                    <span className="font-bold">Location:</span> {group.location}
                  </p>
                  {group.EventItem.length > 0 && (
                    <>
                      <p>
                        <span className="font-bold">Material:</span>
                      </p>
                      <div className="flex">
                        <ul>
                          {group.EventItem.map((item) => (
                            <EventItemView key={item.id} item={item} material={material} problems={problems} />
                          ))}
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
