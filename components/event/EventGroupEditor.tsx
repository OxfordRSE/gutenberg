import React, { useState } from "react"
import { Button } from "flowbite-react"
import { Control, UseFormRegister, useFieldArray } from "react-hook-form"
import EventItemAdder from "components/forms/EventItemAdder"
import type { Option } from "components/forms/SelectSectionField"
import DateTimeField from "components/forms/DateTimeField"
import Stack from "components/ui/Stack"
import Textarea from "components/forms/Textarea"
import Textfield from "components/forms/Textfield"
import Title from "components/ui/Title"
import type { Event as EventWithUsers } from "pages/api/event/[eventId]"
import type { Material } from "lib/material"
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

export type EventForm = EventWithUsers

const SortableItem = ({
  id = "",
  children,
}: {
  id?: string
  children: React.ReactNode
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-cy="event-group-item"
      tabIndex={0}
      className="focus:outline-none"
    >
      {children}
    </div>
  )
}

export function buildSectionsOptions(material: Material): Option[] {
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

type Props = {
  control: Control<EventForm>
  register: UseFormRegister<EventForm>
  groupIndex: number
  sectionsOptions: Option[]
  onRemoveGroup: () => void
}

const EventGroupEditor: React.FC<Props> = ({ control, register, groupIndex, sectionsOptions, onRemoveGroup }) => {
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

export default EventGroupEditor
