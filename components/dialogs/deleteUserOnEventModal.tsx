import React from "react"
import { useState, useEffect } from "react"
import { Button, Modal } from "flowbite-react"
import Stack from "components/ui/Stack"
import { atom, useRecoilState } from "recoil"
import useUsersOnEvent from "lib/hooks/useUsersOnEvent"
import useEvents from "lib/hooks/useEvents"
import { Toast } from "flowbite-react"
import { HiCheckCircle, HiX } from "react-icons/hi"
import deleteUserOnEvent from "lib/actions/deleteUserOnEvent"
import { UserOnEvent } from "lib/types"

interface DeleteUserOnEventProps {
  onClose: () => void
}

export const deleteUserOnEventModalState = atom({
  key: "deleteUserOnEventModalState",
  default: false,
})

export const deleteUserOnEventIdState = atom<UserOnEvent>({
  key: "deleteUserOnEventIdState",
  default: undefined,
})

export const DeleteUserOnEventModal: React.FC<DeleteUserOnEventProps> = ({ onClose }) => {
  const [showDeleteUserOnEventModal, setShowDeleteUserOnEventModal] = useRecoilState(deleteUserOnEventModalState)
  const [userOnEvent, setDeleteUserOnEventId] = useRecoilState(deleteUserOnEventIdState)
  const [success, setSuccess] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true)

  // disable the button for 1 seconds
  const enableButton = () => {
    setTimeout(() => {
      setButtonDisabled(false)
    }, 1000)
  }

  useEffect(() => {
    if (showDeleteUserOnEventModal === true) {
      enableButton()
    } else {
      setButtonDisabled(true)
    }
  }, [showDeleteUserOnEventModal])

  const handleDeleteUserOnEvent = () => {
    if (userOnEvent == undefined) {
      return
    }
    deleteUserOnEvent(userOnEvent)
      .then((deletedEvent) => {
        if (deletedEvent == undefined) {
          return
        }
        setFailure(null)
        setSuccess("success")
        setTimeout(() => {
          setShowDeleteUserOnEventModal(false)
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
    <Modal dismissible={true} show={showDeleteUserOnEventModal} onClose={onClose} initialFocus={1} size="sm">
      <Modal.Header>Unenrol From Event</Modal.Header>
      <Modal.Body>
        <Stack>
          <h6>Are you sure you wish to unsubscribe from this event? </h6>
          <p className="text-red-400">Warning! This cannot be undone.</p>
          <Button
            className="mt-4"
            color="failure"
            onClick={handleDeleteUserOnEvent}
            disabled={buttonDisabled}
            data-cy="confirm-event-unsubscribe"
          >
            Unsubscribe
          </Button>
          {success && (
            <Toast data-cy="event-deleted-toast" className="">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheckCircle className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Successfully unsubscribed</div>
            </Toast>
          )}
          {failure && (
            <Toast className="">
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                <HiX className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">Error unsubscribing</div>
            </Toast>
          )}
        </Stack>
      </Modal.Body>
    </Modal>
  )
}
export default DeleteUserOnEventModal
