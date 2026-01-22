import type { NextPage, GetServerSideProps } from "next"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import prisma from "lib/prisma"
import Layout from "components/Layout"
import { Material, getMaterial, removeMarkdown, sectionSplit } from "lib/material"
import { makeSerializable } from "lib/utils"
import { PageTemplate, loadPageTemplate } from "lib/pageTemplate"
import Title from "components/ui/Title"
import { Prisma } from "@prisma/client"
import { Badge, Button, Card, Tabs } from "flowbite-react"
import CourseLevelBadge from "components/courses/CourseLevelBadge"
import { getTagColor } from "lib/tagColors"
import { getServerSession } from "next-auth/next"
import { authOptions } from "pages/api/auth/[...nextauth]"
import useProfile from "lib/hooks/useProfile"
import { useForm, useFieldArray, UseFormRegister, Control } from "react-hook-form"
import Textfield from "components/forms/Textfield"
import Textarea from "components/forms/Textarea"
import Checkbox from "components/forms/Checkbox"
import SelectField from "components/forms/SelectField"
import Stack from "components/ui/Stack"
import { putCourse } from "lib/actions/putCourse"
import EventItemAdder from "components/forms/EventItemAdder"
import type { Option } from "components/forms/SelectSectionField"
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
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type CourseFull = Prisma.CourseGetPayload<{
  include: {
    CourseGroup: { include: { CourseItem: true } }
    CourseItem: true
  }
}>

type CourseItemForm = {
  id: number
  order: number | string
  section: string
}

type CourseGroupForm = {
  id: number
  name: string
  summary: string
  order: number | string
  CourseItem: CourseItemForm[]
}

type CourseForm = {
  name: string
  summary: string
  level: string
  hidden: boolean
  languageText: string
  tagsText: string
  outcomesText: string
  prerequisitesText: string
  CourseGroup: CourseGroupForm[]
}

type CourseDetailProps = {
  material: Material
  course: CourseFull
  pageInfo: PageTemplate
}

const SortableItem = ({ id = "", children }: { id?: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
}

function listToText(values: string[] = []): string {
  return values.join("\n")
}

function textToList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

function courseToForm(course: CourseFull): CourseForm {
  return {
    name: course.name ?? "",
    summary: course.summary ?? "",
    level: course.level ?? "",
    hidden: !!course.hidden,
    languageText: listToText(course.language ?? []),
    tagsText: listToText(course.tags ?? []),
    outcomesText: listToText(course.outcomes ?? []),
    prerequisitesText: listToText(course.prerequisites ?? []),
    CourseGroup: course.CourseGroup.map((group) => ({
      id: group.id,
      name: group.name ?? "",
      summary: group.summary ?? "",
      order: group.order ?? 0,
      CourseItem: group.CourseItem.map((item) => ({
        id: item.id,
        order: item.order ?? 0,
        section: item.section ?? "",
      })),
    })),
  }
}

const CoursePreview = ({ material, course }: { material: Material; course: CourseFull }) => {
  return (
    <>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32">
        <Title text={course.name || "Untitled course"} className="text-3xl font-bold" style={{ marginBottom: "0px" }} />
        <div className="mt-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Difficulty
            </span>
            <CourseLevelBadge level={course.level} />
          </div>
          {(course.language ?? []).length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {(course.language ?? []).map((language) => {
                const color = getTagColor(language)
                return (
                  <Badge key={language} style={{ backgroundColor: color.background, color: color.text }}>
                    {language}
                  </Badge>
                )
              })}
            </div>
          )}
          {course.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {course.tags.map((tag) => {
                const color = getTagColor(tag)
                return (
                  <Badge key={tag} style={{ backgroundColor: color.background, color: color.text }}>
                    {tag}
                  </Badge>
                )
              })}
            </div>
          )}
        </div>
        {course.summary && <p className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-line">{course.summary}</p>}
        {course.outcomes.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Outcomes:</span>{" "}
            {course.outcomes.join(", ")}
          </div>
        )}
        {course.prerequisites.length > 0 && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-800 dark:text-gray-200">Prerequisites:</span>{" "}
            {course.prerequisites.join(", ")}
          </div>
        )}
      </div>
      <div className="px-2 md:px-10 lg:px-10 xl:px-20 2xl:px-32 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {course.CourseGroup.sort((a, b) => a.order - b.order).map((group) => (
            <Card key={group.id}>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name || "Untitled group"}</h2>
              {group.summary && <p className="text-gray-700 dark:text-gray-300">{group.summary}</p>}
              <ul className="mt-2 space-y-1">
                {group.CourseItem.sort((a, b) => a.order - b.order).map((item) => {
                  const { section, course: matCourse, theme, url } = sectionSplit(item.section, material)
                  const label = section?.name || matCourse?.name || theme?.name || item.section
                  return (
                    <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                      {url ? (
                        <Link href={url} className="hover:underline">
                          {label}
                        </Link>
                      ) : (
                        label
                      )}
                    </li>
                  )
                })}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}

