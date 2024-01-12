import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Theme, Material, remove_markdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Content from "components/content/Content"
import NavDiagram from "components/NavDiagram"
import Title from "components/ui/Title"
import { Event, EventFull } from "lib/types"
import useSWR, { Fetcher } from "swr"
import { basePath } from "lib/basePath"
import EventActions from "components/EventActions"
import { Avatar, Button, Card, Tabs } from "flowbite-react"
import EventUsers from "components/EventUsers"
import EventProblems from "components/EventProblems"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { useSession } from "next-auth/react"
import { MdEdit, MdPreview } from "react-icons/md"
import Textfield from "components/forms/Textfield"
import Textarea from "components/forms/Textarea"
import DateTimeField from "components/forms/DateTimeField"
import useEvent from "lib/hooks/useEvent"
import useProfile from "lib/hooks/useProfile"
import { Event as EventWithUsers } from "pages/api/event/[eventId]"
import Stack from "components/ui/Stack"
import { putEvent } from "lib/actions/putEvent"
import { useEffect, useState } from "react"
import { Prisma } from "@prisma/client"
import SelectField from "components/forms/SelectField"
import Checkbox from "components/forms/Checkbox"
import SubTitle from "components/ui/SubTitle"
import EventCommentThreads from "components/EventCommentThreads"
import { PageTemplate, pageTemplate } from "lib/pageTemplate"

type EventProps = {
  material: Material
  event: Event
  pageInfo?: PageTemplate
}

const Event: NextPage<EventProps> = ({ material, event, pageInfo }) => {
  // don't show date/time until the page is loaded (due to rehydration issues)
  const [showDateTime, setShowDateTime] = useState(false)
  useEffect(() => {
    setShowDateTime(true)
  }, [])

  const { event: eventData, error: eventError, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)
  if (eventData) {
    event = eventData
  }
  const { data: session } = useSession()
  const { userProfile, error: profileError, isLoading: profileLoading } = useProfile()
  const { control, handleSubmit, reset, setValue } = useForm<EventWithUsers>({ defaultValues: eventData })

  const {
    fields: eventGroups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: "EventGroup",
  })

  const { fields: eventUser } = useFieldArray({
    control,
    name: "UserOnEvent",
  })

  const myUserOnEvent = eventData?.UserOnEvent.find((e) => e.userEmail == session?.user?.email)
  const isInstructor = myUserOnEvent?.status === "INSTRUCTOR" || false
  const isAdmin = userProfile?.admin

  const onSubmit = (data: EventWithUsers) => {
    putEvent(data).then((data) => {
      data.event && mutateEvent(data.event)
    })
  }

  useEffect(() => {
    reset(eventData)
  }, [eventData, reset])

  if (eventIsLoading) return <div>loading...</div>

  const handleAddGroup = () => {
    appendGroup({
      id: 0,
      eventId: event.id,
      name: "",
      summary: "",
      content: "",
      start: event.start,
      end: event.end,
      location: "",
      EventItem: [],
    })
  }

  const handleRemoveGroup = (index: number) => () => {
    removeGroup(index)
  }

  const statusOptions = [
    { label: "student", value: "STUDENT" },
    { label: "instructor", value: "INSTRUCTOR" },
    { label: "request", value: "REQUEST" },
    { label: "reject", value: "REJECTED" },
  ]

  const eventView = (
    <>
      <Title text={event.name} />
      <SubTitle
        text={
          showDateTime
            ? `${new Date(event.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} - ${new Date(
                event.end
              ).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
            : ""
        }
      />
      <Content markdown={eventData ? eventData.content : event.content} />
      {(isInstructor || isAdmin) && eventData && (
        <>
          <Title text="Unresolved Threads" />
          <EventCommentThreads event={eventData} material={material} />
          <Title text="Student Progress" />
          <EventProblems event={eventData} material={material} />
        </>
      )}
    </>
  )
  const eventEditView = (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Textfield label="Title" name="name" control={control} />
        <Textarea label="Enrol" name="enrol" control={control} />
        <Textarea label="Enrolment Key" name="enrolKey" control={control} />
        <Textarea label="Instructor Key" name="instructorKey" control={control} />
        <Textarea label="Summary" name="summary" control={control} />
        <Textarea label="Content" name="content" control={control} />
        <DateTimeField label="Start" name="start" control={control} />
        <DateTimeField label="End" name="end" control={control} />
        <Checkbox label="Hidden" name={`hidden`} control={control} />
        <Title text="Users" />
        <div className="grid grid-cols-4 gap-4">
          {eventUser.map((user, index) => (
            <div key={user.id} className="flex items-center space-x-4">
              <div className="shrink-0">
                <Avatar img={user.user?.image || undefined} rounded={true} size="sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{user.user?.name}</p>
                <p className="truncate text-sm text-gray-500 dark:text-gray-400">{user.user?.email}</p>
              </div>
              <SelectField control={control} name={`UserOnEvent.${index}.status`} options={statusOptions} />
            </div>
          ))}
        </div>
        <Title text="Groups" />
        <div className="grid grid-cols-3 items-end gap-4 ">
          {eventGroups.map((group, index) => (
            <Stack key={group.id}>
              <Textfield label="Group Name" name={`EventGroup.${index}.name`} control={control} />
              <Textfield label="Group Summary" name={`EventGroup.${index}.summary`} control={control} />
              <Textfield label="Group Location" name={`EventGroup.${index}.location`} control={control} />
              <DateTimeField label="Start" name={`EventGroup.${index}.start`} control={control} />
              <DateTimeField label="End" name={`EventGroup.${index}.end`} control={control} />
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleRemoveGroup(index)}>Delete</Button>
                {eventData?.EventGroup[index] && (
                  <Button href={`${basePath}/event/${eventData.id}/${eventData.EventGroup[index].id}`}>
                    <p>Go</p>
                    <svg
                      className="ml-2 -mr-1 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            </Stack>
          ))}
          <Button onClick={handleAddGroup}>Add Group</Button>
        </div>
        <Button type="submit">Save</Button>
      </Stack>
    </form>
  )
  return (
    <Layout material={material} pageInfo={pageInfo}>
      {eventData && isAdmin ? (
        <Tabs.Group style="underline">
          <Tabs.Item active icon={MdPreview} title="Event">
            {eventView}
          </Tabs.Item>
          <Tabs.Item icon={MdEdit} title="Edit">
            {eventEditView}
          </Tabs.Item>
        </Tabs.Group>
      ) : (
        eventView
      )}
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const events = await prisma.event
    .findMany({
      where: { hidden: false },
    })
    .catch((e) => [])
  return {
    paths: events.map((e) => ({ params: { eventId: `${e.id}` } })),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = pageTemplate
  const eventId = parseInt(context?.params?.eventId as string)
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return { notFound: true }
  }

  let material = await getMaterial()

  remove_markdown(material, undefined)

  return {
    props: makeSerializable({ event, material, pageInfo }),
  }
}

export default Event
