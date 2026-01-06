import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import prisma from "lib/prisma"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Title from "components/ui/Title"
import type { Event } from "lib/types"
import { basePath } from "lib/basePath"
import { Button, Tabs } from "flowbite-react"
import Avatar from "@mui/material/Avatar"
import { useForm, useFieldArray } from "react-hook-form"
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
import { useEffect, useRef, useState } from "react"
import SelectField from "components/forms/SelectField"
import Checkbox from "components/forms/Checkbox"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import { load } from "js-yaml"
import EventViewPane from "components/event/EventViewPane"

type EventProps = {
  material: Material
  event: Event
  pageInfo?: PageTemplate
}

const Event: NextPage<EventProps> = ({ material, event, pageInfo }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const tabsRef = useRef<{ setActiveTab: (idx: number) => void } | null>(null)

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

  // keep tabs in sync with hash for deep links + browser navigation
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.replace("#", "")
      const idx = hash === "edit" ? 1 : 0
      setActiveTabIndex(idx)
      tabsRef.current?.setActiveTab(idx)
    }
    syncFromHash()
    window.addEventListener("hashchange", syncFromHash)
    return () => window.removeEventListener("hashchange", syncFromHash)
  }, [])

  const handleTabChange = (idx: number) => {
    setActiveTabIndex(idx)
    if (typeof window === "undefined") return
    const basePath = `${window.location.pathname}${window.location.search}`
    const nextUrl = idx === 1 ? `${basePath}#edit` : basePath
    if (window.location.href === `${window.location.origin}${nextUrl}`) return
    // I am using pushState rather than next router cause i can reliably crash next router
    // by clicking the same tab twice before it loads
    window.history.pushState(null, "", nextUrl)
  }

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
    <EventViewPane
      event={event}
      eventWithRelations={eventData}
      material={material}
      isAdmin={!!isAdmin}
      isInstructor={isInstructor}
    />
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
                <Avatar src={user.user?.image || undefined} alt={user.user?.name || undefined} />
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
              <input type="hidden" name={`EventGroup.${index}.id`} value={group.id} />
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
        <Button type="submit">Save Changes</Button>
      </Stack>
    </form>
  )
  const pageTitle = pageInfo?.title ? `${event.name}: ${pageInfo.title}` : event.name
  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={pageTitle}>
      {eventData && isAdmin ? (
        <Tabs.Group style="underline" ref={tabsRef} onActiveTabChange={handleTabChange}>
          <Tabs.Item active={activeTabIndex === 0} icon={MdPreview} title="Event">
            {eventView}
          </Tabs.Item>
          <Tabs.Item active={activeTabIndex === 1} icon={MdEdit} title="Edit">
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
  const pageInfo = loadPageTemplate()
  const eventId = parseInt(context?.params?.eventId as string)
  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return { notFound: true }
  }

  let material = await getMaterial()

  removeMarkdown(material, undefined)

  return {
    props: makeSerializable({ event, material, pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default Event
