import { EventStatus, UserOnEvent } from "@prisma/client"
import { Button, Modal, Toast, TextInput } from "flowbite-react"
import { Event } from "lib/types"
import { useSession } from "next-auth/react"
import React from "react"
import Content from "./content/Content"
import { HiCheckCircle, HiMail, HiX } from "react-icons/hi"
import postUserOnEvent from "lib/actions/postUserOnEvent"
import putUserOnEvent from "lib/actions/putUserOnEvent"
import useEvent from "lib/hooks/useEvent"
import { useForm } from "react-hook-form"
import Stack from "./ui/Stack"
import TextField from "./forms/Textfield"
import { delay } from "cypress/types/bluebird"

type Props = {
  event: Event
  show: boolean
  onEnrol: (userOnEvent: UserOnEvent | undefined) => void
}

interface Enrol {
  enrolKey: string
}

const EnrolDialog: React.FC<Props> = ({ event, show, onEnrol }) => {
  const { control, handleSubmit, reset } = useForm<Enrol>()
  const [error, setError] = React.useState<string | undefined>(undefined)
  const [enrolError, setEnrolError] = React.useState<string | undefined>(undefined)
  const [keySuccess, setKeySuccess] = React.useState<string | undefined>(undefined)
  const [success, setSuccess] = React.useState<string | null>(null)
  const session = useSession()
  const { event: eventData, error: eventError, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)

  const onClose = () => {
    onEnrol(undefined)
  }

  const userEmail = session.data?.user?.email
  if (userEmail === undefined || userEmail === null) {
    return null
  }

  const checkKey = (enrolKey: string) => {
    if (enrolKey === event.enrolKey) {
      return "STUDENT"
    } else if (enrolKey === event.instructorKey) {
      return "INSTRUCTOR"
    }
    return null
  }

  const onClick = () => {
    postUserOnEvent(event)
      .then((data) => {
        if ("userOnEvent" in data) {
          onEnrol(data.userOnEvent)
          setSuccess("success")
          setError(undefined)
        } else if ("error" in data) {
          setError(data.error)
          setSuccess(null)
        }
      })
      .catch((err) => {
        setError(err.message)
        setSuccess(null)
      })
  }

  const enrolWithKey = async (data: Enrol) => {
    const status = checkKey(data.enrolKey)
    if (status === null) {
      setEnrolError("error")
    } else {
      postUserOnEvent(event).then((data) => {
        if ("userOnEvent" in data) {
          let newUser = data.userOnEvent
          if (newUser) {
            if (status === "STUDENT") {
              newUser.status = EventStatus.STUDENT
            } else if (status === "INSTRUCTOR") {
              newUser.status = EventStatus.INSTRUCTOR
            }
            if (event) {
              putUserOnEvent(event.id, newUser).then(() => {
                setKeySuccess("success")
                setTimeout(() => {
                  onEnrol(newUser)
                  setSuccess("success")
                  setEnrolError(undefined)
                }, 2000)
              })
            }
          }
        } else if ("error" in data) {
          setError(data.error)
          setSuccess(null)
        }
      })
    }
  }

  return (
    <>
      <Modal dismissible={true} show={show} onClose={onClose}>
        <Modal.Header>{event.name}</Modal.Header>
        <Modal.Body>
          <Stack>
            <Content markdown={event.enrol} />
            <p>You should have received an enrolment key from the course organiser.</p>
            <form onSubmit={handleSubmit(enrolWithKey)}>
              <Stack direction="row" spacing={2} className="justify-center flex-row">
                <TextField
                  data-cy={`key-enrol-input-${event.id}`}
                  textfieldProps={{ autoComplete: "off", placeholder: "Enrolment Key", autoFocus: true }}
                  name={"enrolKey"}
                  control={control}
                />
                <Button data-cy={`key-enrol-${event.id}`} type="submit" className="m-0 h-10 mt-1">
                  Enrol
                </Button>
              </Stack>
            </form>
            {enrolError && (
              <Toast data-cy={`enrol-failure-${event.id}`} className="">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
                  <HiX className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal">Invalid Enrolment Key</div>
              </Toast>
            )}
            {keySuccess && (
              <Toast data-cy={`enrol-success-${event.id}`} className="">
                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                  <HiCheckCircle className="h-5 w-5" />
                </div>
                <div className="ml-3 text-sm font-normal">Enrolment Successful!</div>
              </Toast>
            )}
          </Stack>
        </Modal.Body>
        <Modal.Footer>
          <p>If you have not received an enrolment key, you can request enrolment:</p>
          <Button data-cy={`request-enrol-${event.id}`} onClick={onClick}>
            Request Enrollment
          </Button>
        </Modal.Footer>
      </Modal>
      {error && (
        <Toast className="">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
            <HiX className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">Unexpected Error</div>
        </Toast>
      )}
      {success && (
        <Toast className="">
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiMail className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">Enrollment request sent.</div>
        </Toast>
      )}
    </>
  )
}

export default EnrolDialog
