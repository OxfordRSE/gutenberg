import React from "react"
import { useState, useEffect } from "react"
import { Button, Modal } from "flowbite-react"
import Stack from "./ui/Stack"
import { atom, useRecoilState } from "recoil"
import useEvent from "lib/hooks/useEvent"
import useEvents from "lib/hooks/useEvents"
import { postEvent } from "lib/actions/postEvent"
import { Event } from "lib/types"

interface DuplicateEventProps {
  onClose: () => void
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
  const [failure, setFailure] = useState<string | null>(null)

  const handleDuplicateEvent = () => {
    // make a new event
    if (!event) return
    postEvent(event).then((newEvent) => {
      console.log("newEvent", newEvent)
    })
  }

  return (
    <Modal dismissible={true} show={showDuplicateEventModal} onClose={onClose} size="xl">
      <Modal.Header>Duplicate Event</Modal.Header>
      <Modal.Body>
        <p>This will create a duplicate of event: {event?.name}</p>
        <Button
          size="sm"
          className="mt-4"
          color="failure"
          onClick={handleDuplicateEvent}
          data-cy="confirm-event-duplicate"
        >
          Create Duplicate Event
        </Button>
      </Modal.Body>
    </Modal>
  )
}
