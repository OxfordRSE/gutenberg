import { EventStatus, UserOnEvent } from '@prisma/client'
import { Button, Modal, Toast } from 'flowbite-react'
import { Event } from 'lib/types'
import { useSession } from 'next-auth/react'
import React from 'react'
import useSWR, { Fetcher } from 'swr'
import useSWRMutation from 'swr/mutation'
import Content from './Content'
import { HiMail, HiX } from 'react-icons/hi'


export const createUserOnEvent = async (arg: UserOnEvent) => {
  const response = await fetch('/api/userOnEvent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    throw new Error('could not create user on event')
  }

  const data = await response.json()
  return data
}
 
type Props = {
  event: Event, 
  show: boolean,
  onEnrol: (userOnEvent: UserOnEvent | null) => void
}

const EnrolDialog: React.FC<Props> = ({ event, show, onEnrol}) => {
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const session = useSession()

  const onClose = () => {
    onEnrol(null)
  }

  const userEmail = session.data?.user?.email;
  if (userEmail === undefined || userEmail === null) {
    return null;
  }

  const onClick = () => {
    createUserOnEvent({
      eventId: event.id,
      userEmail, 
      status: EventStatus.REQUEST,
    }).then((data) => {
      onEnrol(data)
      setSuccess(data)
      setError(null)
    }).catch((err) => {
      setError(err.message)
      setSuccess(null)
    })
  };

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
      </Modal.Body>
      <Modal.Footer>
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