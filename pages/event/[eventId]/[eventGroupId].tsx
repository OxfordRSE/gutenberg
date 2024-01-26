import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Theme, Material, remove_markdown, eventItemSplit } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import NavDiagram from "components/NavDiagram"
import Title from "components/ui/Title"
import { Event, EventFull } from "lib/types"
import { basePath } from "lib/basePath"
import Link from "next/link"
import useEventGroup from "lib/hooks/useEventGroup"
import useProfile from "lib/hooks/useProfile"
import { Button, Tabs } from "flowbite-react"
import { useFieldArray, useForm } from "react-hook-form"
import { EventGroup } from "pages/api/eventGroup/[eventGroupId]"
import { useEffect, useState } from "react"
import { putEventGroup } from "lib/actions/putEventGroup"
import Stack from "components/ui/Stack"
import Textfield from "components/forms/Textfield"
import Textarea from "components/forms/Textarea"
import { MdEdit, MdPreview } from "react-icons/md"
import DateTimeField from "components/forms/DateTimeField"
import SelectField from "components/forms/SelectField"
import IntegerField from "components/forms/IntegerField"
import SubTitle from "components/ui/SubTitle"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"

type EventGroupProps = {
  material: Material
  event: Event
  eventGroupId: number
  pageInfo?: PageTemplate
}

const EventGroupPage: NextPage<EventGroupProps> = ({ material, event, eventGroupId, pageInfo }) => {
  // don't show date/time until the page is loaded (due to rehydration issues)
  const [showDateTime, setShowDateTime] = useState(false)
  useEffect(() => {
    setShowDateTime(true)
  }, [])
  const {
    eventGroup,
    error: eventGroupError,
    isLoading: eventGroupIsLoading,
    mutate: mutateEventGroup,
  } = useEventGroup(eventGroupId)
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile()
  const isAdmin = userProfile?.admin
  const { control, handleSubmit, reset, setValue } = useForm<EventGroup>({ defaultValues: eventGroup })

  useEffect(() => {
    reset(eventGroup)
  }, [eventGroup, reset])

  const {
    fields: eventItems,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "EventItem",
  })

  const eventMapToIndex = eventItems.reduce(
    (acc, item, index) => {
      acc[item.id] = index
      return acc
    },
    {} as { [key: number]: number }
  )

  eventItems.sort((a, b) => a.order - b.order)

  const handleAddItem = () => {
    appendItem({
      id: 0,
      groupId: eventGroupId,
      order: eventItems.length,
      section: "",
    })
  }

  const handleRemoveItem = (index: number) => () => {
    removeItem(index)
  }

  const onSubmit = (data: EventGroup) => {
    putEventGroup(data).then((data) => data.eventGroup && mutateEventGroup(data.eventGroup))
  }

  const sectionsOptions = material.themes.flatMap((theme) => {
    return [
      {
        value: `${theme.repo}.${theme.id}`,
        label: `${theme.repo} - ${theme.name}`,
      },
    ].concat(
      theme.courses.flatMap((course) => {
        return [
          {
            value: `${theme.repo}.${theme.id}.${course.id}`,
            label: `${theme.repo} - ${theme.name} - ${course.name}`,
          },
        ].concat(
          course.sections.map((section) => {
            const tags = section.tags.join(", ")
            let label = `${theme.repo} - ${theme.name} - ${course.name} - ${section.name}`
            if (tags.length > 0) {
              label = `${label} [${tags}]`
            }
            return {
              value: `${theme.repo}.${theme.id}.${course.id}.${section.id}`,
              label,
            }
          })
        )
      })
    )
  })

  if (eventGroupIsLoading) return <div>Loading...</div>
  if (!eventGroup)
    return (
      <>
        <Title text={event.name} />
        <p>
          You are not enrolled on this event, please see the main <Link href={`/event/${event.id}`}>event page</Link>{" "}
          for more information.
        </p>
      </>
    )

  const eventGroupView = (
    <>
      <a href={`/event/${event.id}`}>
        <Title text={event.name} />
      </a>
      <SubTitle text={eventGroup.name} />
      <SubTitle
        text={
          showDateTime
            ? `Time: ${new Date(eventGroup.start).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })} - ${new Date(eventGroup.end).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
            : ""
        }
      />
      <SubTitle text={`Location: ${eventGroup.location}`} />
      <Content markdown={eventGroup.content} />
      <SubTitle text="Material" />
      <ul className="text-center">
        {eventGroup.EventItem.map((item, index) => {
          const { theme, course, section, url } = eventItemSplit(item, material)
          let label = theme?.name
          if (course) {
            label = `${label} - ${course.name}`
          }
          if (section) {
            label = `${label} - ${section.name}`
          }
          return (
            <a href={url} key={index}>
              <p>{label}</p>
            </a>
          )
        })}
      </ul>
    </>
  )

  const eventGroupEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Textfield label="Title" name="name" control={control} />
        <Textfield label="Location" name="location" control={control} />
        <Textfield label="Summary" name="summary" control={control} />
        <Textarea label="Content" name="content" control={control} />
        <DateTimeField label="Start" name="start" control={control} />
        <DateTimeField label="End" name="end" control={control} />
        <Title text="Items" />
        {eventItems.map((item, order) => {
          const index = eventMapToIndex[item.id]
          return (
            <Stack key={item.id} direction="row" className="items-end">
              <SelectField
                label="Section"
                name={`EventItem.${index}.section`}
                control={control}
                options={sectionsOptions}
              />
              <IntegerField label="Order" name={`EventItem.${index}.order`} control={control} />
              <Button onClick={handleRemoveItem(index)}>Remove</Button>
            </Stack>
          )
        })}
        <Button onClick={handleAddItem}>Add Item</Button>
        <Button type="submit">Save</Button>
      </Stack>
    </form>
  )

  return (
    <Layout material={material} pageInfo={pageInfo}>
      {isAdmin ? (
        <Tabs.Group style="underline">
          <Tabs.Item active icon={MdPreview} title="Event">
            {eventGroupView}
          </Tabs.Item>
          <Tabs.Item icon={MdEdit} title="Edit">
            {eventGroupEditView}
          </Tabs.Item>
        </Tabs.Group>
      ) : (
        eventGroupView
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await prisma.event.findMany({ include: { EventGroup: true } }).catch((e) => [])
  let paths = []
  for (let event of events) {
    for (let eventGroup of event.EventGroup) {
      paths.push({ params: { eventId: `${event.id}`, eventGroupId: `${eventGroup.id}` } })
    }
  }
  return {
    paths,
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
  const eventId = parseInt(context?.params?.eventId as string)
  const eventGroupId = parseInt(context?.params?.eventGroupId as string)
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return { notFound: true }
  }

  let material = await getMaterial()

  remove_markdown(material, undefined)

  return {
    props: makeSerializable({ event, material, eventGroupId, pageInfo }),
  }
}

export default EventGroupPage
