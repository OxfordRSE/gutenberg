import { Material } from "lib/material"

import { Problem } from "@prisma/client"
import { EventFull as Event, UserOnEvent } from "lib/types"
import UserEventProblems from "components/UserEventProblems"
import { PageTemplate } from "lib/pageTemplate"
import { useRecoilState } from "recoil"
import deleteUserOnEventModal, {
  deleteUserOnEventModalState,
  deleteUserOnEventIdState,
} from "components/dialogs/deleteUserOnEventModal"
import { Button } from "flowbite-react"
import Stack from "components/ui/Stack"
import { Tooltip } from "@mui/material"

type EventProps = {
  material: Material
  event: Event
  pageInfo?: PageTemplate
  userProblems: Problem[]
  userOnEvent: UserOnEvent
}

const ProfileEventView: React.FC<EventProps> = ({ material, event, userProblems, userOnEvent }) => {
  const [showDeleteUserOnEventModal, setShowDeleteUserOnEventModal] = useRecoilState(deleteUserOnEventModalState)
  const [deleteUserOnEventId, setDeleteUserOnEventId] = useRecoilState(deleteUserOnEventIdState)

  const openDeleteUserOnEventModal = (eventId: number) => {
    setShowDeleteUserOnEventModal(true)
    setDeleteUserOnEventId(userOnEvent)
  }
  return (
    <>
      <Stack direction="row">
        <a href={`/event/${event.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 pt-2">{event.name}</h3>

          <h2 className="text-m text-gray-700 pb-2">
            {`${new Date(event.start).toLocaleString([], {
              dateStyle: "medium",
              timeStyle: "short",
            })} - ${new Date(event.end).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`}
          </h2>
        </a>
        <Tooltip title="Unsubscribe from event">
          <Button
            className="text-xs"
            color="failure"
            data-cy={`delete-event-${event.id}`}
            size={8}
            onClick={() => openDeleteUserOnEventModal(event.id)}
          >
            Remove
          </Button>
        </Tooltip>
      </Stack>
      <UserEventProblems key={event.id} userProblems={userProblems} event={event} material={material} />
    </>
  )
}

export default ProfileEventView
