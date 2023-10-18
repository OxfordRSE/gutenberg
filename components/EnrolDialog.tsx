import { EventStatus, UserOnEvent } from '@prisma/client'
import { Button, Modal, Toast, TextInput } from 'flowbite-react'
import { Event } from 'lib/types'
import { useSession } from 'next-auth/react'
import React from 'react'
import Content from './content/Content'
import { HiMail, HiX } from 'react-icons/hi'
import postUserOnEvent from 'lib/actions/postUserOnEvent'
import useEvent from 'lib/hooks/useEvent'
import { putUserOnEvent } from 'pages/api/userOnEvent/[eventId]'


type Props = {
  event: Event, 
  show: boolean,
  onEnrol: (userOnEvent: UserOnEvent | undefined) => void
}

const EnrolDialog: React.FC<Props> = ({ event, show, onEnrol}) => {
  const [error, setError] = React.useState<string | undefined>(undefined)
  const [enrolError, setEnrolError] = React.useState<string | undefined>(undefined)
  const [success, setSuccess] = React.useState<string | null>(null)
  const session = useSession()
  const { event: eventData, error: eventError, isLoading: eventIsLoading, mutate: mutateEvent } = useEvent(event.id)
  console.log('eD',eventData)

  const onClose = () => {
    onEnrol(undefined)
  }

  const userEmail = session.data?.user?.email;
  if (userEmail === undefined || userEmail === null) {
    return null;
  }

  const checkKey = (enrolKey: string) => {
    if (enrolKey === event.enrolKey) {
      return 'STUDENT'
    }
    else if (enrolKey === event.instructorKey) {
      return 'INSTRUCTOR'
    }
    return null
  }

  const onClick = () => {
    postUserOnEvent(event)
    .then((data) => {
      if ('userOnEvent' in data) {
        onEnrol(data.userOnEvent)
        setSuccess("success")
        setError(undefined)
      } else if ('error' in data) {
        setError(data.error)
        setSuccess(null)
      }
    }).catch((err) => {
      setError(err.message)
      setSuccess(null)
    })
  };

  const enrolWithKey = () => {
    const enrolKey = (document.getElementById('enrol-key') as HTMLInputElement).value;
    console.log(enrolKey)
    const status = checkKey(enrolKey)
    console.log(status)
    if (status === null) {
      setEnrolError("error")
    } else {
      postUserOnEvent(event)
      .then((data) => {
        if ('userOnEvent' in data) {
          let newUser = data.userOnEvent
          if (newUser) {
            if (status === 'STUDENT') {
              newUser.status = EventStatus.STUDENT
            } else if (status === 'INSTRUCTOR') {
              newUser.status = EventStatus.INSTRUCTOR
            }
            if (eventData) {
              putUserOnEvent(eventData?.id, newUser).then((data) => {
                console.log(data)
                onEnrol(newUser)
                setSuccess("success")
                setEnrolError(undefined)             
            })}
            }
          } else if ('error' in data) {
            setError(data.error)
            setSuccess(null)
          }
      })
    }
  }

  return (
    <>
    <Modal
      dismissible={true}
      show={show}
      onClose={onClose}
    >
      <Modal.Header>
        {event.name}
      </Modal.Header>
      <Modal.Body>
        <Content markdown={event.enrol} />
        You should have received an enrolment key from the course organiser:
        <div className="flex">
        <TextInput
          className="w-[80%]"
          id="enrol-key"
          sizing="sm"
          type="text"
          placeholder='Enrolment Key'
        />
        <Button className="w-[15%] h-8" onClick={enrolWithKey}>
          Enrol
        </Button>
      </div>
      { enrolError && (
      <Toast className=''>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
          <HiX className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">
          Invalid Enrolment Key
        </div>
      </Toast>
    )}
      </Modal.Body>
      <Modal.Footer>
        If you have not received an enrolment key, you can request enrolment:
        <Button onClick={onClick}>
          Request Enrollment
        </Button>
      </Modal.Footer>
    </Modal>
    { error && (
      <Toast className=''>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
          <HiX className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">
          Unexpected Error
        </div>
      </Toast>
    )}
    { success && (
      <Toast className=''>
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
          <HiMail className="h-5 w-5" />
        </div>
        <div className="ml-3 text-sm font-normal">
          Enrollment request sent.
        </div>
      </Toast>
    )}
    </>
  )
}

export default EnrolDialog