const CourseGroupEditor = ({
  control,
  register,
  groupIndex,
  sectionsOptions,
}: {
  control: Control<CourseForm>
  register: UseFormRegister<CourseForm>
  groupIndex: number
  sectionsOptions: Option[]
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([])
  const [inputValue, setInputValue] = useState<string>("")
  const {
    fields: groupItems,
    append: appendItem,
    remove: removeItem,
    replace: replaceItems,
  } = useFieldArray({
    control,
    name: `CourseGroup.${groupIndex}.CourseItem`,
    keyName: "fieldId",
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function findOptionLabel(value: string) {
    const option = sectionsOptions.find((option) => option.value === value)
    return option ? option.label : value
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = groupItems.findIndex((item) => item.fieldId === active.id)
    const newIndex = groupItems.findIndex((item) => item.fieldId === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(groupItems, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: index + 1,
    }))
    replaceItems(reordered)
  }

  const handleAddItems = () => {
    let currentOrder = groupItems.length + 1
    selectedOptions.forEach((option) => {
      appendItem({
        id: 0,
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
      <EventItemAdder
        sectionsOptions={sectionsOptions}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        handleAddClick={handleAddItems}
        inputValue={inputValue}
        setInputValue={setInputValue}
        className="font-normal text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      />
      {groupItems.length > 0 && <Title text="Material Sections (drag to reorder)" />}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={groupItems.map((item) => item.fieldId)} strategy={verticalListSortingStrategy}>
          {groupItems.map((item, itemIndex) => (
            <SortableItem key={item.fieldId} id={item.fieldId}>
              <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-100 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-sm text-gray-700 dark:text-gray-200">{findOptionLabel(item.section)}</span>
                <Button type="button" size="xs" color="warning" onClick={() => removeItem(itemIndex)}>
                  Remove
                </Button>
              </div>
              <input type="hidden" {...register(`CourseGroup.${groupIndex}.CourseItem.${itemIndex}.id`)} />
              <input type="hidden" {...register(`CourseGroup.${groupIndex}.CourseItem.${itemIndex}.section`)} />
              <input type="hidden" {...register(`CourseGroup.${groupIndex}.CourseItem.${itemIndex}.order`)} />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </Stack>
  )
}

const CourseDetail: NextPage<CourseDetailProps> = ({ material, course, pageInfo }) => {
  const { userProfile } = useProfile()
  const [courseData, setCourseData] = useState(course)

  const defaultValues = useMemo(() => courseToForm(courseData), [courseData])
  const { control, handleSubmit, reset, register } = useForm<CourseForm>({ defaultValues })

  const {
    fields: groups,
    append: appendGroup,
    remove: removeGroup,
  } = useFieldArray({
    control,
    name: "CourseGroup",
    keyName: "fieldId",
  })

  const sectionsOptions = useMemo<Option[]>(() => {
    return material.themes.flatMap((theme) => {
      return [
        {
          value: `${theme.repo}.${theme.id}`,
          label: `${theme.repo} - ${theme.name}`,
        },
      ].concat(
        theme.courses.flatMap((courseItem) => {
          return [
            {
              value: `${theme.repo}.${theme.id}.${courseItem.id}`,
              label: `${theme.repo} - ${theme.name} - ${courseItem.name}`,
            },
          ].concat(
            courseItem.sections.map((section) => {
              const tags = section.tags.join(", ")
              let label = `${theme.repo} - ${theme.name} - ${courseItem.name} - ${section.name}`
              if (tags.length > 0) {
                label = `${label} [${tags}]`
              }
              return {
                value: `${theme.repo}.${theme.id}.${courseItem.id}.${section.id}`,
                label,
              }
            })
          )
        })
      )
    })
  }, [material])

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = async (form: CourseForm) => {
    const payload: CourseFull = {
      ...courseData,
      name: form.name,
      summary: form.summary,
      level: form.level,
      hidden: form.hidden,
      language: textToList(form.languageText),
      tags: textToList(form.tagsText),
      outcomes: textToList(form.outcomesText),
      prerequisites: textToList(form.prerequisitesText),
      CourseGroup: form.CourseGroup.map((group) => ({
        id: group.id,
        name: group.name,
        summary: group.summary,
        order: Number(group.order) || 0,
        courseId: courseData.id,
        CourseItem: group.CourseItem.map((item) => ({
          id: item.id,
          order: Number(item.order) || 0,
          section: item.section,
          courseId: courseData.id,
          groupId: group.id,
        })),
      })),
      CourseItem: [],
    }

    const response = await putCourse(payload)
    if ("course" in response && response.course) {
      setCourseData(response.course)
      reset(courseToForm(response.course))
    }
  }

  return (
    <Layout material={material} pageInfo={pageInfo} pageTitle={`${courseData.name}: ${pageInfo.title}`}>
      {userProfile?.admin ? (
        <Tabs.Group style="underline">
          <Tabs.Item title="Course" active icon={MdPreview}>
            <CoursePreview material={material} course={courseData} />
          </Tabs.Item>
          <Tabs.Item title="Edit" icon={MdEdit}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack>
                <Textfield label="Title" name="name" control={control} />
                <Textarea label="Summary" name="summary" control={control} />
                <SelectField
                  label="Level"
                  name="level"
                  control={control}
                  options={[
                    { label: "", value: "" },
                    { label: "Beginner", value: "beginner" },
                    { label: "Intermediate", value: "intermediate" },
                    { label: "Advanced", value: "advanced" },
                  ]}
                />
                <Checkbox label="Hidden" name="hidden" control={control} />
                <Textarea label="Language (one per line)" name="languageText" control={control} />
                <Textarea label="Tags (one per line)" name="tagsText" control={control} />
                <Textarea label="Outcomes (one per line)" name="outcomesText" control={control} />
                <Textarea label="Prerequisites (one per line)" name="prerequisitesText" control={control} />

                <Title text="Groups" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {groups.map((group, groupIndex) => (
                    <Stack key={group.fieldId}>
                      <input type="hidden" {...register(`CourseGroup.${groupIndex}.id`)} />
                      <Textfield label="Group Name" name={`CourseGroup.${groupIndex}.name`} control={control} />
                      <Textarea label="Group Summary" name={`CourseGroup.${groupIndex}.summary`} control={control} />
                      <Textfield
                        label="Group Order"
                        name={`CourseGroup.${groupIndex}.order`}
                        control={control}
                        textfieldProps={{ type: "number" }}
                      />
                      <CourseGroupEditor
                        control={control}
                        register={register}
                        groupIndex={groupIndex}
                        sectionsOptions={sectionsOptions}
                      />
                      <Button type="button" color="warning" onClick={() => removeGroup(groupIndex)}>
                        Delete Group
                      </Button>
                    </Stack>
                  ))}
                  <Button
                    type="button"
                    onClick={() =>
                      appendGroup({ id: 0, name: "", summary: "", order: groups.length + 1, CourseItem: [] })
                    }
                  >
                    Add Group
                  </Button>
                </div>

                <Button type="submit">Save Changes</Button>
              </Stack>
            </form>
          </Tabs.Item>
        </Tabs.Group>
      ) : (
        <CoursePreview material={material} course={courseData} />
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageInfo = loadPageTemplate()
  const courseId = parseInt(context?.params?.courseId as string, 10)

  const session = await getServerSession(context.req, context.res, authOptions)
  const userEmail = session?.user?.email || undefined
  const currentUser = userEmail ? await prisma.user.findUnique({ where: { email: userEmail } }) : null
  const isAdmin = !!currentUser?.admin

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      CourseGroup: { include: { CourseItem: true } },
      CourseItem: true,
    },
  })

  if (!course || (course.hidden && !isAdmin)) {
    return { notFound: true }
  }

  let material = await getMaterial()
  removeMarkdown(material, material)

  return {
    props: makeSerializable({ material, course, pageInfo }),
  }
}

export default CourseDetail
