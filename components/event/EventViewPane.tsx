import { useEffect, useState } from "react"
import Content from "components/content/Content"
import EventCommentThreads from "components/event/EventCommentThreads"
import EventProblems from "components/event/EventProblems"
import EventActions from "components/timeline/EventActions"
import SubTitle from "components/ui/SubTitle"
import Title from "components/ui/Title"
import { Material } from "lib/material"
import { Event as BaseEvent } from "lib/types"
import { Event as EventWithUsers } from "pages/api/event/[eventId]"

type Props = {
  event: BaseEvent
  material: Material
  eventWithRelations?: EventWithUsers
  isAdmin?: boolean
  isInstructor?: boolean
}

const EventViewPane: React.FC<Props> = ({
  event,
  material,
  eventWithRelations,
  isAdmin = false,
  isInstructor = false,
}) => {
  const [showDateTime, setShowDateTime] = useState(false)

  useEffect(() => {
    setShowDateTime(true)
  }, [])

  const viewEvent = (eventWithRelations ?? event) as BaseEvent
  const fullEvent = eventWithRelations

  return (
    <div data-cy="event-view-pane">
      <EventActions event={viewEvent} verbose={true} />
      <Title text={viewEvent.name} />
      <SubTitle
        text={
          showDateTime
            ? `${new Date(viewEvent.start).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} - ${new Date(
                viewEvent.end
              ).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
            : ""
        }
      />
      <Content markdown={fullEvent ? fullEvent.content : viewEvent.content} />
      {(isInstructor || isAdmin) && fullEvent && (
        <>
          <Title text="Unresolved Threads" />
          <EventCommentThreads event={fullEvent} material={material} />
          <Title text="Student Progress" />
          <EventProblems event={fullEvent} material={material} />
        </>
      )}
    </div>
  )
}

export default EventViewPane
