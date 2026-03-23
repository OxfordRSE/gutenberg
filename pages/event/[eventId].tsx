import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Title from "components/ui/Title"
import type { Event as PublicEvent } from "lib/types"
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
import Stack from "components/ui/Stack"
import { putEvent } from "lib/actions/putEvent"
import { useEffect, useMemo, useRef, useState } from "react"
import SelectField from "components/forms/SelectField"
import Checkbox from "components/forms/Checkbox"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import EventViewPane from "components/event/EventViewPane"
import { runBuildPrismaQuery } from "lib/buildPrisma"
import EventGroupEditor, { buildSectionsOptions, EventForm } from "components/event/EventGroupEditor"
import MaterialGroupsNotice from "components/ui/MaterialGroupsNotice"

type EventProps = {
  material: Material
  event: PublicEvent
  pageInfo: PageTemplate
}

const Event: NextPage<EventProps> = ({ material, event, pageInfo }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const tabsRef = useRef<{ setActiveTab: (idx: number) => void } | null>(null)

  const { event: eventData, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)
  const currentEvent = eventData ?? event
  const { data: session } = useSession()
  const { userProfile } = useProfile()
  const initialValues = useMemo(
    () =>
      ({
        ...(event as unknown as EventForm),
        EventGroup: [],
        UserOnEvent: [],
      }) satisfies EventForm,
    [event]
  )
  const { control, handleSubmit, reset, register } = useForm<EventForm>({ defaultValues: initialValues })

  const {
    fields: eventGroups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: "EventGroup",
    keyName: "fieldId",
  })

  const { fields: eventUsers } = useFieldArray({
    control,
    name: "UserOnEvent",
    keyName: "fieldId",
  })

  const myUserOnEvent = eventData?.UserOnEvent.find((userOnEvent) => userOnEvent.userEmail === session?.user?.email)
  const isInstructor = myUserOnEvent?.status === "INSTRUCTOR"
  const isAdmin = !!userProfile?.admin
  const sectionsOptions = useMemo(() => buildSectionsOptions(material), [material])

  const onSubmit = (data: EventForm) => {
    putEvent(data).then((response) => {
      if (response.event) {
        mutateEvent(response.event)
      }
    })
  }

  useEffect(() => {
    if (eventData) {
      reset(eventData)
    }
  }, [eventData, reset])

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
    const currentPath = `${window.location.pathname}${window.location.search}`
    const nextUrl = idx === 1 ? `${currentPath}#edit` : currentPath
    if (window.location.href === `${window.location.origin}${nextUrl}`) return
    window.history.pushState(null, "", nextUrl)
  }

  if (eventIsLoading) return <div>loading...</div>

  const handleAddGroup = () => {
    appendGroup({
      id: 0,
      eventId: currentEvent.id,
      name: "",
      summary: "",
      content: "",
      start: currentEvent.start,
      end: currentEvent.end,
      location: "",
      EventItem: [],
    })
  }

  const statusOptions = [
    { label: "student", value: "STUDENT" },
    { label: "instructor", value: "INSTRUCTOR" },
    { label: "request", value: "REQUEST" },
    { label: "reject", value: "REJECTED" },
  ]

  const eventView = (
    <EventViewPane
      event={currentEvent}
      eventWithRelations={eventData}
      material={material}
      isAdmin={isAdmin}
      isInstructor={!!isInstructor}
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
        <Checkbox label="Hidden" name="hidden" control={control} />
        <Title text="Users" />
        <div className="grid grid-cols-4 gap-4">
          {eventUsers.map((user, index) => (
            <div key={user.fieldId} className="flex items-center space-x-4">
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
        {eventGroups.length === 0 && (
          <MaterialGroupsNotice
            dataCy="event-groups-required"
            heading="Add a group before adding material"
            body="Events now organise material through groups. Create a group first, then add sections inside that group."
          />
        )}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {eventGroups.map((group, groupIndex) => (
            <EventGroupEditor
              key={group.fieldId}
              control={control}
              register={register}
              groupIndex={groupIndex}
              sectionsOptions={sectionsOptions}
              onRemoveGroup={() => removeGroup(groupIndex)}
            />
          ))}
          <Button type="button" onClick={handleAddGroup}>
            Add Group
          </Button>
        </div>
        <Button type="submit">Save Changes</Button>
      </Stack>
    </form>
  )

  const pageTitle = pageInfo?.title ? `${currentEvent.name}: ${pageInfo.title}` : currentEvent.name
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
  const events = await runBuildPrismaQuery("pages/event/[eventId].tsx paths", [], (prisma) =>
    prisma.event.findMany({
      where: { hidden: false },
    })
  )
  return {
    paths: events.map((e) => ({ params: { eventId: `${e.id}` } })),
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps = async (context) => {
  const pageInfo = loadPageTemplate()
  const eventId = parseInt(context?.params?.eventId as string)
  const event = await runBuildPrismaQuery("pages/event/[eventId].tsx event", null, (prisma) =>
    prisma.event.findUnique({ where: { id: eventId } })
  )
  if (!event) {
    return { notFound: true }
  }

  const material = await getMaterial()

  removeMarkdown(material, undefined)

  return {
    props: makeSerializable({ event, material, pageInfo }),
    revalidate: revalidateTimeout,
  }
}

export default Event
