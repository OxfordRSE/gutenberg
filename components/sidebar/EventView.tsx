import React from "react"
import { Material } from "lib/material"
import { EventFull, Event, Problem } from "lib/types"
import useSWR, { Fetcher } from "swr"
import { Timeline } from "flowbite-react"
import { basePath } from "lib/basePath"
import EventItemView from "components/sidebar/EventItemView"
import Link from "next/link"

type EventsProps = {
  material: Material
  event: EventFull
}

type Data = {
  problems: Problem[]
}

const problemsFetcher: Fetcher<Data, string> = (url) => fetch(url).then((r) => r.json())

const EventView: React.FC<EventsProps> = ({ material, event }) => {
  type EventGroupWithItems = EventFull["EventGroup"][number]
  type EventItem = EventGroupWithItems["EventItem"][number]

  const { data, error, mutate } = useSWR(`${basePath}/api/event/${event.id}/problems`, problemsFetcher)
  const problems = data?.problems

  for (let i = 0; i < event.EventGroup.length; i++) {
    event.EventGroup[i].start = new Date(event.EventGroup[i].start)
    event.EventGroup[i].end = new Date(event.EventGroup[i].end)
    event.EventGroup[i].EventItem.sort((a: EventItem, b: EventItem) => {
      return a.order - b.order
    })
  }
  event.EventGroup.sort((a: EventGroupWithItems, b: EventGroupWithItems) => {
    return a.start > b.start ? 1 : -1
  })

  return (
    <div>
      <Link
        href={`${basePath}/event/${event.id}`}
        className="w-full text-2xl text-gray-800 dark:text-gray-300 font-bold hover:underline"
      >
        {event.name}
      </Link>
      <p className="mb-3 text-lg font-normal text-gray-700 dark:text-gray-400">{event.summary}</p>
      <Timeline>
        {event.EventGroup.map((group: EventGroupWithItems) => (
          <Timeline.Item key={group.id}>
            <Timeline.Point />
            <Timeline.Content>
              <Timeline.Title>
                <Link
                  href={`${basePath}/event/${event.id}/${group.id}`}
                  className="font-bold text-gray-800 dark:text-gray-300 hover:underline"
                >
                  {group.name}
                </Link>
              </Timeline.Title>
              <Timeline.Time>
                {new Date(group.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </Timeline.Time>
              <Timeline.Body>
                <p className="text-gray-700 dark:text-gray-400">{group.summary}</p>
                <p className="text-gray-700 dark:text-gray-400">{group.location}</p>
                {group.EventItem.length > 0 && (
                  <div className="flex">
                    <ul>
                      {group.EventItem.map((item: EventItem) => (
                        <EventItemView key={item.id} item={item} material={material} problems={problems} />
                      ))}
                    </ul>
                  </div>
                )}
              </Timeline.Body>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  )
}

export default EventView
