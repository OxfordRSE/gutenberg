import React, { useState, useEffect } from "react"
import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Theme, Material, removeMarkdown, eventItemSplit } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import Title from "components/ui/Title"
import SubTitle from "components/ui/SubTitle"
import { Event } from "lib/types"
import Link from "next/link"
import useEventGroup from "lib/hooks/useEventGroup"
import useProfile from "lib/hooks/useProfile"
import { Button, Tabs } from "flowbite-react"
import { Grid, Typography } from "@mui/material"
import { useFieldArray, useForm } from "react-hook-form"
import { EventGroup } from "pages/api/eventGroup/[eventGroupId]"
import { putEventGroup } from "lib/actions/putEventGroup"
import Stack from "components/ui/Stack"
import Textfield from "components/forms/Textfield"
import Textarea from "components/forms/Textarea"
import DateTimeField from "components/forms/DateTimeField"
import EventItemAdder from "components/forms/EventItemAdder"
import { MdEdit, MdPreview } from "react-icons/md"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core"
import type { Option } from "components/forms/SelectSectionField"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"

type EventGroupProps = {
  material: Material
  event: Event
  eventGroupId: number
  pageInfo?: PageTemplate
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const SortableItem = ({ id = "", children }: { id?: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} {...style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

const EventGroupPage: NextPage<EventGroupProps> = ({ material, event, eventGroupId, pageInfo }) => {
  const [showDateTime, setShowDateTime] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])
  const [inputValue, setInputValue] = useState<string>("")

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
  const { control, handleSubmit, reset } = useForm<EventGroup>({ defaultValues: eventGroup })

  useEffect(() => {
    if (eventGroup) {
      reset(eventGroup)
    }
  }, [eventGroup, reset])

  const {
    fields: eventItems,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control,
    name: "EventItem",
  })

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = eventItems.findIndex((item) => item.id === active.id)
      const newIndex = eventItems.findIndex((item) => item.id === over?.id)

      const reorderedItems = arrayMove(eventItems, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index + 1,
      }))

      reset({
        ...eventGroup,
        EventItem: reorderedItems,
      })
    }
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

  function findOptionLabel(value: string) {
    const option = sectionsOptions.find((option) => option.value === value)
    return option ? option.label : ""
  }

  function handleAddEventItem() {
    let currentId = eventItems.length + 1
    selectedOptions.forEach((option) => {
      appendItem({
        id: 0,
        groupId: eventGroupId,
        order: currentId,
        section: option.value,
      })
      currentId++
    })

    setInputValue("")
    setSelectedOptions([])
  }

  const eventGroupEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Textfield label="Title" name="name" control={control} />
        <Textfield label="Location" name="location" control={control} />
        <Textfield label="Summary" name="summary" control={control} />
        <Textarea label="Content" name="content" control={control} />
        <DateTimeField label="Start" name="start" control={control} />
        <DateTimeField label="End" name="end" control={control} />
        <EventItemAdder
          sectionsOptions={sectionsOptions}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          handleAddClick={handleAddEventItem}
          inputValue={inputValue}
          setInputValue={setInputValue}
          className="font-normal text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {eventItems.length > 0 && <Title text="Material Sections (drag to reorder)" />}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={eventItems.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {eventItems.map((item, index) => (
              <SortableItem key={item.id} id={item.id}>
                <Grid
                  container
                  alignItems="center"
                  spacing={2}
                  className="bg-slate-200 dark:bg-gray-800"
                  sx={{
                    border: "1px solid",
                    marginBottom: "6px",
                    borderRadius: "4px",
                    paddingTop: "0px",
                  }}
                >
                  <Grid item xs={9} sx={{ paddingTop: "0px" }}>
                    <Typography className="p-0" variant="body1">
                      {findOptionLabel(item.section)}
                    </Typography>
                  </Grid>
                  <Grid item xs={3} container justifyContent="flex-end" sx={{ paddingTop: "0px" }}>
                    <Button onClick={handleRemoveItem(index)} variant="outlined" color="warning">
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </SortableItem>
            ))}
          </SortableContext>
        </DndContext>
        <Button type="submit">Save Changes</Button>
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

  removeMarkdown(material, undefined)

  return {
    props: makeSerializable({ event, material, eventGroupId, pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default EventGroupPage
