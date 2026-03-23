import type { NextPage, GetStaticProps, GetStaticPaths } from "next"
import { getMaterial, Material, removeMarkdown } from "lib/material"
import Layout from "components/Layout"
import { makeSerializable } from "lib/utils"
import Title from "components/ui/Title"
import type { Event as PublicEvent } from "lib/types"
import { basePath } from "lib/basePath"
import { Button, Tabs } from "flowbite-react"
import Avatar from "@mui/material/Avatar"
import { useForm, useFieldArray, Control, UseFormRegister } from "react-hook-form"
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
import { useEffect, useMemo, useRef, useState } from "react"
import SelectField from "components/forms/SelectField"
import Checkbox from "components/forms/Checkbox"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import revalidateTimeout from "lib/revalidateTimeout"
import EventViewPane from "components/event/EventViewPane"
import { runBuildPrismaQuery } from "lib/buildPrisma"
import EventItemAdder from "components/forms/EventItemAdder"
import type { Option } from "components/forms/SelectSectionField"
import { formatTagLabel } from "lib/tagLabels"
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type EventProps = {
  material: Material
  event: PublicEvent
  pageInfo: PageTemplate
}

type EventForm = EventWithUsers

const SortableItem = ({ id = "", children }: { id?: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

function buildSectionsOptions(material: Material): Option[] {
  return material.themes.flatMap((theme) => {
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
            const tags = section.tags.map((tag) => formatTagLabel(tag)).join(", ")
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
}

const EventGroupEditor = ({
  control,
  register,
  groupIndex,
  sectionsOptions,
  onRemoveGroup,
}: {
  control: Control<EventForm>
  register: UseFormRegister<EventForm>
  groupIndex: number
  sectionsOptions: Option[]
  onRemoveGroup: () => void
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])
  const [inputValue, setInputValue] = useState("")
  const {
    fields: eventItems,
    append: appendItem,
    remove: removeItem,
    replace: replaceItems,
  } = useFieldArray({
    control,
    name: `EventGroup.${groupIndex}.EventItem`,
    keyName: "fieldId",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function findOptionLabel(value: string) {
    const option = sectionsOptions.find((candidate) => candidate.value === value)
    return option ? option.label : value
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = eventItems.findIndex((item) => item.fieldId === active.id)
    const newIndex = eventItems.findIndex((item) => item.fieldId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(eventItems, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))
    replaceItems(reordered)
  }

  const handleAddItems = () => {
    let currentOrder = eventItems.length + 1
    selectedOptions.forEach((option) => {
      appendItem({
        id: 0,
        groupId: 0,
        order: currentOrder,
        section: option.value,
      })
      currentOrder += 1
    })
    setInputValue("")
    setSelectedOptions([])
  }

  return (
    <Stack>
      <input type="hidden" {...register(`EventGroup.${groupIndex}.id`)} />
      <Textfield label="Group Name" name={`EventGroup.${groupIndex}.name`} control={control} />
      <Textarea label="Group Summary" name={`EventGroup.${groupIndex}.summary`} control={control} />
      <Textarea label="Group Content" name={`EventGroup.${groupIndex}.content`} control={control} />
      <Textfield label="Group Location" name={`EventGroup.${groupIndex}.location`} control={control} />
      <DateTimeField label="Start" name={`EventGroup.${groupIndex}.start`} control={control} />
      <DateTimeField label="End" name={`EventGroup.${groupIndex}.end`} control={control} />
      <EventItemAdder
        sectionsOptions={sectionsOptions}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        handleAddClick={handleAddItems}
        inputValue={inputValue}
        setInputValue={setInputValue}
        className="font-normal text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {eventItems.length > 0 && <Title text="Material Sections (drag to reorder)" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={eventItems.map((item) => item.fieldId)} strategy={verticalListSortingStrategy}>
          {eventItems.map((item, itemIndex) => (
            <SortableItem key={item.fieldId} id={item.fieldId}>
              <div className="mb-2 flex items-center justify-between rounded border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-gray-200">{findOptionLabel(item.section)}</span>
                <Button type="button" size="xs" color="warning" onClick={() => removeItem(itemIndex)}>
                  Remove
                </Button>
              </div>
              <input type="hidden" {...register(`EventGroup.${groupIndex}.EventItem.${itemIndex}.id`)} />
              <input type="hidden" {...register(`EventGroup.${groupIndex}.EventItem.${itemIndex}.groupId`)} />
              <input type="hidden" {...register(`EventGroup.${groupIndex}.EventItem.${itemIndex}.section`)} />
              <input type="hidden" {...register(`EventGroup.${groupIndex}.EventItem.${itemIndex}.order`)} />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <div>
        <Button type="button" color="failure" onClick={onRemoveGroup}>
          Delete Group
        </Button>
      </div>
    </Stack>
  )
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
