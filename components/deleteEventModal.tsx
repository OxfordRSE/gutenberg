import React from "react"
import { useState, useEffect } from "react"
import { Button, Modal } from "flowbite-react"
import Stack from "./ui/Stack"
import { atom, useRecoilState } from "recoil"
import useEvent from "lib/hooks/useEvent"
import { deleteEvent } from "lib/actions/deleteEvent"
import useEvents from "lib/hooks/useEvents"
import { Toast } from "flowbite-react"
import { HiCheckCircle, HiX } from "react-icons/hi"

interface DeleteEventProps {
  onClose: () => void
}

export const deleteEventModalState = atom({
  key: "deleteEventModalState",
  default: false,
})

export const deleteEventIdState = atom<number>({
  key: "deleteEventIdState",
  default: undefined,
})

export const DeleteEventModal: React.FC<DeleteEventProps> = ({ onClose }) => {
  const [showDeleteEventModal, setShowDeleteEventModal] = useRecoilState(deleteEventModalState)
  const [deleteEventId, setDeleteEventId] = useRecoilState(deleteEventIdState)
  const { event } = useEvent(deleteEventId)
  const { events, mutate: mutateEvents } = useEvents()
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true)
  let buttonTimer: string = "3"

  // disable the button for 2 seconds
  const enableButton = () => {
    setTimeout(() => {
      setButtonDisabled(false)
    }, 2000)
  }

  useEffect(() => {
    if (showDeleteEventModal === true) {
      enableButton()
    } else {
      setButtonDisabled(true)
    }
  }, [showDeleteEventModal])

  const handleDeleteEvent = () => {
    if (event == undefined) {
      return
    }
    deleteEvent(event)
      .then((deletedEvent) => {
        if (deletedEvent == undefined) {
          return
        }
        if (events != undefined) {
          if ("id" in deletedEvent) {
            // ts thinks id is not on deletedEvent so we ignore
            // @ts-ignore
            mutateEvents(events.filter((e) => e.id != deletedEvent.id))
          }
        }
        setFailure(null)
        setSuccess("success")
        setTimeout(() => {
          setShowDeleteEventModal(false)
          onClose()
          setSuccess(null)
        }, 2000)
      })
      .catch((error) => {
        console.error(error)
        setSuccess(null)
        setFailure("failure")
        setTimeout(() => {
          setFailure(null)
        }, 2000)
      })
  }

  return (
    <Modal dismissible={true} show={showDeleteEventModal} onClose={onClose} initialFocus={1} size="xl">
      <Modal.Header>Delete Event</Modal.Header>
      <Modal.Body>
        <Stack>
          <h6>
            Are you sure you wish to delete: <b className="text-gray-900 dark:text-slate-400">{event?.name}</b> ?{" "}
          </h6>
          <p className="text-red-400">Warning! This action cannot be undone.</p>
          <Button
            className="mt-4"
            color="failure"
            onClick={handleDeleteEvent}
            disabled={buttonDisabled}
            data-cy="confirm-event-delete"
          >
            Delete Event
          </Button>
          {success && (
            <Toast data-cy="event-deleted-toast" className="">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Event Deleted</div>
            </Toast>
          )}
          {failure && (
            <Toast className="">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiX className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Error deleting event</div>
            </Toast>
          )}
        </Stack>
      </Modal.Body>
    </Modal>
  )
}
