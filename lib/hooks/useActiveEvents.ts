import { useState, useEffect, useContext, useCallback } from "react"
import { basePath } from "lib/basePath"
import { useSession } from "next-auth/react"
import { data } from "cypress/types/jquery"
import { User } from "@prisma/client"
import { EventFull, Event } from "lib/types"
import useEvent from "./useEvent"
import { AppContext } from "lib/context/ContextProvider"

function useActiveEvent(): [EventFull | undefined, (event: EventFull | undefined) => void] {
  const { state, dispatch } = useContext(AppContext)

  const activeEventId = state.activeEventId

  const { event: activeEvent } = useEvent(activeEventId || undefined)

  const setActiveEventId = useCallback(
    (id: number | undefined) => {
      dispatch({ type: "SET_ACTIVE_EVENT_ID", activeEventId: id })
    },
    [dispatch]
  )

  useEffect(() => {
    const store = localStorage.getItem("activeEvent")
    if (store) {
      setActiveEventId(parseInt(store))
    }
  }, [setActiveEventId])

  useEffect(() => {
    const store = activeEventId?.toString()
    if (store) {
      localStorage.setItem("activeEvent", store)
    } else {
      localStorage.removeItem("activeEvent")
    }
  }, [activeEventId])

  const setActiveEvent = (event: EventFull | undefined) => {
    return event ? setActiveEventId(event.id) : setActiveEventId(undefined)
  }

  return [activeEvent, setActiveEvent]
}

export default useActiveEvent
