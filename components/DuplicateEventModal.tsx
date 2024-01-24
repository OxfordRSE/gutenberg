import React, { useEffect } from "react"
import { useState } from "react"
import { Button, Modal } from "flowbite-react"
import { atom, useRecoilState } from "recoil"
import useEvent from "lib/hooks/useEvent"
import useEvents from "lib/hooks/useEvents"
import { postEvent } from "lib/actions/postEvent"
import { HiCheckCircle } from "react-icons/hi"
import { useForm } from "react-hook-form"
import { putEvent } from "lib/actions/putEvent"
import DateTimeField from "./forms/DateTimeField"
import { Stack } from "@mui/material"
import { EventItem } from "pages/api/eventGroup/[eventGroupId]"
import { Toast } from "flowbite-react"

interface DuplicateEventProps {
  onClose: () => void
}

interface DuplicateEventForm {
  date: Date
}

export const duplicateEventModalState = atom({
  key: "duplicateEventModalState",
  default: false,
})

export const duplicateEventIdState = atom<number>({
  key: "duplicateEventIdState",
  default: undefined,
})

export const DuplicateEventModal: React.FC<DuplicateEventProps> = ({ onClose }) => {
  const [showDuplicateEventModal, setShowDuplicateEventModal] = useRecoilState(duplicateEventModalState)
  const [duplicateEventId, setDuplicateEventId] = useRecoilState(duplicateEventIdState)
  const { events: currentEvents, mutate } = useEvents()
  const { event } = useEvent(duplicateEventId)
  const { events, mutate: mutateEvents } = useEvents()
  const [success, setSuccess] = useState<string | null>(null)
  const { control, handleSubmit, reset } = useForm<DuplicateEventForm>({ defaultValues: { date: event?.start } })

  useEffect(() => {
    reset({ date: event?.start })
  }, [event])

  const duplicateEventGroup = (eg: any, dateOffset: number) => {
    let newEg = JSON.parse(JSON.stringify(eg))
    newEg.id = undefined
    newEg.EventItem = []
    newEg.start = new Date(new Date(newEg.start).getTime() + dateOffset)
    newEg.end = new Date(new Date(newEg.end).getTime() + dateOffset)
    eg.EventItem.map((ei: EventItem) => {
      const newEi = duplicateEventItem(ei)
      newEg.EventItem.push(newEi)
    })
    return newEg
  }

  const duplicateEventItem = (ei: any) => {
    let newEi = JSON.parse(JSON.stringify(ei))
    newEi.id = undefined
    newEi.groupId = undefined
    return newEi
  }

  const duplicateEvent = (data: DuplicateEventForm) => {
    // make a new event
    if (!event) return
    const newDate = data.date
    const dateOffset = new Date(newDate).getTime() - new Date(event.start).getTime()

    let eventDuplicate = JSON.parse(JSON.stringify(event))
    // remove EG and UOE and id to prevent them being duplicated with duplicate ids
    eventDuplicate.EventGroup = []
    eventDuplicate.UserOnEvent = []
    eventDuplicate.id = undefined
    eventDuplicate.start = new Date(new Date(eventDuplicate.start).getTime() + dateOffset)
    eventDuplicate.end = new Date(new Date(eventDuplicate.end).getTime() + dateOffset)

    postEvent(eventDuplicate).then((newEvent) => {
      // here we take the newly saved event and add copies of the eventgroups and items
      newEvent.EventGroup = []
      event.EventGroup.map((eg) => {
        const newEg = duplicateEventGroup(eg, dateOffset)
        newEvent.EventGroup.push(newEg)
      })
      // prevent createmany from failing
      newEvent.UserOnEvent = []

      putEvent(newEvent).then((updatedEvent) => {
        const finalEvent = updatedEvent.event
        // we ignore the ts error because it doesn't seem to understand the input for mutate here
        // @ts-ignore
        mutateEvents([...events, finalEvent])
        setSuccess("success")
        setTimeout(() => {
          setShowDuplicateEventModal(false)
          onClose()
          setSuccess(null)
        }, 1500)
      })
    })
  }

  return (
    <Modal dismissible={true} show={showDuplicateEventModal} onClose={onClose} size="xl">
      <Modal.Header>Duplicate Event</Modal.Header>
      <Modal.Body>
        <Stack direction="column" spacing="0.4rem">
          <p>This will create a duplicate of event: {event?.name}</p>
          <p>
            Enter a start date for the event. All dates and times will be appropriately adjusted relative to the start
            date but you will likely need to further adjust the schedule to suit the specifics of the course.
          </p>
          <DateTimeField name={"date"} control={control} />
          <Button
            size="sm"
            className="m-0 h-10 mt-1"
            onClick={handleSubmit(duplicateEvent)}
            data-cy="confirm-event-duplicate"
          >
            Create Duplicate Event
          </Button>
          {success && (
            <Toast className="">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Event Successfully Duplicated!</div>
            </Toast>
          )}
        </Stack>
      </Modal.Body>
    </Modal>
  )
}
