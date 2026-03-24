import { useCallback, useContext, useEffect } from "react"
import { AppContext } from "lib/context/ContextProvider"

export type LearningContext = { type: "event"; id: number } | { type: "course"; externalId: string }
const STORAGE_KEY = "activeEvent"

const parseLearningContext = (stored: string): LearningContext | undefined => {
  if (/^\d+$/.test(stored)) {
    return { type: "event", id: parseInt(stored, 10) }
  }

  const [type, rawValue] = stored.split(":", 2)
  if (type === "event" && /^\d+$/.test(rawValue ?? "")) {
    return { type: "event", id: parseInt(rawValue, 10) }
  }

  if (type === "course" && rawValue) {
    return { type: "course", externalId: rawValue }
  }

  return undefined
}

const serializeLearningContext = (context: LearningContext): string => {
  return context.type === "event" ? `event:${context.id}` : `course:${context.externalId}`
}

function useLearningContext(): [LearningContext | undefined, (context: LearningContext | undefined) => void] {
  const { state, dispatch } = useContext(AppContext)

  const learningContext = state.learningContext

  const setLearningContext = useCallback(
    (context: LearningContext | undefined) => {
      dispatch({ type: "SET_LEARNING_CONTEXT", learningContext: context })
    },
    [dispatch]
  )

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return
    const parsed = parseLearningContext(stored)
    if (parsed) {
      setLearningContext(parsed)
      const serialized = serializeLearningContext(parsed)
      if (stored !== serialized) {
        localStorage.setItem(STORAGE_KEY, serialized)
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [setLearningContext])

  useEffect(() => {
    if (learningContext) {
      localStorage.setItem(STORAGE_KEY, serializeLearningContext(learningContext))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [learningContext])

  return [learningContext, setLearningContext]
}

export default useLearningContext
