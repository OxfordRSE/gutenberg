import { EventFull } from "lib/types"
import useEvent from "./useEvent"
import useLearningContext from "./useLearningContext"

function useActiveEvent(): [EventFull | undefined, (event: EventFull | undefined) => void] {
  const [learningContext, setLearningContext] = useLearningContext()
  const activeEventId = learningContext?.type === "event" ? learningContext.id : undefined

  const { event: activeEvent } = useEvent(activeEventId || undefined)

  const setActiveEvent = (event: EventFull | undefined) => {
    return event ? setLearningContext({ type: "event", id: event.id }) : setLearningContext(undefined)
  }

  return [activeEvent, setActiveEvent]
}

export default useActiveEvent
