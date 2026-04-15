import { Badge, Button, Card } from "flowbite-react"
import { Tooltip } from "@mui/material"
import Link from "next/link"
import { useAtom } from "jotai"
import { Material } from "lib/material"
import { Problem } from "@prisma/client"
import { EventFull as Event, UserOnEvent } from "lib/types"
import UserEventProblems from "components/event/UserEventProblems"
import { deleteUserOnEventModalState, deleteUserOnEventIdState } from "components/dialogs/DeleteUserOnEventModal"
import useActiveEvent from "lib/hooks/useActiveEvents"

type EventProps = {
  material: Material
  event: Event
  userProblems: Problem[]
  userOnEvent: UserOnEvent
}

const ProfileEventView: React.FC<EventProps> = ({ material, event, userProblems, userOnEvent }) => {
  const [, setShowDeleteUserOnEventModal] = useAtom(deleteUserOnEventModalState)
  const [, setDeleteUserOnEventId] = useAtom(deleteUserOnEventIdState)
  const [activeEvent] = useActiveEvent()
  const isActiveEvent = activeEvent?.id === event.id

  const openDeleteUserOnEventModal = () => {
    setShowDeleteUserOnEventModal(true)
    setDeleteUserOnEventId(userOnEvent)
  }

  const statusLabel =
    userOnEvent.status === "INSTRUCTOR" ? "Instructor" : userOnEvent.status === "REQUEST" ? "Requested" : "Student"

  return (
    <Card
      className={isActiveEvent ? "border-cyan-300 bg-cyan-50/70 dark:border-cyan-700 dark:bg-cyan-950/20" : undefined}
      data-cy={`profile-event-${event.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              <Link href={`/event/${event.id}`} className="hover:underline">
                {event.name}
              </Link>
            </h3>
            <Badge color="gray">{statusLabel}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {`${new Date(event.start).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })} - ${new Date(event.end).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
          </p>
          {event.summary && <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{event.summary}</p>}
        </div>
        <Tooltip title="Unsubscribe from event">
          <Button
            className="shrink-0"
            color="failure"
            data-cy={`delete-event-${event.id}`}
            size="xs"
            onClick={openDeleteUserOnEventModal}
          >
            Remove
          </Button>
        </Tooltip>
      </div>
      <div className="mt-4">
        <UserEventProblems key={event.id} userProblems={userProblems} event={event} material={material} />
      </div>
    </Card>
  )
}

export default ProfileEventView
